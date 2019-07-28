import { AXSecurityDomain } from "../run/AXSecurityDomain";
import { axCoerceString } from "../run/axCoerceString";
import { Errors } from "../errors";

export function Toplevel_getClassByAlias(sec: AXSecurityDomain, aliasName: string):any {
    aliasName = axCoerceString(aliasName);
    if (!aliasName) {
      sec.throwError('TypeError', Errors.NullPointerError, 'aliasName');
    }
  
    var axClass = sec.classAliases.getClassByAlias(aliasName);
    if (!axClass) {
      sec.throwError('ReferenceError', Errors.ClassNotFoundError, aliasName);
    }
    return axClass;
  }