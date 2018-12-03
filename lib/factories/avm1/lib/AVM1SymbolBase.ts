
import {
	alCoerceString, alToBoolean, alToInteger, alToNumber,
	AVM1PropertyFlags
} from "../runtime";
import {
	avm1BroadcastNativeEvent, avm1HasEventProperty, DEPTH_OFFSET, getAVM1Object,
	IAVM1SymbolBase, toTwipFloor, toTwipRound, away2avmDepth
} from "./AVM1Utils";
import {AVM1Context, IAVM1EventPropertyObserver} from "../context";
import {isNullOrUndefined, MapObject} from "../../base/utilities";
import {notImplemented, somewhatImplemented, warning, release, assert} from "../../base/utilities/Debug";
import {DisplayObjectContainer} from "@awayjs/scene";
import {AVM1MovieClip} from "./AVM1MovieClip";
import {AVM1Rectangle, toAS3Rectangle} from "./AVM1Rectangle";
import {AVM1Transform} from "./AVM1Transform";
import {Point, Box} from "@awayjs/core";
import {AVM1Object} from "../runtime/AVM1Object";
import { AVM1Function } from "../runtime/AVM1Function";
import { AVM1PropertyDescriptor } from "../runtime/AVM1PropertyDescriptor";
import { AVM1EventHandler } from "./AVM1EventHandler";
import { AVM1Color } from './AVM1Color';
import { PickGroup } from '@awayjs/renderer';
import { AVM1Stage } from './AVM1Stage';

export class AVM1SymbolBase<T extends DisplayObjectContainer> extends AVM1Object implements IAVM1SymbolBase, IAVM1EventPropertyObserver {
	adaptee: T;
	_as3ObjectTemplate: any;

	public hasSwappedDepth:boolean=false;
	public dynamicallyCreated:boolean=false;
	public initAVM1SymbolInstance(context: AVM1Context, awayObject: T) {
		//AVM1Object.call(this, context);
        this.avmType="symbol";
        this.scriptRefsToChilds={};
        this._mouseListenerCount=0;
		this._avm1Context = context;
		this._ownProperties = Object.create(null);
		this._prototype = null;

		var self = this;
		// Using IAVM1Callable here to avoid circular calls between AVM1Object and
		// AVM1Function during constructions.
		// TODO do we need to support __proto__ for all SWF versions?

        this._onClipEventsListeners = [];
        
		var getter = { alCall: function (thisArg: any, args?: any[]): any { return self.alPrototype; }};
		var setter = { alCall: function (thisArg: any, args?: any[]): any { self.alPrototype = args[0]; }};
		var desc = new AVM1PropertyDescriptor(AVM1PropertyFlags.ACCESSOR |
			AVM1PropertyFlags.DONT_DELETE |
			AVM1PropertyFlags.DONT_ENUM,
			null,
			getter,
			setter);
		this.alSetOwnProperty('__proto__', desc);


		release || assert(awayObject);
		this.adaptee = awayObject;
		var name = awayObject.name;
		var parent = this.get_parent();
		if (name && parent) {
			parent._addChildName(this, name);
		}
	}


	// event handling:
    
	protected _mouseListenerCount:number;
	private _eventsMap: MapObject<AVM1EventHandler>;
	private _events: AVM1EventHandler[];
	protected _eventsListeners: MapObject<Function>;
	protected _onClipEventsListeners: any[];
	protected _eventHandlers: MapObject<AVM1EventHandler>;
	protected enabled:boolean=true;
	
	private avmColor:AVM1Color;

	public bindEvents(events: AVM1EventHandler[], autoUnbind: boolean = true) {
		this._events = events;
		var eventsMap = Object.create(null);
		this._eventsMap = eventsMap;
		this._eventsListeners = Object.create(null);
		this._eventHandlers= Object.create(null);
		var observer = this;
		var context: AVM1Context = (<any>this).context;
		events.forEach(function (event: AVM1EventHandler) {
			// Normalization will always stay valid in a player instance, so we can safely modify
			// the event itself, here.
			var propertyName = event.propertyName = context.normalizeName(event.propertyName);
			eventsMap[propertyName] = event;
			//context.registerEventPropertyObserver(propertyName, observer);
			observer._updateEvent(event);
		});

	}

