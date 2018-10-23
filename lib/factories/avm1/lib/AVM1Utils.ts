/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {isNullOrUndefined} from "../../base/utilities";

import {AVM1ActionsData, AVM1Context, IAVM1EventPropertyObserver} from "../context";
import {ASObject} from "../../AVM2Dummys";
import {
	alCoerceString, alDefineObjectProperties, alToBoolean, alToInt32, alToInteger, alToNumber,
	AVM1NativeFunction, AVM1PropertyFlags
} from "../runtime";
import {Debug, release} from "../../base/utilities/Debug";
import {AVM1MovieClip} from "./AVM1MovieClip";
import {AVM1ArrayNative} from "../natives";
import {AVM1ClipEvents} from "../../base/SWFTags";

import {DisplayObject, TextField, MovieClip } from "@awayjs/scene";

import {AVM1TextField} from "./AVM1TextField";
import {AVM1Button} from "./AVM1Button";
import {AVM1SymbolBase} from "./AVM1SymbolBase";
import {AVM1Object} from "../runtime/AVM1Object";
import { AVM1Function } from "../runtime/AVM1Function";
import { AVM1PropertyDescriptor } from "../runtime/AVM1PropertyDescriptor";
import { AVM1EventHandler } from "./AVM1EventHandler";

export var DEPTH_OFFSET = 16384;

export interface IHasAS3ObjectReference {
	adaptee: any;//80pro ASObject;
}

export interface IAVM1SymbolBase extends IHasAS3ObjectReference{
	context: AVM1Context;
	initAVM1SymbolInstance(context: AVM1Context, awayObject:DisplayObject);
	updateAllEvents();
	getDepth(): number;
}

/**
 * Checks if an object contains a reference to a native AS3 object.
 * Returns false for MovieClip instances or instances of constructors with
 * MovieClip on their prototype chain that were created in script using,
 * e.g. new MovieClip(). Those lack the part of their internal structure
 * that makes them displayable.
 */
export function hasAwayJSAdaptee(obj: any): boolean {
	return !!obj.adaptee;
}

/**
 * Returns obj's reference to a native AS3 object. If the reference
 * does not exist, returns undefined.
 */
export function getAwayJSAdaptee(obj: IHasAS3ObjectReference):any{//80pro} ASObject {
	return obj.adaptee;
}

/**
 * Returns obj's reference to a native AS3 object. If the reference
 * doesn't exist, obj was created in script, e.g. with new MovieClip(),
 * and doesn't reflect a real, displayable display object. In that case,
 * an empty null-proto object is created and returned. This is used for
 * classes that are linked to embedded symbols that extend MovieClip. Their
 * inheritance chain is built by assigning new MovieClip to their prototype.
 * When a proper, displayable, instance of such a class is created via
 * attachMovie, initial values for properties such as tabEnabled
 * can be initialized from values set on the template object.
 */
export function getAwayObjectOrTemplate<T extends DisplayObject>(obj: AVM1SymbolBase<T>): T {
	if (obj.adaptee) {
		return <T>obj.adaptee;
	}
	// The _as3ObjectTemplate is not really an ASObject type, but we will fake
	// that for AVM1SymbolBase's properties transfers.
	if (!obj._as3ObjectTemplate) {
		var template;
		var proto = obj.alPrototype;
		while (proto && !(<any>proto).initAVM1SymbolInstance) {
			template = (<any>proto)._as3ObjectTemplate;
			if (template) {
				break;
			}
			proto = proto.alPrototype;
		}
		obj._as3ObjectTemplate = Object.create(template || null);
	}
	return <T>obj._as3ObjectTemplate;
}


export var BlendModesMap = [undefined, "normal", "layer", "multiply",
	"screen", "lighten", "darken", "difference", "add", "subtract", "invert",
	"alpha", "erase", "overlay", "hardlight"];

