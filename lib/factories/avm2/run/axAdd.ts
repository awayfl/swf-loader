import { AXSecurityDomain } from "./AXSecurityDomain";
import { release } from "../../base/utilities/Debug";
import { assert } from "@awayjs/graphics";
import { isXMLCollection, ASXMLList } from "../natives/xml";

/**
 * ActionScript 3 has different behaviour when deciding whether to call toString or valueOf
 * when one operand is a string. Unlike JavaScript, it calls toString if one operand is a
 * string and valueOf otherwise. This sucks, but we have to emulate this behaviour because
 * YouTube depends on it.
 *
 * AS3 also overloads the `+` operator to concatenate XMLs/XMLLists instead of stringifying them.
 */
export function axAdd(l: any, r: any, sec: AXSecurityDomain): any {
    release || assert(!(typeof l === "number" && typeof r === "number"), 'Inline number addition.');
    if (typeof l === "string" || typeof r === "string") {
      return String(l) + String(r);
    }
    if (isXMLCollection(sec, l) && isXMLCollection(sec, r)) {
      return ASXMLList.addXML(l, r);
    }
    return l + r;
  }