
import {Loader as AwayLoader, Point, IAsset, ParserBase} from "@awayjs/core";
import {LoaderContainer as AwayLoaderContainer} from "@awayjs/scene";
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
import {Image2DParser} from "@awayjs/stage";
import {Sound} from "../media/Sound";
import {FlashSceneGraphFactory} from "../factories/FlashSceneGraphFactory";
import {URLLoaderEvent} from "@awayjs/core";

// todo: define all methods (start new with converting as3-Loader to ts ?)

export class Loader extends DisplayObjectContainer
{
	private _factory:FlashSceneGraphFactory;
	private _loader:AwayLoader;
	private _isImage:boolean;
	private _parser:ParserBase;

	private _loaderContext:LoaderContext;

	// for AVM1:
	public content:any;
	public _content:any;

	constructor(parser:ParserBase){
		super();
		this._onLoaderProgressDelegate = (event:URLLoaderEvent) => this.onLoaderProgress(event);
		this._onLoaderCompleteDelegate = (event:LoaderEvent) => this.onLoaderComplete(event);
		this._onAssetCompleteDelegate = (event:AssetEvent) => this.onAssetComplete(event);

		this._parser = parser;

		this._loaderInfo=new LoaderInfo();
		this._factory = new FlashSceneGraphFactory();
	}

	private _onLoaderProgressDelegate:(event:URLLoaderEvent) => void;
	private onLoaderProgress(event: URLLoaderEvent){
		var newEvent=new ProgressEvent(ProgressEvent.PROGRESS, null, null, event.urlLoader.bytesLoaded, event.urlLoader.bytesTotal);
		newEvent.currentTarget=this._loaderInfo;
		this._loaderInfo.dispatchEvent(newEvent);
	}

	private _onLoaderCompleteDelegate:(event:LoaderEvent) => void;
	private onLoaderComplete(event: LoaderEvent){
		var newEvent=new Event(Event.COMPLETE);
		newEvent.currentTarget=this._loaderInfo;

		this._loaderInfo.dispatchEvent(newEvent);

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
		} else if (asset.isAsset(SceneImage2D)) {
			this._loaderContext.applicationDomain.addDefinition(asset.name, <SceneImage2D> asset);

			// we should only do this for bitmaps loaded from jpg or png
			if (this._isImage)
				this.addChild(this._loaderInfo.content = new Bitmap(<BitmapData> (<SceneImage2D> asset).adapter));
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
			if (asset.name=="Scene 1" || (asset.name=="scene")){// "Scene 1" when AWDParser, "scene" when using SWFParser
				this.addChild(this._loaderInfo.content = (<MovieClip>(<AwayMovieClip>asset).adapter));
			}
		}
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
		
		this._loader.load(url, null, null, (this._isImage)? new Image2DParser(this._factory) : this._parser);
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

	public get contentLoaderInfo():LoaderInfo
	{
		return this._loaderInfo;
	}

	public set contentLoaderInfo(value:LoaderInfo)
	{
		this._loaderInfo=value;
	}
}