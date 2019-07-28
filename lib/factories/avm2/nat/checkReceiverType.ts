import { AXObject } from "../run/AXObject";
import { AXClass } from "../run/AXClass";
import { Errors } from "../errors";


export function checkReceiverType(receiver: AXObject, type: AXClass, methodName: string) {
    if (!type.dPrototype.isPrototypeOf(receiver)) {
      receiver.sec.throwError('TypeError', Errors.InvokeOnIncompatibleObjectError,
                                          methodName);
    }
  }