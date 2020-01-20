import { ASObject } from '../../avm2/nat/ASObject';
import { notImplemented, warning } from '../../base/utilities/Debug';
import { AXClass } from '../../avm2/run/AXClass';
import { axCoerceString } from '../../avm2/run/axCoerceString';
import { ObjectEncoding } from '../../avm2/natives/byteArray';
import { StringUtilities } from '../../base/utilities/StringUtilities';
import { AMF3 } from '../../avm2/amf';
import { ByteArray } from '../utils/ByteArray';

interface IStorage {
	getItem(key: string): string;
	setItem(key: string, value: string): void;
	removeItem(key: string): void;
  }
  
  var _sharedObjectStorage: IStorage;
function getSharedObjectStorage(): IStorage  {
	/*if (!_sharedObjectStorage) {
	  if (typeof ShumwayCom !== 'undefined' && ShumwayCom.createSpecialStorage) {
		_sharedObjectStorage = ShumwayCom.createSpecialStorage();
	  } else {
		_sharedObjectStorage = (<any>window).sessionStorage;
	  }
	}
	release || assert(_sharedObjectStorage, "SharedObjectStorage is not available.");
	*/
	if (typeof (Storage) !== "undefined") {
		_sharedObjectStorage=localStorage;
	}
	return _sharedObjectStorage;
  }
export class SharedObject extends ASObject {
	private _data: ASObject;
	private _object_name: string;

	static axClass: typeof SharedObject;

	//for AVM1:
	//public fps: number;

	constructor() {
		super();
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
	
	public _path: string;
	public _fps: number;
	public _objectEncoding;
	private static _defaultObjectEncoding = ObjectEncoding.DEFAULT;
	
	public static getLocal(name: string, localPath?: string, secure?: boolean): SharedObject {
		name = axCoerceString(name);
		localPath = axCoerceString(localPath);
		secure = !!secure;
		var path = (localPath || '') + '/' + name;
		/*if (this._sharedObjects[path]) {
		return this._sharedObjects[path];
		}*/
		var encodedData = getSharedObjectStorage().getItem(path);
		var data;
		var encoding = this._defaultObjectEncoding;
		if (encodedData) {
		try {
			var bytes = StringUtilities.decodeRestrictedBase64ToBytes(encodedData);
			//console.log("loaded bytes", bytes);
			var serializedData = new ByteArray(bytes.length);
			(<any>serializedData).sec=this.sec;
			serializedData.setArrayBuffer(bytes.buffer);
			
			//console.log("serializedData.arraybytes", serializedData.arraybytes);
			
				
			//	unexpected("Object Encoding");
			//}
			data = AMF3.read(<any>serializedData); //serializedData.readObject();
			//encoding = serializedData.objectEncoding;
		} catch (e) {
			warning('Error encountered while decoding LocalStorage entry. Resetting data.');
		}
		if (!data || typeof data !== 'object') {
			data = this.sec.createObject();
		}
		} else {
		data = this.sec.createObject();
		}
		var so = this.sec.flash.net.SharedObject();
		so._path=path;
		so._objectEncoding = encoding;
		so._data=data;
		return so;
	}
	public static getRemote(name: string, remotePath?: string, persistence?: boolean, secure?: boolean): SharedObject {
		return new SharedObject();
	}

	public flush(minDiskSpace: number = 0): void {
		/*if (typeof (Storage) !== "undefined") {
			localStorage.setItem(this._object_name, JSON.stringify(this._data));
		}
		else {
			console.log("no local storage available");

		}*/
		minDiskSpace = minDiskSpace | 0;

		
		// Check if the object is empty. If it is, don't create a stored object if one doesn't exist.
		var isEmpty = true;
		for (var key in this._data) {
		  if (this._data.hasOwnProperty(key)) {
			isEmpty = false;
			break;
		  }
		}
		if (isEmpty && !getSharedObjectStorage().getItem(this._path)) {
		  return;
		}
		var serializedData = new ByteArray();
		(<any>serializedData).sec=this.sec;
		//serializedData.objectEncoding = this._objectEncoding;
		serializedData.writeObject(this._data);
		
        AMF3.write(<any>serializedData, this._data);
		//data = AMF3.write(<any>serializedData); //serializedData.readObject();
		var bytes = new Uint8Array(serializedData.arraybytes);
		var encodedData = StringUtilities.base64EncodeBytes(bytes);
		/*if (!release) {
		  var decoded = StringUtilities.decodeRestrictedBase64ToBytes(encodedData);
		  assert(decoded.byteLength === bytes.byteLength);
		  for (var i = 0; i < decoded.byteLength; i++) {
			assert(decoded[i] === bytes[i]);
		  }
		}*/
		getSharedObjectStorage().setItem(this._path, encodedData);
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