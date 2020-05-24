
import {argumentsToString} from "../utilities";
import {omitRepeatedWarnings} from "../settings";

export var release:boolean = true;
export var debugable: boolean = true;

export class Debug{
	public static release:boolean=release;
	public static assert=assert;
	public static error=error;
	public static assertUnreachable=assertUnreachable;
	public static assertNotImplemented=assertNotImplemented;
	public static warning=warning;
	public static notImplemented=notImplemented;
	public static dummyConstructor=dummyConstructor;
	public static warnCounts=warnCounts;
	public static abstractMethod=abstractMethod;
	public static somewhatImplemented=somewhatImplemented;
	public static unexpected=unexpected;
	public static unexpectedCase=unexpectedCase;
}


export function notImplemented(message: string) {
	warning('AVM1 not implemented: ' + message);
}

export function somewhatImplemented(message: string) {
	warning("AVM1 somewhatImplemented: " + message);
}

export function error(message: string) {
	console.error(message);
	throw new Error(message);
}

export function assert(condition: any, message: any = "assertion failed") {
	if (condition === "") {     // avoid inadvertent false positive
		condition = true;
	}
	if (!condition) {
		if (typeof console !== 'undefined' && 'assert' in console) {
			console.assert(false, message);
			throw new Error(message);
		} else {
			error(message.toString());
		}
	}
}

export function assertUnreachable(msg: string): void {
	var location = new Error().stack.split('\n')[1];
	throw new Error("Reached unreachable location " + location + msg);
}

export function assertNotImplemented(condition: boolean, message: string) {
	if (!condition) {
		error("notImplemented: " + message);
	}
}

var _warnedCounts = Object.create(null);

export function warning(message: any, arg1?: any, arg2?: any/*...messages: any[]*/) {
	if (release) {
		return;
	}
	var key = argumentsToString(arguments);
	if (_warnedCounts[key]) {
		_warnedCounts[key]++;
		if (omitRepeatedWarnings.value) {
			return;
		}
	}
	_warnedCounts[key] = 1;
	console.warn.apply(console, arguments);
}

export function warnCounts() {
	var list = [];
	for (var key in _warnedCounts) {
		list.push({key: key, count: _warnedCounts[key]});
	}
	list.sort((entry, prev) => prev.count - entry.count);
	return list.reduce((result, entry) => (result += '\n' + entry.count + '\t' + entry.key), '');
}

export function dummyConstructor(message: string) {
	release || assert(false, "Dummy Constructor: " + message);
}

export function abstractMethod(message: string) {
	release || assert(false, "Abstract Method " + message);
}


export function unexpected(message?: any) {
	assert(false, "Unexpected: " + message);
}

export function unexpectedCase(message?: any) {
	assert(false, "Unexpected Case: " + message);
}

interface IAwayDebug extends StringMap<IDebugMethodDeclaration> {}

declare global {
    interface Window { _AWAY_DEBUG_: IAwayDebug; }
}

// export WRITER API for capture AVM2 reports

type TMethodType = 'undefined' | 'object' | 'boolean' | 'number' | 'string' | 'function';
 
export interface IDebugMethodDeclaration {
	name: string;
	declaration?: Array<{name: string, type: TMethodType}>;
	description?: string;	
}

export function registerDebugMethod(func: (...args: any[]) => any, methodInfo: IDebugMethodDeclaration) {
	if(!debugable) {
		return;
	}

	const name = methodInfo.name;
	delete methodInfo.name;

	if(!methodInfo || !name) {
		throw new Error("Method name should not be empty");
	}

	const api: Object = window._AWAY_DEBUG_ = (window._AWAY_DEBUG_ || {});

	if(api.hasOwnProperty(name)) {
		console.warn(`Overrides existed debug method definition: ${name}`);
	}

	Object.assign(func, methodInfo);

	api[name] = func;
}
