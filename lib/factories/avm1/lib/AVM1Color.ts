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
import {AVM1Object} from "../runtime/AVM1Object";
import {getAwayJSAdaptee, IAVM1SymbolBase, wrapAVM1NativeClass} from "./AVM1Utils";
import {AVM1ColorTransform, toAS3ColorTransform} from "./AVM1ColorTransform";
import {DisplayObject, HierarchicalProperties, MovieClip} from "@awayjs/scene";
import {ColorTransform} from "@awayjs/core";
import {AVM1Context} from "../context";
import { AVM1SymbolBase } from './AVM1SymbolBase';


export class AVM1Color extends AVM1Object {
	static createAVM1Class(context: AVM1Context): AVM1Object {
		return wrapAVM1NativeClass(context, true, AVM1Color,
			[],
			['getRGB', 'getTransform', 'setRGB', 'setTransform'],
			null, AVM1Color.prototype.avm1Constructor);
	}

	private _target: IAVM1SymbolBase;
	private _targetAwayObject: DisplayObject;

	public avm1Constructor(target_mc) {
		if(target_mc && target_mc instanceof AVM1SymbolBase){
			this._target = this.context.resolveTarget(target_mc);
			if(this._target ){
				(<any>this._target).avmColor=this;
				(<any>this._target)._ctBlockedByScript=true;
				this._targetAwayObject = <DisplayObject>getAwayJSAdaptee(this._target);
            }
		}
	}
	public changeTarget(target_mc) {
		if(target_mc && target_mc instanceof AVM1SymbolBase){
			this._target = target_mc;
			(<any>this._target).avmColor=this;
			(<any>this._target)._ctBlockedByScript=true;
			this._targetAwayObject = <DisplayObject>getAwayJSAdaptee(this._target);
        }	
        else{
            this._target=null;
        }	
	}

	public getRGB(): number {
		var transform = AVM1Color.prototype.getTransform.call(this);
		if(transform)
			return transform.alGet('rgb');
		return null;
	}

	public getTransform(): AVM1ColorTransform {
		if(this._targetAwayObject){
			return AVM1ColorTransform.fromAS3ColorTransform(this.context, this._targetAwayObject.transform.colorTransform);
		}
		return null;
	}

	public setRGB(offset): void {
		var transform = AVM1Color.prototype.getTransform.call(this);
		if(transform){
			transform.alPut('rgb', offset);
			AVM1Color.prototype.setTransform.call(this, transform);
		}
	}

	public setTransform(transform: AVM1Object): void {
		if(this._targetAwayObject){
			var newCT:ColorTransform = toAS3ColorTransform(transform);
			this._targetAwayObject.transform.colorTransform._rawData[0] = newCT._rawData[0];
			this._targetAwayObject.transform.colorTransform._rawData[1] = newCT._rawData[1];
			this._targetAwayObject.transform.colorTransform._rawData[2] = newCT._rawData[2];
			this._targetAwayObject.transform.colorTransform._rawData[3] = newCT._rawData[3];
			this._targetAwayObject.transform.colorTransform._rawData[4] = newCT._rawData[4];
			this._targetAwayObject.transform.colorTransform._rawData[5] = newCT._rawData[5];
			this._targetAwayObject.transform.colorTransform._rawData[6] = newCT._rawData[6];
			this._targetAwayObject.transform.colorTransform._rawData[7] = newCT._rawData[7];
			this._targetAwayObject.transform.invalidateColorTransform();
			this._targetAwayObject.invalidate();
			this._targetAwayObject._invalidateHierarchicalProperties(HierarchicalProperties.COLOR_TRANSFORM);
		}
	}
}

