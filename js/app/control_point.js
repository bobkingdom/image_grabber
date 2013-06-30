define(function(require, exports, module) {
    function ControlPoint(x,y){
        this.x = x||0;
        this.y = y||0;

    }

    ControlPoint.prototype.CONTROL_POINT_RADIUS = 5;
    ControlPoint.prototype.CONTROL_POINT_COLOR = 'cyan';

    ControlPoint.prototype.ctx = function(){
        return ctx;
    };

    ControlPoint.prototype.draw = function(ratio){
        ratio = ratio || 1;
        var self = this;
        self.ctx.beginPath();
        self.ctx.arc(this.x*ratio, this.y*ratio, this.CONTROL_POINT_RADIUS, 0, 2*Math.PI, false);
    };

    ControlPoint.prototype.print = function(ratio){
        this.draw(ratio);
        this.ctx.save();
        this.ctx.strokeStyle = this.CONTROL_POINT_COLOR;
        this.ctx.fillStyle = this.CONTROL_POINT_COLOR;
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.restore();
    };

    ControlPoint.prototype.isInPoint = function(x, y){
        var self = this;
        self.draw();
        if(self.ctx.isPointInPath(x, y)) {
            return true;
        }
        return false;
    };

    module.exports = ControlPoint;
});