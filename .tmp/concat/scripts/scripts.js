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


/**
 * Created by Administrator on 2016/6/21.
 */

var Player = {
    audioObj:null,
    currentID: 0,
    playList:[],
    cycle:2,
    init:function(){
        this.audioObj = new Audio();
    },
    add:function(name, url, lyurl){
        this.playList.push({
            "name": name,
            "url": url,
            "lyricUrl": lyurl    || null
        })
    },
    remove:function(name){
        delete this.playList[name];
    },
    setCycle: function(num){
        num = Math.floor( num % 3);
        this.cycle = num;
    },
    isPause:function(){
        return this.audioObj.paused;
    },
    load:function(url, succFN, failFN){
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "blob";
        request.onload = function() {
            if (this.status >= 200 && this.status < 300 || this.status == 304) {
                var resUrl = URL.createObjectURL(this.response);
                succFN && succFN(resUrl);
            } else {
                failFN && failFN();
            }
        }
        request.send();
    },
    play:function(index){
        var song =this.playList[index];
        if(song != null){

            if(this.audioObj.readyState == 4 && this.currentID == index){
                this.audioObj.play();
            } else {
                this.currentID = index;
                this.pause();
                var url = song.url;
                var _this = this;
                this.load(url, function(resUrl){
                    _this.audioObj.src = resUrl;
                    _this.audioObj.load();
                    _this.audioObj.play();
                })
            }
        }
       return song;
    },
    pause: function(){
        this.audioObj.pause();
    },
    playStep: function(step){
        if(this.playList.length < 1){
            return null;
        } else if(this.currentID == null){
            return this.play(0);
        } else {
            var id = this.currentID + step;
            id = (id > this.playList.length - 1)? id % this.playList.length: id;
            id = (id < 0)? this.playList.length - 1: id;
            return this.play(id);
        }
    },
    next: function(){
        var step;
        switch(this.cycle){
            case 0:
            case 1:
                step = 1;
                break;
            case 2:
                step = Tools.random(1, this.playList.length - 1);
                break;
        }
        return this.playStep(step);
    },
    prev: function(){
        return this.playStep(-1);
    },
    ended: function(){
        var step;
        switch(this.cycle){
            case 0:
                step = 1;
                break;
            case 1:
                step = 0;
                break;
            case 2:
                step = Tools.random(1, this.playList.length - 1);
                break;
        }
        return this.playStep(step);
    }
}





/**
 * Created by Administrator on 2016/6/30.
 */

var AudManager = {
    ctx: null,
    analyser: null,
    gain: null,
    source: null,
    init: function() {
        try{
            this.ctx = new AudioContext();
        } catch(e) {
            this.ctx = null;
            console.log("Your browser can't support Audio API!");
        }
        if(this.ctx !== null && this.ctx instanceof AudioContext){
            
            this.source = this.ctx.createMediaElementSource(Player.audioObj);
            this.gain = this.ctx.createGain();
            this.analyser = this.ctx.createAnalyser();
            this.source.connect(this.gain);
            this.gain.connect(this.analyser);
            this.analyser.connect(this.ctx.destination);
            this.analyser.smoothingTimeConstant = 0.7;
            this.analyser.fftSize = 128;
        }
    },
    setGain: function(vol){
        this.gain.gain.value = vol;
    },
    setSmooth: function(smo){
        this.analyser.smoothingTimeConstant = smo;
    },
    getData: function(arr){
    }
};

/**
 * Created by Administrator on 2016/6/30.
 */

