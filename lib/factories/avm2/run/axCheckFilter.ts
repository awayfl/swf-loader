import { isXMLCollection } from "../natives/xml";
import { Errors } from "../errors";
import { AXSecurityDomain } from "./AXSecurityDomain";


export function axCheckFilter(sec: AXSecurityDomain, value) {
    if (!value || !isXMLCollection(sec, value)) {
      var className = value && value.axClass ? value.axClass.name.toFQNString(false) : '[unknown]';
      sec.throwError('TypeError', Errors.FilterError, className);
    }
    return value;
  }
  