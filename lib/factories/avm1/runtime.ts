/*
 * Copyright 2015 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */



import {AVM1Context} from "./context";
import {Debug, release} from "../base/utilities/Debug";
import {AVM1ArrayNative, AVM1BooleanNative, AVM1NumberNative, AVM1StringNative} from "./natives";
import {axCoerceString} from "../AVM2Dummys";
import {isIndex, isNullOrUndefined} from "../base/utilities";
import {IDisplayObjectAdapter, DisplayObject} from "@awayjs/scene";
import {IAsset} from "@awayjs/core";
import { AVM1Object } from "./runtime/AVM1Object";
import { AVM1Function } from "./runtime/AVM1Function";
import { AVM1Globals } from "./lib/AVM1Globals";
import { AVM1PropertyDescriptor } from "./runtime/AVM1PropertyDescriptor";
import Big from "big.js";

// Just assigning class prototype to null will not work, using next best thing.
//NullPrototypeObject.prototype = Object.create(null);

// Implementing object structure and metaobject protocol very similar to
// the one documented in the ECMAScript language 3.0 specification.

// ActionScript properties flags.
// DONT_ENUM, DONT_DELETE, and READ_ONLY are mapped to the the ASSetPropFlags.
export const enum AVM1PropertyFlags {
	DONT_ENUM = 1,
	DONT_DELETE = 2,
	READ_ONLY = 4,
	DATA = 64,
	ACCESSOR = 128,
	ASSETPROP_MASK = DONT_DELETE | DONT_ENUM | READ_ONLY
}

export const enum AVM1DefaultValueHint {
	NUMBER,
	STRING
}

export interface IAVM1Callable {
	alCall(thisArg: any, args?: any[]): any;
}

export interface IAVM1PropertyWatcher {
	name: any;
	callback: IAVM1Callable;
	userData: any;
}

export interface IAVM1Builtins {
	Object: AVM1Object;
	Function: AVM1Object;
	Boolean: AVM1Object;
	Number: AVM1Object;
	String: AVM1Object;
	Array: AVM1Object;
	Date: AVM1Object;
	Math: AVM1Object;
	Error: AVM1Object;
}

export interface IAVM1Context {
	builtins: IAVM1Builtins;
	swfVersion: number;
	isPropertyCaseSensitive: boolean;
	registerClass(name: string, cls: AVM1Object): void;
}

/**
 * Base class for ActionScript functions with native JavaScript implementation.
 */
export class AVM1NativeFunction extends AVM1Function {
	private _fn: Function;
	private _ctor: Function;

	/**
	 * @param {IAVM1Context} context
	 * @param {Function} fn The native function for regular calling.
	 * @param {Function} ctor The native function for construction.
	 */
	public constructor(context: IAVM1Context, fn: Function, ctor?: Function) {
		super(context);
		this._fn = fn;
		if (ctor) {
			this._ctor = ctor;
		}
	}

	public alConstruct(args?: any[]): AVM1Object {
		if (!this._ctor) {
			throw new Error('not a constructor');
		}
		return this._ctor.apply(this, args);
	}

	public alCall(thisArg: any, args?: any[]): any {
		if (!this._fn) {
			throw new Error('not callable');
		}
		return this._fn.apply(thisArg, args);
	}
}

/**
 * Base class the is used for the interpreter.
 * See {AVM1InterpretedFunction} implementation
 */
export class AVM1EvalFunction extends AVM1Function {
	public constructor(context: IAVM1Context) {
		super(context);
		var proto = new AVM1Object(context);
		proto.alPrototype = context.builtins.Object.alGetPrototypeProperty();
		proto.alSetOwnProperty('constructor', new AVM1PropertyDescriptor(AVM1PropertyFlags.DATA |
			AVM1PropertyFlags.DONT_ENUM |
			AVM1PropertyFlags.DONT_DELETE));
		this.alSetOwnPrototypeProperty(proto);
	}
	public alConstruct(args?: any[]): AVM1Object  {
		var obj = new AVM1Object(this.context);
		var objPrototype = this.alGetPrototypeProperty();
		if (!(objPrototype instanceof AVM1Object)) {
			objPrototype = this.context.builtins.Object.alGetPrototypeProperty();
		}
		obj.alPrototype = objPrototype;
		obj.alSetOwnConstructorProperty(this);
		var result = this.alCall(obj, args);
		return result instanceof AVM1Object ? result : obj;
	}
}

