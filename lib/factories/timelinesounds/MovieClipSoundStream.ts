
import { MP3DecoderSession } from "./MP3DecoderSession";
import { SoundChannel } from "../as3webFlash/media/SoundChannel";
import { ISecurityDomain } from "../avm1/ISecurityDomain";
import { Sound } from "../as3webFlash/media/Sound";
import { MovieClip } from "@awayjs/scene";
import { SoundStream, packageWave } from "../../parsers/utils/parser/sound";
import { WaveAudio } from '@awayjs/core';
import { WaveAudioData } from '@awayjs/core/dist/lib/audio/WaveAudio';

export interface DecodedSound {
  streamId: number;
  samplesCount: number;
  pcm?: Float32Array;
  data?: Uint8Array;
  seek?: number;
}

var MP3_MIME_TYPE = 'audio/mpeg';

interface ISoundStreamAdapter {
  currentTime: number;
  paused: boolean;
  isReady: boolean;

  stop();
  playFrom(time: number);
  queueData(frame: DecodedSound);
  finish();
  isPlaying:boolean;
}

class HTMLAudioElementAdapter implements ISoundStreamAdapter {
  private _sec: ISecurityDomain;
  private _element: HTMLAudioElement;
  private _channel: SoundChannel;

  get isReady(): boolean {
    return !!this._channel;
  }

  get element(): HTMLAudioElement {
    return this._element;
  }

  get currentTime(): number {
    return this._element.currentTime;
  }

  playFrom(time: number) {
    var element = this._element;
    if (element.paused) {
      element.play();
      element.addEventListener('playing', function setTime(e) {
        element.removeEventListener('playing', setTime);
        element.currentTime = time;
      });
    } else {
      element.currentTime = time;
    }
  }
  
  get isPlaying(): boolean {
    return false;
  }
  stop(){
  }
  
  get paused(): boolean {
    return this._element.paused;
  }

  set paused(value: boolean) {
    var element = this._element;
    if (value) {
      if (!element.paused) {
        element.pause();
      }
    } else {
      if (element.paused) {
        element.play();
      }
    }
  }

  constructor(sec: ISecurityDomain, element: HTMLAudioElement) {
    this._sec = sec;
    this._element = element;
  }

  createChannel() {
    //this._channel = SoundChannel.initializeFromAudioElement(this._sec, this._element);
  }

  queueData(frame: DecodedSound) {
    //Debug.abstractMethod('HTMLAudioElementAdapter::queueData');
  }

  finish() {
    //Debug.abstractMethod('HTMLAudioElementAdapter::finish');
  }
}

class MediaSourceStreamAdapter extends HTMLAudioElementAdapter {
  private _mediaSource: MediaSource;
  private _sourceBuffer: SourceBuffer;
  private _updating: boolean;
  private _loading: boolean;
  private _rawFrames: any[];
  private _isReady: boolean;

  constructor(sec: ISecurityDomain, element: HTMLAudioElement) {
    super(sec, element);
    this._mediaSource = new MediaSource();
    this._sourceBuffer = null;
    this._updating = false;
    this._loading = true;
    this._rawFrames = [];
    this._isReady = false;

    this._mediaSource.addEventListener('sourceopen', this._openMediaSource.bind(this));
    this.element.src = URL.createObjectURL(this._mediaSource);
  }

  private _appendSoundData() {
    if (this._rawFrames.length === 0 || this._updating || !this._sourceBuffer) {
      return;
    }
    if (!this._loading) {
      this._mediaSource.endOfStream();
      return;
    }

    this._updating = true;
    // There is an issue when multiple appendBuffers are added in a sequence,
    // pushing frames one-by-one.
    this._sourceBuffer.appendBuffer(this._rawFrames.shift());

    // Making MediaSourceStreamAdapter be ready on first packet.
    if (!this._isReady) {
      this._isReady = true;
      this.createChannel();
    }
  }

  private _openMediaSource() {
    var sourceBuffer = this._mediaSource.addSourceBuffer(MP3_MIME_TYPE);
    sourceBuffer.addEventListener('update', function () {
      this._updating = false;
      this._appendSoundData();
    }.bind(this));
    this._sourceBuffer = sourceBuffer;
    this._appendSoundData();
  }

  queueData(frame: DecodedSound) {
    this._rawFrames.push(frame.data);
    this._appendSoundData();
  }

  finish() {
    this._loading = false;
    this._appendSoundData();
  }
}

class BlobStreamAdapter extends HTMLAudioElementAdapter {
  private _rawFrames: any[];

  constructor(sec: ISecurityDomain, element: HTMLAudioElement) {
    super(sec, element);
    this._rawFrames = [];
  }

  queueData(frame: DecodedSound) {
    this._rawFrames.push(frame.data);
  }

