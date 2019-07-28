import { AXSecurityDomain } from "../run/AXSecurityDomain";
import { release } from "../../base/utilities/Debug";
import { assert, isNullOrUndefined } from "@awayjs/graphics";

/**
 * Transforms a JS value into an AS value.
 */
export function transformJSValueToAS(sec: AXSecurityDomain, value, deep: boolean) {
    release || assert(typeof value !== 'function');
    if (typeof value !== "object") {
      return value;
    }
    if (isNullOrUndefined(value)) {
      return value;
    }
    if (Array.isArray(value)) {
      var list = [];
      for (var i = 0; i < value.length; i++) {
        var entry = value[i];
        var axValue = deep ? transformJSValueToAS(sec, entry, true) : entry;
        list.push(axValue);
      }
      return sec.createArray(list);
    }
    return sec.createObjectFromJS(value, deep);
  }
  