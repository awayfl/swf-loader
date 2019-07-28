import { ASClass } from "../nat";
import { Errors } from "../errors";

// REDUX: check if we need this now that we do arg checking at callsites.
export function checkParameterType(argument: any, name: string, type: ASClass) {
    if (argument == null) {
      type.sec.throwError('TypeError', Errors.NullPointerError, name);
    }
    if (!type.axIsType(argument)) {
      type.sec.throwError('TypeError', Errors.CheckTypeFailedError, argument,
                          type.classInfo.instanceInfo.getClassName());
    }
  }