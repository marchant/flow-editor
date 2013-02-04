var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component,
    FlowBezierSpline = require("montage/ui/flow-bezier-spline").FlowBezierSpline,
    PenToolMath = require("ui/pen-tool-math.js"),
    Vector3 = PenToolMath.Vector3,
    BezierCurve = PenToolMath.BezierCurve,
    Shape = PenToolMath.Shape,
    Scene = PenToolMath.Scene;

exports.Editor = Montage.create(Component, {

    object: {
        get: function () {
            return this.flow;
        },
        set: function (value) {
            if (value._stageObject) {
                console.log(value);
                this.flow = value.stageObject;
            } else {
                this.flow = value;
            }
        }
    },

    _flow: {
        value: null
    },

    flow: {
        get: function () {
            return this._flow;
        },
        set: function (value) {
            this._cameraPosition = value.cameraPosition;
            this._cameraTargetPoint = value.cameraTargetPoint;
            this._cameraRoll = value.cameraRoll;
            this._cameraFov = value.cameraFov;
            this._flow = value;
        }
    },

    hasSplineUpdated: {
        value: true
    },

/*    _selectedTool: {
        enumerable: false,
        value: "add"
    },

    selectedTool: {
        get: function () {
            return this._selectedTool;
        },
        set: function (value) {
            this._selectedTool = value;
            this.topView.mousedownDelegate =
            this.frontView.mousedownDelegate =
            this.topView.mousemoveDelegate =
            this.frontView.mousemoveDelegate = null;
            this.topView.isDrawingHandlers =
            this.frontView.isDrawingHandlers =
            this.topView.isDrawingDensities =
            this.frontView.isDrawingDensities =
            this.topView.isHighlightingCloserKnot =
            this.frontView.isHighlightingCloserKnot =
            this.topView.isHighlightingCloserHandler =
            this.frontView.isHighlightingCloserHandler = false;

            // TODO move this to draw
            this.frontView.element.style.display =
            this.topView.element.style.display = "block";
            this.parametersEditor.style.display = "none";
            this[value + "ButtonAction"]();
        }
    },

    addButtonAction: {
        value: function () {
            var self = this,
                sX,
                sY,
                tmp;

            this.topView.isDrawingHandlers = this.frontView.isDrawingHandlers = true;
            this.topView.mousedownDelegate = function (x, y, knot, handler, type, isScrolling) {
                self.spline.previousHandlers.push([x, 0, y]);
                self.spline.knots.push([x, 0, y]);
                self.spline.nextHandlers.push([x, 0, y]);
                self.spline.densities.push(3);
                self.spline._computeDensitySummation.call(self.spline);
                self.frontView.updateSpline();
                self.topView.updateSpline();
                self.hasSplineUpdated = true;
                self.flow._updateLength();
                sX = x;
                sY = y;
                return false;
            };
            this.frontView.mousedownDelegate = function (x, y, knot, handler, type, isScrolling) {
                self.spline.previousHandlers.push([x, y, 0]);
                self.spline.knots.push([x, y, 0]);
                self.spline.nextHandlers.push([x, y, 0]);
                self.spline.densities.push(3);
                self.spline._computeDensitySummation.call(self.spline);
                self.frontView.updateSpline();
                self.topView.updateSpline();
                self.hasSplineUpdated = true;
                self.flow._updateLength();
                sX = x;
                sY = y;
                return false;
            };
            this.topView.mousemoveDelegate = function (x, y, knot, handler, type, isScrolling) {
                sX -= x;
                sY -= y;
                tmp = self.spline.knots[self.spline.knots.length - 1];
                self.spline.previousHandlers[self.spline.previousHandlers.length - 1] = [tmp[0] * 2 - sX, 0, tmp[2] * 2 - sY];
                self.spline.nextHandlers[self.spline.nextHandlers.length - 1] = [sX, 0, sY];
                self.frontView.updateSpline();
                self.topView.updateSpline();
                self.hasSplineUpdated = true;
                self.flow._updateLength();
                return false;
            };
            this.frontView.mousemoveDelegate = function (x, y, knot, handler, type, isScrolling) {
                sX -= x;
                sY -= y;
                tmp = self.spline.knots[self.spline.knots.length - 1];
                self.spline.previousHandlers[self.spline.previousHandlers.length - 1] = [tmp[0] * 2 - sX, tmp[1] * 2 - sY, 0];
                self.spline.nextHandlers[self.spline.nextHandlers.length - 1] = [sX, sY, 0];
                self.frontView.updateSpline();
                self.topView.updateSpline();
                self.hasSplineUpdated = true;
                self.flow._updateLength();
                return false;
            };
        }
    },

    removeButtonAction: {
        value: function () {
            var self = this;

            this.topView.isDrawingHandlers = this.frontView.isDrawingHandlers = false;
            this.topView.isDrawingDensities = this.frontView.isDrawingDensities = false;
            this.topView.isHighlightingCloserKnot = this.frontView.isHighlightingCloserKnot = true;
            this.topView.mousedownDelegate = this.frontView.mousedownDelegate = function (x, y, knot, handler, type, isScrolling) {
                if (knot !== null) {
                    self.spline.knots.splice(knot, 1);
                    self.spline.nextHandlers.splice(knot, 1);
                    self.spline.previousHandlers.splice(knot, 1);
                    self.spline.densities.splice(knot, 1);
                    self.frontView.updateSpline();
                    self.topView.updateSpline();
                    self.hasSplineUpdated = true;
                    self.spline._computeDensitySummation.call(self.spline);
                    self.flow._updateLength();
                    return false;
                } else {
                    return true;
                }
            };
        }
    },

    moveKnotButtonAction: {
        value: function () {
            var self = this;

            this.topView.isHighlightingCloserKnot = this.frontView.isHighlightingCloserKnot = true;
            this.topView.mousedownDelegate =
            this.frontView.mousedownDelegate = function (x, y, knot, handler, type, isScrolling) {
                if (knot !== null) {
                    self._selectedKnot = knot;
                    return false;
                } else {
                    self._selectedKnot = null;
                    return true;
                }
            };
            this.topView.mousemoveDelegate = function (x, y, knot, handler, type, isScrolling) {
                if (self._selectedKnot !== null) {
                    self.spline.knots[self._selectedKnot][0] -= x;
                    self.spline.knots[self._selectedKnot][2] -= y;
                    self.spline.nextHandlers[self._selectedKnot][0] -= x;
                    self.spline.nextHandlers[self._selectedKnot][2] -= y;
                    self.spline.previousHandlers[self._selectedKnot][0] -= x;
                    self.spline.previousHandlers[self._selectedKnot][2] -= y;
                    self.frontView.updateSpline(true);
                    self.topView.updateSpline(true);
                    self.hasSplineUpdated = true;
                    self.flow._updateLength();
                }
            };
            this.frontView.mousemoveDelegate = function (x, y, knot, handler, type, isScrolling) {
                if (self._selectedKnot !== null) {
                    self.spline.knots[self._selectedKnot][0] -= x;
                    self.spline.knots[self._selectedKnot][1] -= y;
                    self.spline.nextHandlers[self._selectedKnot][0] -= x;
                    self.spline.nextHandlers[self._selectedKnot][1] -= y;
                    self.spline.previousHandlers[self._selectedKnot][0] -= x;
                    self.spline.previousHandlers[self._selectedKnot][1] -= y;
                    self.frontView.updateSpline(true);
                    self.topView.updateSpline(true);
                    self.hasSplineUpdated = true;
                    self.flow._updateLength();
                }
            };
        }
    },

    moveHandlerButtonAction: {
        value: function () {
            var self = this;

            this.topView.isDrawingHandlers = this.frontView.isDrawingHandlers = true;
            this.topView.isHighlightingCloserHandler = this.frontView.isHighlightingCloserHandler = true;
            this.topView.mousedownDelegate =
            this.frontView.mousedownDelegate = function (x, y, knot, handler, type, isScrolling) {
                if (handler !== null) {
                    self._selectedHandler = handler;
                    self._selectedHandlerType = type;
                    return false;
                } else {
                    self._selectedHandler = null;
                    return true;
                }
            };
            this.topView.mousemoveDelegate = function (x, y, knot, handler, type, isScrolling) {
                if (self._selectedHandler !== null) {
                    if (self._selectedHandlerType === "next") {
                        var sX = self.spline.nextHandlers[self._selectedHandler][0] - x,
                            sY = self.spline.nextHandlers[self._selectedHandler][2] - y,
                            tmp;

                        tmp = self.spline.knots[self._selectedHandler];
                        self.spline.previousHandlers[self._selectedHandler][0] = tmp[0] * 2 - sX;
                        self.spline.previousHandlers[self._selectedHandler][2] = tmp[2] * 2 - sY;
                        self.spline.nextHandlers[self._selectedHandler][0] = sX
                        self.spline.nextHandlers[self._selectedHandler][2] = sY;
                        self.frontView.updateSpline(true);
                        self.topView.updateSpline(true);
                        self.hasSplineUpdated = true;
                        self.flow._updateLength();
                    } else {
                        var sX = self.spline.previousHandlers[self._selectedHandler][0] - x,
                            sY = self.spline.previousHandlers[self._selectedHandler][2] - y,
                            tmp;

                        tmp = self.spline.knots[self._selectedHandler];
                        self.spline.nextHandlers[self._selectedHandler][0] = tmp[0] * 2 - sX;
                        self.spline.nextHandlers[self._selectedHandler][2] = tmp[2] * 2 - sY;
                        self.spline.previousHandlers[self._selectedHandler][0] = sX
                        self.spline.previousHandlers[self._selectedHandler][2] = sY;
                        self.frontView.updateSpline(true);
                        self.topView.updateSpline(true);
                        self.hasSplineUpdated = true;
                        self.flow._updateLength();
                    }
                }
            };
            this.frontView.mousemoveDelegate = function (x, y, knot, handler, type, isScrolling) {
                if (self._selectedHandler !== null) {
                    if (self._selectedHandlerType === "next") {
                        var sX = self.spline.nextHandlers[self._selectedHandler][0] - x,
                            sY = self.spline.nextHandlers[self._selectedHandler][1] - y,
                            tmp;

                        tmp = self.spline.knots[self._selectedHandler];
                        self.spline.previousHandlers[self._selectedHandler][0] = tmp[0] * 2 - sX;
                        self.spline.previousHandlers[self._selectedHandler][1] = tmp[1] * 2 - sY;
                        self.spline.nextHandlers[self._selectedHandler][0] = sX
                        self.spline.nextHandlers[self._selectedHandler][1] = sY;
                        self.frontView.updateSpline(true);
                        self.topView.updateSpline(true);
                        self.hasSplineUpdated = true;
                        self.flow._updateLength();
                    } else {
                        var sX = self.spline.previousHandlers[self._selectedHandler][0] - x,
                            sY = self.spline.previousHandlers[self._selectedHandler][1] - y,
                            tmp;

                        tmp = self.spline.knots[self._selectedHandler];
                        self.spline.nextHandlers[self._selectedHandler][0] = tmp[0] * 2 - sX;
                        self.spline.nextHandlers[self._selectedHandler][1] = tmp[1] * 2 - sY;
                        self.spline.previousHandlers[self._selectedHandler][0] = sX
                        self.spline.previousHandlers[self._selectedHandler][1] = sY;
                        self.frontView.updateSpline(true);
                        self.topView.updateSpline(true);
                        self.hasSplineUpdated = true;
                        self.flow._updateLength();
                    }
                }
            };
        }
    },

    cameraButtonAction: {
        value: function () {
            var self = this;

            this.topView.mousedownDelegate =
            this.frontView.mousedownDelegate = function (x, y, knot, handler, type, isScrolling) {
                return false;
            };
            this.topView.mousemoveDelegate = function (x, y, knot, handler, type, isScrolling) {
                self.cameraPosition = [
                    self.cameraPosition[0] - x,
                    self.cameraPosition[1],
                    self.cameraPosition[2] - y
                ];
            };
            this.frontView.mousemoveDelegate = function (x, y, knot, handler, type, isScrolling) {
                self.cameraPosition = [
                    self.cameraPosition[0] - x,
                    self.cameraPosition[1] - y,
                    self.cameraPosition[2]
                ];
            };
        }
    },

    weightButtonAction: {
        value: function () {
            var self = this;

            this.topView.isDrawingDensities = this.frontView.isDrawingDensities = true;
            this.topView.isHighlightingCloserKnot = this.frontView.isHighlightingCloserKnot = true;
            this.topView.mousedownDelegate =
            this.frontView.mousedownDelegate = function (x, y, knot, handler, type, isScrolling) {
                if (knot !== null) {
                    self._selectedKnot = knot;
                    return false;
                } else {
                    self._selectedKnot = null;
                    return true;
                }
            };
            this.frontView.mousemoveDelegate =
            this.topView.mousemoveDelegate = function (x, y, knot, handler, type, isScrolling) {
                if (self._selectedKnot !== null) {
                    self.spline.densities[self._selectedKnot] += y * self.frontView._scale / 20;
                    if (self.spline.densities[self._selectedKnot] < 0.05) {
                        self.spline.densities[self._selectedKnot] = 0.05;
                    }
                    self.frontView.updateSpline(true);
                    self.topView.updateSpline(true);
                    self.hasSplineUpdated = true;
                    self.flow._updateLength();
                }
            };
        }
    },

    parametersButtonAction: {
        value: function () {
            this.parametersEditor.style.display = "block";
            this.frontView.element.style.display =
            this.topView.element.style.display = "none";
        }
    },*/

    spline: {
        value: null
    },

/*    _centralX: {
        enumerable: false,
        value: 0
    },

    centralX: {
        get: function () {
            return this._centralX;
        },
        set: function (value) {
            this._centralX = value;
        }
    },

    _centralY: {
        enumerable: false,
        value: 0
    },

    centralY: {
        get: function () {
            return this._centralY;
        },
        set: function (value) {
            this._centralY = value;
        }
    },

    _centralZ: {
        enumerable: false,
        value: 0
    },

    centralZ: {
        get: function () {
            return this._centralZ;
        },
        set: function (value) {
            this._centralZ = value;
        }
    },

    scale: {
        get: function () {
            return this._scale;
        },
        set: function (value) {
            this._scale = value;
        }
    },

    _scale: {
        enumerable: false,
        value: .2
    },

    scale: {
        get: function () {
            return this._scale;
        },
        set: function (value) {
            this._scale = value;
        }
    },

    handleResize: {
        enumerable: false,
        value: function () {
            this.needsDraw = true;
        }
    },*/

    convertFlowToShape: {
        value: function () {
            var bezier, shape, spline, i, k, j;

            this.viewport.scene = Scene.create().init();
            for (j = 0; j < this.flow.splinePaths.length; j++) {
                shape = Shape.create().init();
                shape.fillColor = "rgba(0,0,0,0)";
                spline = this.flow.splinePaths[j];
                for (i = 0; i < this.spline.knots.length - 1; i++) {
                    bezier = BezierCurve.create().init();
                    bezier.pushControlPoint(Vector3.create().initWithCoordinates([
                        spline._knots[i][0],
                        spline._knots[i][1],
                        spline._knots[i][2],
                    ]));
                    bezier.pushControlPoint(Vector3.create().initWithCoordinates([
                        spline._nextHandlers[i][0],
                        spline._nextHandlers[i][1],
                        spline._nextHandlers[i][2],
                    ]));
                    bezier.pushControlPoint(Vector3.create().initWithCoordinates([
                        spline._previousHandlers[i + 1][0],
                        spline._previousHandlers[i + 1][1],
                        spline._previousHandlers[i + 1][2],
                    ]));
                    bezier.pushControlPoint(Vector3.create().initWithCoordinates([
                        spline._knots[i + 1][0],
                        spline._knots[i + 1][1],
                        spline._knots[i + 1][2],
                    ]));
                    shape.pushBezierCurve(bezier);
                }
                this.viewport.scene.pushShape(shape);
            }
        }
    },

    convertShapeToFlow: {
        value: function () {
            var shape, bezier, i, spline, j;

            for (j = 0; j < this.viewport.scene.length; j++) {
                shape = this.viewport.scene.getShape(j);
                spline = this.flow.splinePaths[j];
                for (i = 0; i < shape.length; i++) {
                    bezier = shape.getBezierCurve(i);
                    spline._knots[i][0] = (bezier.getControlPoint(0).x);
                    spline._knots[i][1] = (bezier.getControlPoint(0).y);
                    spline._knots[i][2] = (bezier.getControlPoint(0).z);
                    spline._nextHandlers[i][0] = (bezier.getControlPoint(1).x);
                    spline._nextHandlers[i][1] = (bezier.getControlPoint(1).y);
                    spline._nextHandlers[i][2] = (bezier.getControlPoint(1).z);
                    spline._previousHandlers[i + 1][0] = (bezier.getControlPoint(2).x);
                    spline._previousHandlers[i + 1][1] = (bezier.getControlPoint(2).y);
                    spline._previousHandlers[i + 1][2] = (bezier.getControlPoint(2).z);
                    spline._knots[i + 1][0] = (bezier.getControlPoint(3).x);
                    spline._knots[i + 1][1] = (bezier.getControlPoint(3).y);
                    spline._knots[i + 1][2] = (bezier.getControlPoint(3).z);
                }
            }
            this.flow.needsDraw = true;
        }
    },

    handleSceneUpdated: {
        value: function () {
            this.convertShapeToFlow();
        }
    },

    prepareForDraw: {
        enumerable: false,
        value: function () {
            var i, j;

            for (j = 0; j < this.flow.splinePaths.length; j++) {
                this.spline = this.flow.splinePaths[j];
                if (!this.spline.previousDensities) {
                    this.spline.previousDensities = [];
                }
                if (!this.spline.nextDensities) {
                    this.spline.nextDensities = [];
                }
                for (i = 0; i < this.spline.knots.length; i++) {
                    if (typeof this.spline.previousHandlers[i] === "undefined") {
                        this.spline.previousHandlers[i] = [
                            2 * this.spline.knots[i][0] - this.spline.nextHandlers[i][0],
                            2 * this.spline.knots[i][1] - this.spline.nextHandlers[i][1],
                            2 * this.spline.knots[i][2] - this.spline.nextHandlers[i][2]
                        ];
                    }
                    if (typeof this.spline.nextHandlers[i] === "undefined") {
                        this.spline.nextHandlers[i] = [
                            2 * this.spline.knots[i][0] - this.spline.previousHandlers[i][0],
                            2 * this.spline.knots[i][1] - this.spline.previousHandlers[i][1],
                            2 * this.spline.knots[i][2] - this.spline.previousHandlers[i][2]
                        ];
                    }
                    if (typeof this.spline.previousDensities[i] === "undefined") {
                        this.spline.previousDensities[i] = 3;
                    }
                    if (typeof this.spline.nextDensities[i] === "undefined") {
                        this.spline.nextDensities[i] = 3;
                    }
                }
            }
            this.convertFlowToShape();
            this.viewport.scene.addEventListener("sceneUpdated", this, false);


            /*var self = this;

            if (this.flow.splinePaths[0]) {
                var i;

                this.spline = this.flow.splinePaths[0];
                if (!this.spline.previousDensities) {
                    this.spline.previousDensities = [];
                }
                if (!this.spline.nextDensities) {
                    this.spline.nextDensities = [];
                }
                for (i = 0; i < this.spline.knots.length; i++) {
                    if (typeof this.spline.previousHandlers[i] === "undefined") {
                        this.spline.previousHandlers[i] = [
                            2 * this.spline.knots[i][0] - this.spline.nextHandlers[i][0],
                            2 * this.spline.knots[i][1] - this.spline.nextHandlers[i][1],
                            2 * this.spline.knots[i][2] - this.spline.nextHandlers[i][2]
                        ];
                    }
                    if (typeof this.spline.nextHandlers[i] === "undefined") {
                        this.spline.nextHandlers[i] = [
                            2 * this.spline.knots[i][0] - this.spline.previousHandlers[i][0],
                            2 * this.spline.knots[i][1] - this.spline.previousHandlers[i][1],
                            2 * this.spline.knots[i][2] - this.spline.previousHandlers[i][2]
                        ];
                    }
                    if (typeof this.spline.previousDensities[i] === "undefined") {
                        this.spline.previousDensities[i] = 3;
                    }
                    if (typeof this.spline.nextDensities[i] === "undefined") {
                        this.spline.nextDensities[i] = 3;
                    }
                }
            } else {
                this.spline = Montage.create(FlowBezierSpline);
                this.flow._paths = [];
                this.flow._paths.push({
                    headOffset: 0,
                    tailOffset: 0
                });
                this.flow.splinePaths.push(this.spline);
            }
            window.addEventListener("resize", this, false);*/
            /*this.parametersEditor.textContent = JSON.stringify(this.spline.parameters);
            this.parametersEditor.addEventListener("keyup", function () {
                try {
                    self.spline.parameters = JSON.parse(self.parametersEditor.value);
                } catch (e) {
                }
                self.flow.needsDraw = true;
            }, false);*/
        }
    },

    willDraw: {
        enumerable: false,
        value: function () {
            /*this.frontView.width = this._element.offsetWidth;
            this.frontView.height = (this._element.offsetHeight - this.toolbar.element.offsetHeight - 1) >> 1;
            this.topView.width = this._element.offsetWidth;
            this.topView.height = this._element.offsetHeight - this.toolbar.element.offsetHeight - this.frontView.height - 1;*/
        }
    },

    draw: {
        enumerable: false,
        value: function () {
            //this.frontView.element.style.top = (this.topView.height + 1) + "px";
            /*this.removeClass(this._addButton, "selected");
            this.removeClass(this._moveButton, "selected");
            this.removeClass(this._weightButton, "selected");
            this.removeClass(this._zoomExtentsButton, "selected");
            this.addClass(this._selectedTool, "selected");*/

            /*this._frontViewContext.clearRect(0, 0, this._frontViewWidth, this._frontViewHeight);
            this._topViewContext.clearRect(0, 0, this._topViewWidth, this._topViewHeight);

            this._drawGrid(this._topViewContext, this._topViewWidth, this._topViewHeight, this._centerX, this._centerZ, this._scale, true);
            this._drawGrid(this._frontViewContext, this._frontViewWidth, this._frontViewHeight, this._centerX, this._centerY, this._scale, true);
            this._spline.transformMatrix = [
                this._scale, 0, 0, 0,
                0, 0, this._scale, 0,
                0, this._scale, 0, 0,
                this._topViewWidth / 2 - this.centerX * this._scale, this._topViewHeight / 2 - this.centerZ * this._scale, 0, 1
            ];
            this._spline.drawSpline(this._topViewContext);
            this._spline.drawKnots(this._topViewContext);
            if (this._selectedTool === this._weightButton) {
                this._spline.drawDensities(this._topViewContext);
            }
            if (this._drawHandlers) {
                this._spline.drawHandlers(this._topViewContext, [this._selectedKnot - 1, this._selectedKnot]);
            }
            this._spline.transformMatrix = [
                this._scale, 0, 0, 0,
                0, this._scale, 0, 0,
                0, 0, this._scale, 0,
                this._topViewWidth / 2 - this.centerX * this._scale, this._topViewHeight / 2 - this.centerY * this._scale, 0, 1
            ];
            this._spline.drawSpline(this._frontViewContext);
            this._spline.drawKnots(this._frontViewContext);
            if (this._selectedTool === this._weightButton) {
                this._spline.drawDensities(this._frontViewContext);
            }
            if (this._drawHandlers) {
                this._spline.drawHandlers(this._frontViewContext, [this._selectedKnot - 1, this._selectedKnot]);
            }*/
        }
    }

});