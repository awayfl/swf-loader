
import {Loader as AwayLoader, Point, IAsset, ParserBase} from "@awayjs/core";
import {LoaderContainer as AwayLoaderContainer, IDisplayObjectAdapter} from "@awayjs/scene";
import {LoaderInfo} from "./LoaderInfo";
import {Bitmap} from "./Bitmap";
import {BitmapData} from "./BitmapData";
import {TextField} from "../text/TextField";
import {LoaderContext} from "../system/LoaderContext";
import {DisplayObjectContainer} from "./DisplayObjectContainer";
import {DisplayObject} from "./DisplayObject";
import {Sprite} from "./Sprite";
import {MovieClip} from "./MovieClip";
import {LoaderEvent, AssetLibrary, AssetEvent, WaveAudio} from "@awayjs/core";
import {MovieClip as AwayMovieClip, Sprite as AwaySprite, TextField as AwayTextField} from "@awayjs/scene";
import {URLRequest} from "../net/URLRequest";
import {Event} from "../events/Event";
import {ProgressEvent} from "../events/ProgressEvent";
import {Font, DisplayObjectContainer as AwayDisplayObjectContainer, DisplayObject as AwayDisplayObject, SceneImage2D} from "@awayjs/scene";
import {Image2DParser, BitmapImage2D} from "@awayjs/stage";
import {Sound} from "../media/Sound";
import {FlashSceneGraphFactory} from "../factories/FlashSceneGraphFactory";
import {URLLoaderEvent} from "@awayjs/core";
import { release, somewhatImplemented } from '../../base/utilities/Debug';
import { UncaughtErrorEvents } from '../events/UncaughtErrorEvents';
import { Errors } from '../../avm2/errors';
import { ByteArray } from '../../avm2/natives/byteArray';

// todo: define all methods (start new with converting as3-Loader to ts ?)

export class Loader extends DisplayObjectContainer
{
	private _factory:FlashSceneGraphFactory;
	private _loader:AwayLoader;
	private _isImage:boolean;
	private _parser:ParserBase;
	private _uncaughtErrorEvents: UncaughtErrorEvents;

	private _loaderContext:LoaderContext;

	public _content:DisplayObject;

	// for AVM1:
	public get content():DisplayObject
	{
		return this._content;
	}

	public get uncaughtErrorEvents(): UncaughtErrorEvents {
		release || somewhatImplemented("public flash.display.Loader::uncaughtErrorEvents");
		if (!this._uncaughtErrorEvents) {
			this._uncaughtErrorEvents = new UncaughtErrorEvents();
		}
		return this._uncaughtErrorEvents;
	}

	constructor(parser:ParserBase){
		super();
		this._onLoaderProgressDelegate = (event:URLLoaderEvent) => this.onLoaderProgress(event);
		this._onLoaderCompleteDelegate = (event:LoaderEvent) => this.onLoaderComplete(event);
		this._onAssetCompleteDelegate = (event:AssetEvent) => this.onAssetComplete(event);

		this._parser = parser;

		this._loaderInfo=new this.sec.flash.display.LoaderInfo();
		this._loaderInfo._loader = this;
		this._factory = new FlashSceneGraphFactory(null);
	}

	private _onLoaderProgressDelegate:(event:URLLoaderEvent) => void;
	private onLoaderProgress(event: URLLoaderEvent){
		var newEvent=new ProgressEvent(ProgressEvent.PROGRESS, null, null, event.urlLoader.bytesLoaded, event.urlLoader.bytesTotal);
		newEvent.currentTarget=this._loaderInfo;
		this._loaderInfo.dispatchEventInternal(newEvent);
	}

