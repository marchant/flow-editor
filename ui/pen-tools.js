var Montage = require("montage").Montage,
    PenToolMath = require("ui/pen-tool-math"),
    FlowKnot = require("ui/flow-spline-handlers").FlowKnot,
    Vector3 = PenToolMath.Vector3,
    FlowSpline = require("ui/flow-spline").FlowSpline,
    CanvasFlowSpline = require("ui/flow-spline").CanvasFlowSpline,
    BezierCurve = PenToolMath.CubicBezierCurve,
    CanvasFlowHelix = require("ui/flow-helix").CanvasFlowHelix;

exports.ArrowTool = Montage.create(Montage, {

    start: {
        value: function (viewport) {
        }
    },

    stop: {
        value: function (viewport) {
        }
    },

    _pointerX: {
        value: null
    },

    _pointerY: {
        value: null
    },

    handleMousedown: {
        value: function (event, viewport) {
            var selected = viewport.findSelectedShape(event.offsetX, event.offsetY);

            viewport.unselect();
            if (selected) {
                selected.isSelected = true;
            }
            this._pointerX = event.pageX,
            this._pointerY = event.pageY;
        }
    },

    handleMousemove: {
        value: function (event, viewport) {
            var dX = event.pageX - this._pointerX,
                dY = event.pageY - this._pointerY;

            if (viewport.selection && viewport.selection[0] && viewport.selection[0]._data.type !== "FlowGrid") {
                viewport.selection[0].translate(
                    Vector3.
                    create().
                    initWithCoordinates([dX, dY, 0]).
                    transformMatrix3d(viewport.inverseTransformMatrix(viewport.matrix)).
                    subtract(
                        Vector3.
                        create().
                        initWithCoordinates([0, 0, 0]).
                        transformMatrix3d(viewport.inverseTransformMatrix(viewport.matrix))
                    )._data
                );
            } else {
                viewport.translateX += dX;
                viewport.translateY += dY;
            }
            this._pointerX = event.pageX;
            this._pointerY = event.pageY;
        }
    },

    handleMouseup: {
        value: function (event, viewport) {
        }
    }

});

exports.ConvertTool = Montage.create(Montage, {

    start: {
        value: function (viewport) {
        }
    },

    stop: {
        value: function (viewport) {
        }
    },

    _pointerX: {
        value: null
    },

    _pointerY: {
        value: null
    },

    handleMousedown: {
        value: function (event, viewport) {
            var path,
                i;

            this._selectedChild = viewport.findSelectedChild(event.offsetX, event.offsetY);
            if (this._selectedChild) {
                path = viewport.findPathToNode(this._selectedChild);
                viewport.unselect();
                for (i = 0; i < path.length; i++) {
                    path[i].isSelected = true;
                }
            } else {
                viewport.unselect();
            }
            this._pointerX = event.pageX;
            this._pointerY = event.pageY;
        }
    },

    handleMousemove: {
        value: function (event, viewport) {
            var dX = event.pageX - this._pointerX,
                dY = event.pageY - this._pointerY;

            if (this._selectedChild) {
                this._selectedChild.translate(
                    Vector3.
                    create().
                    initWithCoordinates([dX, dY, 0]).
                    transformMatrix3d(viewport.inverseTransformMatrix(viewport.matrix)).
                    subtract(
                        Vector3.
                        create().
                        initWithCoordinates([0, 0, 0]).
                        transformMatrix3d(viewport.inverseTransformMatrix(viewport.matrix))
                    )._data
                );
            } else {
                viewport.translateX += dX;
                viewport.translateY += dY;
            }
            this._pointerX = event.pageX;
            this._pointerY = event.pageY;
        }
    },

    handleMouseup: {
        value: function (event, viewport) {
        }
    }

});

