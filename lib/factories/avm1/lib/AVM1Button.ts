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

import {AVM1SymbolBase} from "./AVM1SymbolBase"
import {getAwayObjectOrTemplate, getAVM1Object,
	wrapAVM1NativeClass, initializeAVM1Object
} from "./AVM1Utils";
import {AVM1Context} from "../context";
import {alToBoolean} from "../runtime";
import {EventDispatcher} from "@awayjs/core";
import {DisplayObject, MovieClip} from "@awayjs/scene";
import {AVM1ButtonAction} from "../../link";
import {LoaderInfo} from "../../customAway/LoaderInfo";
import {AVM1Object} from "../runtime/AVM1Object";
import { AVM1EventHandler, AVM1MovieClipButtonModeEvent } from "./AVM1EventHandler";
import {notImplemented, somewhatImplemented, warning, release, assert} from "../../base/utilities/Debug";


enum StateTransitions {
	IdleToOverUp =      0x001, // roll over
	OverUpToIdle =      0x002, // roll out
	OverUpToOverDown =  0x004, // press
	OverDownToOverUp =  0x008, // release
	OverDownToOutDown = 0x010, // drag out
	OutDownToOverDown = 0x020, // drag over
	OutDownToIdle =     0x040, // release outside
	IdleToOverDown =    0x080, // ???
	OverDownToIdle =    0x100  // ???
}
/**
 * Key codes below 32 aren't interpreted as char codes, but are mapped to specific buttons instead.
 * This array uses the key code as the index and KeyboardEvent.keyCode values matching the
 * specific keys as the value.
 * @type {number[]}
 */
var AVM1KeyCodeMap = [-1, 37, 39, 36, 35, 45, 46, -1, 8, -1, -1, -1, -1, 13, 38, 40, 33, 34, 9, 27];

export interface IFrameScript {
	(any?): any;
	precedence?: number[];
	context?: MovieClip;
}
export class AVM1Button extends AVM1SymbolBase<MovieClip> {
	private _requiredListeners: any;
	private _actions: AVM1ButtonAction[];

	static createAVM1Class(context: AVM1Context) : AVM1Object {
		return wrapAVM1NativeClass(context, true, AVM1Button,
			[],
			[ '_alpha#', 'blendMode#', 'cacheAsBitmap#', 'enabled#', 'filters#', '_focusrect#',
				'getDepth', '_height#', '_highquality#', 'menu#', '_name#', '_parent#', '_quality#', 'removeMovieClip',
				'_rotation#', 'scale9Grid#', '_soundbuftime#', 'stop', 'tabEnabled#', 'tabIndex#', '_target#',
				'trackAsMenu#', '_url#', 'useHandCursor#', '_visible#', '_width#','toString', 
				'_x#', '_xmouse#', '_xscale#', '_y#', '_ymouse#', '_yscale#']);
	}