// TODO create classes for the ActionScript errors.

function AVM1TypeError(msg?) {
}
AVM1TypeError.prototype = Object.create(Error.prototype);

export function alToPrimitive(context: IAVM1Context, v, preferredType?: AVM1DefaultValueHint) {
	if (!(v instanceof AVM1Object)) {
		return v;
	}
	var obj: AVM1Object = v;
	return preferredType !== undefined ? obj.alDefaultValue(preferredType) : obj.alDefaultValue();
}

export function alToBoolean(context: IAVM1Context, v): boolean {
	switch (typeof v) {
		case 'undefined':
			return false;
		case 'object':
			return v !== null;
		case 'boolean':
			return v;
		case 'string':
		case 'number':
			return !!v;
		default:
			release || Debug.assert(false);
	}
}

export function alToNumber(context: IAVM1Context, v): number {
	if (typeof v === 'object' && v !== null) {
		v = alToPrimitive(context, v, AVM1DefaultValueHint.NUMBER);
	}
	switch (typeof v) {
		case 'undefined':
			return context.swfVersion >= 7 ? NaN : 0;
		case 'object':
			if (v === null) {
				return context.swfVersion >= 7 ? NaN : 0;
			}
			return context.swfVersion >= 5 ? NaN : 0;
		case 'boolean':
			return v ? 1 : 0;
		case 'number':
			return v;
		case 'string':
			if (v === '' && context.swfVersion < 5) {
				return 0;
			}
			if(v===""){
				return NaN;
			}
			return +v;
		default:
			release || Debug.assert(false);
	}
}

export function alToInteger(context: IAVM1Context, v): number {
	var n = alToNumber(context, v);
	if (isNaN(n)) {
		return 0;
	}
	if (n === 0 || n === Number.POSITIVE_INFINITY || n === Number.NEGATIVE_INFINITY) {
		return n;
	}
	return n < 0 ? Math.ceil(n) : Math.floor(n);
}

export function alToInt32(context: IAVM1Context, v): number  {
	var n = alToNumber(context, v);
	return n | 0;
}



export function alToString(context: IAVM1Context, v): string {
	if (typeof v === 'object' && v !== null) {
		v = alToPrimitive(context, v, AVM1DefaultValueHint.STRING);
	}
	switch (typeof v) {
		case 'undefined':
			return context.swfVersion >= 7 ? 'undefined' : '';
		case 'object':
			if (v === null) {
				return 'null';
			}
            if (v && v instanceof Array) {
                var outputStr:string="";
                for(var i:number=0; i< v.length; i++){
                    outputStr+=alToString(context, v[i]);
                    outputStr+=i==v.length-1?"":",";
                }
                return outputStr;
            }
			return '[type ' + alGetObjectClass(v) + ']';
		case 'boolean':
			return v ? 'true' : 'false';
		case 'number':
			if (!isNaN(v)) {
				var bigv=Big(v);
				if(Math.abs(bigv.e)<14)
					bigv=bigv.round(14-bigv.e, 1);
				return bigv.toString();
			}
			return v.toString();
		case 'string':
			return v;
		default:
			release || Debug.assert(false);
	}
}

export function alIsName(context: IAVM1Context, v): boolean {
	return typeof v === 'number' ||
		typeof v === 'string' &&
		(!context.isPropertyCaseSensitive || v === v.toLowerCase());
}

export function alToObject(context: IAVM1Context, v): AVM1Object {
	switch (typeof v) {
		case 'undefined':
			throw new AVM1TypeError();
		case 'object':
			if (v === null) {
				throw new AVM1TypeError();
			}
			// TODO verify if all objects here are inherited from AVM1Object
			if (Array.isArray(v)) {
				return new AVM1ArrayNative(context, v);
			}
			return v;
		case 'boolean':
			return new AVM1BooleanNative(context, v);
		case 'number':
			return new AVM1NumberNative(context, v);
		case 'string':
			return new AVM1StringNative(context, v);
		default:
			release || Debug.assert(false);
	}
}

export function alNewObject(context: IAVM1Context): AVM1Object {
	var obj = new AVM1Object(context);
	obj.alPrototype = context.builtins.Object.alGetPrototypeProperty();
	obj.alSetOwnConstructorProperty(context.builtins.Object);
	return obj;
}

