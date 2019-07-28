import { AXSecurityDomain } from "../run/AXSecurityDomain";
import { Errors } from "../errors";

  export function createArrayValueFromArgs(sec: AXSecurityDomain, args: any[]) {
    if (args.length === 1 && typeof args[0] === 'number') {
      var len = args[0];
      try {
        return new Array(len);
      } catch (e) {
        sec.throwError('RangeError', Errors.ArrayIndexNotIntegerError, len);
      }
    }
    return Array.apply(Array, args);
  }