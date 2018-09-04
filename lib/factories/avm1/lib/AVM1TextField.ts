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

import {
	alCoerceNumber, alCoerceString, alToBoolean, alToInt32, alToInteger, alToNumber, alToString
} from "../runtime";
import {AVM1Context} from "../context";
import {getAVM1Object, wrapAVM1NativeClass, toTwipFloor, toTwipRound} from "./AVM1Utils";
import {AVM1TextFormat} from "./AVM1TextFormat";
import {Debug, notImplemented, warning} from "../../base/utilities/Debug";
import {EventBase as Event, Point, Box} from "@awayjs/core";
import {TextField, TextFieldType, TextFormat, TextFieldAutoSize, DisplayObject, DisplayObjectContainer} from "@awayjs/scene";
import {AVM1Key} from "./AVM1Key";
import {AVM1SymbolBase} from "./AVM1SymbolBase";
import {AVM1Object} from "../runtime/AVM1Object";
import { AVM1EventHandler } from "./AVM1EventHandler";
import { AVM1Globals } from './AVM1Globals';
import {MouseManager} from "@awayjs/view";
import {alCallProperty,} from "../runtime";

interface mapNumberToString{
	[key: number]: string;
}
interface mapStringToNumber{
	[key: string]: number;
}

export class AVM1TextField extends AVM1SymbolBase<TextField> {
	static createAVM1Class(context: AVM1Context): AVM1Object  {
		return wrapAVM1NativeClass(context, true, AVM1TextField,
			[],
			[ '_alpha#', 'addListener', 'antiAliasType#', 'autoSize#', 'background#', 'backgroundColor#',
				'border#',  'borderColor#', 'bottomScroll#', 'condenseWhite#', 'embedFonts#',
				'filters#', 'getNewTextFormat', 'getTextFormat', 'gridFitType#', 'getDepth',
				'_height#', '_highquality#', 'hscroll#', 'html#', 'htmlText#', 'length#',
				'maxChars#', 'maxhscroll#', 'maxscroll#', 'multiline#',
				'_name#', '_parent#', 'password#', '_quality#', '_rotation#',
				'replaceSel','removeMovieClip',
				'removeTextField', 'restrict#',  'scroll#', 'selectable#', 'setNewTextFormat', 'setTextFormat',
				'_soundbuftime#', 'tabEnabled#', 'tabIndex#', '_target#', 'toString',
				'text#', 'textColor#', 'textHeight#', 'textWidth#', 'type#',
				'_url#', 'variable#', '_visible#', '_width#', 'wordWrap#',
				'_x#', '_xmouse#', '_xscale#', '_y#', '_ymouse#', '_yscale#', 'onChanged']);
	}

	private _variable: string;

	private _exitFrameHandler: (event: Event) => void;

	public dispatchKeyEvent(keyCode, isShift, isCTRL, isAlt){
		
		// this is called from the adaptee whenever a text-input occurs
		if(MouseManager.getInstance().useSoftkeyboard){
			var staticState: typeof AVM1Key = this.context.getStaticState(AVM1Key);
			staticState._lastKeyCode = keyCode;
			staticState._keyStates[keyCode] = 1;
			alCallProperty(AVM1Globals.instance.Key, 'broadcastMessage', ['onKeyDown']);
			
			delete staticState._keyStates[keyCode];
			alCallProperty(AVM1Globals.instance.Key, 'broadcastMessage', ['onKeyUp']);
		}
	}

	public static allTextfields:any={};
	public static syncAllTextfields(){
		for (var key in AVM1TextField.allTextfields){
			if(AVM1TextField.allTextfields[key]){
				AVM1TextField.allTextfields[key].syncTextFieldValue();

			}
			else{
				delete AVM1TextField.allTextfields[key];
			}
		}
	}
	public static textFieldVars:AVM1TextField[]=[];
	public static syncQueedTextfields(){
		if(AVM1TextField.textFieldVars.length>0){
			var len=AVM1TextField.textFieldVars.length;
			for(var i:number=0; i<len; i++){
				AVM1TextField.textFieldVars[i].syncTextFieldValue()
			}
			AVM1TextField.textFieldVars.length=0;
		}
	}

