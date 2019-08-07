import { ASObject } from '../../avm2/nat/ASObject';
import { notImplemented } from '../../base/utilities/Debug';
import { AXClass } from '../../avm2/run/AXClass';

export class SharedObject extends ASObject {
	private _data: ASObject;
	private _object_name: string;

	static axClass: typeof SharedObject;

	//for AVM1:
	//public fps: number;

	constructor(name: string) {
		super();
		this._object_name = name;
		if (typeof (Storage) !== "undefined") {
			this._data = JSON.parse(localStorage.getItem(name));
		}
		if (this._data == null) {
			console.log("no shared object found");
			this._data = this.sec.createObject();
		}
	}


	static get defaultObjectEncoding(): number /*uint*/ {
		notImplemented("public flash.net.SharedObject::static defaultObjectEncoding"); return;
	}
	static set defaultObjectEncoding(version: number /*uint*/) {
		notImplemented("public flash.net.SharedObject::static defaultObjectEncoding"); return;
	}
	public static deleteAll(url: string): number /*int*/ {
		notImplemented("public flash.net.SharedObject::static deleteAll"); return;
	}
	public static getDiskUsage(url: string): number /*int*/ {
		notImplemented("public flash.net.SharedObject::static getDiskUsage");
		return 0;
	}
	public static getLocal(name: string, localPath?: string, secure?: boolean): SharedObject {
		return this.sec.flash.net.SharedObject(name);
	}
	public static getRemote(name: string, remotePath?: string, persistence?: boolean, secure?: boolean): SharedObject {
		return new SharedObject(name);
	}

	public flush(minDiscSapce: number = 0): void {
		if (typeof (Storage) !== "undefined") {
			localStorage.setItem(this._object_name, JSON.stringify(this._data));
		}
		else {
			console.log("no local storage available");

		}
	}


	public get data(): ASObject {
		return this._data;
	}
	public set data(object: ASObject) {
		this._data=object;
	}

	public get objectEncoding(): number /*uint*/ {
		notImplemented("public flash.net.SharedObject::get objectEncoding"); return;
	}
	public set objectEncoding(version: number /*uint*/) {
		notImplemented("public flash.net.SharedObject::set objectEncoding"); return;
	}

	public get client(): ASObject {
		notImplemented("public flash.net.SharedObject::get client"); return;
		// return this._client;
	}
	public set client(object: ASObject) {
		notImplemented("public flash.net.SharedObject::set client"); return;
		// this._client = object;
	}
	public setDirty(propertyName: string): void {
		notImplemented("public flash.net.SharedObject::setDirty"); return;
	}

	public connect(myConnection: any, params: string = null): void {
		notImplemented("public flash.net.SharedObject::connect"); return;
	}

	public send(): void {
		notImplemented("public flash.net.SharedObject::send"); return;
	}

	public close(): void {
		notImplemented("public flash.net.SharedObject::close"); return;
	}


	public clear(): void {
		notImplemented("public flash.net.SharedObject::clear"); return;
	}

	public get size(): number {
		notImplemented("public flash.net.SharedObject::get size"); return;
	}

	public set fps(updatesPerSecond: number) {
		notImplemented("public flash.net.SharedObject::set fps"); return;
	}

	public setProperty(propertyName: string, value: any = null): void {
		notImplemented("public flash.net.SharedObject::setProperty"); return;
	}

}