var Drawer = {
    ctx: null,
    width: 0,
    height: 0,
    Dots: [],
    drawIndex: 5,
    size: function(){
        if(AudManager.analyser !== null){
            return AudManager.analyser.fftSize / 4

        } else {
            return 0;
        }
    }() ,
    animateID: null,
    init: function(canvas){
        // todo: test canvas
        this.ctx = canvas.getContext("2d");
        this.width = canvas.offsetWidth;
        this.height = canvas.offsetHeight;
    },
    setSize: function(s){
        // todo:test parameter is 2^n
        this.size = s;
        AudManager.analyser.fftSize = 4 * this.size;
    },
    setSmooth: function(s){
        AudManager.analyser.smoothingTimeConstant = s;  // todo: move it to audManager
    },
    visualizer: function(){
        var _this = this;
        window.cancelAnimationFrame(this.animateID);
        var array = new Uint8Array(this.size);
        var draw;
        this.ctx.fillStyle = "";
        this.ctx.strokeStyle = "";
        this.ctx.shadowBlur = 0;

        switch(this.drawIndex){
            case 0:
                this.addLineargrandient();
                this.getDots();
                draw = function(arr){
                    _this.columnDraw(arr);
                };
                break;
            case 1:
                this.getDots();
                draw = function(arr){
                    _this.bubbleDraw(arr);
                };
                break;
            case 2:
                //this.getDots();
                this.setSmooth(0.85);
                this.addShadow();
                draw = function(arr){
                    _this.phosphorDraw(arr);
                };
                break;
            case 3:
                this.setSmooth(0.9);
                this.addLineargrandient();
                draw = function(arr){
                    _this.squareDraw(arr);
                };
                break;
            case 5:
                this.setSmooth(0.9);
                this.getDots();
                //this.addShadow()
                draw = function(arr){
                    _this.spiralDraw(arr);
                };
                break;

        }
        //this.phosphorColoring()
        Monitor.start();
        function v(){
            AudManager.analyser.getByteFrequencyData(array);
            _this.ctx.clearRect(-1000, -1000, _this.width + 1000, _this.height + 1000);
            // _this.columnDraw(array);
            //_this.phosphorDraw(array)
           draw(array);
            Monitor.update();
            _this.animateID = requestAnimationFrame(v);
        }
        requestAnimationFrame(v);
        draw(array);
        //_this.phosphorDraw(array)
        //this.columnDraw(array);
    },
    getDots: function(){
        this.Dots=[];
        for(var i=0;i<this.size;i++){
            var random = Tools.random;
            var x=random(0, this.width);
            var y=random(0, this.height);
            var dx=random(2, 5);
            var dy=random(2, 5);
            var color = "rgba(" + random(200, 255) + ","+ random(66, 200) + "," + random(66, 200) + "," + random(0.6, 1)+")";
            var color2 = "rgba(" + random(200,255)+","+random(66,200)+","+random(66,200)+","+random(0.1,0.5)+")";
            this.Dots.push({
                x:x,
                y:y,
                dx:dx,
                dy:dy,
                color:color,
                color2:color2,
                cap:0
            });
        }
    },
    addLineargrandient: function(){
        var lineargrandient=this.ctx.createLinearGradient(0,this.height,0,0);
        lineargrandient.addColorStop(0,'#ff9966');
        lineargrandient.addColorStop(0.5,'#99ff66');
        lineargrandient.addColorStop(0.8,'#9966ff');
        lineargrandient.addColorStop(1,'#6699ff');
        this.ctx.fillStyle=lineargrandient;
    },
    columnDraw: function(arr){
        var t=0.6*this.width/this.size;
        t=(t>20)?20:t;
        var d=0.1*this.height;
        for (var i = 0; i < this.size; i++) {
            var o = this.Dots[i];
            var x = Math.floor(i * this.width / this.size);
            var w = 0.8 * (Math.floor((i + 1) * this.width / this.size) - x);
            var h = arr[i] / 256 * (this.height-t);
            var v=0.5+(o.cap-h)/(0.2*this.height);  //buffer movement
            o.cap-=v;
            if(o.cap<0){
                o.cap=0;
            }
            if(h>0&&h+d>o.cap){
                o.cap=h+d;
            }
            if(o.cap>this.height-t){
                o.cap=this.height-t;
            }

            this.ctx.fillRect(x, this.height, w, -h);
            this.ctx.fillRect(x, this.height-o.cap, w, -t);
        }
    },
    bubbleDraw: function(arr){

        for(var i = 0; i < this.size; i++){
            var o= this.Dots[i];
            var r=6+arr[i]/256*(this.height>this.width?this.width:this.height)/10;
            var g=this.ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,r);
            g.addColorStop(0,o.color2);
            g.addColorStop(1,o.color);
            this.ctx.beginPath();
            this.ctx.arc(o.x,o.y,r,0,Math.PI*2,true);
            this.ctx.fillStyle=g;
            this.ctx.fill();
            o.x+=o.dx;
            o.x=o.x>this.width?0:o.x;
        }
    },
    addShadow: function(){
        // var backImage = new Image();
        // backImage.src="../public/images/146752285666.jpg";
        // var _this = this;
        // backImage.onload = function(){
        //     _this.ctx.fillStyle = "url('http://www.samskirrow.com/background.png')";
        //     //_this.ctx.drawImage(backImage, 0, 0);
        // };

        // this.ctx.shadowColor = "#ff6699";
        // this.ctx.shadowBlur = 30;
        // this.ctx.shadowOffsetX = 0;
        // this.ctx.shadowOffsetY = 0;
        // this.ctx.fillStyle = "#ffaacc"

        this.ctx.shadowColor = "#0033ff";
        this.ctx.shadowBlur = 1;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.fillStyle = "white"
        // this.ctx.shadowColor = "black";
        // this.ctx.shadowBlur = 1;
        // this.ctx.shadowOffsetX = 0;
        // this.ctx.shadowOffsetY = 0;

    },
    phosphorDraw: function(arr){
        this.ctx.fillRect(0, this.height / 2 +  1, this.width, -1);
        var t=0.6*this.width/this.size;
        t=(t>20)?20:t;
        var d=0.1*this.height;
        for (var i = 0; i < this.size; i++) {
            var x = Math.floor(i * this.width / this.size);
            var w = 0.6 * (Math.floor((i + 1) * this.width / this.size) - x);
            var h = arr[i] / 256 * (this.height-t);
            this.ctx.fillRect(x, this.height / 2 +  h / 2, w, -h);
        }
    },
    squareDraw: function(arr){
        var t=0.6*this.width/this.size;
        t=(t>20)?20:t;
        var d=0.1*this.height;
        var w =  Math.round(this.width / this.size );

        for (var i = 0; i < this.size; i++) {
            var x = i * w;
            var h = arr[i] / 256 * (this.height-t);
            for(var j = 0; j < h / w; j++){
                this.ctx.fillStyle = "rgba(" + Math.floor( i / this.size * 256) + "," + arr[i] + "," + j * w / h * 256 + ",1)";
                this.ctx.fillRect(x, this.height - w * j,  0.9 * w, -0.9 * w);
            }
        }
    },
    getDots2: function(){
        this.Dots=[];
        for(var i=0;i<this.size;i++){
            var dx=2 + 2 * Math.random();
            var dy= - ( 2 + 2 * Math.random() );
            //var color = "rgba(" + random(200, 255) + ","+ random(66, 200) + "," + random(66, 200) + "," + random(0.6, 1)+")";
           // var color2 = "rgba(" + random(200,255)+","+random(66,200)+","+random(66,200)+","+random(0.1,0.5)+")";
            this.Dots.push({
                x:0,
                y:200,
                dx:dx,
                dy:dy,
                color:"",
                color2:"",
                cap:1
            });
        }
    },
    spiralDraw: function(arr) {
        this.ctx.lineWidth = 2;
        var r = 10;
        this.ctx.translate(this.width / 2, this.height / 2);
        var avg = 0;
        var avgArr = [0];
        for (var i = 0,j = 1; i < this.size ; i++){
            if( i == (j * this.size / 8 - 1) ){
                avgArr.push( avg );
                j++;
            }
            avg += arr[i];
        }
        for (var i = 1; i < avgArr.length; i++){
            avgArr[i - 1] = (avgArr[i]  - avgArr[i - 1]) * 8 / this.size;
        }
        this.ctx.beginPath();
        for (var i = 0; i < this.size; i++) {

            this.ctx.strokeStyle = "rgba(" + parseInt(255 - arr[i]) + ",255," + parseInt(255 - avg) + ",1)";
            r = 100 + arr[i] / 256 * ((this.height > this.width ? this.width : this.height) - 200) / 2;
            this.ctx.moveTo(r, 0);
            this.ctx.arc(0, 0, r, 0, 2 * Math.PI, true);

        }
        this.ctx.stroke();
        r = 100;
        this.ctx.beginPath();
        //this.ctx.fillStyle= "white";
        this.ctx.rotate(0.2 * Math.PI / this.size);
        for (var i = 0; i < this.size; i++) {
            this.ctx.fillStyle = "rgba(" + parseInt(255 - avg) + "," + parseInt(255 - arr[i]) + ",255,1)";
            this.ctx.rotate(2 * Math.PI / this.size);
            this.ctx.fillRect(r, 0, arr[i]/2, 7)
        }
        this.ctx.stroke();

        var o = this.Dots[0]
        o.cap -= 0.004 * Math.PI
        for(var i = 0;i < 8; i++){
            this.ctx.beginPath();
            this.ctx.lineWidth = 4;
            this.ctx.strokeStyle ="rgba(255," + parseInt(255 - avg) + "," + parseInt(255 - avgArr[i]) + ",1)";
            this.ctx.arc(0, 0, 90 - 10 * i, o.cap - avgArr[i] / 256 * 2 * Math.PI / 2, o.cap + avgArr[i] / 256 * 2 * Math.PI / 2 , false)
            this.ctx.stroke();
        }
        //this.ctx.fillStyle= "white";

         this.ctx.translate(-this.width / 2, -this.height / 2);



    }
}