	public selectTextField(fromMouseDown:boolean=false){
		// this is called from the adaptee whenever it is selected in MouseManager
		if(AVM1Globals.softKeyboardManager){
			if(this.adaptee.name=="dummy_txt")
				fromMouseDown=true;
			AVM1Globals.softKeyboardManager.openKeyboard(this.adaptee, fromMouseDown);
		}
	}

	public removeTextField() {
		this.removeMovieClip();
	}
	public alPut(p, v) {
		super.alPut(p,v);
		if(p=="onChanged"){
			this.onChanged(v);
		}
	}

	public onChanged(callback:any): void {
		var myThis=this;
		this.adaptee.onChanged=function(){
			// make sure text-var is synced before onChanged is called:
			myThis.updateVarFromText();
			myThis.syncTextFieldValue();
			if(callback)
				callback.alCall(myThis, [myThis]);
		};
	}

	public doInitEvents():void
	{
		if (this.adaptee._symbol) {
			//console.log("do init", this.adaptee._symbol.variableName, this);
			this.setVariable(this.adaptee._symbol.variableName || '');
		}
		//this._initEventsHandlers();
	}

	public initAVM1SymbolInstance(context: AVM1Context, awayObject: TextField) {

		super.initAVM1SymbolInstance(context, awayObject);

		//this.dynamicallyCreated=false;
		this.adaptee=awayObject;
		this._initEventsHandlers();
		this._variable = '';
		this._exitFrameHandler = null;
		this.adaptee=awayObject;
		this.onChanged(null);

	}


	public clone(){
		return <AVM1TextField>getAVM1Object(this.adaptee.clone(), <AVM1Context>this._avm1Context);
	}

	public getAntiAliasType(): string {
		notImplemented("AVM1Textfield.getAntiAliasType");
		return ""; // this.adaptee.antiAliasType;
	}

	public setAntiAliasType(value: string) {
		notImplemented("AVM1Textfield.getAntiAliasType");
		//value = alCoerceString(this.context, value);
		//this.adaptee.antiAliasType = value;
	}
	
	
	public get_width(): number
	{
		this.syncTextFieldValue();
		//this.replicateWeirdFlashBehavior();
		var box:Box = this.adaptee.getBoxBounds(this.adaptee);
		return (box == null)? 0 : toTwipRound(box.width);
		//return this._prevWidth;
	}

	public set_width(value: number)
	{
		value =  toTwipRound(alToNumber(this.context, value));

		this._blockedByScript = true;

		if (isNaN(value))
			return;
		
		this.adaptee.width = value;
		//var box:Box = this.adaptee.getBoxBounds(this.adaptee);
		//this._prevWidth=(box == null)? 0 : toTwipRound(box.width);
	}

	public get_x(): number {
		this.syncTextFieldValue();
		//this.replicateWeirdFlashBehavior();
		return toTwipFloor(this.adaptee.x+(this.adaptee.scaleX * this.adaptee.textOffsetX));
	}
	public get_y(): number {
		this.syncTextFieldValue();
		return toTwipFloor(this.adaptee.y+(this.adaptee.scaleY * this.adaptee.textOffsetY));
	}
	public set_x(value: number) {
		this.syncTextFieldValue();
		this.adaptee.x=toTwipFloor(value-(this.adaptee.scaleX * this.adaptee.textOffsetX));
	}
	public set_y(value: number) {
		this.syncTextFieldValue();
		this.adaptee.y=toTwipFloor(value-(this.adaptee.scaleY * this.adaptee.textOffsetY));
	}

	public getAutoSize() {
		return this.adaptee.autoSize;
	}

	public setAutoSize(value: any) {
		// AVM1 treats |true| as "LEFT" and |false| as "NONE".
		if (value === true) {
			value = "left";
		} else if (value === false) {
			value = "none";
		}
		value = alCoerceString(this.context, value);
		this.adaptee.autoSize = value;
	}

	public getBackground(): boolean {
		return this.adaptee.background;
	}

	public setBackground(value: boolean) {
		value = alToBoolean(this.context, value);
		this.adaptee.background = value;
	}

	public getBackgroundColor(): number {
		return this.adaptee.backgroundColor;
	}

