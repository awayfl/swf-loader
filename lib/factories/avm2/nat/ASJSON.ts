import { ASObject } from "./ASObject";
import { axCoerceString } from "../run/axCoerceString";
import { AXFunction } from "../run/AXFunction";
import { axIsCallable } from "../run/axIsCallable";
import { Errors } from "../errors";
import { transformJSValueToAS } from "./transformJSValueToAS";
import { transformASValueToJS } from "./transformASValueToJS";
import { walk } from "./walk";

export class ASJSON extends ASObject {
    static parse(text: string, reviver: AXFunction = null): any {
      text = axCoerceString(text);
      if (reviver !== null && !axIsCallable(reviver)) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, reviver, 'Function');
      }
      if (text === null) {
        this.sec.throwError('SyntaxError', Errors.JSONInvalidParseInput);
      }
  
      try {
        var unfiltered: Object = transformJSValueToAS(this.sec, JSON.parse(text), true);
      } catch (e) {
        this.sec.throwError('SyntaxError', Errors.JSONInvalidParseInput);
      }
  
      if (reviver === null) {
        return unfiltered;
      }
      return walk(this.sec, {"": unfiltered}, "", reviver.value);
    }
  
    static stringify(value: any, replacer = null, space = null): string {
      // We deliberately deviate from ECMA-262 and throw on
      // invalid replacer parameter.
      if (replacer !== null) {
        var sec = typeof replacer === 'object' ? replacer.sec : null;
        if (!sec || !(sec.AXFunction.axIsType(replacer) || sec.AXArray.axIsType(replacer))) {
          this.sec.throwError('TypeError', Errors.JSONInvalidReplacer);
        }
      }
  
      var gap;
      if (typeof space === 'string') {
        gap = space.length > 10 ? space.substring(0, 10) : space;
      } else if (typeof space === 'number') {
        gap = "          ".substring(0, Math.min(10, space | 0));
      } else {
        // We follow ECMA-262 and silently ignore invalid space parameter.
        gap = "";
      }
  
      if (replacer === null) {
        return this.stringifySpecializedToString(value, null, null, gap);
      } else if (sec.AXArray.axIsType(replacer)) {
        return this.stringifySpecializedToString(value, this.computePropertyList(replacer.value),
                                                  null, gap);
      } else { // replacer is Function
        return this.stringifySpecializedToString(value, null, replacer.value, gap);
      }
    }
  
    // ECMA-262 5th ed, section 15.12.3 stringify, step 4.b
    private static computePropertyList(r: any[]): string[] {
      var propertyList = [];
      var alreadyAdded = Object.create(null);
      for (var i = 0, length = r.length; i < length; i++) {
        if (!r.hasOwnProperty(<any>i)) {
          continue;
        }
        var v = r[i];
        var item: string = null;
  
        if (typeof v === 'string') {
          item = v;
        } else if (typeof v === 'number') {
          item = axCoerceString(v);
        }
        if (item !== null && !alreadyAdded[item]) {
          alreadyAdded[item] = true;
          propertyList.push(item);
        }
      }
      return propertyList;
    }
  
    private static stringifySpecializedToString(value: Object, replacerArray: any [], replacerFunction: (key: string, value: any) => any, gap: string): string {
      try {
        // In AS3 |JSON.stringify(undefined)| returns "null", while JS returns |undefined|.
        // TODO: Is there anything to be done in case of a |replacerFunction| function?
        if (value === undefined) {
          return "null";
        }
        return JSON.stringify(transformASValueToJS(this.sec, value, true), replacerFunction, gap);
      } catch (e) {
        this.sec.throwError('TypeError', Errors.JSONCyclicStructure);
      }
    }
  }