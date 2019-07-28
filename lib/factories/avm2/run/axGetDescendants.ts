import { Multiname } from "../abc/lazy/Multiname";
import { AXSecurityDomain } from "./AXSecurityDomain";
import { Errors } from "../errors";
import { axIsXMLCollection } from "./axIsXMLCollection";

export function axGetDescendants(object, mn: Multiname, sec: AXSecurityDomain) {
    if (!axIsXMLCollection(object, sec)) {
      sec.throwError('TypeError', Errors.DescendentsError, object);
    }
    return object.descendants(mn);
  }