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
