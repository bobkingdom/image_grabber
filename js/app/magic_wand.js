define(function(require, exports, module) {
    var HIDDEN_CLASS = 'hidden';

    var SelectionBuilder = require('app/selection_builder.js');
    var marchingAnts = require('app/marching_ants');
    var util = require('app/util');
    var zoom = require('app/zoom');

    var artCanvas = document.querySelector('#artCanvas');
    var artContext = artCanvas.getContext('2d');
    var selectionCanvas = document.querySelector('#selectionCanvas');
    var selectionContext = selectionCanvas.getContext('2d');

    var listeners;
    var builder;

    function MagicWand() {
        var self = this;
        self.name = 'magicwand';
        self.tolerance = 32/255;
        self.contiguous = true;
    }

    MagicWand.prototype.buildSelection = function(e) {
        var self = this;
        var compositCanvas = artCanvas.compositCanvas;
        var compositContext = compositCanvas.getContext('2d');
        var ratio = zoom.zoomRatio;
        var src = compositContext.getImageData(0, 0, compositCanvas.width, compositCanvas.height);
        var point = util.canvas.windowToCanvas(e.clientX, e.clientY, artCanvas);
        var relativePoint = {
            x: Math.round(point.x / ratio),
            y: Math.round(point.y / ratio)
        };
        var selectedPixels;

        marchingAnts.deselect();
        selectionContext.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);

        builder = new SelectionBuilder(src, relativePoint, self.tolerance, self.contiguous);
        builder.mask(function(selectedPixels) {
            selectionCanvas.selectedPixels = selectedPixels;
            var pixels = util.canvas.scaleImageData(selectedPixels, selectionCanvas.width, selectionCanvas.height);
            marchingAnts.ants(selectionCanvas, pixels);
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