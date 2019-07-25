/*
 * Copyright 2014 Mozilla Foundation
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

import {jsGlobal} from "./utilities/jsGlobal";
import {CharacterCodes} from "./utilities/Shumway";
import {assert, Debug} from "./utilities/Debug";
import {clamp} from "./utilities/NumberUtilities";
import {RGBAToARGB, rgbaToCSSStyle} from "./utilities/ColorUtilities";
import {base64EncodeBytes} from "./utilities/StringUtilities";
import {ShumwayCom} from "./external";
import {Shumway} from "./utilities/Shumway";
//import {Promise} from 'es6-promise'
// Our polyfills for some DOM things make testing this slightly more onerous than it ought to be.
var inBrowser = typeof window !=='undefined' && 'document' in window && 'plugins' in window.document;
var inFirefox = typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Firefox') >= 0;

declare var putstr;
// declare var print;
// declare var console;
// declare var performance;
// declare var XMLHttpRequest;
// declare var document;
// declare var getComputedStyle;

/** @define {boolean} */ var release = false;
/** @define {boolean} */ var profile = false;

declare var dump: (message: string) => void;

export function dumpLine(line: string) {
	if (!release && typeof dump !== "undefined") {
		dump(line + "\n");
	}
}

if (!jsGlobal.performance) {
	jsGlobal.performance = {};
}

if (!jsGlobal.performance.now) {
	jsGlobal.performance.now = function () {
		return Date.now();
	};
}

var START_TIME = performance.now();

declare global {
	interface String {
		padRight(c: string, n: number): string;

		padLeft(c: string, n: number): string;

		endsWith(s: string): boolean;
	}
}


interface Function {
	boundTo: boolean;
}

interface Array<T> {
	runtimeId: number;
}

interface Math {
	imul(a: number, b: number): number;
	/**
	 * Returns the number of leading zeros of a number.
	 * @param x A numeric expression.
	 */
	clz32(x: number): number;
}

interface Error {
	stack: string;
}

interface Map<K, V> {
	clear(): void;
	delete(key: K): boolean;
	forEach(callbackfn: (value: V, index: K, map: Map<K, V>) => void, thisArg?: any): void;
	get(key: K): V;
	has(key: K): boolean;
	set(key: K, value: V): Map<K, V>;
	size: number;
}

declare var Map: {
	new <K, V>(): Map<K, V>;
	prototype: Map<any, any>;
};

export interface WeakMap<K, V> {
	clear(): void;
	delete(key: K): boolean;
	get(key: K): V;
	has(key: K): boolean;
	set(key: K, value: V): WeakMap<K, V>;
}

declare var WeakMap: {
	new <K, V>(): WeakMap<K, V>;
	prototype: WeakMap<any, any>;
};

export interface Set<T> {
	add(value: T): Set<T>;
	clear(): void;
	delete(value: T): boolean;
	forEach(callbackfn: (value: T, index: T, set: Set<T>) => void, thisArg?: any): void;
	has(value: T): boolean;
	size: number;
}

export declare var Set: {
	new <T>(): Set<T>;
	prototype: Set<any>;
};

interface Uint8ClampedArray extends ArrayBufferView {
	BYTES_PER_ELEMENT: number;
	length: number;
	[index: number]: number;
	get(index: number): number;
	set(index: number, value: number): void;
	set(array: Uint8Array, offset?: number): void;
	set(array: number[], offset?: number): void;
	subarray(begin: number, end?: number): Uint8ClampedArray;
}

declare var Uint8ClampedArray: {
	prototype: Uint8ClampedArray;
	new (length: number): Uint8ClampedArray;
	new (array: Uint8Array): Uint8ClampedArray;
	new (array: number[]): Uint8ClampedArray;
	new (buffer: ArrayBuffer, byteOffset?: number, length?: number): Uint8ClampedArray;
	BYTES_PER_ELEMENT: number;
};


/**
 * The buffer length required to contain any unsigned 32-bit integer.
 */
/** @const */ export var UINT32_CHAR_BUFFER_LENGTH = 10; // "4294967295".length;
/** @const */ export var UINT32_MAX = 0xFFFFFFFF;
/** @const */ export var UINT32_MAX_DIV_10 = 0x19999999; // UINT32_MAX / 10;
/** @const */ export var UINT32_MAX_MOD_10 = 0x5; // UINT32_MAX % 10

export function isString(value): boolean {
	return typeof value === "string";
}

export function isFunction(value): boolean {
	return typeof value === "function";
}

export function isNumber(value): boolean {
	return typeof value === "number";
}

export function isInteger(value): boolean {
	return (value | 0) === value;
}

export function isArray(value): boolean {
	return value instanceof Array;
}

export function isNumberOrString(value): boolean {
	return typeof value === "number" || typeof value === "string";
}

export function isObject(value): boolean {
	return typeof value === "object" || typeof value === 'function';
}

export function toNumber(x): number {
	return +x;
}

export function isNumericString(value: string): boolean {
	// ECMAScript 5.1 - 9.8.1 Note 1, this expression is true for all
	// numbers x other than -0.
	return String(Number(value)) === value;
}

/**
 * Whether the specified |value| is a number or the string representation of a number.
 */
