/**
 * Created by Administrator on 2016/6/29.
 */
// todo:添加通用的缓冲运动
var Tools = {
    toDoubleDigits: function(num){
        var t = num.toString();
        if(t.length < 2 ){
            t = "0" + t;
        }
        return t;
    },
    toTime: function(secn){
        return this.toDoubleDigits(Math.floor(secn / 60))+":"+
                this.toDoubleDigits(Math.floor(secn % 60));
    },
    addStyleBufferAnimate: function(obj, json, t, fnEnd){
        clearInterval(obj.timer);  //每个对象使用不同且唯一的计时器。
        obj.timer=setInterval(function(){
            var stop=true;
            for(var attr in json){
                var cur=0;
                //用getStyle取样式的现值存入cur
                if(attr=='opacity')  //透明度分开计算
                {
                    cur=parseFloat(getStyle(obj,attr))*100;
                }else{
                    cur=parseInt(getStyle(obj,attr));
                }

                var speed=(json[attr]-cur)/10;  //缓冲运动使用的公式
                speed=speed>0?Math.ceil(speed):Math.floor(speed);
                if(cur!=json[attr]) stop=false;
                if(attr=='opacity')
                {
                    obj.style.filter='alpha(opacity):'+(cur+speed)+')';  //IE
                    obj.style.opacity=(cur+speed)/100;   //Chrome,FireFox
                }else{
                    obj.style[attr]=cur+speed+'px';   //更新样式
                }
            }
            if(stop){
                clearInterval(obj.timer);
                if(fnEnd)fnEnd();
            }
        },t);   
        
        function getStyle(obj,name){
            if(obj.currentStyle){
                return obj.currentStyle[name];
            }else{
                return getComputedStyle(obj,false)[name];
            }
        }
    },
    addDomBufferAnimate: function(obj, json, t, fnEnd) {
        clearInterval(obj.timer);  //每个对象使用不同且唯一的计时器。
        obj.timer = setInterval(function () {
            var stop = true;
            for (var attr in json) {
                var cur = obj[attr];
                var speed = (json[attr] - cur) / 10;  //缓冲运动使用的公式
                speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed);
                if (cur != json[attr]) {
                    stop = false;
                }
                obj[attr] = cur + speed;   //更新样式
            }
            if (stop) {
                clearInterval(obj.timer);
                if (fnEnd)fnEnd();
            }
        }, t);
    },
    random: function(m, n){
        return Math.round(Math.random()*(n-m)+m);
    },
    loadLyric: function(url, succFn, failFn){
        var request = new XMLHttpRequest();

        request.open("GET", url, true);
        request.responseType = "text";
        request.onload = function() {
            if (this.status >= 200 && this.status < 300 || this.status == 304) {
                var resText = request.responseText;
                succFn && succFn(resText);
            } else {
                failFn && failFn();
            }
        };
        request.send();
    },
    stopPropagation: function(event){
        if(event.stopPropagation){
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    },
    preventDefault: function(evnet){
        if(event.preventDefault){
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    }
}

