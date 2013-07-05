var SEGMENT_LEFT = 'segmentLeft';
var SEGMENT_RIGHT = 'segmentRight';
var SEGMENT_Y = 'segmentY';

addEventListener("message", function(event) {
    var data = event.data;
    var dataToReturn = data.desData;

    var contiguous = data.contiguous;
    var tolerance = parseInt(data.tolerance, 10);

    var visited = [];
    var marked = [];
    var stack = [];
    visited.length = marked.length = data.width * data.height;

    if(data.contiguous) {
        searchLineAtPoint(data.pickedPoint);
        while (stack.length > 0) {
            var segment = stack.pop();
            processSegment(segment);
        }

        dataToReturn = createMask();
    } else {
        dataToReturn = searchEachPoint();
    }

    postMessage(dataToReturn);

    function searchEachPoint() {
        var pixels = dataToReturn.data;

        for (var y = 0; y < data.height; y++) {
            var thisRow = y * data.width;

            for (var x = 0; x < data.width; x++) {
                if (pixelMatches({x:x, y:y})) {
                    pixels[(thisRow + x) * 4] = 0x00;
                    pixels[(thisRow + x) * 4 + 1] = 0x00;
                    pixels[(thisRow + x) * 4 + 2] = 0x00;
                    pixels[(thisRow + x) * 4 + 3] = 0xFF;
                }
            }
        }

        return dataToReturn;
    }

    function searchLineAtPoint(point) {
        if ((point.y < 0) || (point.y >= data.height) || (point.x < 0) || (point.x >= data.width)) return;

        var hasBeenVisited = visited[point.y * data.width + point.x];
        if (hasBeenVisited) return;

        if (!markPointIfMatches(point)) return;

        // search left
        var x = point.x - 1;
        var left = point.x;
        while (x >= 0) {
            if (markPointIfMatches({
                x: x,
                y: point.y
            })) {
                left = x;
            } else {
                break;
            }
            x = x - 1;
        }

        // search right
        var right = point.x;
        x = point.x + 1;
        while (x < data.width) {
            if (markPointIfMatches({
                x: x,
                y: point.y
            })) {
                right = x;
            } else {
                break;
            }
            x = x + 1;
        }

        // push the segment we just found onto the stack, so we can look above
        // and below it later.
        var segment = {
            'segmentLeft': left,
            'segmentRight': right,
            'segmentY': point.y
        };
        stack.push(segment);
    }

    function markPointIfMatches(point) {
        var offset = point.y * data.width + point.x;
        var hasBeenVisited = visited[offset];
        if (hasBeenVisited) return false;

        var matches = false;
        if (pixelMatches(point)) {
            matches = true;
            marked[offset] = true;
        }
        visited[offset] = true;

        return matches;
    }

    function pixelMatches(point) {
        var difference = pixelDifference(point);
        return difference <= tolerance;
    }

    function pixelDifference(point) {
        var offset = (point.y * data.width + point.x) * 4;
        var clicked = (data.pickedPoint.y * data.width + data.pickedPoint.x) * 4;
        return Math.max(Math.abs(data.srcData[offset] - data.srcData[clicked]),
        Math.abs(data.srcData[offset + 1] - data.srcData[clicked + 1]),
        Math.abs(data.srcData[offset + 2] - data.srcData[clicked + 2]));
    }

    function processSegment(segment) {
        var left = segment[SEGMENT_LEFT];
        var right = segment[SEGMENT_RIGHT];
        var y = segment[SEGMENT_Y];
        var x = 0;

        for (x = left; x <= right; x++) {
            searchLineAtPoint({
                x: x,
                y: y - 1
            }); // check above
            searchLineAtPoint({
                x: x,
                y: y + 1
            }); // check below
        }
    }

    function createMask() {
        var pixels = dataToReturn.data;

        for (var y = 0; y < data.height; y++) {
            var thisRow = y * data.width;

            for (var x = 0; x < data.width; x++) {
                if (marked[thisRow + x]) {
                    pixels[(thisRow + x) * 4] = 0x00;
                    pixels[(thisRow + x) * 4 + 1] = 0x00;
                    pixels[(thisRow + x) * 4 + 2] = 0x00;
                    pixels[(thisRow + x) * 4 + 3] = 0xFF;
                }
            }
        }

        return dataToReturn;
    }
}, false);