  finish() {
    var blob = new Blob(this._rawFrames);
    this.element.src = URL.createObjectURL(blob);
    this.createChannel();
  }
}

function syncTime(element, movieClip) {
  var initialized = false;
  var startMediaTime, startRealTime;
  element.addEventListener('timeupdate', function (e) {
    if (!initialized) {
      startMediaTime = element.currentTime;
      startRealTime = performance.now();
      initialized = true;
      //movieClip._stage._frameScheduler.startTrackDelta();
      return;
    }
    var mediaDelta = element.currentTime - startMediaTime;
    var realDelta = performance.now() - startRealTime;
    //movieClip._stage._frameScheduler.setDelta(realDelta - mediaDelta * 1000);
  });
  element.addEventListener('pause', function (e) {
    //movieClip._stage._frameScheduler.endTrackDelta();
    initialized = false;
  });
  element.addEventListener('seeking', function (e) {
    //movieClip._stage._frameScheduler.endTrackDelta();
    initialized = false;
  });
}

class WebAudioAdapter implements ISoundStreamAdapter {
  protected _sec: ISecurityDomain;
  protected _sound: WaveAudio;
  protected _data;
  protected _frameData;
  protected _position: number;

  get currentTime(): number {
    return this._sound.currentTime;
  }

  playFrom(time: number) {
    // tslint, noop
    this._sound.play(time);
  }
  stop() {
    // tslint, noop
    if(this._sound)
      this._sound.stop();
  }

  get paused(): boolean {
    return false;
  }

  set paused(value: boolean) {
    // tslint, noop
  }

  get isPlaying(): boolean {
    return this._sound.isPlaying;
  }
  get isReady(): boolean {
    return !!this._sound;
  }

  constructor(sec: ISecurityDomain, data) {
    this._sec = sec;
    this._sound = null;
    this._frameData = [];
    this._data = data;
    this._position = 0;
  }

  queueData(frame: DecodedSound) {
    if (!frame.pcm) {
      console.log("error in WebAudioAdapter.queueData - frame does not provide pcm data")
      return;

    }
    this._frameData.push(frame);
  }

  finish() {
    var totalLength = 0;
    for (var i = 0; i < this._frameData.length; i++) {
      totalLength += this._frameData[i].data.length;
    }
    var finalBytes = new Int8Array(totalLength);
    for (var i = 0; i < this._frameData.length; i++) {
      finalBytes.set(this._frameData[i].data, this._position);
      this._position += this._frameData[i].data.length;
    }

    var packagedWave = packageWave(finalBytes, this._data.sampleRate, this._data.channels, this._data.streamSize, false);
    var sound = new WaveAudio(new WaveAudioData(packagedWave.data.buffer));

    //sound.play(0);
    this._sound = sound;
  }
}

class WebAudioMP3Adapter extends WebAudioAdapter {
  //private _decoderPosition: number;
  //private _decoderSession: MP3DecoderSession;
  constructor(sec: ISecurityDomain, data) {
    super(sec, data);

    /*this._decoderPosition = 0;
    this._decoderSession = new MP3DecoderSession();
    this._decoderSession.onframedata = function (frameData) {
      var position = this._decoderPosition;
      data.pcm.set(frameData, position);
      this._decoderPosition = position + frameData.length;
    }.bind(this);
    this._decoderSession.onclosed = function () {
      WebAudioAdapter.prototype.finish.call(this);
    }.bind(this);
    this._decoderSession.onerror = function (error) {
      console.log('MP3DecoderSession error: ' + error);
    };
    */
  }

  queueData(frame: DecodedSound) {
    if (!frame.data) {
      console.log("error in WebAudioAdapter.queueData - frame does not provide data")
      return;

    }
    this._frameData.push(frame);
  }


  finish() {
    var totalLength = 0;
    for (var i = 0; i < this._frameData.length; i++) {
      totalLength += this._frameData[i].data.length;
    }
    var finalBytes = new Uint8Array(totalLength);
    for (var i = 0; i < this._frameData.length; i++) {
      finalBytes.set(this._frameData[i].data, this._position);
      this._position += this._frameData[i].data.length;
    }
    /*var a = document.createElement("a");
    var file = new Blob([finalBytes.buffer], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = "testmp3.mp3";
    a.click();*/

    var sound = new WaveAudio(new WaveAudioData(finalBytes.buffer));
    //sound._symbol = data;
    //sound.applySymbol();
    //sound.play(0);
    //var mp3Parser=new MP3Parser();
    //mp3Parser.push(this._data.pcm);
    //this._decoderSession.close();
    this._sound = sound;
  }
}

export class MovieClipSoundStream {
  private movieClip: MovieClip;
  private data;
  private seekIndex: Array<number>;
  private position: number;
  private finalized: boolean;
  public isPlaying: boolean;
  private element;
  private startFrame: number;
  private soundStreamAdapter: ISoundStreamAdapter;

