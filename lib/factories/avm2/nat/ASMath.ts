import { ASObject } from "./ASObject";
import { defineNonEnumerableProperty } from "../../base/utilities/ObjectUtilities";

export class ASMath extends ASObject {
    public static classNatives: any [] = [Math];
    static classInitializer: any = function() {
      defineNonEnumerableProperty(this, '$BgE', Math.E);
      defineNonEnumerableProperty(this, '$BgLN10', Math.LN10);
      defineNonEnumerableProperty(this, '$BgLN2', Math.LN2);
      defineNonEnumerableProperty(this, '$BgLOG10E', Math.LOG10E);
      defineNonEnumerableProperty(this, '$BgLOG2E', Math.LOG2E);
      defineNonEnumerableProperty(this, '$BgPI', Math.PI);
      defineNonEnumerableProperty(this, '$BgSQRT1_2', Math.SQRT2);
      defineNonEnumerableProperty(this, '$BgSQRT2', Math.SQRT2);
    }
  }
  