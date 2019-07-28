import { Traits } from "./Traits";
import { ABCFile } from "./ABCFile";
import { Multiname } from "./Multiname";
import { SlotTraitInfo } from "./SlotTraitInfo";
import { TRAIT } from "./TRAIT";

export class ExceptionInfo {
    public catchPrototype: Object = null;
    private _traits: Traits = null;
    constructor(
      public abc: ABCFile,
      public start: number,
      public end: number,
      public target: number,
      public type: Multiname | number,
      public varName: number
    ) {
      // ...
    }
  
    getType(): Multiname {
      if (typeof this.type === "number") {
        this.type = this.abc.getMultiname(<number>this.type);
      }
      return <Multiname>this.type;
    }
  
    getTraits(): Traits {
      if (!this._traits) {
        var traits = [];
        if (this.varName) {
          traits.push(new SlotTraitInfo(this.abc, TRAIT.Slot, this.varName, 1, this.type, 0, 0));
        }
        this._traits = new Traits(traits);
        this._traits.resolve();
      }
      return this._traits;
    }
  }