	public initAVM1SymbolInstance(context: AVM1Context, awayObject: MovieClip) {
		super.initAVM1SymbolInstance(context, awayObject);

		var nativeButton = this.adaptee;
		//this._initEventsHandlers();
		/*if (!nativeButton.timeline.avm1ButtonActions) {
			return;
		}*/
		nativeButton.buttonMode = true;
		nativeButton.addEventListener('addedToStage', this._addListeners.bind(this));
		nativeButton.addEventListener('removedFromStage', this._removeListeners.bind(this));
		var requiredListeners = this._requiredListeners = Object.create(null);
		var actions = this._actions = nativeButton.timeline.avm1ButtonActions;
		for (var i = 0; i < actions.length; i++) {
			var action = actions[i];
			if (!action.actionsBlock) {
				action.actionsBlock = context.actionsDataFactory.createActionsData(action.actionsData, 's' + nativeButton.id + 'e' + i);
			}
			if (action.keyCode) {
				//requiredListeners['keyDown'] = this._keyDownHandler.bind(this);
				//continue;
			}
			var types:string[]=[];
			//console.log('action.stateTransitionFlags: ' + action.stateTransitionFlags);
			// todo : find better solution for cases when we have multiple StateTransitions in one flag
			switch (action.stateTransitionFlags) {
				case 274:
				case StateTransitions.OutDownToIdle:
					types[0] = 'mouseOut3d';
					break;
				case StateTransitions.IdleToOverUp:
					types[0]  = 'mouseOver3d';
					break;
				case StateTransitions.OverUpToIdle:// rollout
					types[0]  = 'mouseOut3d';
					break;
				case StateTransitions.OverUpToOverDown:
					types[0]  = 'mouseDown3d';
					break;
				case StateTransitions.OverDownToOverUp:
					types[0]  = 'mouseUp3d';
					break;
				case 72:
					types[0]  = 'mouseUp3d';
					types[1]  = 'mouseUpOutside3d';
					break;
				case 160:// dragOver
					notImplemented('AVM1 drag over button actions');
					break;
				case 272:// dragOut
					notImplemented('AVM1 drag out button actions');
					break;
				case 434:// rollout dragOver dragOut
					types[0]  = 'mouseOut3d';
					notImplemented('AVM1 drag over button actions');
					notImplemented('AVM1 drag out button actions');
					break;
				case StateTransitions.OverDownToOutDown:
				case StateTransitions.OutDownToOverDown:
					notImplemented('AVM1 drag over/out button actions');
					break;
				case StateTransitions.IdleToOverDown:
				case StateTransitions.OverDownToIdle:
					notImplemented('AVM1 drag trackAsMenu over/out button actions');
					break;
				default:
					warning('Unknown AVM1 button action type: ' + action.stateTransitionFlags);
					continue;
			}
			var cnt=types.length;
			var boundListener=this._mouseEventHandler.bind(this, action.stateTransitionFlags)
			while (cnt>0){
				cnt--;
				requiredListeners[types[cnt]] = boundListener;

			}
		}
		this._initEventsHandlers();
		this._addListeners();
	}
	// this is used for ordering AVM1 Framescripts into correct order
	private compareAVM1FrameScripts(a:IFrameScript, b: IFrameScript): number {
		if (!a.precedence) {
			return !b.precedence ? 0 : -1;
		} else if (!b.precedence) {
			return 1;
		}
		var i = 0;
		while (i < a.precedence.length && i < b.precedence.length && a.precedence[i] === b.precedence[i]) {
			i++;
		}
		if (i >= a.precedence.length) {
			return a.precedence.length === b.precedence.length ? 0 : -1;
		} else {
			return i >= b.precedence.length ? 1 : a.precedence[i] - b.precedence[i];
		}
	}
	public executeScript(actionsBlocks:any){
		
		var name:string=this.adaptee.name.replace(/[^\w]/g,'');
		if(!actionsBlocks){
			window.alert("actionsBlocks is empty, can not execute framescript"+ name+ this.adaptee.currentFrameIndex);
			return;
		}
		var unsortedScripts:any[]=[];
				
		for (let k = 0; k < actionsBlocks.length; k++) {
			let actionsBlock:any = actionsBlocks[k];
			let script:IFrameScript= function (actionsData) {
				(<any>this)._avm1Context.executeActions(actionsData, this);
			}.bind(this, actionsBlock.data);

			// this uses parents of current scenegraph. so its not possible to easy preset in parser 
			script.precedence = this.adaptee.getScriptPrecedence().concat(actionsBlock.precedence);

			script.context = this.adaptee;
			unsortedScripts.push(script);
		}
		if (unsortedScripts.length) {
			unsortedScripts.sort(this.compareAVM1FrameScripts);
			var sortedFrameScripts = unsortedScripts;
			for (let k = 0; k < sortedFrameScripts.length; k++) {
				var myScript = sortedFrameScripts[k];
				var mc = myScript.context;
				myScript.call(mc);
			}
		}		
	}
	public addScript(source:any, frameIdx:number):any{
		let actionsBlocks=source;
		var translatedScripts:any[]=[];
		for (let i = 0; i < actionsBlocks.length; i++) {
			let actionsBlock = actionsBlocks[i];
			var mcName:any=this.adaptee.name;
			if(typeof mcName!="string"){
				mcName=mcName.toString();
			}
			actionsBlock.data=(<AVM1Context>this._avm1Context).actionsDataFactory.createActionsData(
				actionsBlock.actionsData, 'script_'+mcName.replace(/[^\w]/g,'')+"_"+this.adaptee.id+'_frame_' + frameIdx + '_idx_' + i);
			translatedScripts[translatedScripts.length]=actionsBlock;			
		}
		return translatedScripts;
	}
	public clone(){
		return <AVM1Button>getAVM1Object(this.adaptee.clone(), <AVM1Context>this._avm1Context);
	}

	public evalScript(str:string):Function{
		return null; //not used for avm1
	}
	
	public doInitEvents():void
	{
		for (var key in this.adaptee.timeline.avm1InitActions)
			this.executeScript(this.addScript(this.adaptee.timeline.avm1InitActions[key], <any> ("initActionsData" + key)));

		if((<any>this).initEvents){
			initializeAVM1Object(this.adaptee, <AVM1Context>this._avm1Context, (<any>this).initEvents);
		}
	}

	public registerScriptObject(child:DisplayObject):void
	{
		// 	todo: i think buttons can not hae named instances.
		//	if that is true, below code can be removed
		if (child.name){
			this.alPut(child.name, child.adapter);
		}
	}

