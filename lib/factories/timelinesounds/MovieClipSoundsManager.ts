
import { MovieClipSoundStream } from "./MovieClipSoundStream";
import { MovieClip } from "@awayjs/scene";
import { WaveAudio } from '@awayjs/core';

export class MovieClipSoundsManager {
    private lastFrameNum: number;
    private soundStreamHead: any;
    private _soundStreams: MovieClipSoundStream[];
    private static activeSounds={};

    public static addActiveSound(sound:WaveAudio){
        if(!MovieClipSoundsManager.activeSounds[sound.id]){
            MovieClipSoundsManager.activeSounds[sound.id]={}
        }
        MovieClipSoundsManager.activeSounds[sound.id].active=true;
        MovieClipSoundsManager.activeSounds[sound.id].sound=sound;
    }
    public static enterFrame(){
        for(var key in MovieClipSoundsManager.activeSounds){
            var sound= MovieClipSoundsManager.activeSounds[key];
            sound.active=false;
        }
    }
    public static exitFrame(){
        for(var key in MovieClipSoundsManager.activeSounds){
            var sound= MovieClipSoundsManager.activeSounds[key];
            if(!sound.active){
                sound.sound.stop();
            }
            delete MovieClipSoundsManager.activeSounds[key];
        }
    }
    constructor() {
        this.lastFrameNum = -2;
        this._soundStreams = [];

    }


    initSoundStream(streamInfo: any) {
        this.soundStreamHead = streamInfo;
    }

    addSoundStreamBlock(frameNum: number, streamBlock: Uint8Array) {
        if(!this.soundStreamHead){
            console.log("can not add soundstreamblock if no soundstreamHead exists")
            return;
        }
        if (this._soundStreams.length==0 || (frameNum - this.lastFrameNum) > 1) {
            this._soundStreams.push(new MovieClipSoundStream(this.soundStreamHead));
        }
        this.lastFrameNum = frameNum;
        this._soundStreams[this._soundStreams.length - 1].appendBlock(frameNum, streamBlock);

    }


    syncSounds(frameNum: number, isPlaying:boolean, parent:any) {

        for(var i=0; i<this._soundStreams.length; i++){   
            this._soundStreams[i].playFrame(frameNum);     
        }
    }
}