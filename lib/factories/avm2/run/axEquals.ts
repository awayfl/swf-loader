import { isXMLType } from "../natives/xml";
import { AXSecurityDomain } from "./AXSecurityDomain";

export function axEquals(left: any, right: any, sec: AXSecurityDomain): boolean {
    // See E4X spec, 11.5 Equality Operators for why this is required.
    if (isXMLType(left, sec)) {
      return left.equals(right);
    }
    if (isXMLType(right, sec)) {
      return right.equals(left);
    }
    return left == right;
  }