Player.init();
AudManager.init();
initPlaylist();

function initPlaylist(){
    Player.add("石进 - 夜的钢琴曲五 - Demo版纯音乐", "./audio/石进 - 夜的钢琴曲五 - Demo版纯音乐.mp3");
    Player.add("4 Non Blondes - What's Up", "./audio/4 Non Blondes - What's Up.mp3","./lrc/what's up.lrc");
    Player.add("danny mccarthy、mark petrie - rags to rings", "./audio/danny mccarthy、mark petrie - rags to rings.mp3");
    Player.add("Jasper Forks - River Flows In You", "./audio/Jasper Forks - River Flows In You - SIngle MG Mix版纯音乐.mp3");
    Player.add("Ludovico Einaudi - Experience", "./audio/Ludovico Einaudi - Experience - 纯音乐版.mp3");
    Player.add("N2V - Yearning(Original Mix)", "./audio/N2V - Yearning(Original Mix).mp3");
    Player.add("Delacey - Dream It Possible","audio/Delacey - Dream It Possible.mp3","lrc/Dream It Possible.lrc");
    Player.add("Fifth Harmony、kid Ink - Worth It","audio/Fifth Harmony、kid Ink - Worth It.mp3","lrc/Worth it.lrc");
    Player.add("t.A.T.u. - 30 Minutes","audio/t.A.T.u. - 30 Minutes.mp3","lrc/30 Minutes.lrc");
    Player.add("房东的猫 - 美好事物","audio/房东的猫 - 美好事物.mp3","lrc/美好事物.lrc");
    Player.add("这个年纪-齐一","audio/这个年纪-齐一.mp3","lrc/这个年纪.lrc");
}

