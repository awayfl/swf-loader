import { AXFunction } from "./AXFunction";
import { assert } from "@awayjs/graphics";
import { release } from "../../base/utilities/Debug";


/**
 * Returns the current interpreter frame's callee.
 */
export function axGetArgumentsCallee(): AXFunction {
    var callee = this.callee;
    if (callee) {
      return callee;
    }
    release || assert(this.receiver);
    release || assert(this.methodInfo);
    if (this.methodInfo.trait === null) {
      console.error('arguments.callee used on trait-less methodInfo function. Probably a constructor');
      return null;
    }
    release || assert(this.methodInfo.trait);
    var mn = this.methodInfo.trait.name;
    var methodClosure = this.receiver.axGetProperty(mn);
    release || assert(this.sec.AXMethodClosure.tPrototype === Object.getPrototypeOf(methodClosure));
    return methodClosure;
  }