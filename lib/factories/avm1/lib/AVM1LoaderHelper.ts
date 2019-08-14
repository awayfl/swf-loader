import { SWFParser } from "../../../parsers/SWFParser";
import {AVM1Globals} from "./AVM1Globals";
import { Loader, URLLoaderEvent, LoaderEvent, AssetEvent, IAsset, AssetLibrary, URLRequest } from "@awayjs/core";
import { AVM1Context } from "../context";
import { DisplayObject, MovieClip } from "@awayjs/scene";
import { PromiseWrapper } from "../../base/utilities";
import { LoaderInfo } from '../../customAway/LoaderInfo';

export class AVM1LoaderHelper {
	private _loader:Loader;
	private _context: AVM1Context;
	private _content: DisplayObject;
	private result = new PromiseWrapper<DisplayObject>();
	private _url:string;

	public get loader(): Loader {
		return this._loader;
	}

	public get loaderInfo(): LoaderInfo {
		return <LoaderInfo>this._loader.loaderInfo;
	}

	public get content(): DisplayObject {
		return this._content;
	}

	public constructor(context: AVM1Context) {
		this._context = context;
		this._onAssetCompleteDelegate = (event: AssetEvent) => this.onAssetComplete(event);
		this._onLoadCompleteDelegate = (event: LoaderEvent) => this.onLoadComplete(event);
		this._onLoadErrorDelegate = (event: URLLoaderEvent) => this.onLoadError(event);
		this._loader = new Loader();
	}

	private _onAssetCompleteDelegate: (event: AssetEvent) => void;

	private onAssetComplete(event: AssetEvent): void {
		var asset: IAsset = event.asset;
		if (asset.isAsset(MovieClip)) {
			if(asset.assetNamespace!=this._url){
				return;
			}
			if (asset.name == "scene") {
				this._content=<MovieClip>asset;
                this.result.resolve(<MovieClip>asset);
                (<any>asset.adapter).doInitEvents();
			}
		}
	}

	private _onLoadCompleteDelegate: (event: LoaderEvent) => void;

	private onLoadComplete(event: LoaderEvent): void {
		if(event.url!=this._url){
			return;
		}
		AssetLibrary.removeEventListener(AssetEvent.ASSET_COMPLETE, this._onAssetCompleteDelegate);
		AssetLibrary.removeEventListener(LoaderEvent.LOAD_COMPLETE, this._onLoadCompleteDelegate);
		AssetLibrary.removeEventListener(URLLoaderEvent.LOAD_ERROR, this._onLoadErrorDelegate);
	}

	private _onLoadErrorDelegate: (event: URLLoaderEvent) => void;

	private onLoadError(event: URLLoaderEvent): void {
		AssetLibrary.removeEventListener(AssetEvent.ASSET_COMPLETE, this._onAssetCompleteDelegate);
		AssetLibrary.removeEventListener(LoaderEvent.LOAD_COMPLETE, this._onLoadCompleteDelegate);
		AssetLibrary.removeEventListener(URLLoaderEvent.LOAD_ERROR, this._onLoadErrorDelegate);
		console.log("load error in loadMovie", event);
	}
	public load(url: string, method: string): Promise<DisplayObject> {

		this._url=url;
		this.result = new PromiseWrapper<DisplayObject>();
		AssetLibrary.addEventListener(AssetEvent.ASSET_COMPLETE, this._onAssetCompleteDelegate);
		AssetLibrary.addEventListener(LoaderEvent.LOAD_COMPLETE, this._onLoadCompleteDelegate);
		AssetLibrary.addEventListener(URLLoaderEvent.LOAD_ERROR, this._onLoadErrorDelegate);
		AssetLibrary.load(new URLRequest(url), null, url, new SWFParser(AVM1Globals._scenegraphFactory));
		return this.result.promise;

		/*
		todo:
		
		var context = this._context;
		var loader = this._loader;
		var loaderContext: LoaderContext = new context.sec.flash.system.LoaderContext();
		loaderContext._avm1Context = context;
		var request = new context.sec.flash.net.URLRequest(url);
		if (method) {
			request.method = method;
		}

		var loaderInfo = loader.contentLoaderInfo;
		// Waiting for content in the progress event -- the result promise will be resolved
		// as soon as loader's content will be set to non-empty value.
		var progressEventHandler = function (e: ProgressEvent): void {
			if (!loader._content) {
				return;
			}
			loaderInfo.removeEventListener(ProgressEvent.PROGRESS, progressEventHandler);
			result.resolve(loader._content);

		};
		loaderInfo.addEventListener(ProgressEvent.PROGRESS, progressEventHandler);
		loader.load(request, loaderContext);
		*/

		//return null;

	}
}