export function avm1HasEventProperty(context: AVM1Context, target: any, propertyName: string): boolean {
	if (target.alHasProperty(propertyName) &&
		(target.alGet(propertyName) instanceof AVM1Function)) {
		return true;
    }
    if (target.alHasProperty(propertyName) &&
    (target._ownProperties[propertyName] &&  target._ownProperties[propertyName].value)) {
        return true;
}
	var listenersField = target.alGet('_listeners');
	if (!(listenersField instanceof AVM1ArrayNative)) {
		return false;
	}
	var listeners: any[] = listenersField.value;
	return listeners.some(function (listener) {
		return (listener instanceof AVM1Object) && listener.alHasProperty(propertyName);
	});
}

export function avm1BroadcastNativeEvent(context: AVM1Context, target: any, propertyName: string, args: any[] = null): void {
	var handler: AVM1Function = target.alGet(propertyName);
	if (handler instanceof AVM1Function) {
		if(propertyName.toLowerCase()=="onenterframe")	handler.isOnEnter=true;
		context.executeFunction(handler, target, args);
	}
	var _listeners = target.alGet('_listeners');
	if (_listeners instanceof AVM1ArrayNative) {
		_listeners.value.forEach(function (listener) {
			if (!(listener instanceof AVM1Object)) {
				return;
			}
			var handlerOnListener: AVM1Function = listener.alGet(propertyName);
			if (handlerOnListener instanceof AVM1Function) {
				context.executeFunction(handlerOnListener, target, args);
			}
		});
	}
}

export function avm1BroadcastEvent(context: AVM1Context, target: any, propertyName: string, args: any[] = null): void {
	var handler: AVM1Function = target.alGet(propertyName);
	if (handler instanceof AVM1Function) {
		handler.alCall(target, args);
	}
	var _listeners = target.alGet('_listeners');
	if (_listeners instanceof AVM1ArrayNative) {
		_listeners.value.forEach(function (listener) {
			if (!(listener instanceof AVM1Object)) {
				return;
			}
			var handlerOnListener: AVM1Function = listener.alGet(propertyName);
			if (handlerOnListener instanceof AVM1Function) {
				handlerOnListener.alCall(target, args);
			}
		});
	}
}
var myCount=0;

function createAVM1NativeObject(ctor, nativeObject:DisplayObject, context: AVM1Context) {
	// We need to walk on __proto__ to find right ctor.prototype.
	var template;
	var proto = ctor.alGetPrototypeProperty();
	while (proto && !(<any>proto).initAVM1SymbolInstance) {
		if ((<any>proto)._as3ObjectTemplate && !template) {
			template = (<any>proto)._as3ObjectTemplate;
		}
		proto = proto.alPrototype;
	}
	release || Debug.assert(proto);


	var avm1Object = Object.create(proto);
	(<any>proto).initAVM1SymbolInstance.call(avm1Object, context, nativeObject);
	avm1Object.alPrototype = ctor.alGetPrototypeProperty();
	avm1Object.alSetOwnConstructorProperty(ctor);
	(<any>nativeObject)._as2Object = avm1Object;
	ctor.alCall(avm1Object);


	(<any>avm1Object).aCount=myCount++;
	//	80pro: creating a new _ownProperties
	//  makes sure that newly added properties are added to instance, not to prototype
	//avm1Object._ownProperties={};
	//avm1Object._ownProperties = Object.create(null);

	if (template) {
		// transfer properties from the template
		for (var prop in template) {
			nativeObject[prop] = template[prop];
		}
	}
	return avm1Object;
}

