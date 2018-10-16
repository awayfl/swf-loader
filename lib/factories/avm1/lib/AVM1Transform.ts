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

import {AVM1Object} from "../runtime/AVM1Object";
import {AVM1Context} from "../context";
import {getAwayJSAdaptee, IAVM1SymbolBase, wrapAVM1NativeClass} from "./AVM1Utils";
import {AVM1Matrix, toAS3Matrix} from "./AVM1Matrix";
import {AVM1ColorTransform, toAwayColorTransform} from "./AVM1ColorTransform";
import {AVM1Rectangle} from "./AVM1Rectangle";
import {DisplayObject} from "@awayjs/scene";
import {Matrix, Transform} from "@awayjs/core";


export class AVM1Transform extends AVM1Object {
	static createAVM1Class(context: AVM1Context): AVM1Object {
		return wrapAVM1NativeClass(context, true, AVM1Transform,
			[],
			['matrix#', 'concatenatedMatrix#', 'colorTransform#', 'pixelBounds#'],
			null, AVM1Transform.prototype.avm1Constructor);
	}

	private _target: IAVM1SymbolBase;
	private _targetAwayObject: DisplayObject;

	get as3Transform(): Transform {
		return this._targetAwayObject.transform;
	}

	public avm1Constructor(target_mc) {
		this._target = this.context.resolveTarget(target_mc);
		this._targetAwayObject = <DisplayObject>getAwayJSAdaptee(this._target);
	}

	public getMatrix(): AVM1Object {
		var transform = this._targetAwayObject.transform;
		return AVM1Matrix.fromAS3Matrix(this.context, transform.matrix);
	}

	public setMatrix(value: AVM1Matrix) {
		var transform = this._targetAwayObject.transform;
		transform.matrix = toAS3Matrix(value);
	}

	public getConcatenatedMatrix(): AVM1Matrix {
		var transform = this._targetAwayObject.transform;
		return AVM1Matrix.fromAS3Matrix(this.context, <Matrix>transform.concatenatedMatrix);
	}

	public getColorTransform(): AVM1ColorTransform {
		var transform = this._targetAwayObject.transform;
		return AVM1ColorTransform.fromAwayColorTransform(this.context, transform.colorTransform);
	}

	public setColorTransform(value: AVM1ColorTransform) {
		var transform = this._targetAwayObject.transform;
		transform.colorTransform = toAwayColorTransform(value);
	}

	public getPixelBounds(): AVM1Rectangle {
		var transform = this._targetAwayObject.transform;
		return AVM1Rectangle.fromAS3Rectangle(this.context, transform.pixelBounds);
	}
}

