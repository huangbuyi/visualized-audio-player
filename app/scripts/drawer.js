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

