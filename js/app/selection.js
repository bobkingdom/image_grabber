define(function(require, exports, module) {
    var artCanvas = document.querySelector('#artCanvas');
    var artContext = artCanvas.getContext('2d');
    var selectionCanvas = document.querySelector('#selectionCanvas');
    var tools = require('app/tools');

    function Selection() {
        var self = this;
        self.active();
    }

    Selection.prototype.deleteSelectedPixels = function(e) {
        if(tools.currentTool.name !== 'pen' && e.keyCode === 8) {
            e.preventDefault();
            if(!selectionCanvas.selectedPixels) return;

            var compositCanvas = artCanvas.compositCanvas;
            var compositContext = compositCanvas.getContext('2d');

            var w = compositCanvas.width;
            var h = compositCanvas.height;
            var displayW = selectionCanvas.width;
            var displayH = selectionCanvas.height;

            var tempCanvas = document.createElement('canvas');
            var tempContext = tempCanvas.getContext('2d');
            tempCanvas.width = w;
            tempCanvas.height = h;
            tempContext.putImageData(selectionCanvas.selectedPixels, 0, 0);

            artContext.save();
            artContext.globalCompositeOperation = 'destination-out';
            artContext.drawImage(tempCanvas, 0, 0, w, h, 0, 0, displayW, displayH);
            artContext.restore();

            compositContext.save();
            compositContext.globalCompositeOperation = 'destination-out';
            compositContext.drawImage(tempCanvas, 0, 0, w, h);
            compositContext.restore();
        }
    };

    Selection.prototype.active = function() {
        var self = this;
        document.addEventListener('keydown', self.deleteSelectedPixels, false);
    };

    Selection.prototype.deactive = function() {
        var self = this;
        document.removeEventListener('keydown', self.deleteSelectedPixels);
    };

    return new Selection();
});