// todo: ie兼容
// todo: 改变进度条为自定义样式
// todo: 上传本地歌词，歌词滚动
// todo: 切割歌名和作者，网易云格式
window.onload = function() {
    var canvas = $("#canvas").get(0);
    resizeCanvas(700, 500);     //
    Drawer.init(canvas);
    bindPlayBtn();
    bingAudioObj();
    refreshPlayList();
    bindLocalSongBtn();
    bindPurePage();
    bindDrawStyle();

    Drawer.setSize(64);
    Drawer.visualizer();
    window.onresize = function(){
        resizeCanvas(700, 500);
        Drawer.init(canvas);
        Drawer.visualizer();
    }

    // bind events on music control button
    function bindPlayBtn() {

        // play/pause button
        $(".playBtn").on("click", function () {

            if (Player.isPause()) {
                Player.play(Player.currentID);
            } else {
                Player.pause();
            }
        });

        // next music button
        $(".nextBtn").on("click", function() {
            Player.next();
        });

        // previous music button
        $(".prevBtn").on("click", function() {
            Player.prev();
        });

        // play progress bar
        $(".line").on({
            "mousedown": function(event) {
                $(Player.audioObj).unbind("timeupdate", updateProgress);
            },
            "change": function(){

                if( !isNaN(Player.audioObj.duration) ){
                    Player.audioObj.currentTime = $(".line").val() * Player.audioObj.duration;
                    if(!Player.isPause){
                        Player.audioObj.play();
                    }
                }

                Lyric.relocateLyric(Player.audioObj.currentTime, 0, Lyric.labelTimes.length - 1);
            },
            "mouseup": function(){
                $(Player.audioObj).on("timeupdate", updateProgress);
            }
        });

        // playlist UI
        $(".list ul").on("click", function(event){
            var target = event.target;
            if(target.nodeName.toLowerCase()=="span"){
                target=target.parentElement;
            }
            $(".selected").removeClass("selected");
            $(target).addClass("selected");
        });
        $(".list ul").on("dblclick", function(event){
            var target = event.target;
            if(target.nodeName.toLowerCase()=="span"){
                target=target.parentElement;
            }
            Player.play(target.getAttribute("data-id"))
        });

        // audio's volume adjust bar
        $(".volume").click(function(){
            if($(".vol").get(0).style.visibility=="hidden"){
                $(".vol").get(0).style.visibility="visible";
                $(".vol").get(0).style.display="block";
            }else{
                $(".vol").get(0).style.visibility="hidden";
                $(".vol").get(0).style.display="none";
            }
        })
        $(".volGroove").on("mousedown", function(){
            changeVolumn();
            if(event.target.className == "volBtn"){
                $(document).on({
                    "mousemove": function(event){
                        changeVolumn();
                    },
                    "mouseup": function(){
                        $(document).unbind("mousemove");
                        $(document).unbind("mouseup");
                    }
                })
            }
        });

        // play circle mode switch button
        changeCycleStyle(Player.cycle);
        $(".loop").on("click", function(){
            $(this).removeClass("single");
            $(this).removeClass("listing");
            $(this).removeClass("random");
            Player.setCycle(Player.cycle + 1 );
            changeCycleStyle(Player.cycle);
        });
        
        function changeCycleStyle(n){
            switch(n){
                case 0:
                    $(".loop").addClass("listing");
                    break;
                case 1:
                    $(".loop").addClass("single");
                    break;
                case 2:
                    $(".loop").addClass("random");
                    break;
            }
        }
        
        function changeVolumn(){
            var v = $("#footer").get(0).offsetTop - event.clientY - 18;
            v = (v < 0)? 0: (v > 90)? 90: v;
            $(".volBtn").css("bottom", v + "px");
            $(".currVol").css("height", v + 3 + "px");
            AudManager.gain.gain.value = v / 90;
            if(v === 0){
                $(".volume").addClass("mute");
            } else {
                $(".volume").removeClass("mute");
            }
        };
    }
    setInterval(function(){
        $(".logo").text("max-FPS:" + Monitor.maxFrame + "   | min-FPS:" + Monitor.minFrame + "   | cur-FPS:" + Monitor.currFrame);  // todo:replace it of listen event
    }, 1000)

    // add events of audio element 
    function bingAudioObj(){
        $(Player.audioObj).on({
            "play": function () {
                $(".playBtn").addClass("playing");   // change play/pause button style
                $(".onplay").removeClass("onplay");    // change current music style of playlist
                $(".list li[data-id=" + Player.currentID + "]").addClass("onplay");
                scrollList();   // scrolled playlist to current music's location
                $(".detail p").text(Player.playList[Player.currentID].name);    // change current music UI
                Lyric.loadLyric(Player.playList[Player.currentID].lyricUrl, function(){
                    Lyric.relocateLyric(Player.audioObj.currentTime, 0, Lyric.labelTimes.length - 1); // todo:package it
                });
            },
            "pause": function(){
                $(".playBtn").removeClass("playing");
            },
            "timeupdate":function(){
                var cTime = Player.audioObj.currentTime,
                    dTime = Player.audioObj.duration;

                $(".timeline p:eq(0)").text( Tools.toTime(cTime) );     // update played length
                $(".timeline p:eq(1)").text( Tools.toTime(dTime) );

            },
            "ended": function(){
                Player.ended();
            },
            "canplay": function(){

            }
        })

        // some events need to remove or rebind
        $(Player.audioObj).on("timeupdate", updateProgress);
        $(Player.audioObj).on("timeupdate", scrollLyric);
    }
    
    // update audio play progress
    function updateProgress(){
        $(".line").val( Player.audioObj.currentTime / Player.audioObj.duration );
    }
    
    function scrollLyric(){
        Lyric.scrollLyric();
    }

    // scrolled playlist to make sure current playing audio locate in the middle of client area  
    function scrollList(){
        var list = $(".list").get(0);
        var top = parseInt($(".onplay").get(0).offsetTop - list.offsetHeight / 2 + 30 );
        Tools.addDomBufferAnimate(list, {"scrollTop": top}, 20);
    }

    // refresh playlist UI
    function refreshPlayList(){
        $(".list ul").html("");
        var len = Player.playList.length,
            html = "",
            i;
        for(i = 0; i < len; i++){
            html += "<li data-id =" + i + "><span>" + Tools.toDoubleDigits(i + 1) + "</span>" + Player.playList[i].name + "</li>"
        }
        $(".list ul").html(html);
    }

    // set minimum size of page's and canvas'
    function resizeCanvas(minW, minH){
        var oEff = $(".effect").get(0);
        if(document.documentElement.clientWidth < minW){
            document.body.style.width = minW + "px";
        }else{
            document.body.style.width = "100%";
        }
        if(document.documentElement.clientHeight < minH){
            document.body.style.height = minH + 'px';
        }else{
            document.body.style.height = "100%";
        }
        canvas.width = oEff.offsetWidth;
        canvas.height = oEff.offsetHeight;
    }

    // load local music to playlist
    function bindLocalSongBtn(){

        $(".local").on("click", function(){
            $("#file").click();
        }),

        $("#file").on("change", function(){
            var i,file,url,errorCount=0,existCount=0,errorMessage="",existMessage="";

            for(var i = 0; i < this.files.length; i++){
                var isExist = false,
                    len = Player.playList.length,
                    file = this.files[i];

                // To verify if the file is existed
                for(var j = 0; j < len; j++){
                    if(file.name == Player.playList[j].name){
                        isExist=true;
                        existCount++;
                        existMessage+=existCount + ": " + file.name + "\n";
                    }
                }

                // Push audio source into playlist
                if(!isExist){

                    //Verify if files can play
                    if( Player.audioObj.canPlayType(file.type) ){
                        url=URL.createObjectURL(file);
                        Player.add(file.name.slice(0, -4), url);
                    } else {
                        errorCount++;
                        errorMessage+=errorCount + ": " + file.name+"\n";
                    }
                }
            }

            if(errorCount>0){
                errorMessage = "Following " + errorCount + " file(s) upload failure!\n" + errorMessage;
            }

            if(existCount>0){
                existMessage = "Following " + existCount + " file(s) are existed!\n" + existMessage;
            }

            if(errorCount>0 || existCount>0){
                alert(errorMessage+existMessage);  //throw exception infomation
            }
            refreshPlayList();
        })
    }

    // some events are not depend on other modules
    function bindPurePage(){

        // hide or show playlist
        $(".handle").on("click", function(){
            if( $(this).text().indexOf("HIDE") > -1){
                Tools.addStyleBufferAnimate($(".musicList").get(0),{"left":-250},30);
                $(this).text("SHOW");
            }else{
                Tools.addStyleBufferAnimate($(".musicList").get(0),{"left":0},30);
                $(this).text("HIDE")
            }
        });

        // // hide or show lyric
        $(".lyric").on("click", function(){
            if($(this).val() == 0){
                $(".lyr").show();
                $(this).val(1);
            } else {
                $(".lyr").hide();
                $(this).val(0);
            }
        });

    }

    // add playlist scroll animate
    function scrollPlaylist(){
        var list = $(".list").get(0);
        Tools.addDomBufferAnimate(list, {"scrollTop":500}, 50);
    }

    // todo 分离成另一个文件
    var Lyric = {
        nthLine:0,
        labelTimes:[],
        currUrl:"",
        loadLyric: function(url, succ){

            if(url && this.currUrl !== url){
                var _this = this;
                this.nthLine = 0;
                this.currUrl = url;
                this.labelTimes = [];
                Tools.loadLyric(url, function(lyric){
                    var pattern = /\[([0-9]{2})\:([0-9]{2})(\.)([0-9]{2})\]/,
                        lyrs = lyric.split("\n"),
                        html = "";

                    for(var i = 0; i < lyrs.length; i++){
                        var match = pattern.exec(lyrs[i]);

                        if(match){
                            _this.labelTimes.push( _this.labelTimeToSecns(match[0]) );
                            html += "<p>" + lyrs[i].slice(match.index + 10) + "</p>";
                        }
                    }
                    $(".lyricSlider").html(html);
                    succ && succ();

                }, function(){

                    // user upload lyric error
                    $(".lyricSlider").html("<p class='noLyricTitle'>Load lyric failure!</p></br>" +
                        "<a href='javascript:void(0)' class='noLyricUpload'>Upload the other lyric</a>");
                })
            } else if(!url) {

                // lyric is non-existent
                $(".lyricSlider").html("<p class='noLyricTitle'>Can't find lyric!</p></br>" +
                    "<a href='javascript:void(0)' class='noLyricUpload'>Upload a lyric</a>");
            }
        },
        scrollLyric: function(){
            var labeltime = this.labelTimes[this.nthLine],
                lyric = null,
                top = 0,
                $playingLine;

            //console.log(Player.audioObj.currentTime + " " + labeltime)
            if(Player.audioObj.currentTime > labeltime){
                $playingLine =  $(".lyricSlider p:eq("+ this.nthLine +")");
                $(".playingLine").removeClass("playingLine");
                $playingLine.addClass("playingLine");
                lyric = $(".lyricBoard").get(0);
                top = parseInt($playingLine.get(0).offsetTop - lyric.offsetHeight / 2 + 25);
                top = (top < 0)? 0: top;
                Tools.addDomBufferAnimate(lyric, {"scrollTop": top}, 20);
                this.nthLine++;
            }
        },
        labelTimeToSecns: function(s){
            return parseFloat(s.slice(1, 3) * 60) + parseFloat(s.slice(4, 9));
        },
        // relocate which line of lyric are playing by bisection method
        relocateLyric: function(time, lh, rh){
            var md = Math.floor(lh / 2 + rh / 2 ),
                mdtime;

            if( lh == md ){
                this.nthLine = md;
                return md;
            }
            mdtime = this.labelTimes[md];

            if(time < mdtime){
                return this.relocateLyric(time, lh, md);
            } else {
                return this.relocateLyric(time, md, rh);
            }
        }
    }

    function bindDrawStyle(){

        // switch to another visualized animate
        $(".effectStyle").on("click", "div", function(){
            $(".effectStyle .checked").removeClass("checked");
            $(this).addClass("checked");
            switch( $(this).text() ){
                case "Column":
                    Drawer.drawIndex = 0;
                    break;
                case "Bubble":
                    Drawer.drawIndex = 1;
                    break;
                case "Phosphor":
                    Drawer.drawIndex = 2;
                    break;
                case "Square":
                    Drawer.drawIndex = 3;
                    break;
                case "Spiral":
                    Drawer.drawIndex = 5;
                    break;
                default:
                    Drawer.drawIndex = 5;
            }
            resizeCanvas(700, 500);
            Drawer.init(canvas);
            Drawer.visualizer();
        })

        // change splited counts of visualized
        $(".effectSize").on("click", "div", function(){
            $(".effectSize .checked").removeClass("checked");
            $(this).addClass("checked");
            switch( $(this).text() ){
                case "16":
                    Drawer.setSize(16);
                    break;
                case "32":
                    Drawer.setSize(32);
                    break;
                case "64":
                    Drawer.setSize(64);
                    break;
                case "128":
                    Drawer.setSize(128);
                    break;
                case "256":
                    Drawer.setSize(256);
                    break;
                case "512":
                    Drawer.setSize(512);
                    break;
                case "1024":
                    Drawer.setSize(1024);
                    break;
                default:
                    Drawer.setSize(64);
            }
            Drawer.visualizer();
        })
    }
}














/**
 * Created by Administrator on 2016/7/4.
 */

var Monitor = {
    maxFrame: 0,
    minFrame:9999,
    currFrame: 0,
    currTime: 0,
    elapseTime: 0,
    _sTime: 0,
    _sTFrame: 0,
    start: function(){
        this.currTime = this._sTime = new Date();
    },
    update: function(){
        var fTime = new Date();
        if(fTime - this._sTime >= 1000){
            this.currFrame = this._sTFrame;
            this.maxFrame = (this.currFrame > this.maxFrame)? this.currFrame: this.maxFrame;
            this.minFrame = (this.currFrame < this.minFrame)? this.currFrame: this.minFrame;
            this._sTFrame = 0;
            this._sTime = fTime;
        } else {
            ++this._sTFrame;
        }
        this.elapseTime = fTime - this.currTime;
        this.currTime = fTime;
    }
}