	public unbindEvents() {
		var events = this._events;
		var observer = this;
		var context = this.context;
		events.forEach(function (event: AVM1EventHandler) {
			context.unregisterEventPropertyObserver(event.propertyName, observer);
			observer._removeEventListener(event);
		});
		this._events = null;
		this._eventsMap = null;
		this._eventsListeners = null;
		this._eventHandlers = null;
	}
	public updateEventByPropName(eventName) {
        if(!this._eventsMap){
            console.log("no eventsmap set", this)
        }
        else if(this._eventsMap[eventName]){
            this._updateEvent(this._eventsMap[eventName]);
        }
    }

	public updateAllEvents() {
		this._events.forEach(function (event: AVM1EventHandler) {
			this._updateEvent(event);
		}, this)
	}

	private _updateEvent(event: AVM1EventHandler) {
		if (avm1HasEventProperty(this.context, this, event.propertyName)) {
			this._addEventListener(event);
		} else {
			this._removeEventListener(event);
		}
	}
    
	public _addOnClipEventListener(event: AVM1EventHandler, callback:()=>void=null) {
        event.propertyName = this.context.normalizeName(event.propertyName);
        this._onClipEventsListeners.push({event:event, callback:callback});
		if(this.enabled || !event.allowDisable)
            this.addEventListenerOnAdapter(event, callback);
    }

	public _addEventListener(event: AVM1EventHandler, callback:Function=null) {
		var propertyName = this.context.normalizeName(event.propertyName);
        var listener: any = this._eventsListeners[propertyName];
        var myThis=this;
		if (!listener) {
			if(!callback){
				listener = function avm1EventHandler() {
                    var args=null;
                    if(propertyName.toLowerCase()=="onchanged"){
                        args=[myThis];
                    }
					//var args = event.argsConverter ? event.argsConverter.apply(null, arguments) : null;
					avm1BroadcastNativeEvent(this.context, this, propertyName, args);//args);
				}.bind(this);
			}
			else{
				listener=callback;
			}
			this._eventsListeners[propertyName] = listener;
			this._eventHandlers[propertyName] = event;
		}
		if(this.enabled || !event.allowDisable){
			this.addEventListenerOnAdapter(event, listener);
		}
    }
    public addEventListenerOnAdapter(event:AVM1EventHandler, callback:()=>void){
        if(event.stageEvent){
            var awayAVMStage = (<any>this.context.globals.Stage)._awayAVMStage;
            awayAVMStage.addAVM1EventListener(this.adaptee, event.eventName, callback);
        }
        else{
            this.adaptee.addEventListener(event.eventName, callback);
            this._updateMouseEnabled(event, true);
        }
    }
    public removeEventListenerOnAdapter(event:AVM1EventHandler, callback:()=>void){
        if(event.stageEvent){
            var awayAVMStage = (<any>this.context.globals.Stage)._awayAVMStage;
            awayAVMStage.removeAVM1EventListener(this.adaptee, event.eventName, callback);
        }
        else{
            this.adaptee.removeEventListener(event.eventName, callback);
            this._updateMouseEnabled(event, false);
        }
    }

	public _updateMouseEnabled(event:AVM1EventHandler, enabled:boolean):void
	{
		if (this.adaptee.name != "scene") {
            if(event.isMouse){
                if (enabled) {
                    this._mouseListenerCount++;
                    this.adaptee.mouseEnabled = true;
                    this.adaptee.mouseChildren = false;
                } else {
                    this._mouseListenerCount--;
                    if (this._mouseListenerCount <= 0){
                        this._mouseListenerCount=0;
                        this.adaptee.mouseEnabled = false;
                        this.adaptee.mouseChildren = true;
                    }
                }		
            }			
		}	
	}

	public freeFromScript():void{
        super.freeFromScript();
        this.enabled=true;
        this.adaptee.mouseEnabled = false;
        this.adaptee.mouseChildren = true;
        for (var key in this._eventsListeners) {
            this.removeEventListenerOnAdapter(this._eventHandlers[key], <any>this._eventsListeners[key]);
        }   
        this._eventsListeners={}; 
        var cnt= this._onClipEventsListeners.length;
        while(cnt>0){
            cnt--;
            this.removeEventListenerOnAdapter(this._onClipEventsListeners[cnt].event, this._onClipEventsListeners[cnt].callback);            
        }   

        this._onClipEventsListeners=[];
        this._mouseListenerCount=0;
        
    }
    
	private _removeEventListener(event: AVM1EventHandler) {
		var propertyName = this.context.normalizeName(event.propertyName);
		var listener: any = this._eventsListeners[propertyName];
		if (listener) {
            this.removeEventListenerOnAdapter(event, listener);
			delete this._eventsListeners[propertyName];
		}
	}