export function isNumeric(value: any): boolean {
	if (typeof value === "number") {
		return true;
	}
	if (typeof value === "string") {
		// |value| is rarely numeric (it's usually an identifier), and the
		// isIndex()/isNumericString() pair is slow and expensive, so we do a
		// quick check for obvious non-numericalness first. Just checking if the
		// first char is a 7-bit identifier char catches most cases.
		var c = value.charCodeAt(0);
		if ((65 <= c && c <= 90) ||     // 'A'..'Z'
			(97 <= c && c <= 122) ||    // 'a'..'z'
			(c === 36) ||               // '$'
			(c === 95)) {               // '_'
			return false;
		}
		return isIndex(value) || isNumericString(value);
	}
	return false;
}

/**
 * Whether the specified |value| is an unsigned 32 bit number expressed as a number
 * or string.
 */
export function isIndex(value: any): boolean {
	// js/src/vm/String.cpp JSFlatString::isIndexSlow
	// http://dxr.mozilla.org/mozilla-central/source/js/src/vm/String.cpp#474
	var index = 0;
	if (typeof value === "number") {
		index = (value | 0);
		if (value === index && index >= 0) {
			return true;
		}
		return value >>> 0 === value;
	}
	if (typeof value !== "string") {
		return false;
	}
	var length = value.length;
	if (length === 0) {
		return false;
	}
	if (value === "0") {
		return true;
	}
	// Is there any way this will fit?
	if (length > UINT32_CHAR_BUFFER_LENGTH) {
		return false;
	}
	var i = 0;
	index = value.charCodeAt(i++) - CharacterCodes._0;
	if (index < 1 || index > 9) {
		return false;
	}
	var oldIndex = 0;
	var c = 0;
	while (i < length) {
		c = value.charCodeAt(i++) - CharacterCodes._0;
		if (c < 0 || c > 9) {
			return false;
		}
		oldIndex = index;
		index = 10 * index + c;
	}
	/*
	 * Look out for "4294967296" and larger-number strings that fit in UINT32_CHAR_BUFFER_LENGTH.
	 * Only unsigned 32-bit integers shall pass.
	 */
	if ((oldIndex < UINT32_MAX_DIV_10) || (oldIndex === UINT32_MAX_DIV_10 && c <= UINT32_MAX_MOD_10)) {
		return true;
	}
	return false;
}

export function isNullOrUndefined(value) {
	return value == undefined;
}

export function argumentsToString(args: IArguments) {
	var resultList = [];
	for (var i = 0; i < args.length; i++) {
		var arg = args[i];
		try {
			var argStr;
			if (typeof arg !== 'object' || !arg) {
				argStr = arg + '';
			} else if ('toString' in arg) {
				argStr = arg.toString();
			} else {
				argStr = Object.prototype.toString.call(arg);
			}
			resultList.push(argStr);
		} catch (e) {
			resultList.push('<unprintable value>');
		}
	}
	return resultList.join(', ');
}

export function getTicks(): number {
	return performance.now();
}

export interface MapObject<T> {
	[name: string]: T
}

/**
 * Marsaglia's algorithm, adapted from V8. Use this if you want a deterministic random number.
 */
export class Random {
	private static _state: Uint32Array = new Uint32Array([0xDEAD, 0xBEEF]);

	public static seed(seed: number) {
		Random._state[0] = seed;
		Random._state[1] = seed;
	}

	public static reset() {
		Random._state[0] = 0xDEAD;
		Random._state[1] = 0xBEEF;
	}

	public static next(): number {
		var s = this._state;
		var r0 = (Math.imul(18273, s[0] & 0xFFFF) + (s[0] >>> 16)) | 0;
		s[0] = r0;
		var r1 = (Math.imul(36969, s[1] & 0xFFFF) + (s[1] >>> 16)) | 0;
		s[1] = r1;
		var x = ((r0 << 16) + (r1 & 0xFFFF)) | 0;
		// Division by 0x100000000 through multiplication by reciprocal.
		return (x < 0 ? (x + 0x100000000) : x) * 2.3283064365386962890625e-10;
	}
}

/*Math.random = function random(): number {
	return Random.next();
};*/

/**
 * This should only be called if you need fake time.
 */
export function installTimeWarper() {
	var RealDate = Date;

	// Go back in time.
	var fakeTime = 1428107694580; // 3-Apr-2015

	// Overload
	jsGlobal.Date = function (yearOrTimevalue, month, date, hour, minute, second, millisecond) {
		switch (arguments.length) {
			case  0: return new RealDate(fakeTime);
			case  1: return new RealDate(yearOrTimevalue);
			case  2: return new RealDate(yearOrTimevalue, month);
			case  3: return new RealDate(yearOrTimevalue, month, date);
			case  4: return new RealDate(yearOrTimevalue, month, date, hour);
			case  5: return new RealDate(yearOrTimevalue, month, date, hour, minute);
			case  6: return new RealDate(yearOrTimevalue, month, date, hour, minute, second);
			default: return new RealDate(yearOrTimevalue, month, date, hour, minute, second, millisecond);
		}
	};

	// Make date now deterministic.
	jsGlobal.Date.now = function () {
		return fakeTime += 10; // Advance time.
	};

	jsGlobal.Date.UTC = function () {
		return RealDate.UTC.apply(RealDate, arguments);
	};
}

