import { AXSecurityDomain } from "../run/AXSecurityDomain";
import { ASArray } from "./ASArray";
export function transformJStoASRegExpMatchArray(sec: AXSecurityDomain, value: RegExpMatchArray): ASArray {
    var result = sec.createArray(value);
    result.axSetPublicProperty('index', value.index);
    result.axSetPublicProperty('input', value.input);
    return result;
  }
  