	public setBackgroundColor(value) {
		value = alToInt32(this.context, value);
		this.adaptee.backgroundColor = value;
	}

	public getBorder(): boolean {
		return this.adaptee.border;
	}

	public setBorder(value: boolean) {
		value = alToBoolean(this.context, value);
		this.adaptee.border = value;
	}

	public getBorderColor(): number {
		return this.adaptee.borderColor;
	}

	public setBorderColor(value: number) {
		value = alToInt32(this.context, value);
		this.adaptee.borderColor = value;
	}

	public getBottomScroll(): number {
		notImplemented("AVM1Textfield.getBottomScroll");
		return this.adaptee.bottomScrollV;
	}

	public getCondenseWhite(): boolean {
		notImplemented("AVM1Textfield.getCondenseWhite");
		return this.adaptee.condenseWhite;
	}

	public setCondenseWhite(value: boolean) {
		notImplemented("AVM1Textfield.setCondenseWhite");
		value = alToBoolean(this.context, value);
		this.adaptee.condenseWhite = value;
	}

	public getEmbedFonts(): boolean {
		notImplemented("AVM1Textfield.getEmbedFonts");
		return this.adaptee.embedFonts;
	}

	public setEmbedFonts(value) {
		notImplemented("AVM1Textfield.setEmbedFonts");
		value = alToBoolean(this.context, value);
		this.adaptee.embedFonts = value;
	}

	public getNewTextFormat() {
		return AVM1TextFormat.createFromNative(this.context, this.adaptee.defaultTextFormat);
	}

	public getTextFormat(beginIndex: number = -1, endIndex: number = -1) {
		beginIndex = alToInteger(this.context, beginIndex);
		endIndex = alToInteger(this.context, endIndex);
		var as3TextFormat = this.adaptee.getTextFormat(beginIndex, endIndex);
		return AVM1TextFormat.createFromNative(this.context, as3TextFormat);
	}


	public getGridFitType(): string {
		notImplemented("AVM1Textfield.getGridFitType");
		return ""; // this.adaptee.gridFitType;
	}

	public setGridFitType(value: string) {
		notImplemented("AVM1Textfield.setGridFitType");
		//value = alCoerceString(this.context, value);
		//this.adaptee.gridFitType = value;
	}

	public getHscroll(): number {
		notImplemented("AVM1Textfield.getHscroll");
		return this.adaptee.scrollH;
	}

	public setHscroll(value: number) {
		notImplemented("AVM1Textfield.setHscroll");
		value = alCoerceNumber(this.context, value);
		this.adaptee.scrollH = value;
	}

	public getHtml() {
		return this.adaptee.html;
	}

	public setHtml(value) {
		this.adaptee.html = !!value;
		// Flash doesn't update the displayed text at this point, but the return
		// value of `TextField#htmlText` is as though `TextField#htmlText = TextField#text` had
		// also been called. For now, we ignore that.
	}

	public getHtmlText(): string {
		return this.adaptee.html ? this.adaptee.htmlText : this.adaptee.text;
	}

	public setHtmlText(value: string) {
		// alToString turns `undefined` into an empty string, but we really do want "undefined" here.
		value = value === undefined ? 'undefined' : alToString(this.context, value);
		if (this.adaptee.html) {
			this.adaptee.htmlText = value;
		} else {
			this.adaptee.text = value;
		}
		this.updateVarFromText();
		this.syncTextFieldValue();
	}

	public getLength(): number {
		return this.adaptee.length;
	}

	public getMaxChars(): number  {
		return this.adaptee.maxChars;
	}

	public setMaxChars(value) {
		value = alCoerceNumber(this.context, value);
		this.adaptee.maxChars = value;
	}

	public getRestrict(): string  {
		return this.adaptee.restrict;
	}

	public setRestrict(value) {
		value = alCoerceString(this.context, value);
		this.adaptee.restrict = value;
	}

	public getMaxhscroll(): number {
		notImplemented("AVM1Textfield.getMaxhscroll");
		return 0; // todo 80pro this.adaptee.maxScrollH;
	}

	public getMaxscroll(): number {
		notImplemented("AVM1Textfield.getMaxscroll");
		return 0; // todo 80pro this.adaptee.maxScrollV;
	}

