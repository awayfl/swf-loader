
import { MovieClipSoundStream } from "./MovieClipSoundStream";
import { MovieClip } from "@awayjs/scene";
import { WaveAudio } from '@awayjs/core';
import { release } from '../base/utilities/Debug';

export class MovieClipSoundsManager {
    private lastFrameNum: number;
    private soundStreamHead: any;
    private _soundStreams: MovieClipSoundStream[];
    private static activeSounds={};

    public static addActiveSound(sound:WaveAudio){
        //console.log("start sound with id", sound.id)
        if(!MovieClipSoundsManager.activeSounds[sound.id]){
            MovieClipSoundsManager.activeSounds[sound.id]={}
        }
        MovieClipSoundsManager.activeSounds[sound.id].active=true;
        MovieClipSoundsManager.activeSounds[sound.id].sound=sound;
    }
    public static enterFrame(){
        for(var key in MovieClipSoundsManager.activeSounds){
            //console.log("set sound to inactive", key)
            var sound= MovieClipSoundsManager.activeSounds[key];
            sound.active=false;
        }
    }
    public static exitFrame(){
        for(var key in MovieClipSoundsManager.activeSounds){
            var sound= MovieClipSoundsManager.activeSounds[key];
            if(!sound.active){
                //console.log("stop inactive sound", key)
                sound.sound.stop();
                delete MovieClipSoundsManager.activeSounds[key];
            }
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
            release || console.log("can not add soundstreamblock if no soundstreamHead exists")
            return;
        }
        if (this._soundStreams.length==0 || (frameNum - this.lastFrameNum) > 1) {
            this._soundStreams.push(new MovieClipSoundStream(this.soundStreamHead));
        }
        this.lastFrameNum = frameNum;
        this._soundStreams[this._soundStreams.length - 1].appendBlock(frameNum, streamBlock);

    }


    syncSounds(frameNum: number, isPlaying:boolean, parent:any):number {

        var skipFrames:number=0;
        for(var i=0; i<this._soundStreams.length; i++){   
            if(isPlaying && parent){
                var skipFrames_oneStream:number=this._soundStreams[i].playFrame(frameNum);  
                if(Math.abs(skipFrames_oneStream)>Math.abs(skipFrames)){
                    skipFrames=skipFrames_oneStream;
                }  
            } 
        }
        return skipFrames;
    }
}