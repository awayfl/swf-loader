import { axCoerceString } from "../run/axCoerceString";
import { AXSecurityDomain } from "../run/AXSecurityDomain";
import { AXClass } from "../run/AXClass";
import { Errors } from "../errors";

export function Toplevel_registerClassAlias(sec: AXSecurityDomain, aliasName: string, classObject: AXClass) {
    aliasName = axCoerceString(aliasName);
    if (!aliasName) {
      sec.throwError('TypeError', Errors.NullPointerError, 'aliasName');
    }
    if (!classObject) {
      sec.throwError('TypeError', Errors.NullPointerError, 'classObject');
    }
  
    sec.classAliases.registerClassAlias(aliasName, classObject);
  }