import { release } from "../../base/utilities/Debug";
import { checkValue } from "./checkValue";
import { AXClass } from "./AXClass";


export function axIsTypeInterface(x: any) {
    if (!x || typeof x !== 'object') {
      return false;
    }
    release || checkValue(x);
    return (<AXClass>x).axImplementsInterface(this);
  }
  