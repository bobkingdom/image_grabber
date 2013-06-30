define(function(require, exports, module) {
    function MarchingAnts() {
        this.antsInterval = null;
        this.selectedOutline = null;
    }

    MarchingAnts.prototype.createContext = function(width, height) {
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        canvas.width = width, canvas.height = height;
        return context;
    };

    MarchingAnts.prototype.createOutlineMask = function(srcImageData, threshold) {
        var srcData = srcImageData.data;
        var width = srcImageData.width,
            height = srcImageData.height;

        function get(x, y) {
            if (x < 0 || x >= width || y < 0 || y >= height) return;
            var offset = ((y * width) + x) * 4;
            return srcData[offset + 3];
        }

        var context = this.createContext(width, height);
        var dstImageData = context.getImageData(0, 0, width, height);
        var dstData = dstImageData.data;

        function set(x, y, value) {
            var offset = ((y * width) + x) * 4;
            dstData[offset + 0] = value;
            dstData[offset + 1] = value;
            dstData[offset + 2] = value;
            dstData[offset + 3] = 0xFF;
        }

        function match(x, y) {
            var alpha = get(x, y);
            return alpha == null || alpha >= threshold;
        }

        function isEdge(x, y) {
            return !match(x - 1, y - 1) || !match(x + 0, y - 1) || !match(x + 1, y - 1) || !match(x - 1, y + 0) || false || !match(x + 1, y + 0) || !match(x - 1, y + 1) || !match(x + 0, y + 1) || !match(x + 1, y + 1);
        }

        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                if (match(x, y) && isEdge(x, y)) {
                    set(x, y, 0x00);
                } else {
                    set(x, y, 0xFF);
                }
            }
        }

        return dstImageData;
    };

    MarchingAnts.prototype.ant = function(x, y, offset) {
        return ((6 + y + offset % 12) + x) % 12 > 6 ? 0x00 : 0xFF;
    };

    MarchingAnts.prototype.renderMarchingAnts = function(imageData, outlineMask, antOffset) {
        var data = imageData.data;
        var width = imageData.width,
            height = imageData.height;
        var outline = outlineMask.data;

        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var offset = ((y * width) + x) * 4;
                var isEdge = outline[offset] == 0x00;

                if (isEdge) {
                    var value = this.ant(x, y, antOffset);
                    data[offset + 0] = value;
                    data[offset + 1] = value;
                    data[offset + 2] = value;
                    data[offset + 3] = 0xFF;
                } else {
                    data[offset + 3] = 0x00;
                }
            }
        }

        return imageData;
    };

    MarchingAnts.prototype.ants = function(canvas, imageData) {
        var self = this;
        var context = canvas.getContext("2d");
        var offset = 0;
        self.selectedOutline = self.createOutlineMask(imageData, 0xC0);

        self.antsInterval = setInterval(function() {
            context.putImageData(self.renderMarchingAnts(imageData, self.selectedOutline, offset -= 2), 0, 0);
        }, 167);
    };

    MarchingAnts.prototype.deselect = function() {
        clearInterval(this.antsInterval);
    };

    module.exports = new MarchingAnts();
});