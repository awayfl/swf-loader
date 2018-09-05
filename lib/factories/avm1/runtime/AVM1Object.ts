import { IDisplayObjectAdapter } from "@awayjs/scene";
import { IAVM1Context, AVM1PropertyFlags, alToString, alIsName, IAVM1Callable, AVM1DefaultValueHint, alIsFunction } from "../runtime";
import { IAsset } from "@awayjs/core";
import { AVM1Context } from "../context";
import { release, Debug } from "../../base/utilities/Debug";
import { AVM1PropertyDescriptor } from "./AVM1PropertyDescriptor";

/**
 * Base class for object instances we prefer to not inherit Object.prototype properties.
 */
export class NullPrototypeObject { }

var DEBUG_PROPERTY_PREFIX = '$Bg';

/**
 * Base class for the ActionScript AVM1 object.
 */
export class AVM1Object extends NullPrototypeObject implements IDisplayObjectAdapter {
	// Using our own bag of properties
	public _ownProperties: any;
	public _prototype: AVM1Object;

	public _avm1Context: IAVM1Context;

    public adaptee: IAsset;
    public eventObserver:any;
	public _blockedByScript:boolean;
	public _ctBlockedByScript:boolean;
	protected _visibilityByScript:boolean;
	public dispose(): any{

	}
	public isBlockedByScript():boolean{
		return this._blockedByScript;
	}
	public isColorTransformByScript():boolean{
		return this._ctBlockedByScript;
	}

	public isVisibilityByScript():boolean{
		return this._visibilityByScript;
	}
	public doInitEvents():void
	{
	}

	public freeFromScript():void{
		this._blockedByScript=false;
		this._ctBlockedByScript=false;
		this._visibilityByScript=false;
	}

	public clone(){

		var newAVM1Object:AVM1Object=new AVM1Object(this._avm1Context);
		return newAVM1Object;

	}

	public get context(): AVM1Context { // too painful to have it as IAVM1Context
		return <AVM1Context>this._avm1Context;
	}

	public constructor(avm1Context: IAVM1Context) {
		super();
		this._avm1Context = avm1Context;
		this._ownProperties = Object.create(null);
		this._prototype = null;
		this._blockedByScript=false;
		this._ctBlockedByScript=false;
		this._visibilityByScript=false;
		var self = this;
		// Using IAVM1Callable here to avoid circular calls between AVM1Object and
		// AVM1Function during constructions.
		// TODO do we need to support __proto__ for all SWF versions?
		var getter = { alCall: function (thisArg: any, args?: any[]): any { return self.alPrototype; }};
		var setter = { alCall: function (thisArg: any, args?: any[]): any { self.alPrototype = args[0]; }};
		var desc = new AVM1PropertyDescriptor(AVM1PropertyFlags.ACCESSOR |
			AVM1PropertyFlags.DONT_DELETE |
			AVM1PropertyFlags.DONT_ENUM,
			null,
			getter,
			setter);
		this.alSetOwnProperty('__proto__', desc);
	}

	get alPrototype(): AVM1Object {
		return this._prototype;
	}

	set alPrototype(v: AVM1Object) {
		// checking for circular references
		var p = v;
		while (p) {
			if (p === this) {
				return; // possible loop in __proto__ chain is found
			}
			p = p.alPrototype;
		}
		// TODO recursive chain check
		this._prototype = v;
	}

	public alGetPrototypeProperty(): AVM1Object {
		return this.alGet('prototype');
	}

	// TODO shall we add mode for readonly/native flags of the prototype property?
	public alSetOwnPrototypeProperty(v: any): void {
		this.alSetOwnProperty('prototype', new AVM1PropertyDescriptor(AVM1PropertyFlags.DATA |
			AVM1PropertyFlags.DONT_ENUM,
			v));
	}

	public alGetConstructorProperty(): AVM1Object {
		return this.alGet('__constructor__');
	}

	public alSetOwnConstructorProperty(v: any): void {
		this.alSetOwnProperty('__constructor__', new AVM1PropertyDescriptor(AVM1PropertyFlags.DATA |
			AVM1PropertyFlags.DONT_ENUM,
			v));
	}

	_debugEscapeProperty(p: any): string {
		var context = this.context;
		var name = alToString(context, p);
		if (!context.isPropertyCaseSensitive) {
			name = name.toLowerCase();
		}
		return DEBUG_PROPERTY_PREFIX + name;
	}

	public alGetOwnProperty(name): AVM1PropertyDescriptor {
		if (typeof name === 'string' && !this.context.isPropertyCaseSensitive) {
			name = name.toLowerCase();
		}
		release || Debug.assert(alIsName(this.context, name));
		// TODO __resolve
		return this._ownProperties[name];
	}

