import { isNullOrUndefined } from "../../base/utilities";
import { Errors } from "../errors";

export function axCoerce(x: any) {
    if (isNullOrUndefined(x)) {
      return null;
    }
    if (x.__fast__) {
        return x;
    }    
    if (!this.axIsType(x)) {
      this.sec.throwError('TypeError', Errors.CheckTypeFailedError, x,
                                      this.classInfo.instanceInfo.getClassName());
    }
    return x;
  }