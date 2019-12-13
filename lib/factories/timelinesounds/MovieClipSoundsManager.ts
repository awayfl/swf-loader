
import { MovieClipSoundStream } from "./MovieClipSoundStream";
import { MovieClip } from "@awayjs/scene";

export class MovieClipSoundsManager {
    private _mc: MovieClip;
    private lastFrameNum: number;
    private soundStreamHead: any;
    private _soundStreams: MovieClipSoundStream[];

    constructor(mc: MovieClip) {
        this._mc = mc;
        this.lastFrameNum = -2;
        this._soundStreams = [];

    }


    initSoundStream(streamInfo: any) {
        this.soundStreamHead = streamInfo;
    }

    addSoundStreamBlock(frameNum: number, streamBlock: Uint8Array) {
        if (this._soundStreams.length==0 || (frameNum - this.lastFrameNum) > 1) {
            this._soundStreams.push(new MovieClipSoundStream(this.soundStreamHead, this._mc, frameNum));
        }
        this.lastFrameNum = frameNum;
        this._soundStreams[this._soundStreams.length - 1].appendBlock(frameNum, streamBlock);

    }


    syncSounds(frameNum: number, isPlaying:boolean) {

        for(var i=0; i<this._soundStreams.length; i++){   
            if(isPlaying)         
                this._soundStreams[i].playFrame(frameNum);     
            if(!this._soundStreams[i].isPlaying)  
                this._soundStreams[i].stop();
            this._soundStreams[i].isPlaying=false;
        }
    }
}