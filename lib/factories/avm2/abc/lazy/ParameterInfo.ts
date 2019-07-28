import { CONSTANT } from "./CONSTANT";
import { ABCFile } from "./ABCFile";
import { Multiname } from "./Multiname";

export class ParameterInfo {
    constructor(
      public abc: ABCFile,
      public type: Multiname | number,
      /**
       * Don't rely on the name being correct.
       */
      public name: string | number,
      public optionalValueKind: CONSTANT,
      public optionalValueIndex: number
    ) {
      // ...
    }
  
    getName(): string {
      if (typeof this.name === "number") {
        this.name = this.abc.getString(<number>this.name);
      }
      return <string>this.name;
    }
  
    getType(): Multiname {
      if (typeof this.type === "number") {
        this.type = this.abc.getMultiname(<number>this.type);
      }
      return <Multiname>this.type;
    }
  
    hasOptionalValue(): boolean {
      return this.optionalValueKind >= 0;
    }
  
    getOptionalValue(): any {
      return this.abc.getConstant(this.optionalValueKind, this.optionalValueIndex);
    }
  
    toString() {
      var str = "";
      if (this.name) {
        str += this.getName();
      } else {
        str += "?";
      }
      if (this.type) {
        str += ": " + this.getType().name;
      }
      if (this.optionalValueKind >= 0) {
        str += " = " + this.abc.getConstant(this.optionalValueKind, this.optionalValueIndex);
      }
      return str;
    }
  }