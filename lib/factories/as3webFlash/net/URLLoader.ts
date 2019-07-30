import {URLLoader as URLLoaderAway, URLRequest, LoaderEvent, URLLoaderEvent, IAssetAdapter} from "@awayjs/core";

import {EventDispatcher} from "../events/EventDispatcher"
import {IEventMapper} from "../events/IEventMapper"
import {Event} from "../events/Event"
import {ProgressEvent} from "../events/ProgressEvent"

export class URLLoader extends EventDispatcher
{
	private _adaptee:URLLoaderAway;
	//for AVM1:
	public bytesLoaded:number;
	public bytesTotal:number;

	constructor(){
		super();
		this._adaptee = new URLLoaderAway();

		this._completeCallbackDelegate = (event:URLLoaderEvent) => this.completeCallback(event);
		this._progressCallbackDelegate = (event:URLLoaderEvent) => this.progressCallback(event);
		this.eventMapping[Event.COMPLETE]=(<IEventMapper>{
			adaptedType:URLLoaderEvent.LOAD_COMPLETE,
			addListener:this.initListener,
			removeListener:this.removeListener,
			callback:this._completeCallbackDelegate});
		this.eventMapping[ProgressEvent.PROGRESS]=(<IEventMapper>{
			adaptedType:URLLoaderEvent.LOAD_PROGRESS,
			addListener:this.initListener,
			removeListener:this.removeListener,
			callback:this._progressCallbackDelegate});
	}

	public get data():any
	{
		return this._adaptee.data;
	}
	private initListener(type:string, callback:(event:any) => void):void
	{
		this._adaptee.addEventListener(type, callback);
	}
	private removeListener(type:string, callback:(event:any) => void):void
	{
		this._adaptee.removeEventListener(type, callback);
	}
	private _progressCallbackDelegate:(event:URLLoaderEvent) => void;
	private progressCallback(event:URLLoaderEvent=null):void
	{
		var newEvent:ProgressEvent = new ProgressEvent(ProgressEvent.PROGRESS, null, null, event.urlLoader.bytesLoaded, event.urlLoader.bytesTotal);
		newEvent.currentTarget=this;
		this.dispatchEvent(newEvent);
	}
	private _completeCallbackDelegate:(event:URLLoaderEvent) => void;
	private completeCallback(event:URLLoaderEvent=null):void
	{
		var newEvent:Event=new Event(Event.COMPLETE);
		newEvent.currentTarget=this;
		this.dispatchEvent(newEvent);
	}
	public load(request:URLRequest):void{
		this._adaptee.load(request);
	};
}