
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