	public alSetOwnProperty(p, desc: AVM1PropertyDescriptor): void {
		var name = this.context.normalizeName(p);
		if (!desc.originalName && !this.context.isPropertyCaseSensitive) {
			desc.originalName = p;
		}
		if (!release) {
			Debug.assert(desc instanceof AVM1PropertyDescriptor);
			// Ensure that a descriptor isn't used multiple times. If it were, we couldn't update
			// values in-place.
			Debug.assert(!desc['owningObject'] || desc['owningObject'] === this);
			desc['owningObject'] = this;
			// adding data property on the main object for convenience of debugging.
			if ((desc.flags & AVM1PropertyFlags.DATA) &&
				!(desc.flags & AVM1PropertyFlags.DONT_ENUM)) {
				Object.defineProperty(this, this._debugEscapeProperty(name),
					{value: desc.value, enumerable: true, configurable: true});
			}
		}
		this._ownProperties[name] = desc;
	}

	public alHasOwnProperty(p): boolean  {
		var name = this.context.normalizeName(p);
		return !!this._ownProperties[name];
	}

	public alDeleteOwnProperty(p) {
		var name = this.context.normalizeName(p);
		delete this._ownProperties[name];
		if (!release) {
			delete this[this._debugEscapeProperty(p)];
		}
	}

	public deleteOwnProperties() {
		var allProps=this.alGetOwnPropertiesKeys();
		for(var i=0;i<allProps.length;i++){
			this.alDeleteOwnProperty(allProps[i]);
		}
	}
	public alGetOwnPropertiesKeys(): string[] {
		var keys: string[] = [];
		if (!this.context.isPropertyCaseSensitive) {
			for (var name in this._ownProperties) {
				var desc = this._ownProperties[name];
				release || Debug.assert("originalName" in desc);
				if (!(desc.flags & AVM1PropertyFlags.DONT_ENUM)) {
					keys.push(desc.originalName);
				}
			}
		} else {
			for (var name in this._ownProperties) {
				var desc = this._ownProperties[name];
				if (!(desc.flags & AVM1PropertyFlags.DONT_ENUM)) {
					keys.push(name);
				}
			}
		}
		return keys;
	}

	public alGetProperty(p): AVM1PropertyDescriptor {
		var desc = this.alGetOwnProperty(p);
		if (desc) {
			return desc;
		}
		if (!this._prototype) {
			return undefined;
		}
		return this._prototype.alGetProperty(p);
	}

	public alGet(p): any {
		//80pro name = this.context.normalizeName(p);
		var name = this.context.normalizeName(p);
		var desc = this.alGetProperty(name);
		if (!desc) {
			return undefined;
		}
		if ((desc.flags & AVM1PropertyFlags.DATA)) {
			return desc.value;
		}
		release || Debug.assert((desc.flags & AVM1PropertyFlags.ACCESSOR));
		var getter = desc.get;
		if (!getter) {
			return undefined;
		}
		return getter.alCall(this);
	}

	public alCanPut(p): boolean {
		var desc = this.alGetOwnProperty(p);
		if (desc) {
			if ((desc.flags & AVM1PropertyFlags.ACCESSOR)) {
				return !!desc.set;
			} else {
				return !(desc.flags & AVM1PropertyFlags.READ_ONLY);
			}
		}
		var proto = this._prototype;
		if (!proto) {
			return true;
		}
		return proto.alCanPut(p);
	}