	public unregisterScriptObject(child:DisplayObject):void
	{
		// 	todo: i think buttons can not hae named instances.
		//	if that is true, below code can be removed
		if(child && child.adapter != child)
			(<any>child.adapter).alPut("onEnterFrame", null);
		if(child.name)
			this.alDeleteProperty(child.name);
	}

	public stop() {
		return this.adaptee.stop();
	}
	public getEnabled() {
		return this.enabled;
	}

	public setEnabled(value) {
		if (value == this.enabled)
			return;
		this.enabled = value;		
		this.adaptee.buttonEnabled=value;
		
		this.adaptee.removeButtonListeners();
		if(value){
			this.adaptee.addButtonListeners();
		}
		this.setEnabledListener(value);
	}

	public getTrackAsMenu(): boolean {
		notImplemented("AVM1Textfield.getTrackAsMenu");
		return false;//getAwayObjectOrTemplate(this).trackAsMenu;
	}

	public setTrackAsMenu(value: boolean) {
		notImplemented("AVM1Textfield.setTrackAsMenu");
		//getAwayObjectOrTemplate(this).trackAsMenu = alToBoolean(this.context, value);
	}


	public getUseHandCursor() {
		this.adaptee.useHandCursor;
	}

	public setUseHandCursor(value) {
		this.adaptee.useHandCursor=value;
	}


	public _addListeners() {
		for (var type in this._requiredListeners) {
			this._eventHandlers[type]=(<any>{stageEvent:false, eventName:type});
			this._eventsListeners[type]=this._requiredListeners[type];
		}
		this.setEnabledListener(this.enabled);
	}
	public _removeListeners() {
		for (var type in this._requiredListeners) {
			//var target: EventDispatcher = type === 'keyDown' ?	(<any>this.adaptee).stage :	this.adaptee;
			var target: EventDispatcher=this.adaptee;
			target.removeEventListener(type, this._requiredListeners[type]);
		}
	}

	private _keyDownHandler(event) {
		var actions = this._actions;
		for (var i = 0; i < actions.length; i++) {
			var action = actions[i];
			if (!action.keyCode) {
				continue;
			}
			if ((action.keyCode < 32 &&
				AVM1KeyCodeMap[action.keyCode] === event.axGetPublicProperty('keyCode')) ||
				action.keyCode === event.axGetPublicProperty('charCode'))
			{
				this._runAction(action);
			}
		}
	}

	private _mouseEventHandler(type: number) {
		var actions = this._actions;
		for (var i = 0; i < actions.length; i++) {
			var action = actions[i];
			if (action.stateTransitionFlags === type) {
				this._runAction(action);
			}
		}
	}

	private _runAction(action: AVM1ButtonAction) {
		var avm1Context = this._avm1Context;// (<LoaderInfo>this.adaptee.loaderInfo)._avm1Context;
		if(this.adaptee.parent){
			(<AVM1Context>avm1Context).executeActions(action.actionsBlock,	getAVM1Object(this.adaptee.parent, this.context));
		}
	}

	private _initEventsHandlers() {
		this.bindEvents([
			new AVM1EventHandler('onData', 'data'),
			new AVM1EventHandler('onDragOut', 'dragOut'),
			new AVM1EventHandler('onDragOver', 'dragOver'),
			new AVM1EventHandler('onEnterFrame', 'enterFrame'),
			new AVM1EventHandler('onKeyDown', 'keyDown'),
			new AVM1EventHandler('onKeyUp', 'keyUp'),
			new AVM1EventHandler('onKillFocus', 'focusOut', function (e) {
				return [e.relatedObject];
			}),
			new AVM1EventHandler('onLoad', 'load'),
			new AVM1EventHandler('onMouseDown', 'mouseDown3d', null, true),
			new AVM1EventHandler('onMouseUp', 'mouseUp3d', null, true),
			new AVM1EventHandler('onMouseMove', 'mouseMove3d', null, true),
			new AVM1MovieClipButtonModeEvent('onPress', 'mouseDown3d'),
			new AVM1MovieClipButtonModeEvent('onRelease', 'mouseUp3d'),
			new AVM1MovieClipButtonModeEvent('onReleaseOutside', 'mouseUpOutside3d'),
			new AVM1MovieClipButtonModeEvent('onRollOut', 'mouseOut3d'),
			new AVM1MovieClipButtonModeEvent('onRollOver', 'mouseOver3d'),
			new AVM1EventHandler('onSetFocus', 'focusIn', function (e) {
				return [e.relatedObject];
			}),
			new AVM1EventHandler( 'onUnload', 'unload')
		]);
	}
}

