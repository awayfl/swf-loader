import { TraitInfo } from "./TraitInfo";
import { ABCFile } from "./ABCFile";
import { Multiname } from "./Multiname";
import { TRAIT } from "./TRAIT";
import { MethodInfo } from "./MethodInfo";


export class MethodTraitInfo extends TraitInfo {
    public method: Function = null;
    constructor(
      abc: ABCFile,
      kind: TRAIT,
      name: Multiname | number,
      public methodInfo: MethodInfo | number
    ) {
      super(abc, kind, name);
    }
  
    getMethodInfo(): MethodInfo {
      return <MethodInfo>this.methodInfo;
    }
  
    resolve() {
      super.resolve();
      if (typeof this.methodInfo === "number") {
        this.methodInfo = this.abc.getMethodInfo(<number>this.methodInfo);
      }
    }
  }
  