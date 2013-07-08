define(function(require, exports, module) {
    require('app/canvas_to_blob');

    var SCALE = 3;

    var tools = require('app/tools');
    var util = require('app/util');
    var zoom = require('app/zoom');
    var pen = require('app/pen');
    var magicWand = require('app/magic_wand');
    var marchingAnts = require('app/marching_ants');
    var selection = require('app/selection');

    var pasteBoard = document.querySelector('#pasteBoard');
    var artCanvas = document.querySelector('#artCanvas');
    var artContext = artCanvas.getContext('2d');
    var selectionCanvas = document.querySelector('#selectionCanvas');
    var selectionContext = selectionCanvas.getContext('2d');
    var penCanvas = document.querySelector('#penCanvas');

    var body = document.body;
    var loadImg = document.createElement('img');

    function showPlaceholder(e) {
        artContext.drawImage(loadImg, 0, 0);
    }

    function enableOptions() {
        var inputs = document.querySelectorAll('input');
        var buttons = document.querySelectorAll('button');
        Array.prototype.forEach.call(inputs, function(input) {
            input.removeAttribute('disabled');
        });
        Array.prototype.forEach.call(buttons, function(button) {
            button.removeAttribute('disabled');
        });
    }

    function disableOptions() {
        var inputs = document.querySelectorAll('input');
        var buttons = document.querySelectorAll('button');
        Array.prototype.forEach.call(inputs, function(input) {
            input.setAttribute('disabled', 'disabled');
        });
        Array.prototype.forEach.call(buttons, function(button) {
            button.setAttribute('disabled', 'disabled');
        });
    }

    function readFile(e) {
        e.preventDefault();

        var file = e.dataTransfer.files[0],
            reader = new FileReader();
        reader.onload = function (event) {
            if(file.type.indexOf("image") > -1){
                reloadImage(event.target.result);
            }
        };
        reader.readAsDataURL(file);

        return false;
    }

    function reloadImage(data) {
        var img = new Image();
        var options = document.querySelector('#options');
        img.onload = function(){
            if(options.getAttribute('data-enabled') === '0') {
                options.setAttribute('data-enabled', '1');
                enableOptions();
            }

            var w = img.width;
            var h = img.height;
            var winWidth = window.innerWidth;
            var winHeight = window.innerHeight;
            var level = zoom.calculateInitialZoomLevel(Math.min(winWidth/w, winHeight/h));

            artContext.clearRect(0, 0, artCanvas.width, artCanvas.height);
            artCanvas.width = artCanvas.origWidth = w;
            artCanvas.height = artCanvas.origHeight = h;
            // artContext.drawImage(img, 0, 0);

            artCanvas.origCanvas = document.createElement('canvas');
            artCanvas.origCanvas.width = w;
            artCanvas.origCanvas.height = h;
            artCanvas.origCanvas.getContext('2d').drawImage(img, 0, 0);

            artCanvas.bitmapMaskedCanvas = document.createElement('canvas');
            artCanvas.bitmapMaskedCanvas.width = w;
            artCanvas.bitmapMaskedCanvas.height = h;
            artCanvas.bitmapMaskedCanvas.getContext('2d').drawImage(img, 0, 0);

            artCanvas.compositCanvas = document.createElement('canvas');
            artCanvas.compositCanvas.width = w;
            artCanvas.compositCanvas.height = h;
            artCanvas.compositCanvas.getContext('2d').drawImage(img, 0, 0);

            zoom.zoomTo(level);
            pen.reset();
        };
        img.src = data;
        window.addEventListener('resize', redraw, false);
    }

    function redraw(e) {
        zoom.render();
    }

    // before zooming, clear marching ants
    util.Event.addEventListener('beforezoom', function(e) {
        if(!selectionCanvas.selectedPixels) return;
        marchingAnts.deselect();
        selectionContext.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
    });

    // done zooming, set correct canvas size
    // redraw selection marching ants
    util.Event.addEventListener('zoom', function(e) {
        if(!selectionCanvas.selectedPixels) return;
        var pixels = util.canvas.scaleImageData(selectionCanvas.selectedPixels, selectionCanvas.width, selectionCanvas.height);
        marchingAnts.ants(selectionCanvas, pixels);
    });

    // render placeholder image
    loadImg.src = 'images/placeholder_drop.png';
    loadImg.addEventListener('load', showPlaceholder, false);

    // drag and drop
    body.ondragover = function () { return false; };
    body.ondragend = function () { return false; };
    body.ondrop = readFile;

    // ============================================
    // Tools' options
    // Save Button
    document.querySelector('#saveBtn').onclick = function(e) {
        /*var dataURL;
        if(artCanvas.isMasked) {
            // If masked, needs to simulate mask button click before export image data
            var event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, true, document.defaultView, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            document.querySelector('#pMask').dispatchEvent(event);

            dataURL = artCanvas.maskedCanvas.toDataURL();
        } else {
            dataURL = artCanvas.compositCanvas.toDataURL();
        }*/

        function saveImage(blob) {
            var a = document.createElement('a');
            a.href = window.URL.createObjectURL(blob);
            a.download = '图片.png';
            a.textContent = '';
            document.body.appendChild(a);
            a.click();
        }

        if(artCanvas.masked) {
            var event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, true, document.defaultView, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            document.querySelector('#pMask').dispatchEvent(event);
            artCanvas.maskedCanvas.toBlob(saveImage);
        } else {
            artCanvas.compositCanvas.toBlob(saveImage);
        }
    };

    // Magic Wand Options
    document.querySelector('#mwContiguous').onchange = function(e) {
        magicWand.contiguous = e.target.checked;
    };
    document.querySelector('#mwTolerance').onchange = function(e) {
        var tolerance = e.target.value;
        if(tolerance > 255) tolerance = 255;
        else if(tolerance < 0) tolerance = 0;
        magicWand.tolerance = tolerance / 255;
    };
    document.querySelector('#mwDeselect').onclick = function(e) {
        marchingAnts.deselect();
        selectionContext.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
        selectionCanvas.selectedPixels = null;
    };

    // Pen Tool Options
    document.querySelector('#pMask').onclick = function(e) {
        var compositCanvas = artCanvas.compositCanvas;
        var compositContext = compositCanvas.getContext('2d');
        var w = artCanvas.origWidth * zoom.zoomRatio;
        var h = artCanvas.origHeight * zoom.zoomRatio;
        var displayW = artCanvas.width;
        var displayH = artCanvas.height;
        artCanvas.isMasked = true;
        artCanvas.maskedCanvas = pen.getCanvas(compositCanvas);
        artContext.clearRect(0, 0, displayW, displayH);
        artContext.drawImage(artCanvas.maskedCanvas, 0, 0, artCanvas.origWidth, artCanvas.origHeight, 0, 0, w, h);
    };
    document.querySelector('#pUnmask').onclick = function(e) {
        var w = artCanvas.origWidth * zoom.zoomRatio;
        var h = artCanvas.origHeight * zoom.zoomRatio;
        artCanvas.isMasked = false;
        artContext.drawImage(artCanvas.compositCanvas, 0, 0, artCanvas.origWidth, artCanvas.origHeight, 0, 0, w, h);
    };

    // Zoom Tool Options
    document.querySelector('#zActual').onclick = function(e) {
        zoom.zoomTo(7);
    };
    document.querySelector('#zFit').onclick = function(e) {
        var winWidth = window.innerWidth;
        var winHeight = window.innerHeight;
        var level = zoom.fitToWindow(Math.min(winWidth/artCanvas.origWidth, winHeight/artCanvas.origHeight));
        zoom.zoomTo(level);
    };

    // If any input box is focused, deactive Selection's delete functionality
    Array.prototype.forEach.call(document.querySelectorAll('input[type=number]'), function(current) {
        current.addEventListener('focus', function(){selection.deactive();}, false);
        current.addEventListener('blur', function(){selection.active();}, false);
    });

    // init
    disableOptions();
    tools.init('#tools');
});