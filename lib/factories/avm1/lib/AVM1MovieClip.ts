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

import {getAwayJSAdaptee, getAwayObjectOrTemplate,
	getAVM1Object,
	hasAwayJSAdaptee,
	IAVM1SymbolBase, initializeAVM1Object,
	wrapAVM1NativeClass, toTwipFloor, avm2AwayDepth, away2avmDepth
} from "./AVM1Utils";
import {
	alCoerceString, alForEachProperty, alInstanceOf, alIsName, alNewObject, alToBoolean, alToInt32,
	alToNumber,
	alToString, AVM1PropertyFlags
} from "../runtime";
import {AVM1Context} from "../context";
import {release, assert, Debug, notImplemented, somewhatImplemented, warning} from "../../base/utilities/Debug";
import {isNullOrUndefined} from "../../base/utilities";
import {AVM1BitmapData, toAS3BitmapData} from "./AVM1BitmapData";
import {toAS3Matrix} from "./AVM1Matrix";
import {AVM1ArrayNative} from "../natives";
import {FlashNetScript_navigateToURL} from "../AVM1Helpers";
import {copyAS3PointTo, toAS3Point} from "./AVM1Point";
import {MovieClipProperties} from "../interpreter/MovieClipProperties";
import {IMovieClipAdapter, DisplayObject, MovieClip, TextField, Billboard, TextFormat, MouseManager} from "@awayjs/scene";
import {AssetLibrary, Matrix3D, Point, WaveAudio, URLRequest, Rectangle} from "@awayjs/core";
import {AVM1TextField} from "./AVM1TextField";
import {Graphics, LineScaleMode, GradientType} from "@awayjs/graphics";
import {LoaderInfo} from "../customAway/LoaderInfo";
import {AVM1SymbolBase} from "./AVM1SymbolBase";
import {AVM1Object} from "../runtime/AVM1Object";
import {AVM1Stage} from "./AVM1Stage";

import { AVM1PropertyDescriptor } from "../runtime/AVM1PropertyDescriptor";
import { AVM1EventHandler } from "./AVM1EventHandler";
import {AVM1LoaderHelper} from "./AVM1LoaderHelper";
import {EventsListForMC} from "./AVM1EventHandler";
import { AVM1InterpretedFunction } from '../interpreter';
import { PickGroup } from '@awayjs/view';

import {MethodMaterial} from "@awayjs/materials";


export interface IFrameScript {
	(any?): any;
	precedence?: number[];
	context?: MovieClip;
}


export const enum LookupChildOptions {
	DEFAULT = 0,
	IGNORE_CASE = 1,
	INCLUDE_NON_INITIALIZED = 2
}



function convertAS3RectangeToBounds(as3Rectange: any, context): AVM1Object {
	var result = alNewObject(context);
	result.alPut('xMin', as3Rectange.left);
	result.alPut('yMin', as3Rectange.top);
	result.alPut('xMax', as3Rectange.right);
	result.alPut('yMax', as3Rectange.bottom);
	return result;
}

export class AVM1MovieClip extends AVM1SymbolBase<MovieClip> implements IMovieClipAdapter {
    public static currentMCAssetNameSpace:string="";
	public static currentDraggedMC:AVM1MovieClip=null;
	