export function getAVM1Object(awayObject:DisplayObject, context: AVM1Context): AVM1Object {
	if (!awayObject) {
		return null;
	}

	if ((<any>awayObject)._as2Object) {
		return (<any>awayObject)._as2Object;
	}
	var avmObject;

	if(awayObject.isAsset(MovieClip)){
		if((<MovieClip>awayObject).timeline.isButton){
			avmObject=<AVM1Object>createAVM1NativeObject(context.globals.Button, awayObject, context);
		}
		else{     
            avmObject=<AVM1Object>createAVM1NativeObject(context.globals.MovieClip, awayObject, context);
		}
	}
	else if(awayObject.isAsset(TextField)){
		avmObject=<AVM1Object>createAVM1NativeObject(context.globals.TextField, awayObject, context);
	}
	if(avmObject){
		(<any>awayObject)._as2Object=avmObject;
		awayObject.adapter=avmObject;
		avmObject.adaptee=awayObject;
	}
	(<any>awayObject)._as2Object=avmObject;
	return avmObject;

}

export function wrapAVM1NativeMembers(context: AVM1Context, wrap: AVM1Object, obj: any, members: string[], prefixFunctions: boolean = false): void  {
	function wrapFunction(fn) {
		if (isNullOrUndefined(fn)) {
			return undefined;
		}
		release || Debug.assert(typeof fn === 'function');
		if (!prefixFunctions) {
			return new AVM1NativeFunction(context, fn);
		}
		return new AVM1NativeFunction(context, function () {
			var args = Array.prototype.slice.call(arguments, 0);
			args.unshift(context);
			return fn.apply(this, args);
		});
	}
	function getMemberDescriptor(memberName): PropertyDescriptor {
		var desc;
		for (var p = obj; p; p = Object.getPrototypeOf(p)) {
			desc = Object.getOwnPropertyDescriptor(p, memberName);
			if (desc) {
				return desc;
			}
		}
		return null;
	}

	if (!members) {
		return;
	}
	members.forEach(function (memberName) {
		if (memberName[memberName.length - 1] === '#') {
			// Property mapping
			var getterName = 'get' + memberName[0].toUpperCase() + memberName.slice(1, -1);
			var getter = obj[getterName];
			var setterName = 'set' + memberName[0].toUpperCase() + memberName.slice(1, -1);
			var setter = obj[setterName];
			release || Debug.assert(getter || setter, 'define getter or setter')
			var desc = new AVM1PropertyDescriptor(AVM1PropertyFlags.ACCESSOR |
				AVM1PropertyFlags.DONT_DELETE |
				AVM1PropertyFlags.DONT_ENUM,
				null, wrapFunction(getter), wrapFunction(setter));
			wrap.alSetOwnProperty(memberName.slice(0, -1), desc);
			return;
		}

		var nativeDesc = getMemberDescriptor(memberName);
		if (!nativeDesc) {
			return;
		}
		if (nativeDesc.get || nativeDesc.set) {
			release || Debug.assert(false, 'Redefine ' + memberName + ' property getter/setter as functions');
			return;
		}

		var value = nativeDesc.value;
		if (typeof value === 'function') {
			value = wrapFunction(value);
		}
		var desc = new AVM1PropertyDescriptor(AVM1PropertyFlags.DATA |
			AVM1PropertyFlags.DONT_DELETE |
			AVM1PropertyFlags.DONT_ENUM,
			value);
		wrap.alSetOwnProperty(memberName, desc);
	});
}

export function wrapAVM1NativeClass(context: AVM1Context, wrapAsFunction: boolean, cls: typeof AVM1Object, staticMembers: string[], members: string[], call?: Function, cstr?: Function): AVM1Object  {
	var wrappedFn = wrapAsFunction ?
		new AVM1NativeFunction(context, call || function () { }, function () {
			// Creating simple AVM1 object
			var obj = new cls(context);
			obj.alPrototype = wrappedPrototype;
			obj.alSetOwnConstructorProperty(wrappedFn);
			if (cstr) {
				cstr.apply(obj, arguments);
			}
			return obj;
		}) :
		new AVM1Object(context);
	wrapAVM1NativeMembers(context, wrappedFn, cls, staticMembers, true);
	var wrappedPrototype = new cls(context);
	wrappedPrototype.alPrototype = context.builtins.Object.alGetPrototypeProperty();
	wrapAVM1NativeMembers(context, wrappedPrototype, cls.prototype, members, false);
	alDefineObjectProperties(wrappedFn, {
		prototype: {
			value: wrappedPrototype
		}
	});
	alDefineObjectProperties(wrappedPrototype, {
		constructor: {
			value: wrappedFn,
			writable: true
		}
	});
	return wrappedFn;
}

