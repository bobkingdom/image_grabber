define(function(require, exports, module) {
    var util = {};
    util.canvas = {
        center: function(canvas) {
            canvas.style.top = canvas.style.left = '50%';
            canvas.style.marginLeft = parseInt(canvas.style.width, 10)/(-2) + 'px';
            canvas.style.marginTop = parseInt(canvas.style.height, 10)/(-2) + 'px';
        },
        alignTo: function(targetCanvas, baseCavnas) {
            var baseCoordinate = baseCavnas.getBoundingClientRect();
            targetCanvas.style.left = baseCavnas.offsetLeft + 'px';
            targetCanvas.style.top = baseCavnas.offsetTop + 'px';
            targetCanvas.width = baseCoordinate.width;
            targetCanvas.height = baseCoordinate.height;
        },
        alignToWithScaleAndOffset: function(targetCanvas, baseCavnas, scale, offsetX, offsetY) {
            // offsetX and offsetY are ratio values
            scale = scale || 1;
            offsetX = offsetX || 0;
            offsetY = offsetY || offsetX;

            var baseCoordinate = baseCavnas.getBoundingClientRect();
            targetCanvas.width = scale * baseCoordinate.width;
            targetCanvas.height = scale * baseCoordinate.height;

            // var targetContex = targetCanvas.getContext('2d');
            // targetContex.setTransform(1, 0, 0, 1,
            //     Math.abs(offsetX) * scale * baseCoordinate.width,
            //     Math.abs(offsetY) * scale * baseCoordinate.height);
        },
        windowToCanvas: function(x, y, canvas) {
            var bbox = canvas.getBoundingClientRect();
            return { x: Math.round(x - bbox.left * (canvas.width  / bbox.width)),
                     y: Math.round(y - bbox.top  * (canvas.height / bbox.height))
            };
        },
        copyImageData: function(source) {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            var imgData = context.createImageData(source.width, source.height);
            var pixels = imgData.data;
            var srcPixels = source.data;

            for (var y = 0; y < imgData.height; y++) {
                var thisRow = y * imgData.width;
                for (var x = 0; x < imgData.width; x++) {
                    pixels[(thisRow + x) * 4] = srcPixels[(thisRow + x) * 4];
                    pixels[(thisRow + x) * 4 + 1] = srcPixels[(thisRow + x) * 4 + 1];
                    pixels[(thisRow + x) * 4 + 2] = srcPixels[(thisRow + x) * 4 + 2];
                    pixels[(thisRow + x) * 4 + 3] = srcPixels[(thisRow + x) * 4 + 3];
                }
            }

            return imgData;
        }
    };
    util.DOM = {
        debugWindowId:'util.DOMdebug',
        lastSibling:function(node){
            var tempObj=node.parentNode.lastChild;
            while(tempObj.nodeType!=1 && tempObj.previousSibling!=null){
                tempObj=tempObj.previousSibling;
            }
            return (tempObj.nodeType==1)?tempObj:false;
        },
        firstSibling:function(node){
            var tempObj=node.parentNode.firstChild;
            while(tempObj.nodeType!=1 && tempObj.nextSibling!=null){
                tempObj=tempObj.nextSibling;
            }
            return (tempObj.nodeType==1)?tempObj:false;
        },
        getText:function(node){
            if(!node.hasChildNodes()){return false;}
            var reg=/^\s+$/;
            var tempObj=node.firstChild;
            while(tempObj.nodeType!=3 && tempObj.nextSibling!=null || reg.test(tempObj.nodeValue)){
                tempObj=tempObj.nextSibling;
            }
            return tempObj.nodeType==3?tempObj.nodeValue:false;
        },
        setText:function(node,txt){
            if(!node.hasChildNodes()){return false;}
            var reg=/^\s+$/;
            var tempObj=node.firstChild;
            while(tempObj.nodeType!=3 && tempObj.nextSibling!=null || reg.test(tempObj.nodeValue)){
                tempObj=tempObj.nextSibling;
            }
            if(tempObj.nodeType==3){tempObj.nodeValue=txt}else{return false;}
        },
        createLink:function(to,txt){
            var tempObj=document.createElement('a');
            tempObj.appendChild(document.createTextNode(txt));
            tempObj.setAttribute('href',to);
            return tempObj;
        },
        createTextElm:function(elm,txt){
            var tempObj=document.createElement(elm);
            tempObj.appendChild(document.createTextNode(txt));
            return tempObj;
        },
        closestSibling:function(node,direction){
            var tempObj;
            if(direction==-1 && node.previousSibling!=null){
                tempObj=node.previousSibling;
                while(tempObj.nodeType!=1 && tempObj.previousSibling!=null){
                     tempObj=tempObj.previousSibling;
                }
            }else if(direction==1 && node.nextSibling!=null){
                tempObj=node.nextSibling;
                while(tempObj.nodeType!=1 && tempObj.nextSibling!=null){
                     tempObj=tempObj.nextSibling;
                }
            }
            return tempObj.nodeType==1?tempObj:false;
        },
        initDebug:function(){
            if(util.DOM.debug){util.DOM.stopDebug();}
            util.DOM.debug=document.createElement('div');
            util.DOM.debug.setAttribute('id',util.DOM.debugWindowId);
            document.body.insertBefore(util.DOM.debug,document.body.firstChild);
        },
        setDebug:function(bug){
            if(!util.DOM.debug){util.DOM.initDebug();}
            util.DOM.debug.innerHTML+=bug+'\n';
        },
        stopDebug:function(){
            if(util.DOM.debug){
                util.DOM.debug.parentNode.removeChild(util.DOM.debug);
                util.DOM.debug=null;
            }
        },
        cssjs:function(a,o,c1,c2){
            switch (a){
                case 'swap':
                    o.className=!util.DOM.cssjs('check',o,c1)?o.className.replace(c2,c1):o.className.replace(c1,c2);
                break;
                case 'add':
                    if(!util.DOM.cssjs('check',o,c1)){o.className+=o.className?' '+c1:c1;}
                break;
                case 'remove':
                    var rep=o.className.match(' '+c1)?' '+c1:c1;
                    o.className=o.className.replace(rep,'');
                break;
                case 'check':
                    var found=false;
                    var temparray=o.className.split(' ');
                    for(var i=0;i<temparray.length;i++){
                        if(temparray[i]==c1){found=true;}
                    }
                    return found;
                break;
            }
        }
    };
    // Event util is from EventBus
    // see https://github.com/krasimir/EventBus for more details
    util.Event = {
        listeners: {},
        addEventListener:function(type, callback, scope) {
            var args = [];
            var numOfArgs = arguments.length;
            for(var i=0; i<numOfArgs; i++){
                args.push(arguments[i]);
            }
            args = args.length > 3 ? args.splice(3, args.length-1) : [];
            if(typeof util.Event.listeners[type] != "undefined") {
                util.Event.listeners[type].push({scope:scope, callback:callback, args:args});
            } else {
                util.Event.listeners[type] = [{scope:scope, callback:callback, args:args}];
            }
        },
        removeEventListener:function(type, callback, scope) {
            if(typeof util.Event.listeners[type] != "undefined") {
                var numOfCallbacks = util.Event.listeners[type].length;
                var newArray = [];
                for(var i=0; i<numOfCallbacks; i++) {
                    var listener = util.Event.listeners[type][i];
                    if(listener.scope == scope && listener.callback == callback) {

                    } else {
                        newArray.push(listener);
                    }
                }
                util.Event.listeners[type] = newArray;
            }
        },
        hasEventListener:function(type, callback, scope) {
            if(typeof util.Event.listeners[type] != "undefined") {
                var numOfCallbacks = util.Event.listeners[type].length;
                if(callback === undefined && scope === undefined){
                    return numOfCallbacks > 0;
                }
                for(var i=0; i<numOfCallbacks; i++) {
                    var listener = util.Event.listeners[type][i];
                    if(listener.scope == scope && listener.callback == callback) {
                        return true;
                    }
                }
            }
            return false;
        },
        dispatch:function(type, target) {
            var numOfListeners = 0;
            var event = {
                type:type,
                target:target
            };
            var args = [];
            var numOfArgs = arguments.length;
            for(var i=0; i<numOfArgs; i++){
                args.push(arguments[i]);
            }
            args = args.length > 2 ? args.splice(2, args.length-1) : [];
            args = [event].concat(args);
            if(typeof util.Event.listeners[type] != "undefined") {
                var numOfCallbacks = util.Event.listeners[type].length;
                for(var i=0; i<numOfCallbacks; i++) {
                    var listener = util.Event.listeners[type][i];
                    if(listener && listener.callback) {
                        var concatArgs = args.concat(listener.args);
                        listener.callback.apply(listener.scope, concatArgs);
                        numOfListeners += 1;
                    }
                }
            }
        },
        getEvents:function() {
            var str = "";
            for(var type in util.Event.listeners) {
                var numOfCallbacks = util.Event.listeners[type].length;
                for(var i=0; i<numOfCallbacks; i++) {
                    var listener = util.Event.listeners[type][i];
                    str += listener.scope && listener.scope.className ? listener.scope.className : "anonymous";
                    str += " listen for '" + type + "'\n";
                }
            }
            return str;
        }
    };

    module.exports = util;
});