	public onEventPropertyModified(propertyName: string) {
		var propertyName = this.context.normalizeName(propertyName);
		var event = this._eventsMap[propertyName];
		this._updateEvent(event);
	}

    
	public getEnabled() {
		return this.enabled;
	}

	public setEnabled(value) {
		if (value == this.enabled)
			return;
        this.enabled = value;
		this.setEnabledListener(value);
	}
	public setEnabledListener(value:any) {
		if (value!==false && value!==0) {
			for (var key in this._eventsListeners) {
				if(this._eventHandlers[key].allowDisable){
                    this.addEventListenerOnAdapter(this._eventHandlers[key], <any>this._eventsListeners[key]);
				}
			}
			for (var key in this._onClipEventsListeners) {
				if(this._onClipEventsListeners[key].event.allowDisable){
                    this.addEventListenerOnAdapter(this._onClipEventsListeners[key].event, <any>this._onClipEventsListeners[key].callback);
				}
			}
		}
		else {
			for (var key in this._eventsListeners) {
				if(this._eventHandlers[key].allowDisable){
                    this.removeEventListenerOnAdapter(this._eventHandlers[key], <any>this._eventsListeners[key]);
				}
			}
			for (var key in this._onClipEventsListeners) {
				if(this._onClipEventsListeners[key].event.allowDisable){
                    this.removeEventListenerOnAdapter(this._onClipEventsListeners[key].event, <any>this._onClipEventsListeners[key].callback);
				}
			}
		}

    }
    
	public get_alpha(): number {
		return this.adaptee.alpha * 100;
	}

	public set_alpha(value: number) {
		this._ctBlockedByScript=true;
		value = alToNumber(this.context, value);
		if (isNaN(value)) {
			return;
		}
		this.adaptee.alpha = value / 100;
	}

	public getBlendMode(): string {
		notImplemented("AVM1SymbolBase.getBlendMode");
		return "";//this.adaptee.blendMode;
	}

	public setBlendMode(value: string) {
		notImplemented("AVM1SymbolBase.setBlendMode");
		/*value = typeof value === 'number' ? BlendModesMap[value] : alCoerceString(this.context, value);
		this.adaptee.blendMode = value || null;*/
	}

	public getCacheAsBitmap(): boolean {
		return this.adaptee.cacheAsBitmap;
	}

	public setCacheAsBitmap(value: boolean) {
		value = alToBoolean(this.context, value);
		this.adaptee.cacheAsBitmap = value;
	}

	public getFilters(): AVM1Object {
		notImplemented("AVM1SymbolBase.getFilters");
		return null;//80pro convertFromAS3Filters(this.context, this.adaptee.filters);
	}

	public setFilters(value) {
		notImplemented("AVM1SymbolBase.setFilters");
		//80pro this.adaptee.filters = convertToAS3Filters(this.context, value);
	}

	public get_focusrect(): boolean {
		notImplemented("AVM1SymbolBase.setOpaqueBackground");
		return false;//this.adaptee.focusRect || false; // suppressing null
	}

	public set_focusrect(value: boolean) {
		notImplemented("AVM1SymbolBase.setOpaqueBackground");
		/*
		value = alToBoolean(this.context, value);
		this.adaptee.focusRect = value;
		*/
	}

	public get_height()
	{
		var box:Box = PickGroup.getInstance((<AVM1Stage>this.context.globals.Stage)._awayAVMStage.view.renderer.viewport).getBoundsPicker(this.adaptee.partition).getBoxBounds(this.adaptee);
		return (box == null)? 0 : toTwipFloor(box.height);
	}

	public set_height(value: number)
	{
		value = toTwipFloor(alToNumber(this.context, value));

		this._blockedByScript = true;
		
		if (isNaN(value))
			return;
		
		PickGroup.getInstance((<AVM1Stage>this.context.globals.Stage)._awayAVMStage.view.renderer.viewport).getBoundsPicker(this.adaptee.partition).height = value;
	}

	public get_highquality(): number {
		switch (this.get_quality()) {
			case 'BEST':
				return 2;
			case 'HIGH':
				return 1;
			default: // case 'LOW':
				return 0;
		}
	}

	public set_highquality(value: number) {
		var quality: string;
		switch (alToInteger(this.context, value)) {
			case 2:
				quality = 'BEST';
				break;
			case 1:
				quality = 'HIGH';
				break;
			default:
				quality = 'LOW';
				break;
		}
		this.set_quality(quality);
	}

	public getMenu() {
		notImplemented('AVM1SymbolBase.getMenu');
		// return this.adaptee.contextMenu;
	}

