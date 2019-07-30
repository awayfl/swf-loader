import {Event} from "./Event";
import {IEventMapper} from "./IEventMapper";
import {EventDispatcherBase} from "./EventDispatcherBase";

import {EventBase} from "@awayjs/core";
import { ASObject } from '../../avm2/nat/ASObject';
import { ASClass } from '../../avm2/nat/ASClass';
import { ClassInfo } from '../../avm2/abc/lazy/ClassInfo';

/**
	 * [broadcast event] Dispatched when the Flash Player or AIR application operating
	 * loses system focus and is becoming inactive.
	 * @eventType	flash.events.Event.DEACTIVATE
	[Event(name="deactivate", type="flash.events.Event")]

	 * [broadcast event] Dispatched when the Flash Player or AIR application gains
	 * operating system focus and becomes active.
	 * @eventType	flash.events.Event.ACTIVATE
	[Event(name="activate", type="flash.events.Event")]
 */


export class EventDispatcher extends EventDispatcherBase
{

    public toString():string{
        return "";
	}
	public hasEventListener(type:string, listener?:(event:EventBase) => void):boolean
	{
		return super.hasEventListener(type, listener);

	}
	public willTrigger(){

	}
	public dispatchEvent(event:EventBase):void{
		
		super.dispatchEvent(event);
	}
	protected eventMapping:Object;
	protected eventMappingDummys:Object;
	protected eventMappingExtern:Object;

	protected eventMappingInvert:Object;

	// for AVM1:
	public _avm1Context:any;

	constructor(target:any = null)
	{
		super(target);

		this.eventMapping={};
		this.eventMappingDummys={};
		this.eventMappingExtern={};

		this.eventMappingInvert={};//only needed in some cases, when we translate back from awayjs-type to flash-type

		this._activateCallbackDelegate = (event:any) => this.activateCallback(event);
		this.eventMapping[Event.ACTIVATE]=(<IEventMapper>{
			adaptedType:"",
			addListener:this.initActivateListener,
			removeListener:this.removeActivateListener,
			callback:this._activateCallbackDelegate});

		this._deactivateCallbackDelegate = (event:any) => this.deactivateCallback(event);
		this.eventMapping[Event.DEACTIVATE]=(<IEventMapper>{
			adaptedType:"",
			addListener:this.initDeactivateListener,
			removeListener:this.removeDeactivateListener,
			callback:this._deactivateCallbackDelegate});
	}

	// ---------- event mapping functions Event.ACTIVATE

	private initActivateListener(type:string, callback:(event:any) => void):void
	{
		window.onfocus = callback;
	}
	private removeActivateListener(type:string, callback:(event:any) => void):void
	{
		window.onfocus = null;
	}

	private _activateCallbackDelegate:(event:any) => void;
	private activateCallback(event:any=null):void
	{
		this.dispatchEvent(new Event(Event.ACTIVATE));
	}


	// ---------- event mapping functions Event.DEACTIVATE

	private initDeactivateListener(type:string, callback:(event:any) => void):void
	{
		window.onblur = callback;
	}
	private removeDeactivateListener(type:string, callback:(event:any) => void):void
	{
		window.onblur = null;
	}
	private _deactivateCallbackDelegate:(event:any) => void;
	private deactivateCallback(event:any=null):void
	{
		this.dispatchEvent(new Event(Event.DEACTIVATE));
	}


	/*overwrite*/
	public addEventListener(type:string, listener:(event:EventBase) => void, useCapture: boolean = false,
							priority: number /*int*/ = 0, useWeakReference: boolean = false):void
	{

		if(this.eventMappingExtern.hasOwnProperty(type)){

			// this is a external eventMapping
			// this means that we do not need to create any mapping, and will manually dispatch the event
			// we still need to register it on superclass, so it will work if we dispatch it manually
			super.addEventListener(type, listener);
			return;
		}
		if(this.eventMappingDummys.hasOwnProperty(type)){

			// this is a dummy eventMapping
			// this means that this is a event-type, that is not yet supported
			// we do not need to register it on superclass
			// for now we output a warning
			//console.log("Warning - EventDispatcher:  trying to listen for unsupported event: : "+this.eventMappingDummys[type]);
			return;
		}
		if(this.eventMapping.hasOwnProperty(type)){
			
			// a mapping exists for this event
			
			//making sure standart behaviour still works (listener is tracked in list)
			super.addEventListener(type, listener);

			// call the provided "addListener" function
			this.eventMapping[type].addListener.call(this, this.eventMapping[type].adaptedType, this.eventMapping[type].callback);
			return;
		}
		
		// if we make it here, the event is not handled by this dispatcher
		// lets output a Warning for now.
		//console.log("EventDispatcher: trying to listen for unknown event: '"+type+"'")
	}

	/**
	 * Remove an event listener
	 * @method removeEventListener
	 * @param {String} type of event to remove a listener for
	 * @param {Function} listener function
	 */
	public removeEventListener(type:string, listener:(event:EventBase) => void):void
	{
		super.removeEventListener(type, listener);
		if(this.eventMapping.hasOwnProperty(type)){
			// a mapping exists
			this.eventMapping[type].removeListener.call(this, this.eventMapping[type].adaptedType, this.eventMapping[type].callback);
		}
	}
}
