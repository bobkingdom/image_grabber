define(function(require, exports, module) {
    var HIDDEN_CLASS = 'hidden';
    var SCALE = 3;

    var util = require('app/util');
    var pasteBoard = document.querySelector('#pasteBoard');
    var artCanvas = document.querySelector('#artCanvas');
    var artContext = artCanvas.getContext('2d');
    var selectionCanvas = document.querySelector('#selectionCanvas');
    var penCanvas = document.querySelector('#penCanvas');
    artCanvas.origWidth = artCanvas.origWidth ? artCanvas.origWidth : 640;
    artCanvas.origHeight = artCanvas.origHeight ? artCanvas.origHeight : 400;

    function Zoom() {
        var self = this;
        self.name = 'zoom';
        self.zoomLevels = [1/12, 1/8, 1/6, 1/4, 1/3, 1/2, 2/3, 1, 2, 3, 4, 5, 6, 7, 8];
        self.zoomLevel = 7; // supports 0 - 14, 7 is 100%
        self.zoomRatio = 1;

        document.addEventListener('keyup', function(e) {
            self.zoomInOrOut(e);
        }, false);
    }

    Zoom.prototype.fitToWindow = function(ratio) {
        var self = this;
        for(var i = 0, len = self.zoomLevels.length; i < len; i++) {
            if(ratio <= self.zoomLevels[i]) {
                return i;
            }
        }
        return self.zoomLevels[len-1];
    };

    Zoom.prototype.calculateInitialZoomLevel = function(ratio) {
        var self = this;
        var level = 7;

        if(ratio >= 1) {
            return level;
        } else {
            level = self.fitToWindow(ratio);
            return level;
        }
    };

    Zoom.prototype.zoomInOrOut = function(e) {
        /** keydown/keyup event.keyCode
         *
         *  Opera   MSIE  Firefox  Safari  Chrome    Key pressed
         *  ----------------------------------------------------
         *   61     187      61     187     187      = +
         *  189     189     173     189     189      - _
         */
        var self = this;

        // set the new zoom ratio
        if(e.keyCode === 189 || e.keyCode === 173) {
            // zoom out
            self.zoomLevel--;
            if(self.zoomLevel < 0) self.zoomLevel = 0;
            self.zoomRatio = self.zoomLevels[self.zoomLevel];
            self.render();
        } else if(e.keyCode === 187 || e.keyCode === 61) {
            // zoom in
            self.zoomLevel++;
            if(self.zoomLevel >= self.zoomLevels.length) self.zoomLevel = self.zoomLevels.length - 1;
            self.zoomRatio = self.zoomLevels[self.zoomLevel];
            self.render();
        }
    };

    Zoom.prototype.zoomTo = function(level) {
        var self = this;
        self.zoomLevel = level;
        self.zoomRatio = self.zoomLevels[level];
        self.render();
    };

    Zoom.prototype.render = function() {
        util.Event.dispatch('beforezoom', self);

        var self = this;
        var w = artCanvas.origWidth * self.zoomRatio;
        var h = artCanvas.origHeight * self.zoomRatio;

        pasteBoard.style.width = w * SCALE + 'px';
        pasteBoard.style.height = h * SCALE + 'px';
        artCanvas.style.width = w + 'px';
        artCanvas.style.height = h + 'px';
        artCanvas.width = w;
        artCanvas.height = h;

        artContext.webkitImageSmoothingEnabled = false;
        artContext.mozImageSmoothingEnabled = false;
        artContext.imageSmoothingEnabled = false;

        if(artCanvas.isMasked) {
            artContext.drawImage(artCanvas.maskedCanvas, 0, 0, artCanvas.origWidth, artCanvas.origHeight, 0, 0, w, h);
        } else {
            artContext.drawImage(artCanvas.compositCanvas, 0, 0, artCanvas.origWidth, artCanvas.origHeight, 0, 0, w, h);
        }

        util.canvas.center(artCanvas);
        window.scrollTo(
            (document.body.scrollWidth - window.innerWidth)/2,
            (document.body.scrollHeight - window.innerHeight)/2
        );
        setTimeout(function() {
            util.canvas.alignTo(selectionCanvas, artCanvas);
            util.canvas.alignToWithScaleAndOffset(penCanvas, artCanvas, SCALE, -1/SCALE);
            util.Event.dispatch('zoom', self);
        }, 150);
    };

    Zoom.prototype.deactive = function() {
        util.DOM.cssjs('add', document.querySelector('div[data-tool="zoom"]'), HIDDEN_CLASS);
    };

    Zoom.prototype.active = function() {
        util.DOM.cssjs('remove', document.querySelector('div[data-tool="zoom"]'), HIDDEN_CLASS);
    };


    module.exports = new Zoom();
});