	public getMultiline(): boolean {
		return this.adaptee.multiline;
	}

	public setMultiline(value: boolean) {
		value = alToBoolean(this.context, value);
		this.adaptee.multiline = value;
	}

	public getPassword(): boolean {
		notImplemented("AVM1Textfield.getPassword");
		return this.adaptee.displayAsPassword;
	}

	public setPassword(value: boolean) {
		notImplemented("AVM1Textfield.setPassword");
		value = alToBoolean(this.context, value);
		this.adaptee.displayAsPassword = value;
	}

	public getScroll(): number {
		notImplemented("AVM1Textfield.getScroll");
		return this.adaptee.scrollV;
	}

	public setScroll(value: number) {
		notImplemented("AVM1Textfield.setScroll");
		value = alCoerceNumber(this.context, value);
		this.adaptee.scrollV = value;
	}

	public getSelectable(): boolean {
		return this.adaptee.selectable;
	}

	public setSelectable(value: boolean) {
		value = alToBoolean(this.context, value);
		if(!value && MouseManager.getInstance().getFocus()==this.adaptee){
			MouseManager.getInstance().setFocus(null);
		}
		this.adaptee.selectable = value;
	}
	public replaceSel(value: string) {
		value = alToString(this.context, value);
		this.adaptee.replaceSelectedText(value);
	}
	
    /**
     * for html text this will get ignored
     */
	public setNewTextFormat(value) {
		var away3TextFormat:TextFormat;
		if (value instanceof AVM1TextFormat) {
			away3TextFormat = (<AVM1TextFormat>value).adaptee;
		}
		else{
			console.log("AVM1Textfield.setNewtextFormat - trying to set something other than a TextFormat", value);
			return;
		}
		if(!this.adaptee.textFormat){
			this.adaptee.textFormat=new TextFormat();
		}
		
        away3TextFormat.font_table=this.adaptee.textFormat.font_table;
        this.adaptee.newTextFormat=away3TextFormat;
	}

    /**
     * This should only have effect on text that is currently existent on the Textfield.
     * for new text we must use setNewTextFormat
     */
	public setTextFormat() {
		var beginIndex: number = -1, endIndex: number = -1, tf;
		switch (arguments.length) {
			case 0:
				return; // invalid amount of arguments
			case 1:
				tf = arguments[0];
				break;
			case 2:
				beginIndex = alToNumber(this.context, arguments[0]);
				tf = arguments[1];
				break;
			default:
				beginIndex = alToNumber(this.context, arguments[0]);
				endIndex = alToNumber(this.context, arguments[1]);
				tf = arguments[2];
				break;
		}
		//console.log(arguments);
		if(beginIndex>=0 && endIndex==-1){
			endIndex=beginIndex;
		}
		var as3TextFormat;
		if (tf instanceof AVM1TextFormat) {
			as3TextFormat = (<AVM1TextFormat>tf).adaptee;
			this.adaptee.setTextFormat(as3TextFormat, beginIndex, endIndex);
		}
	}

	public getText(): string {
		if(this._variable){
			this.syncTextFieldValue();
		}
		return this.adaptee.text;
	}

	public setText(value: string) {
		
		// alToString turns `undefined` into an empty string, but we really do want "undefined" here.
		value = value === undefined ? '' : alToString(this.context, value);
		var avm1ContextUtils = this.context.utils;
		if(this.adaptee.parent){
			var clip = getAVM1Object(this.adaptee.parent, this.context);
			avm1ContextUtils.setProperty(clip, this._variable, value);

		}
		this.adaptee.text = value;
		if(this._variable){
			this.updateVarFromText();
			this.syncTextFieldValue();
		}
	}

	public getTextColor(): number {
		return this.adaptee.textColor;
	}

	public setTextColor(value: number) {
		value = alToInt32(this.context, value);
		this.adaptee.textColor = value;
	}

	public getTextHeight(): number {
		return this.adaptee.textHeight;
	}

	public setTextHeight(value: number) {
		notImplemented('AVM1TextField.setTextHeight');
	}

	public getTextWidth(): number {
		return this.adaptee.textWidth;
	}

	public setTextWidth(value) {
		notImplemented('AVM1TextField.setTextWidth');
	}

