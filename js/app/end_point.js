define(function(require, exports, module) {
    var ControlPoint = require('app/control_point');

    function EndPoint(x,y,cp0,cp1){
        this.x = x || 0;
        this.y = y || 0;
        this.selected = false;
        this.cp0 = cp0 || new ControlPoint(x, y);
        this.cp1 = cp1 || new ControlPoint(x, y);
        this.cpBalance = true;
    }

    EndPoint.prototype.END_POINT_LENGTH = 5;
    EndPoint.prototype.MOUSE_CHECK_END_POINT_LENGTH = 10;
    EndPoint.prototype.END_POINT_COLOR = 'cyan';
    EndPoint.prototype.canvas = function(){
        return canvas;
    };

    EndPoint.prototype.ctx = function(){
        return ctx;
    };
    EndPoint.prototype.draw = function(height, ratio){
        var self = this;
        height = height || self.END_POINT_LENGTH;
        ratio = ratio || 1;
        self.ctx.beginPath();
        self.ctx.rect(self.x*ratio - height/2, self.y*ratio - height/2, height, height);
    };

    EndPoint.prototype.print = function(ratio){
        ratio = ratio || 1;
        this.draw(this.END_POINT_LENGTH, ratio);
        this.ctx.save();
        this.ctx.strokeStyle = this.END_POINT_COLOR;
        this.ctx.stroke();
        if(this.selected){
            this.ctx.fillStyle = this.END_POINT_COLOR;
            this.ctx.fill();
        }
        this.ctx.restore();
    };
    EndPoint.prototype.printAndControlPoints = function(ratio){
        ratio = ratio || 1;
        this.print(ratio);
        if(!this.selected) return;
        if(this.cp0.x !== this.x || this.cp0.y !== this.y){
            this.cp0.print(ratio);
            line(this.cp0.x, this.cp0.y, this.x,this.y, this.ctx, this.END_POINT_COLOR);

        }
        if(this.cp1.x !== this.x || this.cp1.y !== this.y){
            this.cp1.print(ratio);
            line(this.cp1.x, this.cp1.y, this.x,this.y, this.ctx, this.END_POINT_COLOR);
        }

        function line(x,y,x1,y1, ctx, color){
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x*ratio,y*ratio);
            ctx.strokeStyle = color;
            ctx.lineTo(x1*ratio,y1*ratio);
            ctx.stroke();
            ctx.restore();
        }

    };
    EndPoint.prototype.isInPoint = function(x, y){
        var self = this;
        self.draw(self.MOUSE_CHECK_END_POINT_LENGTH);
        if(self.ctx.isPointInPath(x, y)) {
            return self;
        }
        if(self.selected){
            if(self.cp0.isInPoint(x, y)){
                return self.cp0;
            }
            if(self.cp1.isInPoint(x, y)){
                return self.cp1;
            }
        }
        return false;
    };

    EndPoint.prototype.distanceFromControlPoint = function(controlPoint) {
        return Math.sqrt(Math.pow(this.x - controlPoint.x, 2) + Math.pow(this.y - controlPoint.y, 2));
    };

    EndPoint.prototype.calculateControlPoint = function(x, y, controlPoint){
        if(this.cpBalance) {
            controlPoint.counterpart = (controlPoint === this.cp0 ? this.cp1 : this.cp0);
            controlPoint.counterpart.staticDistance = controlPoint.counterpart.staticDistance ?
                                                        controlPoint.counterpart.staticDistance:
                                                        this.distanceFromControlPoint(controlPoint.counterpart);

            var staticDistance = controlPoint.counterpart.staticDistance;
            var dynamicDistance = this.distanceFromControlPoint(controlPoint);

            controlPoint.counterpart.x = staticDistance/dynamicDistance * (this.x-x) + this.x;
            controlPoint.counterpart.y = staticDistance/dynamicDistance * (this.y-y) + this.y;
            // controlPoint.counterpart will be deleted on mouseup
        }
        controlPoint.x = x;
        controlPoint.y = y;
    };

    module.exports = EndPoint;
});