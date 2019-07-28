import { AXSecurityDomain } from "./AXSecurityDomain";
import { checkValue } from "./checkValue";
import { release } from "../../base/utilities/Debug";
import { scopeStacks } from "./scopeStacks";


export function ensureBoxedReceiver(sec: AXSecurityDomain, receiver: any, callable: any) {
    if (receiver && typeof receiver === 'object') {
      release || checkValue(receiver);
      return receiver;
    }
    var boxedReceiver = sec.box(receiver);
    // Boxing still leaves `null` and `undefined` unboxed, so return the current global instead.
    if (!boxedReceiver) {
      if (scopeStacks.length) {
        boxedReceiver = scopeStacks[scopeStacks.length - 1].topScope().global.object;
      } else if (callable.receiver) {
        // If no scripts are on the stack (e.g., for ExternalInterface calls), use the function's
        // own global.
        boxedReceiver = callable.receiver.scope.global.object;
      }
    }
    return boxedReceiver;
  }
  