function polyfillWeakMap() {
	if (typeof jsGlobal.WeakMap === 'function') {
		return; // weak map is supported
	}
	var id = 0;
	function WeakMap() {
		this.id = '$weakmap' + (id++);
	};
	WeakMap.prototype = {
		has: function(obj) {
			return obj.hasOwnProperty(this.id);
		},
		get: function(obj, defaultValue) {
			return obj.hasOwnProperty(this.id) ? obj[this.id] : defaultValue;
		},
		set: function(obj, value) {
			Object.defineProperty(obj, this.id, {
				value: value,
				enumerable: false,
				configurable: true
			});
		},
		delete: function(obj) {
			delete obj[this.id];
		}
	};
	jsGlobal.WeakMap = WeakMap;
}

polyfillWeakMap();

export interface IReferenceCountable {
	_referenceCount: number;
	_addReference();
	_removeReference();
}

var useReferenceCounting = true;

export class WeakList<T extends IReferenceCountable> {
	private _map: WeakMap<T, number>;
	private _newAdditions: T[][];//80pro Array<Array<T>>;
	private _list: T [];
	private _id: number;
	constructor() {
		if (typeof ShumwayCom !== "undefined" && ShumwayCom.getWeakMapKeys) {
			this._map = new WeakMap<T, number>();
			this._id = 0;
			this._newAdditions = [];
		} else {
			this._list = [];
		}
	}
	clear() {
		if (this._map) {
			this._map.clear();
		} else {
			this._list.length = 0;
		}
	}
	push(value: T) {
		if (this._map) {
			release || assert(!this._map.has(value));
			// We store an increasing id as the value so that keys can be sorted by it.
			this._map.set(value, this._id++);
			this._newAdditions.forEach(function (additions: T[]) {
				additions.push(value);
			});
		} else {
			release || assert(this._list.indexOf(value) === -1);
			this._list.push(value);
		}
	}
	remove(value: T) {
		if (this._map) {
			release || assert(this._map.has(value));
			this._map.delete(value);
		} else {
			release || assert(this._list.indexOf(value) > -1);
			this._list[this._list.indexOf(value)] = null;
			release || assert(this._list.indexOf(value) === -1);
		}
	}
	forEach(callback: (value: T) => void) {
		if (this._map) {
			var newAdditionsToKeys : T[] = [];
			this._newAdditions.push(newAdditionsToKeys);
			var map = this._map;
			var keys: T[] = ShumwayCom.getWeakMapKeys(map);
			// The keys returned by ShumwayCom.getWeakMapKeys are not guaranteed to
			// be in insertion order. Therefore we have to sort them manually.
			keys.sort(function (a: T, b: T) {
				return map.get(a) - map.get(b);
			});
			keys.forEach(function (value: T) {
				if (value._referenceCount !== 0) {
					callback(value);
				}
			});
			// ShumwayCom.getWeakMapKeys take snapshot of the keys, but we are also
			// interested in new added keys while keys.forEach was run.
			newAdditionsToKeys.forEach(function (value: T) {
				if (value._referenceCount !== 0) {
					callback(value);
				}
			});
			this._newAdditions.splice(this._newAdditions.indexOf(newAdditionsToKeys), 1);
			return;
		}
		var list = this._list;
		var zeroCount = 0;
		for (var i = 0; i < list.length; i++) {
			var value = list[i];
			if (!value) {
				continue;
			}
			if (useReferenceCounting && value._referenceCount === 0) {
				list[i] = null;
				zeroCount++;
			} else {
				callback(value);
			}
		}
		if (zeroCount > 16 && zeroCount > (list.length >> 2)) {
			var newList = [];
			for (var i = 0; i < list.length; i++) {
				var value = list[i];
				if (value && value._referenceCount > 0) {
					newList.push(value);
				}
			}
			this._list = newList;
		}
	}
	get length(): number {
		if (this._map) {
			// TODO: Implement this.
			return -1;
		} else {
			return this._list.length;
		}
	}
}

export const enum Numbers {
	MaxU16 = 0xFFFF,
	MaxI16 = 0x7FFF,
	MinI16 = -0x8000
}


export const enum LogLevel {
	Error = 0x1,
	Warn = 0x2,
	Debug = 0x4,
	Log = 0x8,
	Info = 0x10,
	All = 0x1f
}



export class IndentingWriter {
	public static PURPLE = '33[94m'; //\033[94m';
	public static YELLOW = '33[93m'; //\033[93m';
	public static GREEN = '33[92m'; //\033[92m';
	public static RED = '33[91m'; //\033[91m';
	public static BOLD_RED = '33[1;91m'; //\033[1;91m';
	public static ENDC = '33[0m'; //\033[0m';

	public static logLevel: LogLevel = LogLevel.All;

	private static _consoleOut = console.log.bind(console);
	private static _consoleOutNoNewline = console.log.bind(console);

	private _tab: string;
	private _padding: string;
	private _suppressOutput: boolean;
	private _out: (s: string, o?: any) => void;
	private _outNoNewline: (s: string) => void;

