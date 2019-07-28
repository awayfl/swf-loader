import { as3Compatibility } from "../nat/as3Compatibility";
import { ASNumber } from "../nat/ASNumber";

export function axCoerceNumber(x): number {
    if (as3Compatibility) {
      if (typeof x === "string") {
        return ASNumber.convertStringToDouble(x);
      }
      if (x && typeof x === "object") {
        x = x.valueOf(); // Make sure to only call valueOf() once.
        if (typeof x === "string") {
          return ASNumber.convertStringToDouble(x);
        }
      }
    }
    return +x;
  }