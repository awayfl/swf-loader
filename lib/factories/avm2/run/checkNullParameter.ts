import { Errors } from "../errors";
import { AXSecurityDomain } from "./AXSecurityDomain";

export function checkNullParameter(argument: any, name: string, sec: AXSecurityDomain) {
    if (argument == undefined) {
      sec.throwError('TypeError', Errors.NullPointerError, name);
    }
  }