	get suppressOutput() {
		return this._suppressOutput;
	}

	set suppressOutput(val: boolean) {
		this._suppressOutput = val;
	}

	constructor(suppressOutput: boolean = false, out?) {
		this._tab = "  ";
		this._padding = "";
		this._suppressOutput = suppressOutput;
		this._out = out || IndentingWriter._consoleOut;
		this._outNoNewline = out || IndentingWriter._consoleOutNoNewline;
	}

	write(str: string = "", writePadding = false) {
		if (!this._suppressOutput) {
			this._outNoNewline((writePadding ? this._padding : "") + str);
		}
	}

	writeLn(str: string = "") {
		if (!this._suppressOutput) {
			this._out(this._padding + str);
		}
	}

	writeObject(str: string = "", object?: Object) {
		if (!this._suppressOutput) {
			this._out(this._padding + str, object);
		}
	}

	writeTimeLn(str: string = "") {
		if (!this._suppressOutput) {
			this._out(this._padding + performance.now().toFixed(2) + " " + str);
		}
	}

	writeComment(str: string) {
		var lines = (str || '').split("\n");
		if (lines.length === 1) {
			this.writeLn("// " + lines[0]);
		} else {
			this.writeLn("/**");
			for (var i = 0; i < lines.length; i++) {
				this.writeLn(" * " + lines[i]);
			}
			this.writeLn(" */");
		}
	}

	writeLns(str: string) {
		var lines = (str || '').split("\n");
		for (var i = 0; i < lines.length; i++) {
			this.writeLn(lines[i]);
		}
	}

	errorLn(str: string) {
		if (IndentingWriter.logLevel & LogLevel.Error) {
			this.boldRedLn(str);
		}
	}

	warnLn(str: string) {
		if (IndentingWriter.logLevel & LogLevel.Warn) {
			this.yellowLn(str);
		}
	}

	debugLn(str: string) {
		if (IndentingWriter.logLevel & LogLevel.Debug) {
			this.purpleLn(str);
		}
	}

	logLn(str: string) {
		if (IndentingWriter.logLevel & LogLevel.Log) {
			this.writeLn(str);
		}
	}

	infoLn(str: string) {
		if (IndentingWriter.logLevel & LogLevel.Info) {
			this.writeLn(str);
		}
	}

	yellowLn(str: string) {
		this.colorLn(IndentingWriter.YELLOW, str);
	}

	greenLn(str: string) {
		this.colorLn(IndentingWriter.GREEN, str);
	}

	boldRedLn(str: string) {
		this.colorLn(IndentingWriter.BOLD_RED, str);
	}

	redLn(str: string) {
		this.colorLn(IndentingWriter.RED, str);
	}

	purpleLn(str: string) {
		this.colorLn(IndentingWriter.PURPLE, str);
	}

	colorLn(color: string, str: string) {
		if (!this._suppressOutput) {
			if (!inBrowser) {
				this._out(this._padding + color + str + IndentingWriter.ENDC);
			} else {
				this._out(this._padding + str);
			}
		}
	}

	redLns(str: string) {
		this.colorLns(IndentingWriter.RED, str);
	}

	colorLns(color: string, str: string) {
		var lines = (str || '').split("\n");
		for (var i = 0; i < lines.length; i++) {
			this.colorLn(color, lines[i]);
		}
	}

	enter(str: string) {
		if (!this._suppressOutput) {
			this._out(this._padding + str);
		}
		this.indent();
	}

	leaveAndEnter(str: string) {
		this.leave(str);
		this.indent();
	}

	leave(str?: string) {
		this.outdent();
		if (!this._suppressOutput && str) {
			this._out(this._padding + str);
		}
	}

	indent() {
		this._padding += this._tab;
	}

	outdent() {
		if (this._padding.length > 0) {
			this._padding = this._padding.substring(0, this._padding.length - this._tab.length);
		}
	}

	writeArray(arr: any[], detailed: boolean = false, noNumbers: boolean = false) {
		detailed = detailed || false;
		for (var i = 0, j = arr.length; i < j; i++) {
			var prefix = "";
			if (detailed) {
				if (arr[i] === null) {
					prefix = "null";
				} else if (arr[i] === undefined) {
					prefix = "undefined";
				} else {
					prefix = arr[i].constructor.name;
				}
				prefix += " ";
			}
			var number = noNumbers ? "" : ("" + i).padRight(' ', 4);
			this.writeLn(number + prefix + arr[i]);
		}
	}
}

export class CircularBuffer {
	index: number;
	start: number;
	array: ArrayBufferView;
	_size: number;
	_mask: number;
	constructor(Type, sizeInBits: number = 12) {
		this.index = 0;
		this.start = 0;
		this._size = 1 << sizeInBits;
		this._mask = this._size - 1;
		this.array = new Type(this._size);
	}
	public get (i) {
		return this.array[i];
	}

	public forEachInReverse(visitor) {
		if (this.isEmpty()) {
			return;
		}
		var i = this.index === 0 ? this._size - 1 : this.index - 1;
		var end = (this.start - 1) & this._mask;
		while (i !== end) {
			if (visitor(this.array[i], i)) {
				break;
			}
			i = i === 0 ? this._size - 1 : i - 1;
		}
	}

