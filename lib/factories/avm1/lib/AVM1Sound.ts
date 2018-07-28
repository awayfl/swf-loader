/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {AVM1Object} from "../runtime/AVM1Object";
import {AVM1Context} from "../context";
import {Debug, warning, notImplemented} from "../../base/utilities/Debug";
import {IAVM1SymbolBase, wrapAVM1NativeClass} from "./AVM1Utils";
import {ASObject} from "../../AVM2Dummys";
import {WaveAudio, AssetLibrary} from "@awayjs/core";
import {constructClassFromSymbol} from "../../link";

class SoundSymbol{

}

class SoundChannel{
	soundTransform:any;
}
class SoundTransform{

}
export class AVM1Sound extends AVM1Object {
	static createAVM1Class(context: AVM1Context): AVM1Object {
		return wrapAVM1NativeClass(context, true, AVM1Sound,
			[],
			['attachSound', 'duration#', 'getBytesLoaded', 'getBytesTotal',
				'getPan', 'setPan', 'getTransform', 'setTransform', 'getVolume', 'setVolume',
				'start', 'stop', 'onSoundComplete'],
			null, AVM1Sound.prototype.avm1Constructor);
	}

	private _target: IAVM1SymbolBase;
	private _sound: WaveAudio;
	private _channel: SoundChannel;
	private _linkageID: string;
	private _onCompleteCallback:Function;

	public avm1Constructor(target_mc) {
		this._target = this.context.resolveTarget(target_mc);
		this._sound = null;
		this._channel = null;
		this._linkageID = null;
	}

	public alPut(p, v) {
		super.alPut(p,v);
		if(p && p.toLowerCase()=="onsoundcomplete"){
			this.onSoundComplete(v);
		}
	}

	public alDeleteProperty(p) {
		super.alDeleteProperty(p);
		if(p && p.toLowerCase()=="onsoundcomplete"){
			this.onSoundComplete();
		}
		return true;
	}
	public attachSound(id: string): void {

		var symbol = (<any>this).context.getAsset(id);
		if (!symbol) {
			warning("AVM1Sound.attachSound no symbol found "+id);
			return;
		}
		this._linkageID=id;
		this._sound = <WaveAudio>symbol.symbolProps;
		if(!this._sound){
			warning("AVM1Sound.attachSound no WaveAudio found "+ id);
			return;
		}
		this._sound.onSoundComplete=()=>this.soundCompleteInternal();
	}

	private loopsToPlay:number=0;
	private soundCompleteInternal(){
		this.loopsToPlay--;
		if(this.loopsToPlay>0){
			this.stop();
			this._sound.play(0, false);
		}
		else{
			if(this._onCompleteCallback){
				this._onCompleteCallback();
			}
		}
	}
	public onSoundComplete(callback:any=null): void {

		var myThis=this;
		this._onCompleteCallback=null;
		if(callback){
			this._onCompleteCallback=function(){
				callback.alCall(myThis);
			};
		}
		if (!this._sound) {
			warning("AVM1Sound.onSoundComplete called, but no WaveAudio set");
			return;
		}
	}

	public loadSound(url: string, isStreaming: boolean): void {
		notImplemented("AVM1Sound.loadSound");
	}
	public getBytesLoaded(): number { 
		notImplemented("AVM1Sound.getBytesLoaded");
		return 0;
	}
	public getBytesTotal(): number { 
		notImplemented("AVM1Sound.getBytesTotal");
		return 0;
	}
	public getDuration(): number { 
		notImplemented("AVM1Sound.getDuration");
		return 0;
	}

	public getPan(): number {
		notImplemented("AVM1Sound.getPan");
		// todo 80pro var transform: ASObject =(<ASObject> this._channel && this._channel.soundTransform);
		return 0; //transform ? transform.axGetPublicProperty('pan') * 100 : 0;
	}
	public setPan(value: number): void {
		notImplemented("AVM1Sound.setPan");
		// todo 80pro
		/*
		var transform: ASObject = this._channel && this._channel.soundTransform;
		if (transform) {
			transform.axSetPublicProperty('pan', value / 100);
			this._channel.soundTransform = <SoundTransform>transform;
		}
		*/
	}

	public getTransform(): any { 
		notImplemented("AVM1Sound.getTransform");
		return null; 
	}
	public setTransform(transformObject: any): void {
		notImplemented("AVM1Sound.setTransform");
	}

	public getVolume(): number {
		notImplemented("AVM1Sound.getVolume");
		// todo 80pro var transform: ASObject = this._channel && this._channel.soundTransform;
		return 0;//transform ? transform.axGetPublicProperty('volume') * 100 : 0;
	}
	public setVolume(value: number): void {
		if (!this._sound) {
			warning("AVM1Sound.setVolume called, but no WaveAudio set");
			return;
		}
		this._sound.volume=value/100;
	}

	public start(secondOffset?: number, loops?: number): void {
		if (!this._sound) {
			warning("AVM1Sound.start called, but no WaveAudio set");
			return;
		}

		secondOffset = isNaN(secondOffset) || secondOffset < 0 ? 0 : +secondOffset;
		loops = isNaN(loops) || loops < 1 ? 1 : Math.floor(loops);
		this.loopsToPlay=loops;
		this._sound.play(secondOffset, false);
	}
	public stop(linkageID?: string): void {
		if (!this._sound) {
			warning("AVM1Sound.stop called, but no WaveAudio set");
			return;
		}
		if (!linkageID || linkageID === this._linkageID) {
			this._sound.stop();
		}
	}

}