	public getType(): string {
		return <string>this.adaptee.type;
	}

	public setType(value: string) {
		value = alCoerceString(this.context, value);
		if(value) value=value.toLowerCase();
		this.adaptee.type = value;
	}

	public getVariable(): string {
		return this._variable;
	}

	private _prevTextVarContent:string="";
	private _textVarHolder:AVM1Object=null;
	private _textVarPropName:string="";
	public setVariable(name: string) {
		name = alCoerceString(this.context, name);
		if (name === this._variable) {
			return;
		}
		

		var instance = this.adaptee;
		AVM1TextField.allTextfields[instance.id]=this;
		this._prevTextVarContent=this.adaptee.text;
		this._syncTextFieldValue(instance, name);
		if (this._exitFrameHandler && !name) {
			instance.removeEventListener('exitFrame', this._exitFrameHandler);//80pro: should be exitFrame
			this._exitFrameHandler = null;
		}
		this._variable = name;
		if (!this._exitFrameHandler && name) {
			this._exitFrameHandler = this._onAS3ObjectExitFrame.bind(this);
			instance.addEventListener('exitFrame', this._exitFrameHandler);//80pro: should be exitFrame
		}
	}

	private _onAS3ObjectExitFrame() {
		if(this._variable)
			this._syncTextFieldValue(this.adaptee, this._variable);
	}

	public syncTextFieldValue() {
		this._syncTextFieldValue(this.adaptee, this._variable);
	}
	public updateVarFromText(): void {
		//warning("AVM1Textfield.updateVarFromText - '"+this._textVarHolder.toString()+this._textVarPropName+"' / '"+this.adaptee.text+"'");
			
		if(this._textVarHolder){
			this.context.utils.setProperty(this._textVarHolder, this._textVarPropName, this.adaptee.text);
			this._prevTextVarContent=this.adaptee.text;
		}
	}
	private _syncTextFieldValue(instance, name) {
		if(!name || name==""){
			return;
		}
		var avm1ContextUtils = this.context.utils;
		if(this._textVarHolder==null){

			// todo: this could be probably done by using this.context.resolveTarget
			var hasPath = name.indexOf('.') >= 0 || name.indexOf(':') >= 0;
			if (hasPath) {
				var targetPath = name.split(/[.:\/]/g);
				this._textVarPropName = targetPath.pop();
				if (targetPath[0] == '_root' || targetPath[0] === '') {
					var parent=instance.parent;
					this._textVarHolder=null;
					while(parent){
						if(parent.name=="scene"){
							this._textVarHolder=parent.adapter;
							parent=null;
						}
						else{
							parent=parent.parent;
						}
					}
					if (this._textVarHolder === null) {
						return; // text field is not part of the stage yet
					}
					targetPath.shift();
					if (targetPath[0] === '') {
						targetPath.shift();
					}
				} 
				
				else if (targetPath[0] == '_global') {
					targetPath.shift();
					this._textVarHolder=this.context.globals;
				}
				else {
					if(!instance.parent){
						return;
					}
					this._textVarHolder = getAVM1Object(instance.parent, this.context);
				}
				while (targetPath.length > 0) {
					var childName = targetPath.shift();
					this._textVarHolder = avm1ContextUtils.getProperty(this._textVarHolder, childName);
					if (!this._textVarHolder) {
						return; // cannot find child clip
					}
				}
			} else {

				this._textVarPropName=name;
				if(instance.parent && instance.parent.parent){
					this._textVarHolder = getAVM1Object(instance.parent, this.context);
					// in cases where another object exists at the same path, and also has a textvar set,
					// we want to set the already existing path as "textVarHolder", 
					// so that the text-var-property descripten is shared, and both textields update in sync
					var child:DisplayObject;
					var parentParent:DisplayObjectContainer=instance.parent.parent;
					var len:number=parentParent.numChildren;
					for(var i:number=0; i<len; i++){
						child=parentParent.getChildAt(i);
						if(child!=instance.parent && child.name==instance.parent.name){
							if (avm1ContextUtils.hasProperty(child.adapter, this._textVarPropName)) {
								this._textVarHolder=<AVM1Object>child.adapter;
							}	
						}
					}

				}
			}
		}
		
		if (!this._textVarHolder) {
			// the object that holds the variable could not be found yet
			// we add it to a queue that will be worked off before any script executes
			AVM1TextField.textFieldVars.push(this);
			if(instance.html){
				return this._prevTextVarContent=instance.htmlText;
			}
			this._prevTextVarContent=instance.text;
			return;
		}

		if (!avm1ContextUtils.hasProperty(this._textVarHolder, this._textVarPropName)) {
			// the textvar does not exists yet. we create it and fill it with text-content
			if(instance.html){	
				avm1ContextUtils.setProperty(this._textVarHolder, this._textVarPropName, instance.htmlText);
				avm1ContextUtils.setProperty(this._textVarHolder, this._textVarPropName+"_internal_TF", this);
				this._prevTextVarContent=instance.htmlText;
				return;
			}
			avm1ContextUtils.setProperty(this._textVarHolder, this._textVarPropName, instance.text);
			avm1ContextUtils.setProperty(this._textVarHolder, this._textVarPropName+"_internal_TF", this);
			this._prevTextVarContent=instance.text;
			return;
		}
		
		if (!avm1ContextUtils.hasProperty(this._textVarHolder, this._textVarPropName+"_internal_TF")) {
			avm1ContextUtils.setProperty(this._textVarHolder, this._textVarPropName+"_internal_TF", this);
		}
		var newTextVarContent:string=avm1ContextUtils.getProperty(this._textVarHolder, this._textVarPropName);
		if(typeof newTextVarContent !== "string"){
			newTextVarContent=alToString(this.context, newTextVarContent);		
		}
		if(instance.html){	
			if(newTextVarContent!==this._prevTextVarContent){
				// textvar has changed. update text from var
				instance.htmlText = (typeof newTextVarContent === "undefined") ? "" : newTextVarContent;
				this._prevTextVarContent=newTextVarContent;
				return;
			}
			if(instance.htmlText!==newTextVarContent && (!(typeof newTextVarContent==="undefined" && instance.htmlText===""))){
				// makes sure text is set correctly in case the timeline has interferred.
				instance.htmlText = (typeof newTextVarContent === "undefined") ? "" : newTextVarContent;

			}
		}
		else{
			if(newTextVarContent!==this._prevTextVarContent){
				// textvar has changed. update text from var
				instance.text = (typeof newTextVarContent === "undefined") ? "" : newTextVarContent;
				this._prevTextVarContent=newTextVarContent;
				return;
			}
			if(instance.text!==newTextVarContent && (!(typeof newTextVarContent==="undefined" && instance.text===""))){
				// makes sure text is set correctly in case the timeline has interferred.
				instance.text = (typeof newTextVarContent === "undefined") ? "" : newTextVarContent;

			}

		}
	}