	public setMenu(value) {
		notImplemented('AVM1SymbolBase.setMenu');
		// this.adaptee.contextMenu = value;
	}

	public get_name(): string {
		return this.adaptee ? this.adaptee.name : undefined;
	}

	public set_name(value: string) {
		value = alCoerceString(this.context, value);
		var oldName = this.adaptee.name;
		this.adaptee.name = value;

		var avmParent = this.get_parent();
		if(avmParent){
			avmParent.registerScriptObject(<any>this.adaptee);
			avmParent._updateChildName(<AVM1MovieClip><any>this, oldName, value);
		}
	}

	public get_parent(): AVM1MovieClip {
		var parent = getAVM1Object(this.adaptee.parent, this.context);
		// In AVM1, the _parent property is `undefined`, not `null` if the element has no parent.
		return <AVM1MovieClip>parent || undefined;
	}

	public set_parent(value: AVM1MovieClip) {
		notImplemented('AVM1SymbolBase.set_parent');
	}

	public getOpaqueBackground(): number {
		notImplemented("AVM1SymbolBase.getOpaqueBackground");
		return 0;//this.adaptee.opaqueBackground;
	}

	public setOpaqueBackground(value: number) {
		notImplemented("AVM1SymbolBase.setOpaqueBackground");
		/*
		if (isNullOrUndefined(value)) {
			this.adaptee.opaqueBackground = null;
		} else {
			this.adaptee.opaqueBackground = alToInt32(this.context, value);
		}
		*/
	}

	public get_quality(): string {
		somewhatImplemented('AVM1SymbolBase.get_quality');
		return 'HIGH';
	}

	public set_quality(value) {
		somewhatImplemented('AVM1SymbolBase.set_quality');
	}
	public set_root(value) {
		notImplemented('AVM1SymbolBase.set_root');
	}
	public get_root(): AVM1MovieClip {
		var awayObject: DisplayObjectContainer = this.adaptee;
		while (awayObject && awayObject.name!="scene") {
			var avmObject = <AVM1MovieClip>getAVM1Object(awayObject, this.context);
			if (avmObject && avmObject.get_lockroot()) {
				return avmObject;
			}
			awayObject = awayObject.parent;
		}
		if (!awayObject) {
			return undefined;
		}
		return <AVM1MovieClip>getAVM1Object(awayObject, this.context);
	}

	public get_rotation(): number {
		var value= this.adaptee.rotationZ;
		while(value>180){
			value-=360;
		}
		while(value<-180){
			value+=360;
		}
		return value;
	}

	public set_rotation(value: number) {
		value = alToNumber(this.context, value);
		this._blockedByScript=true;
		if (isNaN(value)) {
			return;
		}
		this.adaptee.rotationZ = value;
	}

	public getScale9Grid(): AVM1Rectangle {
		return AVM1Rectangle.fromAS3Rectangle(this.context, this.adaptee.scale9Grid);
	}

	public setScale9Grid(value: AVM1Rectangle) {
		this.adaptee.scale9Grid = isNullOrUndefined(value) ? null : toAS3Rectangle(value);
	}

	public getScrollRect(): AVM1Rectangle {
		return AVM1Rectangle.fromAS3Rectangle(this.context, this.adaptee.scrollRect);
	}

	public setScrollRect(value: AVM1Rectangle) {
		this.adaptee.scrollRect = isNullOrUndefined(value) ? null : toAS3Rectangle(value);
	}

	public get_soundbuftime(): number {
		notImplemented('AVM1SymbolBase.get_soundbuftime');
		return 0;
	}

	public set_soundbuftime(value: number) {
		notImplemented('AVM1SymbolBase.set_soundbuftime');
	}

	public getTabEnabled(): boolean {
		return this.adaptee?this.adaptee.tabEnabled:false;
	}

	public setTabEnabled(value: boolean) {
		if(!this.adaptee)
			return;
		this.adaptee.tabEnabled = value;
	}

	public getTabIndex(): number {
		return this.adaptee.tabIndex;
	}

	public setTabIndex(value: number) {
		this.adaptee.tabIndex = value;
	}

	public get_target(): string {
		var awayObject:DisplayObjectContainer = this.adaptee;
		if (awayObject === awayObject.root) {
			return '/';
		}
		var path = '';
		do {
			if (isNullOrUndefined(awayObject)) {
				warning("AVM1SymbolBase.get_target returns undefined");
				return undefined; // something went wrong
			}
			path = '/' + awayObject.name + path;
			awayObject = awayObject.parent;
		} while (awayObject && awayObject.name !== "scene");
		return path;
	}

