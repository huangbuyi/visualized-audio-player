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