exports.PenTool = Montage.create(Montage, {

    start: {
        value: function (viewport) {
            viewport.unselect();
            this._editingCanvasSpline = null;
        }
    },

    stop: {
        value: function (viewport) {
        }
    },

    _pointerX: {
        value: null
    },

    _pointerY: {
        value: null
    },

    _editingSpline: {
        value: null
    },

    _editingCanvasSpline: {
        value: null
    },

    _previousKnot: {
        value: null
    },

    handleMousedown: {
        value: function (event, viewport) {
            var canvasShape,
                canvasSpline,
                canvasKnot;

            if (this._editingCanvasSpline) {
                if (this._previousKnot) {
                    this._previousKnot.isSelected = false;
                }
                this._editingCanvasSpline.appendControlPoint(Vector3.
                    create().
                    initWithCoordinates([event.offsetX, event.offsetY, 0]).
                    transformMatrix3d(viewport.inverseTransformMatrix(viewport.matrix))
                );
                canvasKnot = this._editingCanvasSpline.appendControlPoint(FlowKnot.
                    create().
                    initWithCoordinates([event.offsetX, event.offsetY, 0]).
                    transformMatrix3d(viewport.inverseTransformMatrix(viewport.matrix))
                );
                canvasKnot.isSelected = true;
                this._previousKnot = canvasKnot;
                this._editingCanvasSpline.appendControlPoint(Vector3.
                    create().
                    initWithCoordinates([event.offsetX, event.offsetY, 0]).
                    transformMatrix3d(viewport.inverseTransformMatrix(viewport.matrix))
                );
            } else {
                this._editingSpline = FlowSpline.create().init();
                this._editingCanvasSpline = canvasSpline = viewport.scene.appendFlowSpline(this._editingSpline);
                canvasKnot = canvasSpline.appendControlPoint(FlowKnot.
                    create().
                    initWithCoordinates([event.offsetX, event.offsetY, 0]).
                    transformMatrix3d(viewport.inverseTransformMatrix(viewport.matrix))
                );
                canvasSpline.appendControlPoint(Vector3.
                    create().
                    initWithCoordinates([event.offsetX, event.offsetY, 0]).
                    transformMatrix3d(viewport.inverseTransformMatrix(viewport.matrix))
                );
                canvasKnot.isSelected = true;
                canvasSpline.isSelected = true;
                this._previousKnot = canvasKnot;
            }
            this._pointerX = event.pageX;
            this._pointerY = event.pageY;
        }
    },

    handleMousemove: {
        value: function (event, viewport) {
            var dX = event.pageX - this._pointerX,
                dY = event.pageY - this._pointerY,
                vector = this._editingSpline._data[this._editingSpline.length - 1]._data[1],
                vector2;

            vector.translate(
                Vector3.
                create().
                initWithCoordinates([dX, dY, 0]).
                transformMatrix3d(viewport.inverseTransformMatrix(viewport.matrix)).
                subtract(
                    Vector3.
                    create().
                    initWithCoordinates([0, 0, 0]).
                    transformMatrix3d(viewport.inverseTransformMatrix(viewport.matrix))
                )._data
            );
            if (this._editingSpline._data[this._editingSpline.length - 2] &&
                (vector2 = this._editingSpline._data[this._editingSpline.length - 2]._data[2])) {
                vector2._data = [
                    this._editingSpline._data[this._editingSpline.length - 1].getControlPoint(0).x * 2 - vector.x,
                    this._editingSpline._data[this._editingSpline.length - 1].getControlPoint(0).y * 2 - vector.y,
                    this._editingSpline._data[this._editingSpline.length - 1].getControlPoint(0).z * 2 - vector.z
                ];
            }
            this._pointerX = event.pageX;
            this._pointerY = event.pageY;
        }
    },

    handleMouseup: {
        value: function (event, viewport) {
        }
    }

});