export function initializeAVM1Object(awayObject: any,
									 context: AVM1Context,
									 placeObjectTag: any) {
	var instanceAVM1 = <AVM1SymbolBase<DisplayObject>>getAVM1Object(awayObject, context);
	release || Debug.assert(instanceAVM1);

	if (placeObjectTag.variableName) {
		instanceAVM1.alPut('variable', placeObjectTag.variableName);
	}

	var events = placeObjectTag.events;
	if (!events) {
		return;
	}
	var stageListeners = [];
	var awayAVMStage = (<any>context.globals.Stage)._awayAVMStage;
	for (var j = 0; j < events.length; j++) {
		var swfEvent = events[j];
		var actionsData;
		if (swfEvent.actionsBlock) {
			actionsData = context.actionsDataFactory.createActionsData(swfEvent.actionsBlock,'s' + placeObjectTag.symbolId + 'd' + placeObjectTag.depth + 'e' + j);
			swfEvent.actionsBlock = null;
			swfEvent.compiled = actionsData;
		} else {
			actionsData = swfEvent.compiled;
		}
		release || Debug.assert(actionsData);
		var handler = clipEventHandler.bind(null, actionsData, instanceAVM1);
		var flags = swfEvent.flags;
		for (var key in ClipEventMappings) {
			var eventFlag=parseInt(key);
			eventFlag |= 0;
			if (!(flags & (eventFlag | 0))) {
				continue;
			}
			var eventMapping = ClipEventMappings[eventFlag];
			var eventName = eventMapping.name;
			if (!eventName) {
				Debug.warning("ClipEvent: " + eventFlag + ' not implemented');
				continue;
			}

			// AVM1 MovieClips are set to button mode if one of the button-related event listeners is
			// set. This behaviour is triggered regardless of the actual value they are set to.
			if (eventMapping.isButtonEvent) {
				awayObject.buttonMode = true;
			}

			//console.log("initializeAVM1Object eventName", eventName);
			// Some AVM1 MovieClip events (e.g. mouse and key events) are bound to
			// the stage rather then object itself -- binding listeners there.
			
			/*if (eventMapping.isStageEvent) {
				//console.log("event name:", eventName);
				//console.log("initializeAVM1Object stage eventName", eventName);
				if(eventName=="keyUp"){
					stageListeners.push({eventName: eventName, handler: handler});
					window.addEventListener("keyup", handler);
				}
				else{
					stageListeners.push({eventName: eventName, handler: handler});
					awayAVMStage.addAVM1EventListener(eventName, handler);
				}
			} else {*/
			//console.log("initializeAVM1Object eventName", eventName);
			if(eventName=="construct" || eventName=="initialize"){
				handler();
			}
			else if(eventName=="load"){
				awayObject.onLoadedAction=handler;
			}
			else{
                var propName=eventName;
                if(eventName=="onEnterFrame")
                    eventName="enterFrame"
                instanceAVM1.alPut(propName.toLowerCase(), handler);
				instanceAVM1._addEventListener(new AVM1EventHandler(propName, eventName, null, eventMapping.isStageEvent), handler);
			}
			//}
		}
	}
	if (stageListeners.length > 0) {
		awayObject.addEventListener('removedFromStage', function () {
			for (var i = 0; i < stageListeners.length; i++) {
				awayAVMStage.removeEventListener(stageListeners[i].eventName, stageListeners[i].fn, false);
			}
		}, false);
	}
}
export function toTwipFloor(value: number): number {
	// in theory this should do:
	//return Math.round(value*20)/20;
	// because AwayJS does not use big.js internally, floats might have this nasty rounding error
	// we need to floor twips, and add a additional twip in case it had the floating error
	var twip:number=Math.floor(value*20)/20;
	if(value>twip && (value-twip)>0.04995){
		twip+=0.05;
	}
	return twip;

}
export function toTwipRound(value: number): number {
	return Math.round(value*20)/20;

}
export function avm2AwayDepth(value: number): number {
	return value+1;
}
export function away2avmDepth(value: number): number {
	return value-1;
}
function clipEventHandler(actionsData: AVM1ActionsData,
						  receiver: IAVM1SymbolBase) {
	return receiver.context.executeActions(actionsData, receiver);
}