	public alPut(p, v) {
		// Perform all lookups with the canonicalized name, but keep the original name around to
		// pass it to `alSetOwnProperty`, which stores it on the descriptor.
		var originalName = p;
		p = this.context.normalizeName(p);
		if (!this.alCanPut(p)) {
			return;
		}

		var ownDesc = this.alGetOwnProperty(p);
		if (ownDesc && (ownDesc.flags & AVM1PropertyFlags.DATA)) {
			
			if (ownDesc.watcher) {
				v = ownDesc.watcher.callback.alCall(this,
					[ownDesc.watcher.name, ownDesc.value, v, ownDesc.watcher.userData]);
			}
			// Real properties (i.e., not things like "_root" on MovieClips) can be updated in-place.
			if (p in this._ownProperties) {
				ownDesc.value = v;
			} else {
				this.alSetOwnProperty(originalName, new AVM1PropertyDescriptor(ownDesc.flags, v));
			}
			return;
		}
		if(typeof v==="undefined" && (p=="_x" || p=="_y" || p=="_xscale" || p=="_yscale" || p=="_width" || p== "_height")){
			// todo check which properties can be init with undefined
			return;
		}
		var desc = this.alGetProperty(p);
		if (desc && (desc.flags & AVM1PropertyFlags.ACCESSOR)) {
			if (desc.watcher) {
				var oldValue = desc.get ? desc.get.alCall(this) : undefined;
				v = desc.watcher.callback.alCall(this,
					[desc.watcher.name, oldValue, v, desc.watcher.userData]);
			}
			var setter = desc.set;
			release || Debug.assert(setter);
			setter.alCall(this, [v]);
		} else {
			if (desc && desc.watcher) {
				release || Debug.assert(desc.flags & AVM1PropertyFlags.DATA);
				v = desc.watcher.callback.alCall(this,
					[desc.watcher.name, desc.value, v, desc.watcher.userData]);
			}
			var newDesc = new AVM1PropertyDescriptor(desc ? desc.flags : AVM1PropertyFlags.DATA, v);
			this.alSetOwnProperty(originalName, newDesc);
		}
	}

	public alHasProperty(p): boolean  {
		var desc = this.alGetProperty(p);
		return !!desc;
	}

	public alDeleteProperty(p): boolean {
		var desc = this.alGetOwnProperty(p);
		if (!desc) {
			return true;
		}
		if ((desc.flags & AVM1PropertyFlags.DONT_DELETE)) {
			return false;
		}
		this.alDeleteOwnProperty(p);
		return true;
	}

	public alAddPropertyWatcher(p: any, callback: IAVM1Callable, userData: any): boolean {
		// TODO verify/test this functionality to match ActionScript
		var desc = this.alGetProperty(p);
		if (!desc) {
			return false;
		}
		desc.watcher = {
			name: p,
			callback: callback,
			userData: userData
		};
		return true;
	}

	public alRemotePropertyWatcher(p: any): boolean {
		var desc = this.alGetProperty(p);
		if (!desc || !desc.watcher) {
			return false;
		}
		desc.watcher = undefined;
		return true;

	}

	public alDefaultValue(hint: AVM1DefaultValueHint = AVM1DefaultValueHint.NUMBER): any {
		if (hint === AVM1DefaultValueHint.STRING) {
			var toString = this.alGet(this.context.normalizeName('toString'));
			if (alIsFunction(toString)) {
				var str = toString.alCall(this);
				return str;
			}
			var valueOf = this.alGet(this.context.normalizeName('valueOf'));
			if (alIsFunction(valueOf)) {
				var val = valueOf.alCall(this);
				return val;
			}
		} else {
			release || Debug.assert(hint === AVM1DefaultValueHint.NUMBER);
			var valueOf = this.alGet(this.context.normalizeName('valueOf'));
			if (alIsFunction(valueOf)) {
				var val = valueOf.alCall(this);
				return val;
			}
			var toString = this.alGet(this.context.normalizeName('toString'));
			if (alIsFunction(toString)) {
				var str = toString.alCall(this);
				return str;
			}
		}
		// TODO is this a default?
		return this;
	}

	public alGetKeys(): string[] {
		var ownKeys = this.alGetOwnPropertiesKeys();
		var proto = this._prototype;
		if (!proto) {
			return ownKeys;
		}

		var otherKeys = proto.alGetKeys();
		if (ownKeys.length === 0) {
			return otherKeys;
		}

		// Merging two keys sets
		// TODO check if we shall worry about __proto__ usage here
		var context = this.context;
		// If the context is case-insensitive, names only differing in their casing overwrite each
		// other. Iterating over the keys returns the first original, case-preserved key that was
		// ever used for the property, though.
		if (!context.isPropertyCaseSensitive) {
			var keyLists = [ownKeys, otherKeys];
			var canonicalKeysMap = Object.create(null);
			var keys = [];
			for (var k = 0; k < keyLists.length; k++) {
				var keyList = keyLists[k];
				for (var i = keyList.length; i--;) {
					var key = keyList[i];
					var canonicalKey = context.normalizeName(key);
					if (canonicalKeysMap[canonicalKey]) {
						continue;
					}
					canonicalKeysMap[canonicalKey] = true;
					keys.push(key);
				}
			}
			return keys;
		} else {
			var processed = Object.create(null);
			for (var i = 0; i < ownKeys.length; i++) {
				processed[ownKeys[i]] = true;
			}
			for (var i = 0; i < otherKeys.length; i++) {
				processed[otherKeys[i]] = true;
			}
			return Object.getOwnPropertyNames(processed);
		}
	}
}