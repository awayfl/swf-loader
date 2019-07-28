import { AXSecurityDomain } from "./AXSecurityDomain";
import { axIsXMLCollection } from "./axIsXMLCollection";


export function axTypeOf(x: any, sec: AXSecurityDomain): string {
    // ABC doesn't box primitives, so typeof returns the primitive type even when
    // the value is new'd
    if (x) {
      if (x.value) {
        return typeof x.value;
      }
      if (axIsXMLCollection(x, sec)) {
        return "xml";
      }
    }
    return typeof x;
  }