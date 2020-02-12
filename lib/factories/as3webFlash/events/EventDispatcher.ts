import {Event} from "./Event";
import {IEventMapper} from "./IEventMapper";
import {EventDispatcherBase} from "./EventDispatcherBase";

import {EventBase} from "@awayjs/core";
import { release } from '../../base/utilities/Debug';
import { assert } from '@awayjs/graphics';

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
	public dispatchQueuedEvents():void{
		
		for(var i=0; i<this._queuedEvents.length; i++){
			this.dispatchEvent(this._queuedEvents[i])
		}
		this._queuedEvents.length=0;
		
	}
	public getQueuedEvents(){
		
		return super.getQueuedEvents();
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
		this.dispatchEvent(new this.sec.flash.events.Event(Event.ACTIVATE));
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
		this.dispatchEvent(new this.sec.flash.events.Event(Event.DEACTIVATE));
	}


	/*overwrite*/
	public addEventListener(type:string, listener:(event:EventBase) => void, useCapture: boolean = false,
							priority: number /*int*/ = 0, useWeakReference: boolean = false):void
	{

		
		if (!useCapture && Event.isBroadcastEventType(type)) {
			BroadcastEventDispatchQueue.getInstance().add(type, this);
		}
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
			if(!this.hasEventListener(type)){
				
				if (Event.isBroadcastEventType(type)) {
					BroadcastEventDispatchQueue.getInstance().remove(type, this);
				}
			}
		}
	}
}

export class BroadcastEventDispatchQueue {
	/**
	 * The queues start off compact but can have null values if event targets are removed.
	 * Periodically we compact them if too many null values exist.
	 */
	private _queues: {};
	private static _instance:BroadcastEventDispatchQueue;
	public static getInstance():BroadcastEventDispatchQueue
	{
		if(!BroadcastEventDispatchQueue._instance)
			BroadcastEventDispatchQueue._instance=new BroadcastEventDispatchQueue();
		return BroadcastEventDispatchQueue._instance;
	}
  
	constructor() {
	  this.reset();
	}
  
	reset() {
	  this._queues = {};
	}
  
	add(type: string, target: EventDispatcher) {
	  release || assert(Event.isBroadcastEventType(type), "Can only register broadcast events.");
	  var queue = this._queues[type] || (this._queues[type] = []);
	  if (queue.indexOf(target) >= 0) {
		return;
	  }
	  queue.push(target);
	}
  
	remove(type: string, target: EventDispatcher) {
	  release || assert (Event.isBroadcastEventType(type), "Can only unregister broadcast events.");
	  var queue = this._queues[type];
	  release || assert (queue, "There should already be a queue for this.");
	  var index = queue.indexOf(target);
	  release || assert (index >= 0, "Target should be somewhere in this queue.");
	  queue[index] = null;
	  release || assert (queue.indexOf(target) < 0, "Target shouldn't be in this queue anymore.");
	}
  
	dispatchEvent(event: Event) {
	  release || assert (event.isBroadcastEvent(), "Cannot dispatch non-broadcast events.");
	  var queue = this._queues[event._type];
	  if (!queue) {
		return;
	  }
	  /*
	  if (!release && traceEventsOption.value) {
		console.log('Broadcast event of type ' + event._type + ' to ' + queue.length +
					' listeners');
	  }*/
	  var nullCount = 0;
	  for (var i = 0; i < queue.length; i++) {
		var target = queue[i];
		if (target === null) {
		  nullCount++;
		} else {
		  target.dispatchEvent(event);
		}
	  }
	  // Compact the queue if there are too many holes in it.
	  if (nullCount > 16 && nullCount > (queue.length >> 1)) {
		var compactedQueue = [];
		for (var i = 0; i < queue.length; i++) {
		  if (queue[i]) {
			compactedQueue.push(queue[i]);
		  }
		}
		this._queues[event.type] = compactedQueue;
	  }
	}
  
	getQueueLength(type: string) {
	  return this._queues[type] ? this._queues[type].length : 0;
	}
  }