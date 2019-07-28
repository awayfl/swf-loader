import { AXObject } from "../run/AXObject";
import { ASFunction } from "./ASFunction";
import { defineNonEnumerableProperty } from "../../base/utilities/ObjectUtilities";
import { AXCallable } from "../run/AXCallable";
import { Errors } from "../errors";
import { sliceArguments } from "../run/writers";
import { ASArray } from "./ASArray";

export class ASMethodClosure extends ASFunction {
    static classInitializer() {
      var proto: any = this.dPrototype;
      var asProto: any = ASMethodClosure.prototype;
      defineNonEnumerableProperty(proto, '$Bgcall', asProto.call);
      defineNonEnumerableProperty(proto, '$Bgapply', asProto.apply);
    }
    static Create(receiver: AXObject, method: AXCallable) {
      var closure: ASMethodClosure = Object.create(this.sec.AXMethodClosure.tPrototype);
      closure.receiver = <any>receiver;
      closure.value = method;
      closure.methodInfo = method.methodInfo;
      return closure;
    }
  
    get prototype(): AXObject {
      return null;
    }
  
    set prototype(prototype: AXObject) {
      this.sec.throwError("ReferenceError", Errors.ConstWriteError, "prototype",
                                      "MethodClosure");
    }
  
    axCall(ignoredThisArg: any): any {
      return this.value.apply(this.receiver, sliceArguments(arguments, 1));
    }
  
    axApply(ignoredThisArg: any, argArray?: any[]): any {
      return this.value.apply(this.receiver, argArray);
    }
  
    call(ignoredThisArg: any) {
      return this.value.apply(this.receiver, sliceArguments(arguments, 1));
    }
  
    apply(ignoredThisArg: any, argArray?: ASArray): any {
      return this.value.apply(this.receiver, argArray ? argArray.value : undefined);
    }
  }