import { ASObject } from "./ASObject";
import { getErrorInfo, formatErrorMessage } from "../errors";
import { ASClass } from "./ASClass";
import { defineNonEnumerableProperty } from "../../base/utilities/ObjectUtilities";

export class ASError extends ASObject {
    public static throwError(type: ASClass, id: number /*, ...rest */) {
      var info = getErrorInfo(id);
      var args = [info];
      for (var i = 2; i < arguments.length; i++) {
        args.push(arguments[i]);
      }
      var message = formatErrorMessage.apply(null, args);
      throw type.axConstruct([message, id]);
    }
  
    static classInitializer(asClass?: any) {
      defineNonEnumerableProperty(this, '$Bglength', 1);
      defineNonEnumerableProperty(this.dPrototype, '$Bgname',
                                  this.classInfo.instanceInfo.getName().name);
      if (asClass === ASError) {
        defineNonEnumerableProperty(this.dPrototype, '$Bgmessage', 'Error');
        defineNonEnumerableProperty(this.dPrototype, '$BgtoString', ASError.prototype.toString);
      }
    }
  
    constructor(message: any, id: any) {
      super();
      if (arguments.length < 1) {
        message = '';
      }
      this.$Bgmessage = String(message);
      this._errorID = id | 0;
    }
  
    $Bgmessage: string;
    $Bgname: string;
    _errorID: number;
  
    toString() {
      return this.$Bgmessage !== "" ? this.$Bgname + ": " + this.$Bgmessage : this.$Bgname;
    }
  
    get errorID() {
      return this._errorID;
    }
  
    public getStackTrace(): string {
      // Stack traces are only available in debug builds. We only do opt.
      return null;
    }
  }
  
export class ASDefinitionError extends ASError {
}
export class ASEvalError extends ASError {
}
export class ASRangeError extends ASError {
}
export class ASReferenceError extends ASError {
}
export class ASSecurityError extends ASError {
}
export class ASSyntaxError extends ASError {
}
export class ASTypeError extends ASError {
}
export class ASURIError extends ASError {
}
export class ASVerifyError extends ASError {
}
export class ASUninitializedError extends ASError {
}
export class ASArgumentError extends ASError {
}
export class ASIOError extends ASError {
}
export class ASEOFError extends ASError {
}
export class ASMemoryError extends ASError {
}
export class ASIllegalOperationError extends ASError {
}