  private decode: (block: Uint8Array) => DecodedSound;

  private expectedFrame: number;
  private waitFor: number;

  public constructor(streamInfo: SoundStream, movieClip: MovieClip, startFrame: number) {
    this.movieClip = movieClip;
    this.decode = streamInfo.decode.bind(streamInfo);
    this.data = {
      sampleRate: streamInfo.sampleRate,
      channels: streamInfo.channels,
      streamSize: streamInfo.streamSize,
    };
    this.startFrame = startFrame;
    this.seekIndex = [];
    this.position = 0;
    this.expectedFrame = 0;
    this.waitFor = 0;
    let audioContext;
    var webAudioMP3Option: boolean = false;
    var mediaSourceMP3Option: boolean = false;
    try {
      audioContext = new (window.AudioContext || (<any>window).webkitAudioContext)();
      webAudioMP3Option = false;
    } catch (error) {
      window.alert(
        `Sorry, but your browser doesn't support the Web Audio API!`
      );
    }
    var sec = (<any>movieClip).sec;
    var isMP3 = streamInfo.format === 'mp3';
    /*if (isMP3 && !webAudioMP3Option) {
      var element = document.createElement('audio');
      element.preload = 'metadata'; // for mobile devices
      element.loop = false;
      syncTime(element, movieClip);
      if (element.canPlayType(MP3_MIME_TYPE)) {
        this.element = element;
        if (!mediaSourceMP3Option) {
          this.soundStreamAdapter = new BlobStreamAdapter(sec, element);
        } else if (typeof MediaSource !== 'undefined' &&
          (<any>MediaSource).isTypeSupported(MP3_MIME_TYPE)) {
          this.soundStreamAdapter = new MediaSourceStreamAdapter(sec, element);
        } else {
          // Falls back to blob playback.
          //Debug.warning('MediaSource is not supported');
          this.soundStreamAdapter = new BlobStreamAdapter(sec, element);
        }
        return;
      }
      // Falls through to WebAudio if element cannot play MP3.
    }*/
    this.soundStreamAdapter = !isMP3 ? new WebAudioAdapter(sec, this.data) : new WebAudioMP3Adapter(sec, this.data);
  }

  public appendBlock(frameNum: number, streamBlock: Uint8Array) {
    var decodedBlock = this.decode(streamBlock);
    var streamPosition = this.position;
    this.seekIndex[frameNum] = streamPosition + decodedBlock.seek * this.data.channels;
    this.position = streamPosition + decodedBlock.samplesCount;
    this.soundStreamAdapter.queueData(decodedBlock);
  }

  public stop() {
    this.soundStreamAdapter.stop();
  }
  public playFrame(frameNum: number) {
    if (isNaN(this.seekIndex[frameNum])) {
      return;
    }

    this.isPlaying=true;
    var PAUSE_WHEN_OF_SYNC_GREATER = 1.0;
    var PLAYBACK_ADJUSTMENT = 0.25;

    if (!this.finalized) {
      this.finalized = true;
      this.soundStreamAdapter.finish();
    }
    var soundStreamData = this.data;
    var time = this.seekIndex[frameNum] / soundStreamData.sampleRate / soundStreamData.channels;
    var elementTime = this.soundStreamAdapter.currentTime;
    console.log("time", time, "elementTime", elementTime);
    if(!this.soundStreamAdapter.isPlaying)
      this.soundStreamAdapter.playFrom(time);
  }
  /*
      if (this.soundStreamAdapter.isReady &&
        !isNaN(this.soundStreamAdapter.currentTime)) {
        var soundStreamData = this.data;
        var time = this.seekIndex[frameNum] /
          soundStreamData.sampleRate / soundStreamData.channels;
        var elementTime = this.soundStreamAdapter.currentTime;
        if (this.expectedFrame !== frameNum) {
          this.soundStreamAdapter.playFrom(time);
        } else if (this.waitFor > 0) {
          if (this.waitFor <= time) {
            this.soundStreamAdapter.paused = false;
            this.waitFor = 0;
          }
        } else if (elementTime - time > PAUSE_WHEN_OF_SYNC_GREATER) {
          console.log('Sound is faster than frames by ' + (elementTime - time));
          this.waitFor = elementTime - PLAYBACK_ADJUSTMENT;
          this.soundStreamAdapter.paused = true;
        } else if (time - elementTime > PAUSE_WHEN_OF_SYNC_GREATER) {
          console.log('Sound is slower than frames by ' + (time - elementTime));
          this.soundStreamAdapter.playFrom(time + PLAYBACK_ADJUSTMENT);
        }
        this.expectedFrame = frameNum + 1;
      }
    }
    */
}

