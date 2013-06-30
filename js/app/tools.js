define(function(require, exports, module) {
    var SELECTED_CLASS = 'selected';

    var MAGIC_WAND_CLASS = 'magicWandTool';
    var PATH_SELECTION_CLASS = 'pathSelectionTool';
    var PEN_CLASS = 'penTool';
    var ZOOM_CLASS = 'zoomTool';

    var util = require('app/util');

    var magicWandTool = require('app/magic_wand');
    var pathSelectionTool = require('app/path_selection');
    var penTool = require('app/pen');
    var zoomTool = require('app/zoom');

    function Tools() {
        this.currentTool = this.toolsList.penTool;
        this.currentTool.node = document.querySelector('.' + PEN_CLASS);
        this.currentTool.active();
    }

    Tools.prototype.toolsList = {
        magicWandTool: magicWandTool,
        pathSelectionTool: pathSelectionTool,
        penTool: penTool,
        zoomTool: zoomTool
    };

    Tools.prototype.init = function(container) {
        var self = this;

        function changeTool(e) {
            e.stopPropagation();

            var t = e.target;
            if(!util.DOM.cssjs('check', t.parentNode, 'tool')) return;

            // done with the old tool
            self.currentTool.deactive();
            util.DOM.cssjs('remove', self.currentTool.node.parentNode, SELECTED_CLASS);

            // set up the new tool
            util.DOM.cssjs('add', t.parentNode, SELECTED_CLASS);
            self.currentTool = self.toolsList[t.getAttribute('data-tool')];
            self.currentTool.node = t;
            self.currentTool.active();
        }

        container = container.nodeType ? container : document.querySelector(container);
        container.addEventListener('click', changeTool);
    };

    module.exports = new Tools();
});