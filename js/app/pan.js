define(function(require, exports, module) {
    function Pan() {
        document.addEventListener('keydown', startPanning, false);
        document.addEventListener('keyup', stopPanning, false);
    }

    function startPanning(e) {
        e.preventDefault();
    }

    function stopPanning(e) {
        e.preventDefault();
    }
});