	// if a stop-action occurs, we check if a child with this name is present, and if so, we execute the function provided
    public static pokiSDKonStopActionChildName:string=null;
    public static pokiSDKonStopAction:any=null;
	public static createAVM1Class(context: AVM1Context): AVM1Object {
		return wrapAVM1NativeClass(context, true, AVM1MovieClip,
			[],
			['$version#', '_alpha#', 'getAwayJSID', 'attachAudio', 'attachBitmap', 'attachMovie',
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

	public static capStyleMapStringToInt:any={"none":0, "round":1, "square":2};
	public static jointStyleMapStringToInt:any={"round":0, "bevel":1, "miter":2};

	private static noScaleDictionary:Object = {
		'normal': LineScaleMode.NORMAL,
		'none': LineScaleMode.NONE,
		'vertical': LineScaleMode.VERTICAL,
		'horizontal': LineScaleMode.HORIZONTAL
	}

	protected _mouseButtonListenerCount:number;
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
                        this.adaptee.mouseChildren = true;
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
        if(!this.enabled){
            this.adaptee.mouseChildren = false;
        }
	}

	public clone(){
        return <AVM1MovieClip>getAVM1Object(this.adaptee.clone(), <AVM1Context>this._avm1Context);
	}
	private attachCustomConstructor(){
        if(this.adaptee){
            var symbolClass:AVM1InterpretedFunction=<AVM1InterpretedFunction>this.adaptee.avm1Symbol;
            if(symbolClass){
                this.alPut("__proto__", symbolClass._ownProperties.prototype.value);
                var myThis=this;
               (<MovieClip>this.adaptee).onCustomConstructor=function(){
                    symbolClass.alCall(myThis);
               }                
            }
        }
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
        AVM1MovieClip.currentMCAssetNameSpace=this.adaptee.assetNamespace;
		AVM1TextField.syncQueedTextfields();
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

	
	public stopAllSounds() {
		var allProps=this.alGetKeys();
		for(var i=0;i<allProps.length;i++){
			var desc=this.alGetProperty(allProps[i]);
			var val=desc?desc.value:null;
			if(val && val._sound && val._sound.isAsset && val._sound.isAsset(WaveAudio)){

				val.stop();
			}
		}
		var child:DisplayObject;
		i=this.adaptee.numChildren;
		while(i>0){
			i--;
			child=this.adaptee.getChildAt(i);
			if(child.isAsset(MovieClip) && child.adapter!=child){
				(<IMovieClipAdapter>child.adapter).freeFromScript();
			}
		}
	}
	// called from adaptee whenever the mc gets reset
	public freeFromScript():void{
        //this.stopAllSounds();
        this.hasSwappedDepth=false;
        super.freeFromScript();
        this._mouseButtonListenerCount=0;

	}
	
	// called from adaptee whenever the mc gets added to a parent
	public doInitEvents():void
	{
        this._dropTarget="";
        this._mouseButtonListenerCount=0;
        AVM1MovieClip.currentMCAssetNameSpace=this.adaptee.assetNamespace;

        // execute the init-actionscript that is stored on timeline
		for (var key in this.adaptee.timeline.avm1InitActions)
			this.executeScript(this.addScript(this.adaptee.timeline.avm1InitActions[key], <any> ("initActionsData" + key)));

        // execute the init-actionscript that is stored on timeline
		if((<any>this).initEvents){
			initializeAVM1Object(this.adaptee, <AVM1Context>this._avm1Context, (<any>this).initEvents);
        }
        this.attachCustomConstructor();
        this.initialDepth=this.adaptee._depthID;
	}


    public registerScriptObject(child:DisplayObject, force:boolean=true):void
	{

		// 	whenever multiple childs get registered for the same name, the child with the lowest depth wins
		//	this is true for objects added via timeline, attachMovie, duplicateMovieClip and CreateEmptyMovieClip and also when renaming objects

		// 	if a avm1 variable for a registered child-name was defined via script, it always wins over the child registration. 
		//	for example, after setting "testMC='something'" in script, trying to get "testMC" will return "something", 
		//	and childs with the name "testMC" will no longer be accessible.
		//	this is true for all datatypes. once a variable is set by script, the value set by script will be returned
		//	also true if the we do something like "testMC=null"

		//	if a avm1 script creates a variable as reference to a registered child, it behaves like this:
		//	the var is not updated if the child registered for the name changes
		//	if we do something like this:
		//			indirectRef = testMC;
		//			this.attachMovie("somethingFromLib", "testMC", -16380)
		//			testMC._x=100;
		//			testMC._y=100;
		//			indirectRef._x=100;
		//			indirectRef._y=100;
		//	this code will move both objects, because the attachMovie changes the object that is available under the name "testMC",
		//	but the indirectRef still holds the reference to the original object.
		//	however, if we remove the original child via removeMovieCLip or if it is removed via timeline, 
		//	the variable will return a reference to the current object that might now be registered 
		//	under the same name as the object that the variable was created for. 

		// 	if a movieclip was tinted by a color object, and than another mc gets registered for the name, the tinting is applied to the new mc


		if(child.adapter!=child)
			(<any>child.adapter).setEnabled(true);

		var name = child.name;
		if(name){
			// 	in AVM1 FP<8, all names ignore case, so we can just convert everything to lower case
			//	for FP>=8, only method names can be handled this way, object names need to keep their case
			
			name=name.toLowerCase();
			
			var hasVar=this.alHasOwnProperty(name);
			if(hasVar){
				// there exists a avm1 var for this name. Object registration should fail
				return;
			}

			//	only register object if:
			//			- no object is registered for this name,
			//			- a already registered object has no valid parent
			//			- the already registered object has a higher depthID than the new object
			if(!this._childrenByName[name] 
				|| (this._childrenByName[name].adaptee && this._childrenByName[name].adaptee.parent==null)
				|| (this._childrenByName[name].adaptee && this._childrenByName[name].adaptee._depthID>child._depthID)){

					if(this._childrenByName[name] && this._childrenByName[name].avmColor){
						// if a object already is registered for this name, and we are going to replace it, 
						// we need to check if it is tinted by a color-class, and if so change the target of the color class to the new object		
						this.unregisteredColors[name]=this._childrenByName[name].avmColor;

					}
					//register new object
					this._childrenByName[name]=getAVM1Object(child, this.context);
					
					// if a object was previous unregistered for this name, we need to check if it was tinted by a color 
					// and if so, we need to apply the tint to the new object
					if(this.unregisteredColors[name]){
						this.unregisteredColors[name].changeTarget(child.adapter);
						this.unregisteredColors[name]=null;
					}
			}


			/* old stuff:
            if(force || !this._childrenByName[child.name] || (this._childrenByName[child.name].adaptee && this._childrenByName[child.name].adaptee.parent==null) ||
                this._childrenByName[child.name].adaptee._depthID>child._depthID){
				
				
                // only replace value if no property exists yet, or if a existing prop was a Away-Object
                var existingValue=this.alGet(child.name);
                if(existingValue && existingValue.adaptee){
                    this.alPut(child.name, child.adapter);
                    if(this.scriptRefsToChilds[child.name]){     
                        // update indirectReferences to this prop
                        this.scriptRefsToChilds[child.name].obj.alPut(this.scriptRefsToChilds[child.name].name, child.adapter);
                    }
                }
                else if(existingValue){
                }
                else{
                    this.alPut(child.name, child.adapter);
                    if(this.scriptRefsToChilds[child.name]){     
                        // update indirectReferences to this prop
                        this.scriptRefsToChilds[child.name].obj.alPut(this.scriptRefsToChilds[child.name].name, child.adapter);
                    }
                }
                if(this.unregisteredColors[child.name]){
                    this.unregisteredColors[child.name].changeTarget(child.adapter);
                    this.unregisteredColors[child.name]=null;
                }
                // always register the child by name on the parent, no matter what avm1prop existed previously
				this._childrenByName[child.name]=child._adapter;
			}
			*/
            /*
			else{
				
				this._unregisteredChilds[child.name]=child;
            }
            */
		}
	}

    private unregisteredColors:any={};
	public unregisterScriptObject(child:DisplayObject):void
	{
		if(child && child.adapter != child)
			(<any>child.adapter).alPut("onEnterFrame", null);
		var name = child.name;
		if(name){
			// 	in AVM1 FP<8, all names ignore case, so we can just convert everything to lower case
			//	for FP>=8, only method names can be handled this way, object names need to keep their case
			name=name.toLowerCase();
			if(this._childrenByName[name] && this._childrenByName[name].adaptee.id==child.id){
		
				if(this._childrenByName[name] && this._childrenByName[name].avmColor){
					this.unregisteredColors[name]=this._childrenByName[name].avmColor;
				}

				// 	check if there is another child with the same name on the movieclip
				//	and if so, register it instead
				//	if multiple childs match the name, get the one with highest depth
				//	attention: at this point the child that we unregister right now is still child of the mc
				var allChilds=this.adaptee._children;
				var allChildsLen=allChilds.length;
				var tmpChild=null;
				var newChild=null;
				for(var i=0; i<allChildsLen; i++){
					tmpChild=allChilds[i];
					if(tmpChild!=child && tmpChild.name && tmpChild.name.toLowerCase()==name){
						
						if(!newChild || newChild._depthID>tmpChild._depthID){
							newChild=tmpChild;
						}
					}
				}

				//	if we have a new child to register, we register it
				//	if not, we delete the registration for this name
				if(newChild){
					this._childrenByName[name]=getAVM1Object(newChild, this.context);
					
					if(this.unregisteredColors[name]){
						this.unregisteredColors[name].changeTarget(newChild.adapter);
						this.unregisteredColors[name]=null;
					}
				}
				else{
					delete this._childrenByName[name];
				}
			}
		}
	}

	public getLatestObjectForName(name:string) {

		var hasVar=this.alHasOwnProperty(name);
		if(hasVar){
			// there exists a avm1 var for this name. Object registration should fail
			return;
		}
		var allChilds=this.adaptee._children;
		var allChildsLen=allChilds.length;
		var tmpChild=null;
		var newChild=null;
		for(var i=0; i<allChildsLen; i++){
			tmpChild=allChilds[i];
			if(tmpChild.name && tmpChild.name.toLowerCase()==name){
				
				if(!newChild || newChild._depthID>tmpChild._depthID){
					newChild=tmpChild;
				}
			}
		}

		//	if we have a new child to register, we register it
		//	if not, we delete the registration for this name
		if(newChild){
			this._childrenByName[name]=getAVM1Object(newChild, this.context);
			if(this.unregisteredColors[name]){
				this.unregisteredColors[name].changeTarget(newChild.adapter);
				this.unregisteredColors[name]=null;
			}
		}
	}

	private _hitArea: any;
	private _lockroot: boolean;

	private get graphics() : Graphics {
		return this.adaptee.graphics;
    }
    
	public initAVM1SymbolInstance(context: AVM1Context, awayObject: any) {//MovieClip
		this._childrenByName = Object.create(null);
		super.initAVM1SymbolInstance(context, awayObject);
		this.dragListenerDelegate = (event) => this.dragListener(event);
		this.stopDragDelegate = (event) => this.stopDrag(event);

		this.dynamicallyCreated=false;
		this.adaptee=awayObject;
		this._initEventsHandlers();
	}

	_lookupChildByName(name: string): AVM1Object {
		release || assert(alIsName(this.context, name));
		return this._childrenByName[name];
	}

	private _lookupChildInAS3Object(name: string): AVM1Object {
		var lookupOptions = LookupChildOptions.INCLUDE_NON_INITIALIZED;
		if (!this.context.isPropertyCaseSensitive) {
			lookupOptions |= LookupChildOptions.IGNORE_CASE;
		}
		//80pro todo lookupOptions
		var as3Child = this.adaptee.getChildByName(name);//, lookupOptions);
		return getAVM1Object(as3Child, this.context);
	}

	public get __targetPath() {
		//return "";
		var target = this.get_target();
		var as3Root = this.adaptee.root;
		release || Debug.assert(as3Root);
		var level = this.context.levelsContainer._getLevelForRoot(as3Root);
		release || Debug.assert(level >= 0);
		var prefix = '_level' + level;
		return target != '/' ? prefix + target.replace(/\//g, '.') : prefix;

	}
	
	public getAwayJSID(): number {
		return this.adaptee.id;
    }
    
	public attachAudio(id: any): void {
		if (isNullOrUndefined(id)) {
			return; // ignoring all undefined objects, probably nothing to attach
		}
		if (id === false) {
			return; // TODO stop playing all attached audio source (when implemented).
		}
		// TODO implement NetStream and Microphone objects to make this work.
		notImplemented('AVM1MovieClip.attachAudio');
	}

	public attachBitmap(bmp:AVM1BitmapData, depth:number, pixelSnapping:string = 'auto', smoothing:boolean = false): void {
		pixelSnapping = alCoerceString(this.context, pixelSnapping);
		smoothing = alToBoolean(this.context, smoothing);
		var awayBitmapImage2D = bmp.as3BitmapData;
		awayBitmapImage2D.transparent=true;
		var billboardMaterial:MethodMaterial = new MethodMaterial(awayBitmapImage2D);
		billboardMaterial.alphaBlending=true;
		billboardMaterial.useColorTransform=true;
		
		var billboard: Billboard = new Billboard(billboardMaterial, pixelSnapping, smoothing);// this.context.sec.flash.display.Bitmap.axClass.axConstruct([as3BitmapData, pixelSnapping, smoothing]);
		this._insertChildAtDepth(billboard, depth);
	}

	public _constructMovieClipSymbol(symbolId:string, name:string): MovieClip {
		symbolId = alToString(this.context, symbolId);
		name = alToString(this.context, name);

		var symbol = AssetLibrary.getAsset(symbolId, this.adaptee.assetNamespace);
		if (!symbol) {
			return undefined;
		}

		/*
		var props: SpriteSymbol = Object.create(symbol.symbolProps);
		props.avm1Name = name;
		*/
		var mc:MovieClip;
		mc = (<any>symbol.adaptee).clone();//constructClassFromSymbol(props, this.context.sec.flash.display.MovieClip.axClass);
        mc.name=name;
		getAVM1Object(mc,<any>this._avm1Context);
		return mc;
	}

	public get$version(): string {
		return "";
		//return Capabilities.version;
	}

	public rgbaToArgb(float32Color:number):number
	{
		var r:number = ( float32Color & 0xff000000 ) >>> 24;
		var g:number = ( float32Color & 0xff0000 ) >>> 16;
		var b:number = ( float32Color & 0xff00 ) >>> 8;
		var a:number = float32Color & 0xff;
		return (a << 24) | (r << 16) | (g << 8) | b;
	}
	public attachMovie(symbolId, name, depth, initObject) {
		
		if(!this._constructMovieClipSymbol)
			return;
		var mc = this._constructMovieClipSymbol(symbolId, name);
		if (!mc) {
			return undefined;
		}
		depth = alToNumber(this.context, depth);

		var oldAVMMC=this._childrenByName[name];

		//console.log("attachMovie", name, avm2AwayDepth(depth));
		var avmMc = <AVM1MovieClip>this._insertChildAtDepth(mc, avm2AwayDepth(depth));
		if (initObject) {
			avmMc._init(initObject);
		}
		if(oldAVMMC && oldAVMMC.avmColor){
			oldAVMMC.avmColor.changeTarget(avmMc);
		}
        if(mc.timeline && mc.timeline.isButton){
            mc.addButtonListeners();
        }
		avmMc.dynamicallyCreated=true;
		this.registerScriptObject(mc, false);
		return avmMc;
	}

	public beginFill(color: number, alpha:number): void {
		color = alToInt32(this.context, color);
        if(typeof alpha=="undefined"){
            if(arguments.length==2){                
                // alpha was set with "undefined" variable - should be 0
                alpha=0;
            }
            else if(arguments.length<=1){  
                // alpha was not set at all - should be 100
                alpha=100;
            }
        }
		alpha = alToNumber(this.context, alpha);
		this.graphics.beginFill(color, alpha / 100.0);
	}

	public beginBitmapFill(bmp: AVM1BitmapData, matrix: AVM1Object = null,
						   repeat: boolean = false, smoothing: boolean = false): void {
		if (!alInstanceOf(this.context, bmp, this.context.globals.BitmapData)) {
			return; // skipping operation if first parameter is not a BitmapData.
		}
		var bmpNative = toAS3BitmapData(bmp);
		var matrixNative = isNullOrUndefined(matrix) ? null : toAS3Matrix(matrix);
		repeat = alToBoolean(this.context, repeat);
		smoothing = alToBoolean(this.context, smoothing);

		notImplemented('AVM1MovieClip.beginBitmapFill');
		//this.graphics.beginBitmapFill(bmpNative.adaptee, matrixNative, repeat, smoothing);
	}

	public beginGradientFill(fillType: GradientType, colors: AVM1Object, alphas: AVM1Object,
							 ratios: AVM1Object, matrix: AVM1Object,
							 spreadMethod: string = 'pad', interpolationMethod: string = 'rgb',
							 focalPointRatio: number = 0.0): void {
		var context = this.context, sec = context.sec;
		// fillType = alToString(this.context, fillType);
		var colorsNative = sec.createArray(
			AVM1ArrayNative.mapToJSArray(colors, (item) => alToInt32(this.context, item)));
		var alphasNative = sec.createArray(
			AVM1ArrayNative.mapToJSArray(alphas, (item) => alToNumber(this.context, item) / 100.0));
		var ratiosNative = sec.createArray(
			AVM1ArrayNative.mapToJSArray(ratios, (item) => alToNumber(this.context, item)));
		var matrixNative = null;
		if (isNullOrUndefined(matrix)) {
			somewhatImplemented('AVM1MovieClip.beginGradientFill');
		}
		spreadMethod = alToString(this.context, spreadMethod);
		interpolationMethod = alToString(this.context, interpolationMethod);
		focalPointRatio = alToNumber(this.context, focalPointRatio);
		this.graphics.beginGradientFill(fillType, colorsNative, alphasNative, ratiosNative, matrixNative,
			spreadMethod, interpolationMethod, focalPointRatio);
	}
	
	public _callFrame(frame:any):any {		
		var script;
		if (typeof frame === "string")
			script=this.adaptee.timeline.getScriptForLabel(this.adaptee, frame);
		else if(typeof frame === "number")
			script = this.adaptee.timeline.get_script_for_frame(this.adaptee, frame-1);
		if(script)
			this.executeScript(script);
	}



	public clear(): void {
		this.graphics.clear();
	}

	/**
	 * This map stores the AVM1MovieClip's children keyed by their names. It's updated by all
	 * operations that can cause different results for name-based lookups. these are
	 * addition/removal of children and swapDepths.
	 *
	 * Using this map instead of always relaying lookups to the AVM2 MovieClip substantially
	 * reduces the time spent in looking up children. In some cases by two orders of magnitude.
	 */
	private _childrenByName: Map<string, AVM1MovieClip>;

	private _insertChildAtDepth<T extends DisplayObject>(mc: T, depth:number): AVM1Object {
		this.adaptee.addChildAtDepth(mc, depth);
		return getAVM1Object(mc, <AVM1Context>this._avm1Context);
	}

	public _updateChildName(child: AVM1MovieClip, oldName: string, newName: string) {
		oldName && this._removeChildName(child, oldName);
		newName && this._addChildName(child, newName);
    }
    
	_removeChildName(child: IAVM1SymbolBase, name: string) {
		release || assert(name);
		if (!this.context.isPropertyCaseSensitive) {
			name = name.toLowerCase();
		}
		if(!this._childrenByName || !this._childrenByName[name])
			return;
		if (this._childrenByName[name] !== child) {
			return;
		}
		var newChildForName = this._lookupChildInAS3Object(name);
		if (newChildForName) {
			this._childrenByName[name] = newChildForName;
		} else {
			delete this._childrenByName[name];
		}
	}

	_addChildName(child: IAVM1SymbolBase, name: string) {
		release || assert(name);
		if (!this.context.isPropertyCaseSensitive) {
			name = name.toLowerCase();
		}
		release || assert(this._childrenByName[name] !== child);
		var currentChild = this._childrenByName[name];
		if (!currentChild || currentChild.getDepth() > child.getDepth()) {
			this._childrenByName[name] = child;
		}
	}

	public createEmptyMovieClip(name, depth): AVM1MovieClip {
        name = alToString(this.context, name);
        var mc: MovieClip;
        if(this.alHasProperty(name)){
            var existingObj=this.alGet(name);
            if(existingObj && existingObj instanceof AVM1MovieClip){
                //existingObj.adaptee.reset();
                //existingObj.adaptee.graphics.clear();
                //this.adaptee.invalidate();
                mc=existingObj.adaptee;
            }
            //return existingObj;
        }
        if(!mc){
            mc = new MovieClip();
            mc.name = name;
            mc.assetNamespace=this.adaptee.assetNamespace;
            getAVM1Object(mc,  <AVM1Context>this._avm1Context);
        }
		//console.log("createEmptyMovieClip", name, avm2AwayDepth(depth));
		var avmMC:AVM1MovieClip=<AVM1MovieClip>this._insertChildAtDepth(mc, avm2AwayDepth(depth));
		avmMC.dynamicallyCreated=true;
		this.registerScriptObject(mc, false);
		// dynamicallyCreated needs to be set after adding child, otherwise it gets reset
		return avmMC;
	}


	public createTextField(name, depth, x, y, width, height): AVM1TextField {
		name = alToString(this.context, name);
		var text: TextField = new TextField();
		text.name = name;
		text.textFormat = new TextFormat();
		getAVM1Object(text,  <AVM1Context>this._avm1Context);
		var myTF=<AVM1TextField>this._insertChildAtDepth(text,  avm2AwayDepth(depth));
		this.registerScriptObject(text, false);
		text.x = x;
		text.y = y;
		text.width = width;
        text.height = height;
        myTF.dynamicallyCreated=true;
		return myTF;
	}

	public get_currentframe() {
		return this.adaptee.currentFrameIndex+1;
	}

	public curveTo(controlX: number, controlY: number, anchorX: number, anchorY: number): void {
		controlX = alToNumber(this.context, controlX);
		controlY = alToNumber(this.context, controlY);
		anchorX = alToNumber(this.context, anchorX);
		anchorY = alToNumber(this.context, anchorY);
		this.graphics.curveTo(controlX, controlY, anchorX, anchorY);
	}

	private _dropTarget:string;
	public setDropTarget(dropTarget:DisplayObject) {
		if(dropTarget){
			//console.log((<AVMRaycastPicker>AVM1Stage.stage.view.mousePicker).getDropTarget().name);
			var names:string[]=[];
			while (dropTarget){
				if(dropTarget.isAVMScene){
					dropTarget=null;
				}
				else{
					if (dropTarget.name != null)
						names.push(dropTarget.name);
					dropTarget=dropTarget.parent;
				}
			}
			var i:number=names.length;
			var mc_path:string="";
			while(i>0){
				mc_path+="/";
				i--;
				mc_path+=names[i];
			}
			//console.log(mc_path);
			
			this._dropTarget=mc_path;
			return;

		}
		this._dropTarget="";
	}
	public get_droptarget() {
		return this._dropTarget;

	}

	public duplicateMovieClip(name, depth, initObject): AVM1MovieClip {
		name = alToString(this.context, name);
		if(name==this.adaptee.name){
			return this;
		}
		var parent = this.get_parent();
		if(!parent){
			warning("AVM1MovieClip.duplicateMovieClip could not get parent");
			parent=this.context.resolveTarget(null);
		}
		var mc: MovieClip;
		if (this.adaptee._symbol) {
			notImplemented('AVM1MovieClip.duplicateMovieClip from symbol');
			//mc = constructClassFromSymbol(nativeAS3Object._symbol, nativeAS3Object.axClass);
		} else {
			mc = (<any>this).clone().adaptee;//new this.context.sec.flash.display.MovieClip();
		}
		mc.name = name;
		(<any>mc.adapter).placeObjectTag=(<any>this).placeObjectTag;
		(<any>mc.adapter).initEvents=(<any>this).initEvents;

		var avmMc = <AVM1MovieClip>parent._insertChildAtDepth(mc,  avm2AwayDepth(depth));
		// dynamicallyCreated needs to be set after adding child, otherwise it gets reset
		avmMc.dynamicallyCreated=true;
		avmMc._avm1Context=this._avm1Context;
		parent.registerScriptObject(mc, false);


		var new_matrix:Matrix3D = mc.transform.matrix3D;
		var originalMatrix:Float32Array = this.adaptee.transform.matrix3D._rawData;
		new_matrix._rawData[0] = originalMatrix[0];
		new_matrix._rawData[1] = originalMatrix[1];
		new_matrix._rawData[4] = originalMatrix[4];
		new_matrix._rawData[5] = originalMatrix[5];
		new_matrix._rawData[12] = originalMatrix[12];
		new_matrix._rawData[13] = originalMatrix[13];
		mc.transform.invalidateComponents();

		mc.alpha = this.adaptee.alpha;
		mc.blendMode = this.adaptee.blendMode;
		mc.cacheAsBitmap = this.adaptee.cacheAsBitmap;
		if (initObject) {
			avmMc._init(initObject);
		}
		return avmMc;
	}

	public endFill(): void {
		this.graphics.endFill();
	}

	public getForceSmoothing(): boolean {
		notImplemented('AVM1MovieClip.getForceSmoothing');
		return false;
	}

	public setForceSmoothing(value: boolean) {
		value = alToBoolean(this.context, value);
		notImplemented('AVM1MovieClip.setForceSmoothing');
	}

	public get_framesloaded() {
		notImplemented('AVM1MovieClip.get_framesloaded');
		return 0;//this.adaptee.framesLoaded;
	}

	public getBounds(bounds): AVM1Object {
		var obj = <DisplayObject>getAwayJSAdaptee(bounds);
		if (!obj) {
			return undefined;
		}
		return convertAS3RectangeToBounds(PickGroup.getInstance((<AVM1Stage>this.context.globals.Stage)._awayAVMStage.scene.renderer.view).getBoundsPicker(this.adaptee.partition).getBoxBounds(obj, true), this.context);
	}

	public getBytesLoaded(): number {
		//var loaderInfo = this.adaptee.loaderInfo;
		return this.adaptee.currentFrameIndex>=0?100:-1;//loaderInfo.bytesLoaded;
	}

	public getBytesTotal() {
		//var loaderInfo = this.adaptee.loaderInfo;
		return 100;//loaderInfo.bytesTotal;
	}

	public getInstanceAtDepth(depth: number): AVM1MovieClip {
		//Debug.notImplemented('AVM1MovieClip.getInstanceAtDepth');
		// 80pro: why does this always return movieclip ?
		// todo: check if in as3 this could be a textfield
		var child:DisplayObject=this.adaptee.getChildAtDepth( avm2AwayDepth(depth));
		if(!child){
			return null;
		}
		if(child.isAsset(Billboard)){
			return this;
		}
		else if(child.isAsset(MovieClip)){
			return this;
		}
		return <AVM1MovieClip>getAVM1Object(child, this.context);

		/*
		var symbolDepth = alCoerceNumber(this.context, depth) + DEPTH_OFFSET;
		var nativeObject = this.adaptee;
		var lookupChildOptions = LookupChildOptions.INCLUDE_NON_INITIALIZED;
		for (var i = 0, numChildren = nativeObject.numChildren; i < numChildren; i++) {
			var child = nativeObject._lookupChildByIndex(i, lookupChildOptions);
			// child is null if it hasn't been constructed yet. This can happen in InitActionBlocks.
			if (child && child._depth === symbolDepth) {
				// Somewhat absurdly, this method returns the mc if a bitmap is at the given depth.
				if (this.context.sec.flash.display.Bitmap.axIsType(child)) {
					return this;
				}
				return <AVM1MovieClip>getAVM1Object(child, this.context);
			}
		}
		return undefined;
		*/
	}

	public getNextHighestDepth(): number {
		return away2avmDepth(this.adaptee.getNextHighestDepth());
	}

	public getRect(bounds): AVM1Object {
		var obj = <DisplayObject>getAwayJSAdaptee(bounds);
		if (!obj) {
			return undefined;
		}
		return convertAS3RectangeToBounds(PickGroup.getInstance((<AVM1Stage>this.context.globals.Stage)._awayAVMStage.scene.renderer.view).getBoundsPicker(this.adaptee.partition).getBoxBounds(obj), this.context);
	}

	public getSWFVersion(): number {
		var loaderInfo = <LoaderInfo>this.adaptee.loaderInfo;
		return 0;//loaderInfo.swfVersion;
	}

	public getTextSnapshot() {
		notImplemented('AVM1MovieClip.getTextSnapshot');
	}

	public getURL(url, window, method) {
		var request = new URLRequest(url);
		if (method) {
			request.method = method;
		}
		FlashNetScript_navigateToURL(request, window);
	}

	public globalToLocal(pt) {
        if(!pt)
            return;
		var tmp = toAS3Point(pt);
		this.adaptee.transform.globalToLocal(tmp, tmp);
		copyAS3PointTo(tmp, pt);
	}

	public gotoAndPlay(frame) {
		if (this.protoTypeChanged || frame == null)
            return;
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

		if (typeof frame === "string"){
			if(this.adaptee.timeline._labels[frame.toLowerCase()]==null){
				frame=parseInt(frame);
				if(!isNaN(frame)){
					this.adaptee.currentFrameIndex = (<number>frame)-1;
					this.adaptee.play();
				}
				return;
			}
        }
        if(typeof frame ==="number" && frame<=0)
            return;
		this.adaptee.play();
		this._gotoFrame(frame);
	}

	public gotoAndStop(frame) {
		if (this.protoTypeChanged || frame == null)
			return;
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
        
        if(typeof frame ==="number" && frame<=0)
            return;
		this.adaptee.stop();
		this._gotoFrame(frame);
	}

	private _gotoFrame(frame:any):void
	{
		if(typeof frame==="number"){
			if(frame % 1!==0){
				frame=frame.toString();
			}
		} 
		if (typeof frame === "string"){
			
			if(this.adaptee.timeline._labels[frame.toLowerCase()]==null){
				frame=parseInt(frame);
				if(!isNaN(frame)){
					this.adaptee.currentFrameIndex = (<number>frame)-1;
				}
				return;
			}
			this.adaptee.jumpToLabel(<string>frame.toLowerCase());
		}
		else{
			this.adaptee.currentFrameIndex = (<number>frame) - 1;
		}
	}
	public getHitArea() {
		return this._hitArea;
	}

	public setHitArea(value) {
		// The hitArea getter always returns exactly the value set here, so we have to store that.
		this._hitArea = value;
		var obj = value ? <DisplayObject>getAwayJSAdaptee(value) : null;
		if(obj && !obj.isAsset(MovieClip))
			obj = null;

		// 	MA_GBR_0700AAx0100 is the first lesson encountered that makes use of hitArea
		// 	if the hitArea is set, the mouse-interactions on the ducks stop working
		//	this.adaptee.hitArea=obj;
	}

	public hitTest(x: number, y: number, shapeFlag: boolean): boolean {
		if (arguments.length <= 1) {
			// Alternative method signature: hitTest(target: AVM1Object): boolean
            var target = arguments[0];
            if(typeof target ==="string"){
                target=this.context.resolveTarget(target);
            }
			if (isNullOrUndefined(target) || !hasAwayJSAdaptee(target)) {
				return false; // target is undefined or not a AVM1 display object, returning false.
			}
			return PickGroup.getInstance((<AVM1Stage>this.context.globals.Stage)._awayAVMStage.scene.renderer.view).getBoundsPicker(this.adaptee.partition).hitTestObject(PickGroup.getInstance((<AVM1Stage>this.context.globals.Stage)._awayAVMStage.scene.renderer.view).getBoundsPicker((<DisplayObject>getAwayJSAdaptee(target)).partition));
		}
		x = alToNumber(this.context, x);
		y = alToNumber(this.context, y);
		x+=this.get_root().get_x();
		y+=this.get_root().get_y();
		shapeFlag = alToBoolean(this.context, shapeFlag);
		return PickGroup.getInstance((<AVM1Stage>this.context.globals.Stage)._awayAVMStage.scene.renderer.view).getBoundsPicker(this.adaptee.partition).hitTestPoint(x, y, shapeFlag);
	}

	public lineGradientStyle(fillType: GradientType, colors: AVM1Object, alphas: AVM1Object,
							 ratios: AVM1Object, matrix: AVM1Object,
							 spreadMethod: string = 'pad', interpolationMethod: string = 'rgb',
							 focalPointRatio: number = 0.0): void {
		var context = this.context, sec = context.sec;
		// fillType = alToString(this.context, fillType);
		var colorsNative = sec.createArray(
			AVM1ArrayNative.mapToJSArray(colors, (item) => alToInt32(this.context, item)));
		var alphasNative = sec.createArray(
			AVM1ArrayNative.mapToJSArray(alphas, (item) => alToNumber(this.context, item) / 100.0));
		var ratiosNative = sec.createArray(
			AVM1ArrayNative.mapToJSArray(ratios, (item) => alToNumber(this.context, item)));
		var matrixNative = null;
		if (isNullOrUndefined(matrix)) {
			somewhatImplemented('AVM1MovieClip.lineGradientStyle');
		}
		spreadMethod = alToString(this.context, spreadMethod);
		interpolationMethod = alToString(this.context, interpolationMethod);
		focalPointRatio = alToNumber(this.context, focalPointRatio);
		this.graphics.lineGradientStyle(fillType, colorsNative, alphasNative, ratiosNative, matrixNative, spreadMethod, interpolationMethod, focalPointRatio);
	}


	
	public lineStyle(thickness: number = NaN, rgb: number = 0x000000,
					 alpha: number = 100, pixelHinting: boolean = false,
					 noScale: string = 'normal', capsStyle: string = 'round',
					 jointStyle: string = 'round', miterLimit: number = 3): void {
		thickness = alToNumber(this.context, thickness);
		rgb = alToInt32(this.context, rgb);
		pixelHinting = alToBoolean(this.context, pixelHinting);
		noScale = alToString(this.context, noScale);
		var capsStyleInt = AVM1MovieClip.capStyleMapStringToInt[alToString(this.context, capsStyle)];
		var jointStyleInt = AVM1MovieClip.jointStyleMapStringToInt[alToString(this.context, jointStyle)];
		miterLimit = alToNumber(this.context, miterLimit);
		this.graphics.lineStyle(thickness, rgb, alpha / 100.0, pixelHinting, AVM1MovieClip.noScaleDictionary[noScale], capsStyleInt, jointStyleInt, miterLimit);
	}

	public lineTo(x: number, y: number): void {
		x = toTwipFloor(alToNumber(this.context, x));
		y = toTwipFloor(alToNumber(this.context, y));
		this.graphics.lineTo(x, y);
	}

	public loadMovie(url: string, method: string) {

		var loaderHelper = new AVM1LoaderHelper(this.context);
		loaderHelper.load(url, method).then(function () {
			if(loaderHelper.content==null){
				warning("loadMovie - content is null");
				return;
			}
			this.adaptee.timeline=(<MovieClip>loaderHelper.content).timeline;
			this.adaptee.assetNamespace=loaderHelper.content.assetNamespace;
			this.adaptee.reset(true);
		}.bind(this));
	}

	public loadVariables(url: string, method?: string) {
		(<any>this.context).actions._loadVariables(this, url, method);
	}

	public localToGlobal(pt) {
        if(!pt){
            return;
        }
		var tmp = toAS3Point(pt);
		this.adaptee.transform.localToGlobal(tmp, tmp);
		copyAS3PointTo(tmp, pt);
	}

	public get_lockroot(): boolean {
		return this._lockroot;
	}

	public set_lockroot(value: boolean) {
		somewhatImplemented('AVM1MovieClip._lockroot');
		this._lockroot = alToBoolean(this.context, value);
	}

	public moveTo(x: number, y: number): void {
		x = toTwipFloor(alToNumber(this.context, x));
		y = toTwipFloor(alToNumber(this.context, y));
		this.graphics.moveTo(x, y);
	}

	public nextFrame() {
		++this.adaptee.currentFrameIndex;
	}

	public nextScene() {
		notImplemented('AVM1MovieClip.nextScene');
	}

	public play() {
		this.adaptee.play();
	}

	public prevFrame() {
        --this.adaptee.currentFrameIndex;
        this.adaptee.stop();
	}

	public prevScene() {
		notImplemented('AVM1MovieClip.prevScene');
	}


	public setMask(mc:Object) {
		if (mc == null) {
			// Cancel a mask.
			this.adaptee.mask = null;
			return;
		}
		var mask = this.context.resolveTarget(mc);
		if (mask) {
			this.adaptee.mask = <DisplayObject>getAwayJSAdaptee(mask);
		}
	}

	public startDrag(lock?: boolean, left?: number, top?: number, right?: number, bottom?: number): void {
        AVM1MovieClip.currentDraggedMC=this;
		lock = alToBoolean(this.context, lock);
		this._dragBounds=null;
		if(left>right){
			var tmp=right;
			right=left;
			left=tmp;
		}
		if(top>bottom){
			var tmp=bottom;
			bottom=top;
			top=tmp;
		}
		if (arguments.length > 1) {
			left = alToNumber(this.context, left);
			top = alToNumber(this.context, top);
			right = alToNumber(this.context, right);
			bottom = alToNumber(this.context, bottom);
			//console.log("left", left,"top", top, "right", right, "bottom", bottom );
			this._dragBounds = new Rectangle(left, top, right - left, bottom - top);
		}//todo: listen on stage
		if(!this.isDragging){
			this.isDragging=true;
			this.startDragPoint=this.adaptee.parent.transform.globalToLocal(new Point((<any>this.context.globals.Stage)._awayAVMStage.mouseX, (<any>this.context.globals.Stage)._awayAVMStage.mouseY));
            if(lock){
                this.adaptee.x=this.startDragPoint.x;
                this.adaptee.y=this.startDragPoint.y;
            }
            if(this._dragBounds)
                this.checkBounds();
			this.startDragMCPosition.x=this.adaptee.x;
			this.startDragMCPosition.y=this.adaptee.y;
			AVM1Stage.stage.addEventListener("mouseMove3d", this.dragListenerDelegate);
			//window.addEventListener("mouseup", this.stopDragDelegate);
			//window.addEventListener("touchend", this.stopDragDelegate);
			AVM1Stage.stage.scene.mousePicker.dragEntity=this.adaptee;
			MouseManager.getInstance(AVM1Stage.stage.scene.renderer.renderGroup.pickGroup).isAVM1Dragging=true;

		}
	}

	private isDragging:boolean=false;
	private startDragPoint:Point=new Point();
	private startDragMCPosition:Point=new Point();
	private _dragBounds:any;
	public dragListenerDelegate:(e)=>void;

	public dragListener(e){
		//console.log("drag", e);
		//console.log("mouseX", (<any>this.context.globals.Stage)._awayAVMStage.mouseX);
		//console.log("mouseY", (<any>this.context.globals.Stage)._awayAVMStage.mouseY);

		if(this.adaptee.parent){
			var tmpPoint=this.adaptee.parent.transform.globalToLocal(new Point((<any>this.context.globals.Stage)._awayAVMStage.mouseX, (<any>this.context.globals.Stage)._awayAVMStage.mouseY));
	
			this.adaptee.x=this.startDragMCPosition.x+(tmpPoint.x-this.startDragPoint.x);
			this.adaptee.y=this.startDragMCPosition.y+(tmpPoint.y-this.startDragPoint.y);
	
			if(this._dragBounds)
				this.checkBounds();

		}
			
		
	}
	public checkBounds(){
    
        if(this.adaptee.x<(this._dragBounds.left)){
            this.adaptee. x=this._dragBounds.left;
        }
        if(this.adaptee.x>(this._dragBounds.right)){
            this.adaptee.x=(this._dragBounds.right);
        }
        if(this.adaptee.y<this._dragBounds.top){
            this.adaptee.y=this._dragBounds.top;
        }
        if(this.adaptee.y>(this._dragBounds.bottom)){
            this.adaptee.y=this._dragBounds.bottom;
        }
    }
	public stop() {
		if(AVM1MovieClip.pokiSDKonStopAction && AVM1MovieClip.pokiSDKonStopActionChildName && this.adaptee.getChildByName(AVM1MovieClip.pokiSDKonStopActionChildName)){
			AVM1MovieClip.pokiSDKonStopAction();//console.log("called stop on retry mc")
		}
		if(AVM1MovieClip.pokiSDKonStopAction && AVM1MovieClip.pokiSDKonStopActionChildName=="all"){
			AVM1MovieClip.pokiSDKonStopAction();
		}
		return this.adaptee.stop();
	}
	public stopDragDelegate:(e)=>void;
	public stopDrag(e=null) {
		this.isDragging=false;
        AVM1MovieClip.currentDraggedMC=null;
		AVM1Stage.stage.scene.mousePicker.dragEntity=null;
		MouseManager.getInstance(AVM1Stage.stage.scene.renderer.renderGroup.pickGroup).isAVM1Dragging=true;
		AVM1Stage.stage.removeEventListener("mouseMove3d", this.dragListenerDelegate);
		window.removeEventListener("mouseup", this.stopDragDelegate);
		window.removeEventListener("touchend", this.stopDragDelegate);
	}

	public swapDepths(target: any): void {
        //return;
		// if this is the scene, or if no parent exists, we do not want to do anything
		if(this.adaptee.isAVMScene || !this.get_parent()){
			return;
		}
		var parent:MovieClip = <MovieClip>getAwayJSAdaptee(this.get_parent());
		if (!parent){
			warning("AVM1MovieClip.swapDepth called for object with no parent");
			return;
		}
		if (typeof target === 'undefined') {
			warning("AVM1MovieClip.swapDepth called with undefined as target depth");
			return;
		}
		if (typeof target === 'number') {
			//console.log("swap to number", this.adaptee.name, target);
			parent.swapDepths(this.adaptee, avm2AwayDepth(target));
		}
		else if(target.adaptee){
            target._blockedByScript=true;
            target._ctBlockedByScript=true;
			//console.log("swap to children", this.adaptee.name, target.adaptee.name);
			parent.swapChildren(this.adaptee, target.adaptee);
        }
        this._blockedByScript=true;
        this._ctBlockedByScript=true;

        if(this.adaptee._depthID==this.initialDepth){
            this.hasSwappedDepth=false;
        }
        else{
            this.hasSwappedDepth=true;
		}
		if(this.adaptee.name && parent && parent.adapter){
			// the object has a name, and might be registered for access via script
			// we need to check if that registration must be updated to another mc that has a higher depth
			(<AVM1MovieClip>parent.adapter).getLatestObjectForName(this.adaptee.name.toLowerCase());
		}

	}
	public getTabChildren(): boolean {
		return getAwayObjectOrTemplate(this).tabChildren;
	}

	public setTabChildren(value: boolean) {
		getAwayObjectOrTemplate(this).tabChildren = alToBoolean(this.context, value);
	}

	public get_totalframes(): number {
		return this.adaptee.numFrames;
	}

	public getTrackAsMenu(): boolean {
		notImplemented("AVM1MovieClip.getTrackAsMenu()");
		return getAwayObjectOrTemplate(this).trackAsMenu;
	}

	public setTrackAsMenu(value: boolean) {
		notImplemented("AVM1MovieClip.setTrackAsMenu()");
		getAwayObjectOrTemplate(this).trackAsMenu = alToBoolean(this.context, value);
	}


	public unloadMovie() {
		var nativeObject = this.adaptee;
		this.adaptee.constructedKeyFrameIndex=0;
		this.adaptee.stop();
		nativeObject.removeChildren(0, nativeObject.numChildren);
		if((this.dynamicallyCreated || this.hasSwappedDepth) && nativeObject.parent && nativeObject.parent.adapter){
			(<AVM1MovieClip>nativeObject.parent.adapter).unregisterScriptObject(nativeObject);
		}
	}

	public getUseHandCursor() {
		return this.adaptee.useHandCursor;
	}

	public setUseHandCursor(value) {
		if(!this.adaptee)
			return;
		this.adaptee.useHandCursor=value;
	}

	public setParameters(parameters: any): any {
		for (var paramName in parameters) {
			if (!this.alHasProperty(paramName)) {
				this.alPut(paramName, parameters[paramName]);
			}
		}
	}

	// Special and children names properties resolutions

	private _resolveLevelNProperty(name: string): AVM1MovieClip {
		release || assert(alIsName(this.context, name));
		if (name === '_level0') {
			return this.context.resolveLevel(0);
		} else if (name === '_root') {
			return this.context.resolveRoot();
		} else if (name.indexOf('_level') === 0) {
			var level = name.substring(6);
			var levelNum = <any>level | 0;
			if (levelNum > 0 && <any>level == levelNum) {
				return this.context.resolveLevel(levelNum)
			}
		}
		return null;
	}

	private _cachedPropertyResult;
	private _getCachedPropertyResult(value) {
		if (!this._cachedPropertyResult) {
			this._cachedPropertyResult = {
				flags: AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_ENUM, value: value
			};
		} else {
			this._cachedPropertyResult.value = value;
		}
		return this._cachedPropertyResult;
	}

	public alGetOwnProperty(name): AVM1PropertyDescriptor {
		var desc = super.alGetOwnProperty(name);
		if (desc) {
			return desc;
		}
		if (name[0] === '_') {
			if ((name[1] === 'l' && name.indexOf('_level') === 0 ||
					name[1] === 'r' && name.indexOf('_root') === 0))
			{
				var level = this._resolveLevelNProperty(name);
				if (level) {
					return this._getCachedPropertyResult(level);
				}
			} else if (name.toLowerCase() in MovieClipProperties) {
				// For MovieClip's properties that start from '_' case does not matter.
				return super.alGetOwnProperty(name.toLowerCase());
			}
		}
		if (hasAwayJSAdaptee(this)) {
			var child = this._lookupChildByName(name);
			if (child) {
				return this._getCachedPropertyResult(child);
			}
		}
		return undefined;
	}

	public alGetOwnPropertiesKeys(): any [] {
		var keys = super.alGetOwnPropertiesKeys();
		// if it's a movie listing the children as well
		if (!hasAwayJSAdaptee(this)) {
			return keys; // not initialized yet
		}

		var as3MovieClip = this.adaptee;
		if (as3MovieClip._children.length === 0) {
			return keys; // no children
		}

		var processed = Object.create(null);
		var keysLength:number=keys.length;
		var i:number=0;
		for (i = 0; i < keysLength; i++) {
			processed[keys[i]] = true;
		}
		var numChilds:number=as3MovieClip._children.length;
		var child=null;
		var name:string=null;
		var normalizedName:string=null;
		for (i = 0;i < numChilds; i++) {
			child = as3MovieClip._children[i];
			name = child.name;
			normalizedName = name; // TODO something like this._unescapeProperty(this._escapeProperty(name));
			processed[normalizedName] = true;
		}
		return Object.getOwnPropertyNames(processed);
	}

	private _init(initObject) {
		if (initObject instanceof AVM1Object) {
			alForEachProperty(initObject, (name: string) => {
				this.alPut(name, initObject.alGet(name));
			}, null);
		}
	}

	protected _initEventsHandlers() {
		this.bindEvents(EventsListForMC);
	}
}