	public write(value) {
		this.array[this.index] = value;
		this.index = (this.index + 1) & this._mask;
		if (this.index === this.start) {
			this.start = (this.start + 1) & this._mask;
		}
	}

	public isFull(): boolean {
		return ((this.index + 1) & this._mask) === this.start;
	}

	public isEmpty(): boolean  {
		return this.index === this.start;
	}

	public reset() {
		this.index = 0;
		this.start = 0;
	}
}

export class ColorStyle {
	static TabToolbar = "#252c33";
	static Toolbars = "#343c45";
	static HighlightBlue = "#1d4f73";
	static LightText = "#f5f7fa";
	static ForegroundText = "#b6babf";
	static Black = "#000000";
	static VeryDark = "#14171a";
	static Dark = "#181d20";
	static Light = "#a9bacb";
	static Grey = "#8fa1b2";
	static DarkGrey = "#5f7387";
	static Blue = "#46afe3";
	static Purple = "#6b7abb";
	static Pink = "#df80ff";
	static Red = "#eb5368";
	static Orange = "#d96629";
	static LightOrange = "#d99b28";
	static Green = "#70bf53";
	static BlueGrey = "#5e88b0";

	private static _randomStyleCache;
	private static _nextStyle = 0;

	static randomStyle() {
		if (!ColorStyle._randomStyleCache) {
			ColorStyle._randomStyleCache = [
				"#ff5e3a",
				"#ff9500",
				"#ffdb4c",
				"#87fc70",
				"#52edc7",
				"#1ad6fd",
				"#c644fc",
				"#ef4db6",
				"#4a4a4a",
				"#dbddde",
				"#ff3b30",
				"#ff9500",
				"#ffcc00",
				"#4cd964",
				"#34aadc",
				"#007aff",
				"#5856d6",
				"#ff2d55",
				"#8e8e93",
				"#c7c7cc",
				"#5ad427",
				"#c86edf",
				"#d1eefc",
				"#e0f8d8",
				"#fb2b69",
				"#f7f7f7",
				"#1d77ef",
				"#d6cec3",
				"#55efcb",
				"#ff4981",
				"#ffd3e0",
				"#f7f7f7",
				"#ff1300",
				"#1f1f21",
				"#bdbec2",
				"#ff3a2d"
			];
		}
		return ColorStyle._randomStyleCache[(ColorStyle._nextStyle ++) % ColorStyle._randomStyleCache.length];
	}

	private static _gradient = [
		"#FF0000",  // Red
		"#FF1100",
		"#FF2300",
		"#FF3400",
		"#FF4600",
		"#FF5700",
		"#FF6900",
		"#FF7B00",
		"#FF8C00",
		"#FF9E00",
		"#FFAF00",
		"#FFC100",
		"#FFD300",
		"#FFE400",
		"#FFF600",
		"#F7FF00",
		"#E5FF00",
		"#D4FF00",
		"#C2FF00",
		"#B0FF00",
		"#9FFF00",
		"#8DFF00",
		"#7CFF00",
		"#6AFF00",
		"#58FF00",
		"#47FF00",
		"#35FF00",
		"#24FF00",
		"#12FF00",
		"#00FF00"   // Green
	];

	static gradientColor(value) {
		return ColorStyle._gradient[ColorStyle._gradient.length * clamp(value, 0, 1) | 0];
	}

	static contrastStyle(rgb: string): string {
		// http://www.w3.org/TR/AERT#color-contrast
		var c = parseInt(rgb.substr(1), 16);
		var yiq = (((c >> 16) * 299) + (((c >> 8) & 0xff) * 587) + ((c & 0xff) * 114)) / 1000;
		return (yiq >= 128) ? '#000000' : '#ffffff';
	}

	static reset() {
		ColorStyle._nextStyle = 0;
	}
}

export interface UntypedBounds {
	xMin: number;
	yMin: number;
	xMax: number;
	yMax: number;
}

export interface ASRectangle {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * Faster release version of bounds.
 */
export class Bounds {
	xMin: number;
	yMin: number;
	xMax: number;
	yMax: number;
	constructor (xMin: number, yMin: number, xMax: number, yMax: number) {
		this.xMin = xMin|0;
		this.yMin = yMin|0;
		this.xMax = xMax|0;
		this.yMax = yMax|0;
	}

	static FromUntyped (source: UntypedBounds): Bounds {
		return new Bounds(source.xMin, source.yMin, source.xMax, source.yMax);
	}

	static FromRectangle (source: ASRectangle): Bounds {
		return new Bounds(source.x * 20|0, source.y * 20|0, (source.x + source.width) * 20|0,
			(source.y + source.height) * 20|0);
	}

	setElements (xMin: number, yMin: number, xMax: number, yMax: number): void {
		this.xMin = xMin;
		this.yMin = yMin;
		this.xMax = xMax;
		this.yMax = yMax;
	}

	copyFrom (source: Bounds): void {
		this.setElements(source.xMin, source.yMin, source.xMax, source.yMax);
	}

