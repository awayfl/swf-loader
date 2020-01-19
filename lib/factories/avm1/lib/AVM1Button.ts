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

import {getAVM1Object,wrapAVM1NativeClass} from "./AVM1Utils";
import {AVM1Context, AVM1ActionsData} from "../context";
import {EventDispatcher, AudioManager} from "@awayjs/core";
import {MovieClip} from "@awayjs/scene";
import {AVM1Object} from "../runtime/AVM1Object";
import { AVM1EventHandler } from "./AVM1EventHandler";
import {notImplemented, somewhatImplemented, warning, release, assert} from "../../base/utilities/Debug";
import { AVM1MovieClip } from './AVM1MovieClip';
import {ClipEventMappings,EventsListForButton} from "./AVM1EventHandler";
import {AVM1ClipEvents} from "../../base/SWFTags";


class AVM1ButtonAction {
	keyCode: number;
	stateTransitionFlags: number;
	actionsData: Uint8Array;
	actionsBlock: AVM1ActionsData;
}


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

var buttonActionsMap:any={
    1:ClipEventMappings[AVM1ClipEvents.RollOver],
    2:ClipEventMappings[AVM1ClipEvents.RollOut],
    4:ClipEventMappings[AVM1ClipEvents.Press],
    8:ClipEventMappings[AVM1ClipEvents.Release],
    64:ClipEventMappings[AVM1ClipEvents.ReleaseOutside],
    160:ClipEventMappings[AVM1ClipEvents.DragOver],
    272:ClipEventMappings[AVM1ClipEvents.DragOut]
}

export class AVM1Button extends AVM1MovieClip {
	private _requiredListeners: any;
	private _actions: AVM1ButtonAction[];

	static buttonPokiSDKActions:any={};

	static createAVM1Class(context: AVM1Context) : AVM1Object {
		return wrapAVM1NativeClass(context, true, AVM1Button,
			[],
			[ '$version#', '_alpha#', 'getAwayJSID', 'attachAudio', 'attachBitmap', 'attachMovie',
            'beginFill', 'beginBitmapFill', 'beginGradientFill', 'blendMode#',
            'cacheAsBitmap#', '_callFrame', 'clear', 'createEmptyMovieClip',
            'createTextField', '_currentframe#', 'curveTo', '_droptarget#',
            'duplicateMovieClip', 'enabled#', 'endFill', 'filters#', '_framesloaded#',
            '_focusrect#', 'forceSmoothing#', 'getBounds',
            'getBytesLoaded', 'getBytesTotal', 'getDepth', 'getInstanceAtDepth',
            'getNextHighestDepth', 'getRect', 'getSWFVersion', 'getTextSnapshot',
            'getURL', 'globalToLocal', 'gotoAndPlay', 'gotoAndStop', '_height#',
            '_highquality#', 'hitArea#', 'hitTest', 'lineGradientStyle', 'lineStyle',
            'lineTo', 'loadMovie', 'loadVariables', 'localToGlobal', '_lockroot#',
            'menu#', 'moveTo', '_name#', 'nextFrame', 'opaqueBackground#', '_parent#',
            'play', 'prevFrame', '_quality#', 'removeMovieClip', '_root#', '_rotation#',
            'scale9Grid#', 'scrollRect#', 'setMask', '_soundbuftime#', 'startDrag',
            'stop', 'stopDrag', 'swapDepths', 'tabChildren#', 'tabEnabled#', 'tabIndex#',
            '_target#', '_totalframes#', 'trackAsMenu#', 'toString',
            'unloadMovie', '_url#', 'useHandCursor#', '_visible#', '_width#',
            '_x#', '_xmouse#', '_xscale#', '_y#', '_ymouse#', '_yscale#']);
	}

