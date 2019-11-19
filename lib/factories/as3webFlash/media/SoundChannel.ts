import {EventDispatcher} from "../events/EventDispatcher";
import { SoundTransform } from "./SoundTransform";

/**
 * Dispatched when a sound has finished playing.
 * @eventType	flash.events.Event.SOUND_COMPLETE
 * [Event(name="soundComplete", type="flash.events.Event")]
 *
 * The SoundChannel class controls a sound in an application. Every sound
 * is assigned to a sound channel, and the application can have multiple
 * sound channels that are mixed together. The SoundChannel class contains a <codeph class="+ topic/ph pr-d/codeph ">stop()</codeph> method,
 * properties for monitoring the amplitude (volume) of the channel, and a property for assigning a
 * SoundTransform object to the channel.
 */
export class SoundChannel extends EventDispatcher
{
	// for AVM1:
	public axCallPublicProperty(value1:any, value2:any):any{
		return null;
	}
	public axGetPublicProperty(value:any):any{
		return null;
	}
	public axSetPublicProperty(value:any, value2:any):any{
		return null;
	}
	public axHasPublicProperty(value:any):any{
		return null;
	}
	public axDeletePublicProperty(value:any):any{
		return null;
	}
	public axGetEnumerableKeys():string[]{
		return [];
	}


	private _sndtranform:SoundTransform;
	public _sound:any;
	constructor (){
		super();
	}
	/**
	 * The current amplitude (volume) of the left channel, from 0 (silent) to 1 (full amplitude).
	 */
	public get leftPeak () : number{
		console.log("leftPeak not implemented yet in flash/SoundChannel");
		return 0;
	}

	/**
	 * When the sound is playing, the position property indicates in milliseconds the current point
	 * that is being played in the sound file. When the sound is stopped or paused, the
	 * position property indicates the last point that was played in the sound file.
	 *
	 *   A common use case is to save the value of the position property when the
	 * sound is stopped. You can resume the sound later by restarting it from that saved position.
	 * If the sound is looped, position is reset to 0 at the beginning of each loop.
	 */
	public get position () : number{
		console.log("position not implemented yet in flash/SoundChannel");
		return 0;
	}

	/**
	 * The current amplitude (volume) of the right channel, from 0 (silent) to 1 (full amplitude).
	 */
	public get rightPeak () : number{
		console.log("rightPeak not implemented yet in flash/SoundChannel");
		return 0;
	}

	/**
	 * The SoundTransform object assigned to the sound channel. A SoundTransform object
	 * includes properties for setting volume, panning, left speaker assignment, and right
	 * speaker assignment.
	 */
	public get soundTransform () : SoundTransform{
		return this._sndtranform;
	}
	public set soundTransform (value:SoundTransform){
		if(this._sound){
			this._sound.adaptee.volume=value.volume;
			this._sound.adaptee.pan=value.pan;

		}
		this._sndtranform=value;
	}


	/**
	 * Stops the sound playing in the channel.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 * @refpath
	 */
	public stop () {
		if(!this._sound){
			console.log("SoundChannel.stop: No sound exists");
			return;
		}
		this._sound.stop();
	}
}

