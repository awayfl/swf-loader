import { Multiname } from "./Multiname";
import { AXClass } from "../../run/AXClass";
import { TRAIT } from "./TRAIT";
import { ABCFile } from "./ABCFile";

export class RuntimeTraitInfo {
    configurable: boolean = true; // Always true.
    enumerable: boolean; // Always false.
    writable: boolean;
    get: () => any;
    set: (v: any) => void;
    slot: number;
    value: any;
    typeName: Multiname;
  
    private _type: AXClass;
  
    constructor(public name: Multiname, public kind: TRAIT, private abc: ABCFile) {
      this._type = undefined;
      this.typeName = null;
    }
  
    getType(): AXClass {
      if (this._type !== undefined) {
        return this._type;
      }
      if (this.typeName === null) {
        return this._type = null;
      }
      var type = this.abc.applicationDomain.getClass(this.typeName);
      return this._type = (type && type.axCoerce) ? type : null;
    }
  }