exports.AddTool = Montage.create(Montage, {

    start: {
        value: function (viewport) {
            viewport.unselect();
            this._editingCanvasSpline = null;
            this._editingSpline = null;
        }
    },

    stop: {
        value: function (viewport) {
            viewport.scene.appendMark.isVisible = false;
        }
    },

    handleHover: {
        value: function (event, viewport) {
            if (!this._editingCanvasSpline) {
                var selected = viewport.findCloserShapeType("FlowKnot", event.offsetX, event.offsetY),
                    path,
                    spline,
                    i;

                viewport.unselect();
                viewport.scene.appendMark.isVisible = false;
                if (selected) {
                    path = viewport.findPathToNode(selected);
                    for (i = 0; i < path.length; i++) {
                        if (path[i]._data.type === "FlowSpline") {
                            spline = path[i];
                        }
                    }
                    if (spline) {
                        if (selected.isLastKnotOf(spline) || selected.isFirstKnotOf(spline)) {
                            viewport.scene.appendMark.data = selected.data;
                            viewport.scene.appendMark.isVisible = true;
                        }
                    }
                }
            }
        }
    },

    _pointerX: {
        value: null
    },

    _pointerY: {
        value: null
    },

    _editingSpline: {
        value: null
    },

    _isDragging: {
        value: false
    },

    _isFirstSelection: {
        value: false
    },

    _insertMode: {
        value: null
    },

    handleMousedown: {
        value: function (event, viewport) {
            if (!this._editingCanvasSpline) {
                var selected = viewport.findCloserShapeType("FlowKnot", event.offsetX, event.offsetY),
                    path,
                    spline,
                    i;

                if (selected) {
                    path = viewport.findPathToNode(selected);
                    for (i = 0; i < path.length; i++) {
                        if (path[i]._data.type === "FlowSpline") {
                            spline = path[i];
                        }
                    }
                    if (spline) {
                        if (selected.isLastKnotOf(spline)) {
                            this._editingCanvasSpline = spline;
                            this._editingSpline = spline._data;
                            spline.isSelected = true;
                            selected.isSelected = true;
                            this._previousKnot = selected;
                            this._isFirstSelection = true;
                            this._insertMode = "appendToEnd";
                            viewport.scene.appendMark.isVisible = false;
                            if (!selected.nextHandler) {
                                this._editingCanvasSpline.appendControlPoint(Vector3.
                                    create().
                                    initWithCoordinates([
                                        selected.data.x * 2 - selected.previousHandler.x,
                                        selected.data.y * 2 - selected.previousHandler.y,
                                        selected.data.z * 2 - selected.previousHandler.z
                                    ])
                                );
                            }
                        } else {
                            if (selected.isFirstKnotOf(spline)) {
                                this._editingCanvasSpline = spline;
                                this._editingSpline = spline._data;
                                spline.isSelected = true;
                                selected.isSelected = true;
                                this._previousKnot = selected;
                                this._isFirstSelection = true;
                                this._insertMode = "insertToStart";
                                viewport.scene.appendMark.isVisible = false;
                                if (!selected.previousHandler) {
                                    this._editingCanvasSpline.insertControlPointAtStart(Vector3.
                                        create().
                                        initWithCoordinates([
                                            selected.data.x * 2 - selected.nextHandler.x,
                                            selected.data.y * 2 - selected.nextHandler.y,
                                            selected.data.z * 2 - selected.nextHandler.z
                                        ])
                                    );
                                }
                            }
                        }
                    }
                }
            } else {
                var canvasShape,
                    canvasSpline,
                    canvasKnot;

                this._isFirstSelection = false;
                if (this._insertMode === "appendToEnd") {
                    if (this._previousKnot) {
                        this._previousKnot.isSelected = false;
                    }
                    this._editingCanvasSpline.appendControlPoint(Vector3.
                        create().
                        initWithCoordinates([event.offsetX, event.offsetY, 0]).
                        transformMatrix3d(viewport.inverseTransformMatrix(viewport.matrix))
                    );
                    canvasKnot = this._editingCanvasSpline.appendControlPoint(FlowKnot.
                        create().
                        initWithCoordinates([event.offsetX, event.offsetY, 0]).
                        transformMatrix3d(viewport.inverseTransformMatrix(viewport.matrix))
                    );
                    canvasKnot.isSelected = true;
                    this._previousKnot = canvasKnot;
                    this._editingCanvasSpline.appendControlPoint(Vector3.
                        create().
                        initWithCoordinates([event.offsetX, event.offsetY, 0]).
                        transformMatrix3d(viewport.inverseTransformMatrix(viewport.matrix))
                    );
                } else {
                    if (this._previousKnot) {
                        this._previousKnot.isSelected = false;
                    }
                    this._editingCanvasSpline.insertControlPointAtStart(Vector3.
                        create().
                        initWithCoordinates([event.offsetX, event.offsetY, 0]).
                        transformMatrix3d(viewport.inverseTransformMatrix(viewport.matrix))
                    );
                    canvasKnot = this._editingCanvasSpline.insertControlPointAtStart(FlowKnot.
                        create().
                        initWithCoordinates([event.offsetX, event.offsetY, 0]).
                        transformMatrix3d(viewport.inverseTransformMatrix(viewport.matrix))
                    );
                    canvasKnot.isSelected = true;
                    this._previousKnot = canvasKnot;
                    this._editingCanvasSpline.insertControlPointAtStart(Vector3.
                        create().
                        initWithCoordinates([event.offsetX, event.offsetY, 0]).
                        transformMatrix3d(viewport.inverseTransformMatrix(viewport.matrix))
                    );
                }
            }
            this._pointerX = event.pageX;
            this._pointerY = event.pageY;
        }
    },

    handleMousemove: {
        value: function (event, viewport) {
            var dX, dY,
                vector,
                vector2;

            if (!this._isFirstSelection && this._editingSpline) {
                dX = event.pageX - this._pointerX;
                dY = event.pageY - this._pointerY;
                if (this._insertMode === "appendToEnd") {
                    vector = this._editingSpline._data[this._editingSpline.length - 1]._data[1],
                    vector.translate(
                        Vector3.
                        create().
                        initWithCoordinates([dX, dY, 0]).
                        transformMatrix3d(viewport.inverseTransformMatrix(viewport.matrix)).
                        subtract(
                            Vector3.
                            create().
                            initWithCoordinates([0, 0, 0]).
                            transformMatrix3d(viewport.inverseTransformMatrix(viewport.matrix))
                        )._data
                    );
                    if (this._editingSpline._data[this._editingSpline.length - 2] &&
                        (vector2 = this._editingSpline._data[this._editingSpline.length - 2]._data[2])) {
                        vector2._data = [
                            this._editingSpline._data[this._editingSpline.length - 1].getControlPoint(0).x * 2 - vector.x,
                            this._editingSpline._data[this._editingSpline.length - 1].getControlPoint(0).y * 2 - vector.y,
                            this._editingSpline._data[this._editingSpline.length - 1].getControlPoint(0).z * 2 - vector.z
                        ];
                    }
                } else {
                    vector = this._editingSpline._data[0]._data[2],
                    vector.translate(
                        Vector3.
                        create().
                        initWithCoordinates([dX, dY, 0]).
                        transformMatrix3d(viewport.inverseTransformMatrix(viewport.matrix)).
                        subtract(
                            Vector3.
                            create().
                            initWithCoordinates([0, 0, 0]).
                            transformMatrix3d(viewport.inverseTransformMatrix(viewport.matrix))
                        )._data
                    );
                    if (this._editingSpline._data[1] &&
                        (vector2 = this._editingSpline._data[1]._data[1])) {
                        vector2._data = [
                            this._editingSpline._data[0].getControlPoint(3).x * 2 - vector.x,
                            this._editingSpline._data[0].getControlPoint(3).y * 2 - vector.y,
                            this._editingSpline._data[0].getControlPoint(3).z * 2 - vector.z
                        ];
                    }
                }
                this._pointerX = event.pageX;
                this._pointerY = event.pageY;
            }
        }
    },

    handleMouseup: {
        value: function (event, viewport) {
        }
    }

});