	private _onLoaderCompleteDelegate:(event:LoaderEvent) => void;
	private onLoaderComplete(event: LoaderEvent){
		var newEvent=new Event(Event.COMPLETE);
		newEvent.currentTarget=this._loaderInfo;

		this._loaderInfo.dispatchEventInternal(newEvent);

		this._loader.removeEventListener(LoaderEvent.LOAD_COMPLETE, this._onLoaderCompleteDelegate);
		this._loader.removeEventListener(AssetEvent.ASSET_COMPLETE, this._onAssetCompleteDelegate);
		this._loader=null;
		//AssetLibrary.removeEventListener(LoaderEvent.LOAD_COMPLETE, this._onLoaderCompleteDelegate);
		//AssetLibrary.removeEventListener(AssetEvent.ASSET_COMPLETE, this._onAssetCompleteDelegate);
		
	}

	private _onAssetCompleteDelegate:(event:AssetEvent) => void;
	private onAssetComplete(event: AssetEvent){
		
		// 	todo: take care of all needed asset-types (sounds / fonts / textfield)
		//	todo: update awd to support as3-class-identifier as extra property. 
		//  atm the name of the exported symbols will be the as3-class name, 
		//  and all exported symbols are handled as if exposed to as3

		var asset:IAsset = event.asset;

		if (asset.isAsset(AwayTextField)) {
			this._loaderContext.applicationDomain.addDefinition(asset.name, <AwayTextField> asset);
		} else if (asset.isAsset(SceneImage2D) || asset.isAsset(BitmapImage2D)) {
			this._loaderContext.applicationDomain.addDefinition(asset.name, <SceneImage2D> asset);

			// we should only do this for bitmaps loaded from jpg or png
			if (this._isImage)
				(<AwayDisplayObjectContainer> this._adaptee).addChild(new Bitmap(<BitmapData> (<SceneImage2D> asset).adapter).adaptee);
				//this.addChild(this._loaderInfo.content = new Bitmap(<BitmapData> (<SceneImage2D> asset).adapter));
		} else if (asset.isAsset(WaveAudio)) {
			this._loaderContext.applicationDomain.addAudioDefinition(asset.name, (<WaveAudio>asset));
		} else if (asset.isAsset(Font)) {
			this._loaderContext.applicationDomain.addFontDefinition(asset.name, (<Font>asset));
		} else if(asset.isAsset(AwaySprite)) {
			//if((<AwaySprite> asset).material)
			//	(<AwaySprite> asset).material.bothSides=false;
			this._loaderContext.applicationDomain.addDefinition(asset.name, <AwaySprite> asset);
		} else if(asset.isAsset(AwayMovieClip)) {
			this._loaderContext.applicationDomain.addDefinition(asset.name, <AwayMovieClip> asset);
			
			// if this is the "Scene 1", we make it a child of the loader
			if (asset.name=="Scene 1" || (<any>asset).isAVMScene){// "Scene 1" when AWDParser, isAVMScene when using SWFParser

				var newClone=<DisplayObject>(<IDisplayObjectAdapter> asset.adapter).clone();
				newClone.loaderInfo=this.loaderInfo;
				this.addChild(newClone);
				//this.addChild(this._loaderInfo.content = (<MovieClip>(<AwayMovieClip>asset).adapter));
			}
		}else {
			console.log("loaded unhandled asset-type")
		}
	}

	addChild(child: DisplayObject): DisplayObject {
		return super.addChild(child);
	}

	addChildAt(child: DisplayObject, index: number): DisplayObject {
		this.sec.throwError('IllegalOperationError', Errors.InvalidLoaderMethodError);
		return null;
	}

	removeChild(child: DisplayObject): DisplayObject {
		this.sec.throwError('IllegalOperationError', Errors.InvalidLoaderMethodError);
		return null;
	}

	removeChildAt(index: number): DisplayObject {
		this.sec.throwError('IllegalOperationError', Errors.InvalidLoaderMethodError);
		return null;
	}

	setChildIndex(child: DisplayObject, index: number): void {
		this.sec.throwError('IllegalOperationError', Errors.InvalidLoaderMethodError);
	}
	
