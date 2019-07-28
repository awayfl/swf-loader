import { TraitInfo } from "./TraitInfo";
import { ABCFile } from "./ABCFile";
import { TRAIT } from "./TRAIT";
import { Multiname } from "./Multiname";
import { CONSTANT } from "./CONSTANT";
import { typeDefaultValues } from "./typeDefaultValues";

export class SlotTraitInfo extends TraitInfo {
    constructor(
      abc: ABCFile,
      kind: TRAIT,
      name: Multiname | number,
      public slot: number,
      public typeName: Multiname | number,
      public defaultValueKind: CONSTANT,
      public defaultValueIndex: number
    ) {
      super(abc, kind, name);
    }
  
    resolve() {
      super.resolve();
      if (typeof this.typeName === "number") {
        this.typeName = this.abc.getMultiname(<number>this.typeName);
      }
    }
  
    getTypeName() {
      this.resolve();
      return <Multiname>this.typeName;
    }
  
    getDefaultValue(): any {
      if (this.defaultValueKind === -1) {
        if (this.typeName === null) {
          return undefined;
        }
        var value = typeDefaultValues[(<Multiname>this.typeName).getMangledName()];
        return value === undefined ? null : value;
      }
      return this.abc.getConstant(this.defaultValueKind, this.defaultValueIndex);
    }
  }