	contains (x: number, y: number): boolean {
		return x < this.xMin !== x < this.xMax &&
			y < this.yMin !== y < this.yMax;
	}

	unionInPlace (other: Bounds): void {
		if (other.isEmpty()) {
			return;
		}
		this.extendByPoint(other.xMin, other.yMin);
		this.extendByPoint(other.xMax, other.yMax);
	}

	extendByPoint (x: number, y: number): void {
		this.extendByX(x);
		this.extendByY(y);
	}

	extendByX (x: number): void {
		// Exclude default values.
		if (this.xMin === 0x8000000) {
			this.xMin = this.xMax = x;
			return;
		}
		this.xMin = Math.min(this.xMin, x);
		this.xMax = Math.max(this.xMax, x);
	}

	extendByY (y: number): void {
		// Exclude default values.
		if (this.yMin === 0x8000000) {
			this.yMin = this.yMax = y;
			return;
		}
		this.yMin = Math.min(this.yMin, y);
		this.yMax = Math.max(this.yMax, y);
	}

	public intersects(toIntersect: Bounds): boolean {
		return this.contains(toIntersect.xMin, toIntersect.yMin) ||
			this.contains(toIntersect.xMax, toIntersect.yMax);
	}

	isEmpty (): boolean {
		return this.xMax <= this.xMin || this.yMax <= this.yMin;
	}

	get width(): number {
		return this.xMax - this.xMin;
	}

	set width(value: number) {
		this.xMax = this.xMin + value;
	}

	get height(): number {
		return this.yMax - this.yMin;
	}

	set height(value: number) {
		this.yMax = this.yMin + value;
	}

	public getBaseWidth(angle: number): number {
		var u = Math.abs(Math.cos(angle));
		var v = Math.abs(Math.sin(angle));
		return u * (this.xMax - this.xMin) + v * (this.yMax - this.yMin);
	}

	public getBaseHeight(angle: number): number {
		var u = Math.abs(Math.cos(angle));
		var v = Math.abs(Math.sin(angle));
		return v * (this.xMax - this.xMin) + u * (this.yMax - this.yMin);
	}

	setEmpty (): void {
		this.xMin = this.yMin = this.xMax = this.yMax = 0;
	}

	/**
	 * Set all fields to the sentinel value 0x8000000.
	 *
	 * This is what Flash uses to indicate uninitialized bounds. Important for bounds calculation
	 * in `Graphics` instances, which start out with empty bounds but must not just extend them
	 * from an 0,0 origin.
	 */
	setToSentinels (): void {
		this.xMin = this.yMin = this.xMax = this.yMax = 0x8000000;
	}

	clone (): Bounds {
		return new Bounds(this.xMin, this.yMin, this.xMax, this.yMax);
	}

	toString(): string {
		return "{ " +
			"xMin: " + this.xMin + ", " +
			"xMin: " + this.yMin + ", " +
			"xMax: " + this.xMax + ", " +
			"xMax: " + this.yMax +
			" }";
	}
}

/**
 * Slower debug version of bounds, makes sure that all points have integer coordinates.
 */
export class DebugBounds {
	private _xMin: number;
	private _yMin: number;
	private _xMax: number;
	private _yMax: number;

	constructor (xMin: number, yMin: number, xMax: number, yMax: number) {
		assert(isInteger(xMin));
		assert(isInteger(yMin));
		assert(isInteger(xMax));
		assert(isInteger(yMax));
		this._xMin = xMin|0;
		this._yMin = yMin|0;
		this._xMax = xMax|0;
		this._yMax = yMax|0;
		this.assertValid();
	}

	static FromUntyped (source: UntypedBounds): DebugBounds {
		return new DebugBounds(source.xMin, source.yMin, source.xMax, source.yMax);
	}

	static FromRectangle (source: ASRectangle): DebugBounds {
		return new DebugBounds(source.x * 20|0, source.y * 20|0, (source.x + source.width) * 20|0,
			(source.y + source.height) * 20|0);
	}

	setElements (xMin: number, yMin: number, xMax: number, yMax: number): void {
		this.xMin = xMin;
		this.yMin = yMin;
		this.xMax = xMax;
		this.yMax = yMax;
	}

	copyFrom (source: DebugBounds): void {
		this.setElements(source.xMin, source.yMin, source.xMax, source.yMax);
	}

	contains (x: number, y: number): boolean {
		return x < this.xMin !== x < this.xMax &&
			y < this.yMin !== y < this.yMax;
	}

	unionInPlace (other: DebugBounds): void {
		if (other.isEmpty()) {
			return;
		}
		this.extendByPoint(other.xMin, other.yMin);
		this.extendByPoint(other.xMax, other.yMax);
	}

	extendByPoint (x: number, y: number): void {
		this.extendByX(x);
		this.extendByY(y);
	}

	extendByX (x: number): void {
		if (this.xMin === 0x8000000) {
			this.xMin = this.xMax = x;
			return;
		}
		this.xMin = Math.min(this.xMin, x);
		this.xMax = Math.max(this.xMax, x);
	}

