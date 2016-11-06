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
