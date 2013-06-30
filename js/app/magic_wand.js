define(function(require, exports, module) {
    var HIDDEN_CLASS = 'hidden';

    var SelectionBuilder = require('app/selection_builder.js');
    var marchingAnts = require('app/marching_ants');
    var util = require('app/util');

    var artCanvas = document.querySelector('#artCanvas');
    var artContext = artCanvas.getContext('2d');
    var selectionCanvas = document.querySelector('#selectionCanvas');
    var selectionContext = selectionCanvas.getContext('2d');

    var listeners;
    var builder;

    function MagicWand() {
        var self = this;

        self.tolerance = 32/255;
        self.contiguous = true;
    }

    MagicWand.prototype.buildSelection = function(e) {
        var self = this;
        var src = artContext.getImageData(0, 0, artCanvas.width, artCanvas.height);
        var point = util.canvas.windowToCanvas(e.clientX, e.clientY, artCanvas);
        var selectedPixels;

        marchingAnts.deselect();
        selectionContext.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);

        builder = new SelectionBuilder(src, point, self.tolerance, self.contiguous);
        builder.mask(function(selectedPixels) {
            selectionCanvas.selectedPixels = util.canvas.copyImageData(selectedPixels);
            marchingAnts.ants(selectionCanvas, selectedPixels);
        });
    };

    MagicWand.prototype.deactive = function() {
        var self = this;

        if(listeners) {
            selectionCanvas.removeEventListener('click', listeners.mousedown, false);
        }

        util.DOM.cssjs('add', document.querySelector('div[data-tool="magicWand"]'), HIDDEN_CLASS);
    };

    MagicWand.prototype.active = function() {
        var self = this;
        listeners = {
            mousedown: function(e){self.buildSelection(e);}
        };
        selectionCanvas.addEventListener('click', listeners.mousedown, false);
        util.DOM.cssjs('remove', document.querySelector('div[data-tool="magicWand"]'), HIDDEN_CLASS);
    };

    module.exports = new MagicWand();
});