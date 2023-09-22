
import { SoundStream, packageWave } from '../../parsers/utils/parser/sound';
import { WaveAudio } from '@awayjs/core';
import { WaveAudioData } from '@awayjs/core';
import { MovieClipSoundsManager } from './MovieClipSoundsManager';
import { release } from '../base/utilities/Debug';

export interface ISampeFrameInfo {
	channels: number;
	sampleRate: number;
	streamSize: number;
}

export interface DecodedSound {
	streamId: number;
	samplesCount: number;
	pcm?: Float32Array;
	data?: Uint8Array;
	seek?: number;
}

interface ISoundStreamAdapter {
	currentTime: number;
	paused: boolean;
	isReady: boolean;
	isComplete: boolean;
	byteLength: number;

	stop(): void;
	playFrom(time: number): void;
	queueData(frame: DecodedSound): void;
	finish(): void;
	isPlaying: boolean;
}

class WebAudioAdapter implements ISoundStreamAdapter {
	protected _sound: WaveAudio;
	protected _data: ISampeFrameInfo;
	protected _frameData: DecodedSound[];
	protected _position: number;
	protected _byteLength: number = 0;

	get byteLength() {
		return this._byteLength;
	}

	get isComplete() {
		return this._byteLength > 0;
	}

	get currentTime(): number {
		return this._sound.currentTime;
	}

	get sound(): WaveAudio {
		return this._sound;
	}

	playFrom(time: number) {
		/*var startPlay=true;
		if(this._sound.duration<this._sound.currentTime){
		  startPlay=false;
		}*/
		this.stop();
		//if(startPlay){
		this._sound.play(time);
		//}
	}

	stop() {
		if (this._sound)
			this._sound.stop();
	}

	get paused(): boolean {
		return false;
	}

	set paused(_value: boolean) {}

	get isPlaying(): boolean {
		return this._sound.isPlaying;
	}

	get isReady(): boolean {
		return !!this._sound;
	}

	constructor(data: ISampeFrameInfo) {
		this._sound = null;
		this._frameData = [];
		this._data = data;
		this._position = 0;
	}

	queueData(frame: DecodedSound) {
		if (!frame.pcm) {
			release || console.log('error in WebAudioAdapter.queueData - frame does not provide pcm data');
			return;

		}
		this._frameData.push(frame);
		this._byteLength += frame.data.length;
	}

	finish() {
		const finalBytes = new Int8Array(this._byteLength);

		for (let i = 0; i < this._frameData.length; i++) {
			finalBytes.set(this._frameData[i].data, this._position);
			this._position += this._frameData[i].data.length;
		}

		const packagedWave = packageWave(
			finalBytes,
			this._data.sampleRate,
			this._data.channels,
			this._data.streamSize,
			false
		);
		const sound = new WaveAudio(new WaveAudioData(packagedWave.data.buffer));

		this._sound = sound;
	}
}

class WebAudioMP3Adapter extends WebAudioAdapter {
	public queueData(frame: DecodedSound) {
		if (!frame.data) {
			release || console.log('error in WebAudioAdapter.queueData - frame does not provide data');
			return;

		}

		this._frameData.push(frame);
		this._byteLength += frame.data.length;
	}

	public finish() {
		if (!this._byteLength) {
			throw 'Can\'t finish empty stream!';
		}

		const finalBytes = new Uint8Array(this._byteLength);

		for (let i = 0; i < this._frameData.length; i++) {
			finalBytes.set(this._frameData[i].data, this._position);
			this._position += this._frameData[i].data.length;
		}

		const sound = new WaveAudio(new WaveAudioData(finalBytes.buffer));
		this._sound = sound;
	}
}

export class MovieClipSoundStream {
	private data: ISampeFrameInfo;
	private seekIndex: Array<number>;
	private position: number;
	private finalized: boolean;
	public isPlaying: boolean;
	private _stopped: boolean;
	private isMP3: boolean;
	private soundStreamAdapter: WebAudioAdapter;

	private decode: (block: Uint8Array) => DecodedSound;

	public constructor(streamInfo: SoundStream) {
		this._stopped = false;
		this.decode = streamInfo.decode.bind(streamInfo);
		this.data = {
			sampleRate: streamInfo.sampleRate,
			channels: streamInfo.channels,
			streamSize: streamInfo.streamSize,
		};
		this.seekIndex = [];
		this.position = 0;

		this.isMP3 = streamInfo.format === 'mp3';
		this.soundStreamAdapter = !this.isMP3
			? new WebAudioAdapter(this.data)
			: new WebAudioMP3Adapter(this.data);

	}

	public appendBlock(frameNum: number, streamBlock: Uint8Array) {
		const decodedBlock = this.decode(streamBlock);
		const streamPosition = this.position;

		this.seekIndex[frameNum] = (streamPosition + decodedBlock.seek);
		this.position = streamPosition + decodedBlock.samplesCount;
		this.soundStreamAdapter.queueData(decodedBlock);
	}

	public get stopped(): boolean {
		return this._stopped;
	}

	public set stopped(value: boolean) {
		this._stopped = value;
	}

	public stop() {
		this.soundStreamAdapter.stop();
	}

	public playFrame(frameNum: number): number {
		if (this._stopped || isNaN(this.seekIndex[frameNum])) {
			return 0;
		}

		if (!this.soundStreamAdapter.isComplete) {
			return 0;
		}

		if (!this.finalized) {
			this.finalized = true;
			this.soundStreamAdapter.finish();
		}

		this.isPlaying = true;

		const soundStreamData = this.data;

		let time = this.seekIndex[frameNum] / soundStreamData.channels / soundStreamData.sampleRate;

		if (this.isMP3) {
			time *= soundStreamData.channels;
		}

		MovieClipSoundsManager.addActiveSound(this.soundStreamAdapter.sound);

		if (!this.soundStreamAdapter.isPlaying) {
			this.soundStreamAdapter.playFrom(time);
		}

		const elementTime = this.soundStreamAdapter.currentTime;

		let framestoSkip = (elementTime - time) * MovieClipSoundsManager.frameRate;

		if ((elementTime - time) < 0) {
			framestoSkip = Math.ceil(framestoSkip);
		} else {
			framestoSkip = Math.floor(framestoSkip);
		}

		//console.log("framestoSkip ", framestoSkip);
		return framestoSkip;

	}
}