	public load(url:URLRequest, context:LoaderContext=null)
	{
		console.log("start loading the url:"+url.url);
		var ext:string = url.url.substr(-3);
		this._isImage = (ext == "jpg" || ext == "png");
		url.url=url.url.replace(".swf", ".awd");
		this._loaderContext=context;
		this._loaderInfo.applicationDomain=context.applicationDomain;

		this._loader = new AwayLoader();
		this._loader.addEventListener(URLLoaderEvent.LOAD_PROGRESS, this._onLoaderProgressDelegate);
		this._loader.addEventListener(LoaderEvent.LOAD_COMPLETE, this._onLoaderCompleteDelegate);
		this._loader.addEventListener(AssetEvent.ASSET_COMPLETE, this._onAssetCompleteDelegate);
		
		this._loader.load(url.adaptee, null, null, (this._isImage)? new Image2DParser(this._factory) : this._parser);
	}
	public loadData(buffer:Uint8Array, context:LoaderContext=null)
	{
		console.log("start loading swfdata", buffer);
		this._loaderContext=context;
		this._loaderInfo.applicationDomain=context.applicationDomain;

		this._loader = new AwayLoader();
		this._loader.addEventListener(URLLoaderEvent.LOAD_PROGRESS, this._onLoaderProgressDelegate);
		this._loader.addEventListener(LoaderEvent.LOAD_COMPLETE, this._onLoaderCompleteDelegate);
		this._loader.addEventListener(AssetEvent.ASSET_COMPLETE, this._onAssetCompleteDelegate);
		
		this._loader.loadData(buffer, null, null, null, this._parser);
	}

	public loadBytes(data: ByteArray, context?: LoaderContext) {
		this.close();
		console.log("80pro todo: loader.loadBytes");
		/*
		// TODO: properly coerce object arguments to their types.
		var loaderClass = Loader.axClass;
		// In case this is the initial root loader, we won't have a loaderInfo object. That should
		// only happen in the inspector when a file is loaded from a Blob, though.
		this._contentLoaderInfo._url = (this.loaderInfo ? this.loaderInfo._url : '') +
										'/[[DYNAMIC]]/' + (++loaderClass._embeddedContentLoadCount);
		this._applyLoaderContext(context);
		this._loadingType = LoadingType.Bytes;
		this._fileLoader = new FileLoader(this, this._contentLoaderInfo);
		this._queuedLoadUpdate = null;
		if (!release && traceLoaderOption.value) {
			console.log("Loading embedded symbol " + this._contentLoaderInfo._url);
		}
		// Just passing in the bytes won't do, because the buffer can contain slop at the end.
		this._fileLoader.loadBytes(new Uint8Array((<any>data).bytes, 0, data.length));

		release || assert(loaderClass._loadQueue.indexOf(this) === -1);
		loaderClass._loadQueue.push(this);
		*/
	}

	close(): void {
		console.log("80pro todo: loader.close");
		// var queueIndex = Loader.axClass._loadQueue.indexOf(this);
		// if (queueIndex > -1) {
		//   Loader.axClass._loadQueue.splice(queueIndex, 1);
		// }
		// this._contentLoaderInfo.reset();
		// if (!this._fileLoader) {
		//   return;
		// }
		// this._fileLoader.abortLoad();
		// this._fileLoader = null;
	}

	_unload(stopExecution: boolean, gc: boolean): void {
		console.log("80pro todo: loader._unload");
		// if (this._loadStatus < LoadStatus.Initialized) {
		//   this._loadStatus = LoadStatus.Unloaded;
		//   return;
		// }
		// this.close();
		// this._content = null;
		// this._contentLoaderInfo._loader = null;
		// this._loadStatus = LoadStatus.Unloaded;
		// this.dispatchEvent(Event.axClass.getInstance(Event.UNLOAD));
	}
	unload() {
		this._unload(false, false);
	}
	unloadAndStop(gc: boolean) {
		// TODO: remove all DisplayObjects originating from the unloaded SWF from all lists and stop
		// them.
		this._unload(true, !!gc);
	}

	public get contentLoaderInfo():LoaderInfo
	{
		return this._loaderInfo;
	}

	public set contentLoaderInfo(value:LoaderInfo)
	{
		this._loaderInfo=value;
	}
}