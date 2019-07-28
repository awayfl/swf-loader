import { AXSecurityDomain } from "./AXSecurityDomain";


export function axIsXMLCollection(x, sec: AXSecurityDomain): boolean {
    return sec.AXXML.dPrototype.isPrototypeOf(x) ||
            sec.AXXMLList.dPrototype.isPrototypeOf(x);
  }