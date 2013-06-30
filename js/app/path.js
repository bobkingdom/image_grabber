define(function(require, exports, module) {
    var ControlPoint = require('app/control_point.js');

    function Path(){
        this.isClose = false;
    }
    Path.prototype = new Array;

    Path.prototype.isInPoint = function(x, y){
        var cep;
        for(var i=0,l= this.length; i< l; i++){
            cep = this[i].isInPoint(x, y);
            if(cep){
                return {ep: this[i], cp : cep instanceof ControlPoint ? cep : null};
            }
        }
        return null;
    };
    Path.prototype.removeSelected = function(x, y){
        this.forEach(function(ep){
            ep.selected = false;
        });
    };
    Path.prototype.deleteSelected = function(){
        for(var i=0, l=this.length;i<l;i++){
            if(this[i].selected){
                this.splice(i,1);
                l = this.length;
                i--;
            }
        }
    };

    Path.prototype.addEndPoint = function(oed,ed){
        for(var i=0, l=this.length;i<l;i++){
            if(this[i] === oed){
                this.splice(i+1,0, ed);
            }
        }
    };

    module.exports = Path;
});