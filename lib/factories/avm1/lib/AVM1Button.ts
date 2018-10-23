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
import { AVM1MovieClip } from './AVM1MovieClip';


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
	// single onClipActions:
	1:['mouseOver3d'],		// rollOver
	2:['mouseOut3d'],		// rollOut
	4:['mouseDown3d'],		// press
	8:['mouseUp3d'],		// release 
	64:['mouseUpOutside3d'],// releaseOutside
	//160:[],					// dragOver
	//272:[],					// dragOut

	// combinations of onClipActions:
	//TODO: find a betetr way to handle this
	/*72:['mouseUp3d', 'mouseUpOutside3d'], 	// release + releaseOutside
	161:['mouseOver3d'],					// rollover + dragOver
	274:['mouseOut3d'], 					// rollOut + dragOut
	434:['mouseOut3d'],						// rollout + dragOver + dragOut*/
}

export class AVM1Button extends AVM1MovieClip {
	private _requiredListeners: any;
	private _actions: AVM1ButtonAction[];

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
			//console.log('action.stateTransitionFlags: ' + action.stateTransitionFlags);
			// todo : find better solution for cases when we have multiple StateTransitions in one flag
			/*switch (action.stateTransitionFlags) {
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
            }*/
            /*
			if(action.stateTransitionFlags!=0){
				var types:string[]=buttonActionsMap[action.stateTransitionFlags];
				if(types){
					var cnt=types.length;
					var boundListener=this._mouseEventHandler.bind(this, action.stateTransitionFlags)
					while (cnt>0){
						cnt--;
						requiredListeners[types[cnt]] = boundListener;
					}
				}
				else{
					console.warn("unknown button event flag", action.stateTransitionFlags);
				}
            }*/
			if(action.stateTransitionFlags!=0){
                var boundListener=this._mouseEventHandler.bind(this, action.stateTransitionFlags);
                var foundValidAction:boolean=false;
                for(var key in buttonActionsMap){
                    if(action.stateTransitionFlags & parseInt(key)){
                        foundValidAction=true;
						requiredListeners[buttonActionsMap[key]] = boundListener;
                    }
                }
				if(!foundValidAction){
					console.warn("unknown button event flag", action.stateTransitionFlags);
				}
            }
		}
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

	protected _initEventsHandlers() {
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

