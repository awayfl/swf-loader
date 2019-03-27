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

//module Shumway.AVM1.Lib {

	import {jsGlobal} from "../../base/utilities/jsGlobal";
	import {notImplemented, release, Debug, somewhatImplemented, warning} from "../../base/utilities/Debug";
	
	import {
		avm1BroadcastEvent, DEPTH_OFFSET, getAwayJSAdaptee, getAVM1Object, IAVM1SymbolBase,
		wrapAVM1NativeMembers
	} from "./AVM1Utils";
	import {
		alCoerceNumber, alCoerceString, alIsFunction, alNewObject, alToInt32, alToInteger, alToNumber, alToString
	} from "../runtime";
	import {AVM1MovieClip} from "./AVM1MovieClip";
	import {AVM1Broadcaster} from "./AVM1Broadcaster";
	import {AVM1System} from "./AVM1System";
	import {AVM1Stage} from "./AVM1Stage";
	import {AVM1Button} from "./AVM1Button";
	import {AVM1TextField} from "./AVM1TextField";
	import {AVM1Color} from "./AVM1Color";
	import {AVM1Key} from "./AVM1Key";
	import {AVM1Context} from "../context";
	import {AVM1Mouse} from "./AVM1Mouse";
	import {AVM1MovieClipLoader} from "./AVM1MovieClipLoader";
	import {AVM1LoadVarsFunction} from "./AVM1LoadVars";
	import {AVM1Sound} from "./AVM1Sound";
	import {AVM1SharedObject} from "./AVM1SharedObject";
	import {AVM1TextFormat} from "./AVM1TextFormat";
	import {AVM1XMLFunction, AVM1XMLNodeFunction} from "./AVM1XML";
	import {AVM1BitmapData} from "./AVM1BitmapData";
	import {AVM1PointFunction} from "./AVM1Point";
	import {AVM1RectangleFunction} from "./AVM1Rectangle";
	import {AVM1Transform} from "./AVM1Transform";
	import {AVM1ColorTransformFunction} from "./AVM1ColorTransform";
	import {AVM1ExternalInterface} from "./AVM1ExternalInterface";
	import {createFiltersClasses} from "./AVM1Filters";
	import {URLLoaderEvent as Event, AudioManager} from "@awayjs/core";
	import {MovieClip, FrameScriptManager} from "@awayjs/scene";
	import {create, RandomSeed} from "random-seed";
	
	import {forEachPublicProperty, FlashNetScript_navigateToURL, FlashUtilScript_getTimer} from "../../AVM2Dummys";
	import {AVM1Object} from "../runtime/AVM1Object";
	
	import {AVM1Selection} from "./AVM1Selection";
	import {IAVMRandomProvider} from "../../IAVMRandomProvider";
	import {ISoftKeyboardManager} from "../../ISoftKeyboardManager";
	import { AVM1Function } from "../runtime/AVM1Function";
	import { AVM1ArrayNative } from "../natives";
	
	
	var _escape: (str: string) => string = jsGlobal.escape;
	
	var _internalTimeouts: number[] = [];
	
	class AVM1MatrixFunction extends AVM1Object {
		constructor(context: AVM1Context) {
			super(context);
		}
	
	}
	
	export class TraceLevel{
		public static ALL:string="all";
		public static NONE:string="none";
		public static IMPORTANT:string="important";
	}
	
	export class AVM1Globals extends AVM1Object {
		public static _scenegraphFactory:any;
		public static instance:AVM1Globals;
		public static lessonStartTime:number;
		public static _registeredCustomClasses:any={};
		public static _registeredCustomClassInstances:any={};
		public static randomProvider:RandomSeed;
		public static setRandom(seed:string=null){
			if(seed){
				AVM1Globals.randomProvider=create(seed);
				return;
			}
			AVM1Globals.randomProvider=null;
		}
		public static softKeyboardManager:ISoftKeyboardManager;
		public static registerCustomClass(name:string, avm1Class:any) {
			AVM1Globals._registeredCustomClasses[name]=avm1Class;
			if(AVM1Globals.instance){
				AVM1Globals.instance.alPut(name, avm1Class);
			}
		}
		public static registerCustomClassInstance(name:string, avm1Class:AVM1Object) {
			AVM1Globals._registeredCustomClassInstances[name]=avm1Class;
			if(AVM1Globals.instance) {
				AVM1Globals.instance.alPut(name, avm1Class);
			}
		}
		public static createGlobalsObject(context: AVM1Context): AVM1Globals {
			var globals = new AVM1Globals(context);
			wrapAVM1NativeMembers(context, globals, globals,
				['flash', 'ASSetPropFlags', 'BitmapData' ,'clearInterval', 'clearTimeout',"ExternalInterface",
					'escape', 'unescape', 'setInterval', 'setTimeout', 'showRedrawRegions',
					'trace', 'updateAfterEvent','myName',
					'NaN', 'Infinity', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'undefined',
					'Object', 'Function','Array', 'Number', 'Math', 'Boolean', 'Date', 'Selection', 'String', 'Error',
					'MovieClip', 'AsBroadcaster', 'System', 'Stage', 'Button',
					'TextField', 'Color', 'Key', 'Mouse', 'MovieClipLoader', 'XML', 'XMLNode', 'LoadVars',
					'Sound', 'SharedObject', 'ContextMenu', 'ContextMenuItem', 'TextFormat'], false);
					//'myManager', 'SoundManager'], false);
			AVM1Globals.instance=globals;
			return globals;
		}
	
		public static tracelevel:TraceLevel=TraceLevel.NONE;
		public static toStringPrecision:number=-1;
	
		constructor(context: AVM1Context) {
			super(context);
	
			this._initBuiltins(context);
	
			var swfVersion = context.loaderInfo.swfVersion;
			//if (swfVersion >= 8) {
				this._initializeFlashObject(context);
			//}
		}
	
		public flash: AVM1Object;
	
		public ASSetPropFlags(obj: any, children: any, flags: any, allowFalse: any): any {
			// flags (from bit 0): dontenum, dontdelete, readonly, ....
			// TODO
		}
	
		public clearIntervals(): void {
			var i:number=0;
			var len:number=_internalTimeouts.length;
			for(i=0;i<len;i++){
				FrameScriptManager.clearInterval(_internalTimeouts[i]);
			}
			_internalTimeouts.length=0;
		}
	
		public clearInterval(id: number /* uint */): void {
			var internalId = _internalTimeouts[id - 1];
			if (internalId) {
				FrameScriptManager.clearInterval(internalId);
				delete _internalTimeouts[id - 1];
			}
		}
	
		public clearTimeout(id: number /* uint */): void {
			var internalId = _internalTimeouts[id - 1];
			if (internalId) {
				FrameScriptManager.clearTimeout(internalId);
				delete _internalTimeouts[id - 1];
			}
		}
	
		/**
		 * AVM1 escapes slightly more characters than JS's encodeURIComponent, and even more than
		 * the deprecated JS version of escape. That leaves no other option but to do manual post-
		 * processing of the encoded result. :/
		 *
		 * Luckily, unescape isn't thus afflicted - it happily unescapes all the additional things
		 * we escape here.
		 */
		public escape(str: string): string {
			var result = encodeURIComponent(str);
			return result.replace(/!|'|\(|\)|\*|-|\.|_|~/g, function(char: string): string {
				switch (char) {
					case '*':
						return '%2A';
					case '-':
						return '%2D';
					case '.':
						return '%2E';
					case '_':
						return '%5F';
					default:
						return _escape(char);
				}
			});
		}
	
		public unescape(str: string): string {
			return decodeURIComponent(str);
		}
	
		public setInterval(): any {
			// AVM1 setInterval silently swallows everything that vaguely looks like an error.
			if (arguments.length < 2) {
				return undefined;
			}
			var context = this.context;
			var fn:Function;
			var time= alToInteger(context, arguments[1]);
            var argsStartIdx:number=2;
			if (alIsFunction(arguments[0])) {
				fn = arguments[0].toJSFunction();
			} else {
				if (arguments.length < 3) {
					return undefined;
				}
				var obj: any = arguments[0];
				var funName: string = arguments[1];
                time= alToInteger(context, arguments[2]);
                argsStartIdx=3;
				if (!(obj instanceof AVM1Object) || typeof funName !== 'string') {
					return undefined;
				}
				fn = function () {
					var avmFn: AVM1Function = obj.alGet(funName);
					if (!alIsFunction(avmFn)) {
						return;
					}
					var args = Array.prototype.slice.call(arguments, 0);
					context.executeFunction(avmFn, obj, args);
				};
			}
			var args: any[] = [];
			for (var i = argsStartIdx; i < arguments.length; i++) {
				args.push(arguments[i]);
			}
	
			// Unconditionally coerce interval to int, as one would do.
			var internalId;
			if(fn){
				var callback=function(){
					fn.apply(null, args);
				}
				internalId = FrameScriptManager.setInterval(callback, time);
			}
			return _internalTimeouts.push(internalId);
		}
	
		public setTimeout() {
			// AVM1 setTimeout silently swallows most things that vaguely look like errors.
			if (arguments.length < 2 || !alIsFunction(arguments[0])) {
				return undefined;
			}
			var fn:Function = arguments[0].toJSFunction();	
			var time= alToInteger(this.context, arguments[1]);
			var args: any[] = [];
			for (var i = 2; i < arguments.length; i++) {
				args.push(arguments[i]);
			}
			var callback=function(){
				fn.apply(null, args);
			}
			var internalId = FrameScriptManager.setTimeOut(callback, time);
			return _internalTimeouts.push(internalId);
		}
	
		public showRedrawRegions(enable, color) {
			// flash.profiler.showRedrawRegions.apply(null, arguments);
			notImplemented('AVM1Globals.showRedrawRegions');
		}
	
		public trace(expression: any): any {
            if(this)
			    (<any>this.context).actions.trace(expression);
		}
	
		public updateAfterEvent() {
			notImplemented('AVM1Globals.updateAfterEvent');
			//this.context.sec.player.requestRendering();
		}
	
		// built-ins
		public NaN: number = Number.NaN;
		public Infinity: number = Number.POSITIVE_INFINITY;
		public isFinite(n: number): boolean {
			return isFinite(alToNumber(this.context, n));
		}
		public isNaN(n: any): boolean {
			if(n===" "){
				return true;
			}
			return isNaN(alToNumber(this.context, n));
		}
		public parseFloat(s: string): number {
			return parseFloat(alToString(this.context, s));
		}
		public parseInt(s: string, radix?: number): number {
			return parseInt(alToString(this.context, s), alToInt32(this.context, radix));
		}
		public undefined: any = undefined;
	
	
	
		public Object: AVM1Object;
		public Function: AVM1Object;
		public Array: AVM1Object;
		public Number: AVM1Object;
		public Math: AVM1Object;
		public Boolean: AVM1Object;
		public Date: AVM1Object;
		public String: AVM1Object;
		public Error: AVM1Object;
	
		public ExternalInterface:AVM1Object;

		public MovieClip: AVM1Object;
		public AsBroadcaster: AVM1Object;
		public System: AVM1Object;
		public Stage: AVM1Object;
		public Button: AVM1Object;
		public TextField: AVM1Object;
		public Color: AVM1Object;
		public Key: AVM1Object;
		public Mouse: AVM1Object;
		public MovieClipLoader: AVM1Object;
		public LoadVars: AVM1Object;
	
		public Sound: AVM1Object;
		public SharedObject: AVM1Object;
		public ContextMenu: AVM1Object;
		public ContextMenuItem: AVM1Object;
		public TextFormat: AVM1Object;
	
		public XMLNode: AVM1Object;
		public XML: AVM1Object;
	
		public filters: AVM1Object;
		public BitmapData: AVM1Object;
		public Matrix: AVM1Object;
		public Point: AVM1Object;
		public Rectangle: AVM1Object;
		public Transform: AVM1Object;
		public ColorTransform: AVM1Object;
	
		public Selection:AVM1Selection;
	
		private _initBuiltins(context: AVM1Context) {
			var builtins = context.builtins;
	
			this.Object = builtins.Object;
			this.Function = builtins.Function;
			this.Array = builtins.Array;
			this.Number = builtins.Number;
			this.Math = builtins.Math;
			this.Boolean = builtins.Boolean;
			this.Date = builtins.Date;
			this.String = builtins.String;
			this.Error = builtins.Error;
	
			this.Selection = <AVM1Selection>AVM1Selection.createAVM1Class(context)._ownProperties["prototype"].value;
	
			this.ExternalInterface=AVM1ExternalInterface.createAVM1Class(context);

			this.MovieClip = AVM1MovieClip.createAVM1Class(context);
			this.AsBroadcaster = AVM1Broadcaster.createAVM1Class(context);
			this.System = AVM1System.createAVM1Class(context);
			this.Stage = AVM1Stage.createAVM1Class(context);
			this.Button = AVM1Button.createAVM1Class(context);
			this.TextField = AVM1TextField.createAVM1Class(context);
			this.Color = AVM1Color.createAVM1Class(context);
			this.Key = AVM1Key.createAVM1Class(context);
			this.Mouse = AVM1Mouse.createAVM1Class(context);
			this.MovieClipLoader = AVM1MovieClipLoader.createAVM1Class(context);
			this.LoadVars = new AVM1LoadVarsFunction(context);
	
			this.Sound = AVM1Sound.createAVM1Class(context);
			this.SharedObject = AVM1SharedObject.createAVM1Class(context);
			this.ContextMenu = undefined; // wrapAVM1Builtin(sec.flash.ui.ContextMenu.axClass);
			this.ContextMenuItem = undefined; // wrapAVM1Builtin(sec.flash.ui.ContextMenuItem.axClass);
			this.TextFormat = AVM1TextFormat.createAVM1Class(context);
	
			this.XMLNode = new AVM1XMLNodeFunction(context);
			this.XML = new AVM1XMLFunction(context, <AVM1XMLNodeFunction>this.XMLNode);
	
			this.BitmapData = AVM1BitmapData.createAVM1Class(context);
			this.Matrix = new AVM1MatrixFunction(context);
			this.Point = new AVM1PointFunction(context);
			this.Rectangle = new AVM1RectangleFunction(context);
			this.Transform = AVM1Transform.createAVM1Class(context);
			this.ColorTransform = new AVM1ColorTransformFunction(context);
	
	
			AVM1Broadcaster.initialize(context, this.Stage);
			AVM1Broadcaster.initialize(context, this.Key);
			AVM1Broadcaster.initialize(context, this.Mouse);
	
			// register own custom classes and class identifier
			for(var k in AVM1Globals._registeredCustomClasses){
				this.alPut(k, AVM1Globals._registeredCustomClasses[k]);
			}
			for(var k in AVM1Globals._registeredCustomClassInstances){
				this.alPut(k, AVM1Globals._registeredCustomClassInstances[k]);
			}
		}
	
		private _initializeFlashObject(context: AVM1Context): void {
			this.flash = alNewObject(context);
			var display: AVM1Object = alNewObject(context);
			display.alPut('BitmapData', this.BitmapData);
			this.flash.alPut('display', display);
			var external: AVM1Object = alNewObject(context);
			external.alPut('ExternalInterface', AVM1ExternalInterface.createAVM1Class(context));
			this.flash.alPut('external', external);
			var filters: AVM1Object = createFiltersClasses(context);
			this.flash.alPut('filters', filters);
			this.filters = filters;
			var geom: AVM1Object = alNewObject(context);
			geom.alPut('ColorTransform', this.ColorTransform);
			geom.alPut('Matrix', this.Matrix);
			geom.alPut('Point', this.Point);
			geom.alPut('Rectangle', this.Rectangle);
			geom.alPut('Transform', this.Transform);
			this.flash.alPut('geom', geom);
			var text: AVM1Object = alNewObject(context);
			this.flash.alPut('text', text);
		}
	}
	
	export class AVM1NativeActions {
		public constructor(public context: AVM1Context) {
			// TODO ?
		}
	
		public asfunction(link) {
			notImplemented('AVM1NativeActions.$asfunction');
		}
	
		public call(frame) {
			// 	calls a framescript on a given frame (label or frame-number) 
			//	without navigating the mc to that frame 
			var nativeTarget = <AVM1MovieClip>this.context.resolveTarget(null);
			nativeTarget._callFrame(frame);
		}
	
		public chr(code) {
			// return the string for a given charcode
			code = alToInteger(this.context, code);
			if (this.context.swfVersion <= 5) {
				code &= 0xFF;
			}
			return code ? String.fromCharCode(code) : '';
		}
	
		public duplicateMovieClip(target, newname, depth) {
			// todo: check if the DEPTH_OFFSET is 100% correct for working with AwayJS
			var normalizedDepth = alCoerceNumber(this.context, depth) - DEPTH_OFFSET;
			var nativeTarget = <AVM1MovieClip>this.context.resolveTarget(target);
			nativeTarget.duplicateMovieClip(newname, normalizedDepth, null);
		}
	
		public fscommand(command: string, args?: string) {
			// todo: untested
			somewhatImplemented('AVM1NativeActions.fscommand');
			return this.context.sec.flash.system.fscommand.axCall(null, this.context.sec, command, args);
		}
	
		public getTimer(): number {
			return new Date().getTime() - AVM1Globals.lessonStartTime;
		}
	
		public getURL(url, target?, method?) {
			var sec = this.context.sec;
			var request = new sec.flash.net.URLRequest(String(url));
			if (method) {
				request.method = method;
			}
			if (typeof target === 'string' && target.indexOf('_level') === 0) {
				this.loadMovieNum(url, +target.substr(6), method);
				return;
			}
			FlashNetScript_navigateToURL(sec, request, target);
		}
	
		public gotoAndPlay(label, frame?) {
	
			//console.log("AVM1Globals.gotoAndPlay", label, frame);
			// even if gotoAndPlay fails to find a label, the mc wills till be set to play 
			// this is diffeent when calling gotoAndPlaycalling on mc directly)
			var avmMC:AVM1MovieClip=(<AVM1MovieClip>this.context.resolveTarget(null));		
			avmMC.adaptee.play();
			this._gotoFrame(avmMC.adaptee, label, frame);
		}
	
		public gotoAndStop(label, frame?) {
			// see comments in gotoAndPlay
			//console.log("AVM1Globals.gotoAndStop", label, frame);
			//console.log("Scene navigation", arguments[0], scene);
            var avmMC:AVM1MovieClip=(<AVM1MovieClip>this.context.resolveTarget(null));	
            
            if(typeof frame ==="number" && frame<=0)
                return;	
			avmMC.adaptee.stop();
			this._gotoFrame(avmMC.adaptee, label, frame);
		}
	
		private _gotoFrame(mc:MovieClip, frame:any, offset:number):void
		{
            if(Array.isArray(frame)){
                if(frame.length==0)
                    return;
                frame=frame[0];
            }
            if(frame instanceof AVM1ArrayNative){
                if(!frame.value || frame.value.length==0)
                    return;
                frame=frame.value[0];
            }
			if(typeof frame==="number"){
				if(frame % 1!==0){
					frame=frame.toString();
				}
			} 
			if (typeof frame === "string"){
				if(mc.timeline._labels[frame.toLowerCase()]===null){
					frame=parseInt(frame);
					if(!isNaN(frame)){
						mc.currentFrameIndex = (<number>frame) - 1;
					}
					return;
				}
				mc.jumpToLabel(<string>frame.toLowerCase(), offset);
			}
			else
				mc.currentFrameIndex = (<number>frame) - 1;
		}
		public ifFrameLoaded(scene, frame?) {
			// ignoring scene parameter ?
			var nativeTarget = <AVM1MovieClip>this.context.resolveTarget(null);
			var frameNum = arguments.length < 2 ? arguments[0] : arguments[1];
			var framesLoaded = nativeTarget.alGet('_framesloaded');
			var totalFrames = nativeTarget.alGet('_totalframes');
			// The (0-based) requested frame index is clamped to (the 1-based) totalFrames value.
			// I.e., asking if frame 20 is loaded in a timline with only 10 frames returns true if all
			// frames have been loaded.
			return Math.min(frameNum + 1, totalFrames) <= framesLoaded;
		}
	
		public length_(expression): number {
			return ('' + expression).length; // ASCII Only?
		}
	
		public loadMovie(url: string, target: any, method: string): void {
			// some swfs are using loadMovie to call fscommmand
			if (url && url.toLowerCase().indexOf('fscommand:') === 0) {
				this.fscommand(url.substring('fscommand:'.length), target);
				return;
			}
			var loadLevel: boolean = typeof target === 'string' &&	target.indexOf('_level') === 0;
			var levelNumber: number;
			if (loadLevel) {
				var levelStr: string = target.substr(6);
				levelNumber = parseInt(levelStr, 10);
				loadLevel = levelNumber.toString() === levelStr;
			}
			if (loadLevel) {
				this.loadMovieNum(url, levelNumber, method);
			} else {
				var nativeTarget = <AVM1MovieClip>this.context.resolveTarget(target);
				nativeTarget.loadMovie(url, method);
			}
		}
	
		public loadMovieNum(url, level, method) {
			notImplemented("AVM1NativeActions.loadMovieNum");
			return;
			/*
			url = alCoerceString(this.context, url);
			level = alToInteger(this.context, level);
			method = alCoerceString(this.context, method);
	
			// some swfs are using loadMovieNum to call fscommmand
			if (url && url.toLowerCase().indexOf('fscommand:') === 0) {
				return this.fscommand(url.substring('fscommand:'.length));
			}
	
			if (level === 0) {
				release || Debug.notImplemented('loadMovieNum at _level0');
				return;
			}
	
			var avm1LevelHolder = this.context.levelsContainer;
			var loaderHelper = new AVM1LoaderHelper(this.context);
			loaderHelper.load(url, method).then(function () {
				avm1LevelHolder._addRoot(level, loaderHelper.content);
			});
			*/
		}
	
		public loadVariables(url: string, target: any, method: string = ''): void {
			url = alCoerceString(this.context, url);
			method = alCoerceString(this.context, method);
	
			var nativeTarget = this.context.resolveTarget(target);
			if (!nativeTarget) {
				return; // target was not found
			}
			this._loadVariables(nativeTarget, url, method);
		}
	
		public loadVariablesNum(url: string, level: number, method: string = ''): void {
			url = alCoerceString(this.context, url);
			level = alToInteger(this.context, level);
			method = alCoerceString(this.context, method);
	
			var nativeTarget = this.context.resolveLevel(level);
			if (!nativeTarget) {
				return; // target was not found
			}
			this._loadVariables(nativeTarget, url, method);
		}
	
		_loadVariables(nativeTarget: IAVM1SymbolBase, url: string, method: string): void {
			var context = this.context;
			var request = new context.sec.flash.net.URLRequest(url);
			if (method) {
				request.method = method;
			}
			var loader = new context.sec.flash.net.URLLoader(request);
			loader._ignoreDecodeErrors = true;
			loader.dataFormat = 'variables'; // flash.net.URLLoaderDataFormat.VARIABLES;
			var completeHandler = context.sec.boxFunction(function (event:Event): void {
				loader.removeEventListener(Event.LOAD_COMPLETE, completeHandler);
				// If the response data is empty, URLLoader#data contains an empty string.
				if (loader.data !== '') {
					release || Debug.assert(typeof loader.data === 'object');
					forEachPublicProperty(loader.data, function (key, value) {
						context.utils.setProperty(nativeTarget, key, value);
					});
				}
				if (nativeTarget instanceof AVM1MovieClip) {
					avm1BroadcastEvent(context, nativeTarget, 'onData');
				}
			});
			loader.addEventListener(Event.LOAD_COMPLETE, completeHandler);
		}
	
		public mbchr(code) {
			code = alToInteger(this.context, code);
			return code ? String.fromCharCode(code) : '';
		}
	
		public mblength(expression) {
			return ('' + expression).length;
		}
	
		public mbord(character) {
			return ('' + character).charCodeAt(0);
		}
	
		public mbsubstring(value, index, count) {
			if (index !== (0 | index) || count !== (0 | count)) {
				// index or count are not integers, the result is the empty string.
				return '';
			}
	
			index = (index < 1)? 0 : index - 1;
	
			if (count < 0)
				count = undefined;
	
			return ('' + value).substr(index, count);
		}
	
		public nextFrame() {
			var nativeTarget:AVM1MovieClip = <AVM1MovieClip>this.context.resolveTarget(null);
			var awayObject:MovieClip = <MovieClip>getAwayJSAdaptee(nativeTarget);
			++awayObject.currentFrameIndex;
		}
	
		public nextScene() {
			notImplemented('AVM1NativeActions.nextScene');
			//var nativeTarget:AVM1MovieClip = <AVM1MovieClip>this.context.resolveTarget(null);
			//var awayObject:MovieClip = <MovieClip>getAwayJSAdaptee(nativeTarget);
		}
	
		public ord(character) {
			return ('' + character).charCodeAt(0); // ASCII only?
		}
	
		public play() {
			this.context.resolveTarget(null).play();
		}
	
		public prevFrame() {
			var awayObject:MovieClip = <MovieClip>getAwayJSAdaptee(<AVM1MovieClip>this.context.resolveTarget(null));
            --awayObject.currentFrameIndex;
            awayObject.stop();
		}
	
		public prevScene() {
			notImplemented('AVM1NativeActions.prevScene');
		}
	
		public print(target, boundingBox) {
			notImplemented('AVM1NativeActions.print');
		}
	
		public printAsBitmap(target, boundingBox) {
			notImplemented('AVM1NativeActions.printAsBitmap');
		}
	
		public printAsBitmapNum(level, boundingBox) {
			notImplemented('AVM1NativeActions.printAsBitmapNum');
		}
	
		public printNum(level, bondingBox) {
			notImplemented('AVM1NativeActions.printNum');
		}
	
		public random(value) {
			if(AVM1Globals.randomProvider){
				return 0 | (AVM1Globals.randomProvider.random() * (0 | value));
			}
			return 0 | (Math.random() * (0 | value));
		}
	
		public removeMovieClip(target) {
			if(!target){
				warning("AVM1NativeActions.removeMovieClip - called for undefined");
				return;
			}
			var nativeTarget = <AVM1MovieClip>this.context.resolveTarget(target);
			if (!nativeTarget) {
				warning("AVM1NativeActions.removeMovieClip - target not found");
				return;
			}
			nativeTarget.removeMovieClip();
		}
	
		public startDrag(target?, ...args: any[]): void {
            var mc = <AVM1MovieClip>this.context.resolveTarget(target);
            if(mc)
			    mc.startDrag.apply(mc, args);
		}
	
		public stop() {
			var nativeTarget = <AVM1MovieClip>this.context.resolveTarget(null);
			nativeTarget.stop();
		}
		public stopAllSounds() {
			AudioManager.stopAllSounds();
		}
		public stopDrag() {
            if(AVM1MovieClip.currentDraggedMC){
                AVM1MovieClip.currentDraggedMC.stopDrag();
            }	
		}
		public substring(value, index, count) {
			return this.mbsubstring(value, index, count); // ASCII Only?
		}
		public toggleHighQuality() {
			// flash.display.Stage.quality
			notImplemented('AVM1NativeActions.toggleHighQuality');
		}
		public trace(expression) {		
	
			if(AVM1Globals.tracelevel==TraceLevel.NONE)
				return;
			var value: string;
			var isImportantTrace:boolean=false;
			switch (typeof expression) {
				case 'undefined':
					// undefined is always 'undefined' for trace (even for SWF6).
					value = 'undefined';
					break;
				case 'string':
					value = expression;
					isImportantTrace=value.length>0 && value[0]=="!";
					break;
				default:
					value = alToString(this.context, expression);
					break;
			}
			if(AVM1Globals.tracelevel==TraceLevel.IMPORTANT && !isImportantTrace)
				return;
	
			console.log('%cAVM1 trace: %c ' + value + ' ', 'color: #054996', 'background: #eee; color: #054996');
		}
	
		public unloadMovie(target) {
			var nativeTarget = <AVM1MovieClip>this.context.resolveTarget(target);
			if (!nativeTarget) {
				warning("AVM1Globals.unloadMovie - target not found");
				return; // target was not found
			}
			nativeTarget.unloadMovie();
		}
		public unloadMovieNum(level: number) {
			level = alToInt32(this.context, level);
			if (level === 0) {
				notImplemented('unloadMovieNum at _level0');
				return;
			}
	
			var avm1MovieHolder = this.context.levelsContainer;
			avm1MovieHolder._removeRoot(level);
		}
	}
	
	
	