var ClipEventMappings: Map<number, {name: string; isStageEvent: boolean; isButtonEvent: boolean}>;
ClipEventMappings = Object.create(null);
ClipEventMappings[AVM1ClipEvents.Load] = {name: 'load', isStageEvent: false, isButtonEvent: false};
// AVM1's enterFrame happens at the same point in the cycle as AVM2's frameConstructed.
ClipEventMappings[AVM1ClipEvents.EnterFrame] = {name: 'onEnterFrame', isStageEvent: false, isButtonEvent: false};
ClipEventMappings[AVM1ClipEvents.Unload] = {name: 'unload', isStageEvent: false, isButtonEvent: false};
ClipEventMappings[AVM1ClipEvents.MouseMove] = {name: 'mouseMove3d', isStageEvent: true/*true*/, isButtonEvent: false};
ClipEventMappings[AVM1ClipEvents.MouseDown] = {name: 'mouseDown3d', isStageEvent:  true/*true*/, isButtonEvent: false};
ClipEventMappings[AVM1ClipEvents.MouseUp] = {name: 'mouseUp3d', isStageEvent:  true/*true*/, isButtonEvent: false};
ClipEventMappings[AVM1ClipEvents.KeyDown] = {name: 'keydown', isStageEvent: true, isButtonEvent: false};
ClipEventMappings[AVM1ClipEvents.KeyUp] = {name: 'keyup', isStageEvent: true, isButtonEvent: false};
ClipEventMappings[AVM1ClipEvents.Data] = {name: null, isStageEvent: false, isButtonEvent: false};
ClipEventMappings[AVM1ClipEvents.Initialize] = {name: 'initialize', isStageEvent: false, isButtonEvent: false};
ClipEventMappings[AVM1ClipEvents.Press] = {name: 'mouseDown3d', isStageEvent:  false/*true*/, isButtonEvent: true};
ClipEventMappings[AVM1ClipEvents.Release] = {name: 'mouseUp3d', isStageEvent: false, isButtonEvent: true};
ClipEventMappings[AVM1ClipEvents.ReleaseOutside] = {name: 'mouseUpOutside3d', isStageEvent: false, isButtonEvent: false};
ClipEventMappings[AVM1ClipEvents.RollOver] = {name: 'mouseOver3d', isStageEvent:  false/*true*/, isButtonEvent: true};
ClipEventMappings[AVM1ClipEvents.RollOut] = {name: 'mouseOut3d', isStageEvent:  false/*true*/, isButtonEvent: true};
ClipEventMappings[AVM1ClipEvents.DragOver] = {name: null, isStageEvent: false, isButtonEvent: false};
ClipEventMappings[AVM1ClipEvents.DragOut] =  {name: null, isStageEvent: false, isButtonEvent: false};
ClipEventMappings[AVM1ClipEvents.KeyPress] =  {name: null, isStageEvent: true, isButtonEvent: false};
ClipEventMappings[AVM1ClipEvents.Construct] =  {name: 'construct', isStageEvent: false, isButtonEvent: false};


