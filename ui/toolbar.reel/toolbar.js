var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component,
    PenTools = require("ui/pen-tools");

/**
    Description TODO
    @class module:"ui/toolbar.reel".Toolbar
    @extends module:montage/ui/component.Component
*/
exports.Toolbar = Montage.create(Component, /** @lends module:"ui/toolbar.reel".Toolbar# */ {

    selectedTool: {
        value: null
    },

    _tools: {
        value: {}
    },

    handleClick: {
        enumerable: false,
        value: function (event) {
            if (event.target.getAttribute("data-tool")) {
                if (event.target !== this._element) {
                    var elements = this.element.getElementsByTagName("*"),
                        i;

                    for (i = 0; i < elements.length; i++) {
                        elements[i].classList.remove("flow-Editor-Toolbar-Button--selected");
                    }
                    event.target.classList.add("flow-Editor-Toolbar-Button--selected");
                    this.selectedTool = this._tools[event.target.getAttribute("data-tool")];
                }
                event.preventDefault();
            }
        }
    },

    enterDocument: {
        value: function (firstTime) {
            if (firstTime) {
                this._tools = {
                    "arrow": PenTools.ArrowTool.create(),
                    "convert": PenTools.ConvertTool.create(),
                    "pen": PenTools.PenTool.create(),
                    "add": PenTools.AddTool.create(),
                    "helix": PenTools.HelixTool.create()
                };
            }
        }
    },

    prepareForActivationEvents: {
        enumerable: false,
        value: function () {
            this._element.addEventListener("click", this, false);
        }
    },

    handleCloseButtonAction: {
        value: function (evt) {
            window.top.document.getElementsByTagName("iframe")[0].parentNode.component.currentMode = 0;
            evt.stop();
            this.dispatchEventNamed("exitModalEditor", true, true);
        }
    },

    isInspectorVisible: {
        value: true
    },

    handleInspectorButtonAction: {
        value: function () {
            this.isInspectorVisible = !this.isInspectorVisible;
        }
    }

});
