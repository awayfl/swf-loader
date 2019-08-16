import { ensureBoxedReceiver } from "../run/ensureBoxedReceiver";
import { AXObject } from "../run/AXObject";
import { isNullOrUndefined, assert } from "@awayjs/graphics";
import { Errors } from "../errors";
import { release } from "../../base/utilities/Debug";
import { checkValue } from "../run/checkValue";
import { AXCallable } from "../run/AXCallable";
import { MethodInfo } from "../abc/lazy/MethodInfo";
import { Scope } from "../run/Scope";
import { ASObject } from "./ASObject";
import { addPrototypeFunctionAlias } from "./addPrototypeFunctionAlias";
import { defineNonEnumerableProperty } from "../../base/utilities/ObjectUtilities";
import { sliceArguments } from "../run/writers";
import { ASArray } from "./ASArray";


export class ASFunction extends ASObject {
    static classInitializer() {
      var proto: any = this.dPrototype;
      var asProto: any = ASFunction.prototype;
      addPrototypeFunctionAlias(proto, "$BgtoString", asProto.toString);
      addPrototypeFunctionAlias(proto, "$Bgcall", asProto.call);
      addPrototypeFunctionAlias(proto, "$Bgapply", asProto.apply);
      defineNonEnumerableProperty(proto, "value", asProto.native_functionValue);
    }
  
    private _prototype: AXObject;
    private _prototypeInitialzed: boolean = false;
    protected value: AXCallable;
    protected receiver: {scope: Scope};
    protected methodInfo: MethodInfo;
  
    public setReceiver(receiver:any){
      this.receiver=receiver;
    }
    axConstruct(args: any[]) {
      var prototype = this.prototype;
      // AS3 allows setting null/undefined prototypes. In order to make our value checking work,
      // we need to set a null-prototype that has the right inheritance chain. Since AS3 doesn't
      // have `__proto__` or `getPrototypeOf`, this is completely hidden from content.
      if (isNullOrUndefined(prototype)) {
        prototype = this.sec.AXFunctionUndefinedPrototype;
      }
      release || assert(typeof prototype === 'object');
      release || checkValue(prototype);
      var object = Object.create(prototype);
      object.__ctorFunction = this;
      this.value.apply(object, args);
      return object;
    }
  
    axIsInstanceOf(obj: any) {
      return obj && obj.__ctorFunction === this;
    }
  
    native_functionValue() {
      // Empty base function.
    }
  
    get prototype(): AXObject {
      if (!this._prototypeInitialzed) {
        this._prototype = Object.create(this.sec.AXObject.tPrototype);
        this._prototypeInitialzed = true;
      }
      return this._prototype;
    }
  
    set prototype(prototype: AXObject) {
      if (isNullOrUndefined(prototype)) {
        prototype = undefined;
      } else if (typeof prototype !== 'object' || this.sec.isPrimitive(prototype)) {
        this.sec.throwError('TypeError', Errors.PrototypeTypeError);
      }
      this._prototypeInitialzed = true;
      this._prototype = prototype;
    }
  
    get length(): number {
      if (this.value.methodInfo) {
        return this.value.methodInfo.parameters.length;
      }
      return this.value.length;
    }
  
    toString() {
      return "function Function() {}";
    }
  
    call(thisArg: any) {
      thisArg = ensureBoxedReceiver(this.sec, thisArg, this);
      return this.value.apply(thisArg, sliceArguments(arguments, 1));
    }
  
    apply(thisArg: any, argArray?: ASArray): any {
      thisArg = ensureBoxedReceiver(this.sec, thisArg, this);
      return this.value.apply(thisArg, argArray ? argArray.value : undefined);
    }
  
    axCall(thisArg: any): any {
      return this.value.apply(thisArg, sliceArguments(arguments, 1));
    }
  
    axApply(thisArg: any, argArray?: any[]): any {
      return this.value.apply(thisArg, argArray);
    }
  }