	extendByY (y: number): void {
		if (this.yMin === 0x8000000) {
			this.yMin = this.yMax = y;
			return;
		}
		this.yMin = Math.min(this.yMin, y);
		this.yMax = Math.max(this.yMax, y);
	}

	public intersects(toIntersect: DebugBounds): boolean {
		return this.contains(toIntersect._xMin, toIntersect._yMin) ||
			this.contains(toIntersect._xMax, toIntersect._yMax);
	}

	isEmpty (): boolean {
		return this._xMax <= this._xMin || this._yMax <= this._yMin;
	}

	set xMin(value: number) {
		assert(isInteger(value));
		this._xMin = value;
		this.assertValid();
	}

	get xMin(): number {
		return this._xMin;
	}

	set yMin(value: number) {
		assert(isInteger(value));
		this._yMin = value|0;
		this.assertValid();
	}

	get yMin(): number {
		return this._yMin;
	}

	set xMax(value: number) {
		assert(isInteger(value));
		this._xMax = value|0;
		this.assertValid();
	}

	get xMax(): number {
		return this._xMax;
	}

	get width(): number {
		return this._xMax - this._xMin;
	}

	set yMax(value: number) {
		assert(isInteger(value));
		this._yMax = value|0;
		this.assertValid();
	}

	get yMax(): number {
		return this._yMax;
	}

	get height(): number {
		return this._yMax - this._yMin;
	}

	public getBaseWidth(angle: number): number {
		var u = Math.abs(Math.cos(angle));
		var v = Math.abs(Math.sin(angle));
		return u * (this._xMax - this._xMin) + v * (this._yMax - this._yMin);
	}

	public getBaseHeight(angle: number): number {
		var u = Math.abs(Math.cos(angle));
		var v = Math.abs(Math.sin(angle));
		return v * (this._xMax - this._xMin) + u * (this._yMax - this._yMin);
	}

	setEmpty (): void {
		this._xMin = this._yMin = this._xMax = this._yMax = 0;
	}

	clone (): DebugBounds {
		return new DebugBounds(this.xMin, this.yMin, this.xMax, this.yMax);
	}

	toString(): string {
		return "{ " +
			"xMin: " + this._xMin + ", " +
			"yMin: " + this._yMin + ", " +
			"xMax: " + this._xMax + ", " +
			"yMax: " + this._yMax +
			" }";
	}

	private assertValid(): void {
//      release || assert(this._xMax >= this._xMin);
//      release || assert(this._yMax >= this._yMin);
	}
}

/**
 * Override Bounds with a slower by safer version, don't do this in release mode.
 */
	// Shumway.Bounds = DebugBounds;

export class Color {
	public r: number;
	public g: number;
	public b: number;
	public a: number;
	constructor(r: number, g: number, b: number, a: number) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
	static FromARGB(argb: number) {
		return new Color (
			(argb >> 16 & 0xFF) / 255,
			(argb >>  8 & 0xFF) / 255,
			(argb >>  0 & 0xFF) / 255,
			(argb >> 24 & 0xFF) / 255
		);
	}
	static FromRGBA(rgba: number) {
		return Color.FromARGB(RGBAToARGB(rgba));
	}
	public toRGBA() {
		return (this.r * 255) << 24 | (this.g * 255) << 16 | (this.b * 255) << 8 | (this.a * 255);
	}
	public toCSSStyle() {
		return rgbaToCSSStyle(this.toRGBA());
	}
	set (other: Color) {
		this.r = other.r;
		this.g = other.g;
		this.b = other.b;
		this.a = other.a;
	}
	public static Red   = new Color(1, 0, 0, 1);
	public static Green = new Color(0, 1, 0, 1);
	public static Blue  = new Color(0, 0, 1, 1);
	public static None  = new Color(0, 0, 0, 0);
	public static White = new Color(1, 1, 1, 1);
	public static Black = new Color(0, 0, 0, 1);
	private static colorCache: { [color: string]: Color } = {};
	public static randomColor(alpha: number = 1): Color {
		return new Color(Math.random(), Math.random(), Math.random(), alpha);
	}
	public static parseColor(color: string) {
		if (!Color.colorCache) {
			Color.colorCache = Object.create(null);
		}
		if (Color.colorCache[color]) {
			return Color.colorCache[color];
		}
		// TODO: Obviously slow, but it will do for now.
		var span = document.createElement('span');
		document.body.appendChild(span);
		span.style.backgroundColor = color;
		var rgb = getComputedStyle(span).backgroundColor;
		document.body.removeChild(span);
		var m = /^rgb\((\d+), (\d+), (\d+)\)$/.exec(rgb);
		if (!m) m = /^rgba\((\d+), (\d+), (\d+), ([\d.]+)\)$/.exec(rgb);
		var result = new Color(0, 0, 0, 0);
		result.r = parseFloat(m[1]) / 255;
		result.g = parseFloat(m[2]) / 255;
		result.b = parseFloat(m[3]) / 255;
		result.a = m[4] ? parseFloat(m[4]) / 255 : 1;
		return Color.colorCache[color] = result;
	}
}

export function registerCSSFont(id: number, data: Uint8Array, forceFontInit: boolean) {
	if (!inBrowser) {
		Debug.warning('Cannot register CSS font outside the browser');
		return;
	}
	var head = document.head;
	head.insertBefore(document.createElement('style'), head.firstChild);
	var style = <CSSStyleSheet>document.styleSheets[0];
	var rule = '@font-face{font-family:swffont' + id + ';src:url(data:font/opentype;base64,' +
		base64EncodeBytes(data) + ')' + '}';
	style.insertRule(rule, style.cssRules.length);
	// In at least Chrome, the browser only decodes a font once it's used in the page at all.
	// Because it still does so asynchronously, we create a with some text using the font, take
	// some measurement from it (which will turn out wrong because the font isn't yet available),
	// and then remove the node again. Then, magic happens. After a bit of time for said magic to
	// take hold, the font is available for actual use on canvas.
	// TODO: remove the need for magic by implementing this in terms of the font loading API.
	if (forceFontInit) {
		var node = document.createElement('div');
		node.style.fontFamily = 'swffont' + id;
		node.innerHTML = 'hello';
		document.body.appendChild(node);
		var dummyHeight = node.clientHeight;
		document.body.removeChild(node);
	}
}



export class Callback {
	private _queues: any;
	constructor () {
		this._queues = {};
	}