export function alGetObjectClass(obj: AVM1Object): string  {
	if (obj instanceof AVM1Function) {
		return 'Function';
	}
	// TODO more cases
	return 'Object';
}

/**
 * Non-standard string coercion function roughly matching the behavior of AVM2's axCoerceString.
 *
 * This is useful when dealing with AVM2 objects in the implementation of AVM1 builtins: they
 * frequently expect either a string or `null`, but not `undefined`.
 */
export function alCoerceString(context: IAVM1Context, x): string {
	if (x instanceof AVM1Object) {
		return alToString(context, x);
	}
	return axCoerceString(x);
}

export function alCoerceNumber(context: IAVM1Context, x): number {
	if (isNullOrUndefined(x)) {
		return undefined;
	}
	return alToNumber(context, x);
}

export function alIsIndex(context: IAVM1Context, p) {
	if (p instanceof AVM1Object) {
		return isIndex(alToString(context, p));
	}
	return isIndex(p);
}

export function alForEachProperty(obj: AVM1Object, fn: (name: string) => void, thisArg?: any) {
	obj.alGetKeys().forEach(fn, thisArg);
}

export function alIsFunction(obj: any): boolean  {
	return obj instanceof AVM1Function;
}

export function alCallProperty(obj: AVM1Object, p, args?: any[]): any {
	var callable: IAVM1Callable = obj.alGet(p);
	callable.alCall(obj, args);
}

export function alInstanceOf(context: IAVM1Context, obj, cls): boolean  {
	if (!(obj instanceof AVM1Object)) {
		return false;
	}
	if (!(cls instanceof AVM1Object)) {
		return false;
	}
	var proto = cls.alGetPrototypeProperty();
	for (var i = obj; i; i = i.alPrototype) {
		if (i === proto) {
			return true;
		}
	}
	return false;
}

export function alIsArray(context: IAVM1Context, v): boolean  {
	return alInstanceOf(context, v, context.builtins.Array);
}

export function alIsArrayLike(context: IAVM1Context, v): boolean {
	if (!(v instanceof AVM1Object)) {
		return false;
	}
	var length = alToInteger(context, v.alGet('length'));
	if (isNaN(length) || length < 0 || length >= 4294967296) {
		return false;
	}
	return true;
}

export function alIterateArray(context: IAVM1Context, arr: AVM1Object,
							   fn: (obj: any, index?: number) => void, thisArg: any = null): void {
	var length = alToInteger(context, arr.alGet('length'));
	if (isNaN(length) || length >= 4294967296) {
		return;
	}
	for (var i = 0; i < length; i++) {
		fn.call(thisArg, arr.alGet(i), i);
	}
}

export function alIsString(context: IAVM1Context, v): boolean {
	return typeof v === 'string';
}

export function alDefineObjectProperties(obj: AVM1Object, descriptors: any): void {
	var context = obj.context;
	Object.getOwnPropertyNames(descriptors).forEach(function (name) {
		var desc = descriptors[name];
		var value, getter, setter;
		var flags: AVM1PropertyFlags = 0;
		if (typeof desc === 'object') {
			if (desc.get || desc.set) {
				getter = desc.get ? new AVM1NativeFunction(context, desc.get) : undefined;
				setter = desc.set ? new AVM1NativeFunction(context, desc.set) : undefined;
				flags |= AVM1PropertyFlags.ACCESSOR;
			} else {
				value = desc.value;
				if (typeof value === 'function') {
					value = new AVM1NativeFunction(context, value);
				}
				flags |= AVM1PropertyFlags.DATA;
				if (!desc.writable) {
					flags |= AVM1PropertyFlags.READ_ONLY;
				}
			}
			if (!desc.enumerable) {
				flags |= AVM1PropertyFlags.DONT_ENUM;
			}
			if (!desc.configurable) {
				flags |= AVM1PropertyFlags.DONT_DELETE;
			}
		} else {
			value = desc;
			if (typeof value === 'function') {
				value = new AVM1NativeFunction(context, value);
			}
			flags |= AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_DELETE |
				AVM1PropertyFlags.DONT_ENUM | AVM1PropertyFlags.READ_ONLY;
		}
		obj.alSetOwnProperty(name, new AVM1PropertyDescriptor(flags, value, getter, setter));
	});
}

