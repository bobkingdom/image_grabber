define(function(require, exports, module) {
    function SelectionBuilder(src, point, tolerance, contiguous) {
        // count for debug
        // this.count = 0;
        this.contiguous = contiguous;

        this.srcData = src.data;
        this.width = src.width;
        this.height = src.height;
        this.pickedPoint = {
            x: point.x,
            y: point.y
        };
        this.visited = [];
        this.marked = [];
        this.visited.length = this.marked.length = this.width * this.height;
        //this._initializeVisited();

        // Assume 8-bit image for simplicity for now
        this.tolerance = 256 * tolerance;
        this.stack = [];
    }

    SelectionBuilder.prototype.mask = function(callback) {
        var self = this;
        var worker = new Worker('js/app/selection_builder.worker.js');
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        var imgData = context.createImageData(self.width, self.height);

        worker.onmessage = function(e) {
            callback(e.data);
        };

        worker.onerror = function(event) {
            throw new Error(event.message + " (" + event.filename + ":" + event.lineno + ")");
        };

        worker.postMessage({
            contiguous: self.contiguous,
            tolerance: self.tolerance,
            pickedPoint: self.pickedPoint,
            srcData: self.srcData,
            desData: imgData,
            width: self.width,
            height: self.height
        });
    };

    module.exports = SelectionBuilder;
});