	public getWordWrap(): boolean {
		return this.adaptee.wordWrap;
	}

	public setWordWrap(value: boolean) {
		value = alToBoolean(this.context, value);
		this.adaptee.wordWrap = value;
	}


	private _initEventsHandlers() {
		this.bindEvents([
			new AVM1EventHandler('onDragOut', 'dragOut'),
			new AVM1EventHandler('onDragOver', 'dragOver'),
			new AVM1EventHandler('onKeyDown', 'keyDown'),
			new AVM1EventHandler('onKeyUp', 'keyUp'),
			new AVM1EventHandler('onKillFocus', 'focusOut', function (e) {
				return [e.relatedObject];
			}),
			new AVM1EventHandler('onLoad', 'load'),
			new AVM1EventHandler('onMouseDown', 'mouseDown3d'),
			new AVM1EventHandler('onMouseUp', 'mouseUp3d'),
			new AVM1EventHandler('onPress', 'mouseDown3d'),
			new AVM1EventHandler('onRelease', 'mouseUp3d'),
			new AVM1EventHandler('onReleaseOutside', 'releaseOutside'),
			new AVM1EventHandler('onRollOut', 'mouseOut3d'),
			new AVM1EventHandler('onRollOver', 'mouseOver3d'),
			new AVM1EventHandler('onSetFocus', 'focusIn', function (e) {
				return [e.relatedObject];
			})
		]);
	}
}