exports.HelixTool = Montage.create(Montage, {

    start: {
        value: function (viewport) {
            viewport.unselect();
        }
    },

    stop: {
        value: function (viewport) {
        }
    },

    _pointerX: {
        value: null
    },

    _pointerY: {
        value: null
    },

    handleMousedown: {
        value: function (event, viewport) {
            var canvasHelix = CanvasFlowHelix.create(),
                axisOriginPosition =
                    Vector3.
                    create().
                    initWithCoordinates([event.offsetX, event.offsetY, 0]).
                    transformMatrix3d(viewport.inverseTransformMatrix(viewport.matrix)).
                    _data;

            viewport.unselect();
            canvasHelix._x = axisOriginPosition[0];
            canvasHelix._y = axisOriginPosition[1];
            canvasHelix._z = axisOriginPosition[2];
            canvasHelix.update();
            viewport.scene.appendCanvasFlowHelix(canvasHelix);
            canvasHelix.isSelected = true;
            this.helix = canvasHelix;
            this._pointerX = event.pageX;
            this._pointerY = event.pageY;
        }
    },

    handleMousemove: {
        value: function (event, viewport) {
            var dX = event.pageX - this._pointerX,
                dY = event.pageY - this._pointerY;

            this.helix.translate(
                Vector3.
                create().
                initWithCoordinates([dX, dY, 0]).
                transformMatrix3d(viewport.inverseTransformMatrix(viewport.matrix)).
                subtract(
                    Vector3.
                    create().
                    initWithCoordinates([0, 0, 0]).
                    transformMatrix3d(viewport.inverseTransformMatrix(viewport.matrix))
                )._data
            );
            this._pointerX = event.pageX;
            this._pointerY = event.pageY;
        }
    },

    handleMouseup: {
        value: function (event, viewport) {
        }
    }

});