import { ASObject } from "./ASObject";
import { ClassInfo } from "../abc/lazy/ClassInfo";
import { assert } from "@awayjs/graphics";
import { AXSecurityDomain } from "../run/AXSecurityDomain";
import { Errors } from "../errors";
import { release } from '../../base/utilities/Debug';

export class ASClass extends ASObject {
    dPrototype: ASObject;
    tPrototype: ASObject;
  
    classNatives: Object [];
    instanceNatives: Object [];
  
    /**
     * Called on every class when it is initialized. The |axClass| object is passed in as |this|.
     */
    classInitializer: (asClass?: ASClass) => void;
  
    classSymbols: string [];
    instanceSymbols: string [];
    classInfo: ClassInfo;
  
    axCoerce(v: any): any {
      return v;
    }
  
    axConstruct: (argArray?: any []) => any;
    axIsType: (value: any) => boolean;
  
    get prototype(): ASObject {
      release || assert (this.dPrototype);
      return this.dPrototype;
    }
  
    static classInitializer = null;
  }
  