	public _updateMouseEnabled(event:AVM1EventHandler, enabled:boolean):void
	{
		if (!this.adaptee.isAVMScene) {
            if(event.isMouse){
                if (enabled) {
                    this._mouseListenerCount++;
                    this.adaptee.mouseEnabled = true;
                    this.adaptee.mouseChildren = false;
                    if(event.isButton){
                        this._mouseButtonListenerCount++;
                        (<any>this.adaptee).buttonMode = true;
                    }
                } else {
                    this._mouseListenerCount--;
                    if (this._mouseListenerCount <= 0){   
                        this._mouseListenerCount = 0;
                        this.adaptee.mouseEnabled = false;
                        this.adaptee.mouseChildren = false;
                    }
                    if(event.isButton){
                        this._mouseButtonListenerCount--;
                        if (this._mouseButtonListenerCount <= 0){  
                            this._mouseButtonListenerCount = 0;
                            (<any>this.adaptee).buttonMode = false;
                        }  
                    }
                }		
            }			
		}	
	}
	public initAVM1SymbolInstance(context: AVM1Context, awayObject: MovieClip) {
		super.initAVM1SymbolInstance(context, awayObject);

		var nativeButton = this.adaptee;
		var requiredListeners = this._requiredListeners = Object.create(null);
		var actions = this._actions = nativeButton.timeline.avm1ButtonActions;
		var action=null;
		var boundListener=null;
		var foundValidAction:boolean=false;
		var actionsLength:number=actions.length;
		for (var i = 0; i < actionsLength; i++) {
			action = actions[i];
			if (!action.actionsBlock) {
				action.actionsBlock = context.actionsDataFactory.createActionsData(action.actionsData, 's' + nativeButton.id + 'e' + i);
			}
			if (action.keyCode) {
				//requiredListeners['keyDown'] = this._keyDownHandler.bind(this);
				//continue;
			}
			if(action.stateTransitionFlags!=0){
                boundListener=this._mouseEventHandler.bind(this, action.stateTransitionFlags);
                foundValidAction=false;
                for(var key in buttonActionsMap){
                    if(action.stateTransitionFlags & parseInt(key)){
                        foundValidAction=true;
                        //console.log("added event for name:",buttonActionsMap[key].eventName)
						requiredListeners[buttonActionsMap[key].eventName] = {handler:buttonActionsMap[key], boundListener:boundListener};
                    }
                }
				if(!foundValidAction){
					console.warn("unknown button event flag", action.stateTransitionFlags);
				}
            }
		}
        this.adaptee.addButtonListeners();
		this._initEventsHandlers();
		this._addListeners();
	}

	public doInitEvents():void
	{
        super.doInitEvents();
		this._addListeners();
	}

	public stop() {
		return this.adaptee.stop();
	}
	public getEnabled() {
		return this.enabled;
	}

	public setEnabled(value) {
		this.adaptee.buttonEnabled=value;
		if (value == this.enabled)
			return;
		this.enabled = value;		
        this.setEnabledListener(value);
        this.adaptee.mouseEnabled=true;
	}

	public getTrackAsMenu(): boolean {
		notImplemented("AVM1Textfield.getTrackAsMenu");
		return false;//getAwayObjectOrTemplate(this).trackAsMenu;
	}

	public setTrackAsMenu(value: boolean) {
		notImplemented("AVM1Textfield.setTrackAsMenu");
		//getAwayObjectOrTemplate(this).trackAsMenu = alToBoolean(this.context, value);
	}

	public _addListeners() {
		for (var type in this._requiredListeners) {
			this._eventHandlers[type]=this._requiredListeners[type].handler;
			this._eventsListeners[type]=this._requiredListeners[type].boundListener;
		}
        this.setEnabledListener(this.enabled);
	}
	public _removeListeners() {
		var target: EventDispatcher=null;
		for (var type in this._requiredListeners) {
			//var target: EventDispatcher = type === 'keyDown' ?	(<any>this.adaptee).stage :	this.adaptee;
			target=this.adaptee;
			target.removeEventListener(type, this._requiredListeners[type].boundListener);
		}
	}

	private _keyDownHandler(event) {
		var actions = this._actions;
		var actionsLength:number = actions.length;
		for (var i = 0; i < actionsLength; i++) {
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
		var actionsLength:number = actions.length;
		for (var i = 0; i < actionsLength; i++) {
			var action = actions[i];
			if (action.stateTransitionFlags === type) {
				console.log("press button", (<MovieClip>this.adaptee.parent).symbolID, this.adaptee.symbolID)
				if(AVM1Button.buttonPokiSDKActions[this.adaptee.name]){
					console.log("button has poki sdk action");
					AudioManager.setVolume(0);
					AVM1Button.buttonPokiSDKActions[this.adaptee.name](()=>{
						AudioManager.setVolume(1);
						this._runAction(action)
					})				
				}
				else if(AVM1Button.buttonPokiSDKActions["all"]){
					console.log("button has poki sdk action");
					AudioManager.setVolume(0);
					AVM1Button.buttonPokiSDKActions["all"](()=>{
						AudioManager.setVolume(1);
						this._runAction(action)
					})		
				}
				else{
					this._runAction(action);
				}
			}
		}
	}

	private _runAction(action: AVM1ButtonAction) {
		var avm1Context = this._avm1Context;// (<LoaderInfo>this.adaptee.loaderInfo)._avm1Context;
		if(this.adaptee.parent){
			(<AVM1Context>avm1Context).executeActions(action.actionsBlock,	getAVM1Object(this.adaptee.parent, this.context));
		}
	}
	
	protected _initEventsHandlers() {
		this.bindEvents(EventsListForButton);
	}
}