	public register(type, callback) {
		assert(type);
		assert(callback);
		var queue = this._queues[type];
		if (queue) {
			if (queue.indexOf(callback) > -1) {
				return;
			}
		} else {
			queue = this._queues[type] = [];
		}
		queue.push(callback);
	}

	public unregister(type: string, callback) {
		assert(type);
		assert(callback);
		var queue = this._queues[type];
		if (!queue) {
			return;
		}
		var i = queue.indexOf(callback);
		if (i !== -1) {
			queue.splice(i, 1);
		}
		if (queue.length === 0) {
			this._queues[type] = null;
		}
	}

	public notify(type: string, args) {
		var queue = this._queues[type];
		if (!queue) {
			return;
		}
		queue = queue.slice();
		var args = Array.prototype.slice.call(arguments, 0);
		for (var i = 0; i < queue.length; i++) {
			var callback = queue[i];
			callback.apply(null, args);
		}
	}

	public notify1(type: string, value) {
		var queue = this._queues[type];
		if (!queue) {
			return;
		}
		queue = queue.slice();
		for (var i = 0; i < queue.length; i++) {
			var callback = queue[i];
			callback(type, value);
		}
	}
}

export enum ImageType {
	None,

	/**
	 * Premultiplied ARGB (byte-order).
	 */
	PremultipliedAlphaARGB,

	/**
	 * Unpremultiplied ARGB (byte-order).
	 */
	StraightAlphaARGB,

	/**
	 * Unpremultiplied RGBA (byte-order), this is what putImageData expects.
	 */
	StraightAlphaRGBA,

	JPEG,
	PNG,
	GIF
}

export function getMIMETypeForImageType(type: ImageType): string {
	switch (type) {
		case ImageType.JPEG: return "image/jpeg";
		case ImageType.PNG: return "image/png";
		case ImageType.GIF: return "image/gif";
		default: return "text/plain";
	}
}


export class PromiseWrapper<T> {
	public promise: Promise<T>;
	public resolve: (result:T) => void;
	public reject: (reason) => void;

	then(onFulfilled, onRejected) {
		return this.promise.then(onFulfilled, onRejected);
	}

	constructor() {
		this.promise = new Promise<T>(function (resolve, reject) {
			this.resolve = resolve;
			this.reject = reject;
		}.bind(this));
	}
}



declare var exports;
if (typeof exports !== "undefined") {
	exports["Shumway"] = Shumway;
}


/**
 * Extend builtin prototypes.
 *
 * TODO: Go through the code and remove all references to these.
 */
(function () {
	function extendBuiltin(prototype, property, value) {
		if (!prototype[property]) {
			Object.defineProperty(prototype, property,
				{ value: value,
					writable: true,
					configurable: true,
					enumerable: false });
		}
	}

	function removeColors(s) {
		return s.replace(/\033\[[0-9]*m/g, "");
	}

	extendBuiltin(String.prototype, "padRight", function (c, n) {
		var str = this;
		var length = removeColors(str).length;
		if (!c || length >= n) {
			return str;
		}
		var max = (n - length) / c.length;
		for (var i = 0; i < max; i++) {
			str += c;
		}
		return str;
	});

	extendBuiltin(String.prototype, "padLeft", function (c, n) {
		var str = this;
		var length = str.length;
		if (!c || length >= n) {
			return str;
		}
		var max = (n - length) / c.length;
		for (var i = 0; i < max; i++) {
			str = c + str;
		}
		return str;
	});

	extendBuiltin(String.prototype, "trim", function () {
		return this.replace(/^\s+|\s+$/g,"");
	});

	extendBuiltin(String.prototype, "endsWith", function (str) {
		return this.indexOf(str, this.length - str.length) !== -1;
	});

	extendBuiltin(Array.prototype, "replace", function(x, y) {
		if (x === y) {
			return 0;
		}
		var count = 0;
		for (var i = 0; i < this.length; i++) {
			if (this[i] === x) {
				this[i] = y;
				count ++;
			}
		}
		return count;
	});

})();