	public removeMovieClip() {
		if (this.adaptee.name=="scene") {
			return; // let's not remove root symbol
		}
		if(this.adaptee.parent){
            // todo: checking for positive depth is enough ?
			if((this.dynamicallyCreated || this.hasSwappedDepth) && away2avmDepth(this.adaptee._depthID)>=0){
			    this.adaptee.parent.removeChild(this.adaptee);
				var avmParent = this.get_parent();
				if(avmParent){
					avmParent._removeChildName(this, this.adaptee.name);
					avmParent.adaptee.removeChild(this.adaptee);
				}
		    }
		}
    }
	/*
	// transform is only available in FP8, and cause problems in FP6
	public getTransform(): AVM1Object {
		somewhatImplemented("AVM1SymbolBase.setTransform");
		var transformCtor = <AVM1Function>this.context.globals.Transform;
		return transformCtor.alConstruct([this]);
	}

	public setTransform(value: AVM1Transform) {
		if (!(value instanceof AVM1Transform)) {
			return;
		}
		var as3Transform = value.as3Transform;
		notImplemented("AVM1SymbolBase.setTransform");
		//this.adaptee.transform = as3Transform;
	}*/

	public get_visible(): boolean {
		return this.adaptee.visible;
	}

	public set_visible(value: boolean) {
		this._visibilityByScript=true;
		value = alToBoolean(this.context, value);
		this.adaptee.visible = value;
	}

	public get_url(): string {
		return this.adaptee.assetNamespace;
	}

	public get_width(): number
	{
		var box:Box = PickGroup.getInstance((<AVM1Stage>this.context.globals.Stage)._awayAVMStage.view.renderer.viewport).getBoundsPicker(this.adaptee.partition).getBoxBounds(this.adaptee);
		
		return (box == null)? 0 : toTwipRound(box.width);
	}

	public set_width(value: number)
	{
		value =  toTwipRound(alToNumber(this.context, value));

		this._blockedByScript = true;

		if (isNaN(value))
			return;
		
			PickGroup.getInstance((<AVM1Stage>this.context.globals.Stage)._awayAVMStage.view.renderer.viewport).getBoundsPicker(this.adaptee.partition).width = value;
	}

	public get_x(): number {
		return toTwipFloor(this.adaptee.x);
	}

	public set_x(value: number) {
		value = toTwipFloor(alToNumber(this.context, value));
		this._blockedByScript=true;
		if (isNaN(value)) {
			return;
		}
		this.adaptee.x = value;
	}

	public get_xmouse(): number {		
		return toTwipFloor(this.adaptee.globalToLocal(new Point((<any>this.context.globals.Stage)._awayAVMStage.mouseX, 0)).x);
	}

	public get_xscale(): number {
		return this.adaptee.scaleX * 100;
	}

	public set_xscale(value: number) {
		value = alToNumber(this.context, value);
		this._blockedByScript=true;
		if (isNaN(value)) {
			return;
		}
		this.adaptee.scaleX = value / 100;
	}

	public get_y(): number {
		return toTwipFloor(this.adaptee.y);
	}

	public set_y(value: number) {
		value = toTwipFloor(alToNumber(this.context, value));
		this._blockedByScript=true;
		if (isNaN(value)) {
			return;
		}
		this.adaptee.y = value;
	}

	public get_ymouse(): number {
		return toTwipFloor(this.adaptee.globalToLocal(new Point(0, (<any>this.context.globals.Stage)._awayAVMStage.mouseY)).y);
	}

	public get_yscale(): number {
		return this.adaptee.scaleY * 100;
	}

	public set_yscale(value: number) {
		value = alToNumber(this.context, value);
		this._blockedByScript=true;
		if (isNaN(value)) {
			return;
		}
		this.adaptee.scaleY = value / 100;
	}

	public getDepth() {
		if (this.protoTypeChanged)
			return null;
		return away2avmDepth(this.adaptee._depthID);
	}
	public toString() {
		var mc:DisplayObjectContainer=this.adaptee;
		var names:string[]=[];
		while (mc){
			if(mc.name=="scene"){
				names.push("_level0");
				mc=null;
			}
			else{
				names.push(mc.name);
				mc=mc.parent;
			}
		}
		var i:number=names.length;
		var mc_path:string="";
		while(i>0){
			i--;
			mc_path+=names[i];
			if(i>0)
				mc_path+=".";
		}
		//console.log(mc_path);
		return mc_path;
	}
}
