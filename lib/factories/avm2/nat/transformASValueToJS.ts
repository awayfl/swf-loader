import { isNumeric } from "../../base/utilities";
import { assert, isNullOrUndefined } from "@awayjs/graphics";
import { release } from "../../base/utilities/Debug";
import { AXSecurityDomain } from "../run/AXSecurityDomain";

/**
 * Transforms an AS value into a JS value.
 */
export function transformASValueToJS(sec: AXSecurityDomain, value, deep: boolean) {
    if (typeof value !== "object") {
      return value;
    }
    if (isNullOrUndefined(value)) {
      return value;
    }
    if (sec.AXArray.axIsType(value)) {
      var resultList = [];
      var list = value.value;
      for (var i = 0; i < list.length; i++) {
        var entry = list[i];
        var jsValue = deep ? transformASValueToJS(sec, entry, true) : entry;
        resultList.push(jsValue);
      }
      return resultList;
    }
    var keys = Object.keys(value);
    var resultObject = {};
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var jsKey = key;
      if (!isNumeric(key)) {
        release || assert(key.indexOf('$Bg') === 0);
        jsKey = key.substr(3);
      }
      var v = value[key];
      if (deep) {
        v = transformASValueToJS(sec, v, true);
      }
      resultObject[jsKey] = v;
    }
    return resultObject;
  }