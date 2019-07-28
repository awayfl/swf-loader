import { defineNonEnumerableProperty } from "../../base/utilities/ObjectUtilities";
import {ASObject} from "./ASObject";
import {addPrototypeFunctionAlias} from "./addPrototypeFunctionAlias";
import { makeMultiname } from "./makeMultiname";
import { isNumeric, isNumber, isString } from "../../base/utilities";
import { axCoerceName } from "../run/axCoerceName";
import { ensureBoxedReceiver } from "../run/ensureBoxedReceiver";
import { rn } from "./rn";
import { Namespace } from "../abc/lazy/Namespace";
import { SORT } from "../abc/lazy/SORT";
import { Multiname } from "../abc/lazy/Multiname";
import { coerceArray } from "./coerceArray";
import { createArrayValueFromArgs } from "./createArrayValueFromArgs";
import { release, Debug } from "../../base/utilities/Debug";
import { assert } from "@awayjs/graphics";
import { Bytecode } from "../abc/ops";
import { checkValue } from "../run/checkValue";
import { axDefaultCompareFunction } from "../run/axDefaultCompareFunction";
import { axCompare } from "../run/axCompare";
import { axCompareFields } from "../run/axCompareFields";
import { Errors } from "../errors";

export class ASArray extends ASObject {
    static classInitializer() {
      var proto: any = this.dPrototype;
      var asProto: any = ASArray.prototype;
  
      // option flags for sort and sortOn
      defineNonEnumerableProperty(this, '$BgCASEINSENSITIVE', 1);
      defineNonEnumerableProperty(this, '$BgDESCENDING', 2);
      defineNonEnumerableProperty(this, '$BgUNIQUESORT', 4);
      defineNonEnumerableProperty(this, '$BgRETURNINDEXEDARRAY', 8);
      defineNonEnumerableProperty(this, '$BgNUMERIC', 16);
  
      addPrototypeFunctionAlias(proto, "$Bgpush", asProto.generic_push);
      addPrototypeFunctionAlias(proto, "$Bgpop", asProto.generic_pop);
      addPrototypeFunctionAlias(proto, "$Bgshift", asProto.generic_shift);
      addPrototypeFunctionAlias(proto, "$Bgunshift", asProto.generic_unshift);
      addPrototypeFunctionAlias(proto, "$Bgreverse", asProto.generic_reverse);
      addPrototypeFunctionAlias(proto, "$Bgconcat", asProto.generic_concat);
      addPrototypeFunctionAlias(proto, "$Bgslice", asProto.generic_slice);
      addPrototypeFunctionAlias(proto, "$Bgsplice", asProto.generic_splice);
      addPrototypeFunctionAlias(proto, "$Bgjoin", asProto.generic_join);
      addPrototypeFunctionAlias(proto, "$BgtoString", asProto.generic_toString);
      addPrototypeFunctionAlias(proto, "$BgindexOf", asProto.generic_indexOf);
      addPrototypeFunctionAlias(proto, "$BglastIndexOf", asProto.generic_lastIndexOf);
      addPrototypeFunctionAlias(proto, "$Bgevery", asProto.generic_every);
      addPrototypeFunctionAlias(proto, "$Bgsome", asProto.generic_some);
      addPrototypeFunctionAlias(proto, "$BgforEach", asProto.generic_forEach);
      addPrototypeFunctionAlias(proto, "$Bgmap", asProto.generic_map);
      addPrototypeFunctionAlias(proto, "$Bgfilter", asProto.generic_filter);
      addPrototypeFunctionAlias(proto, "$Bgsort", asProto.generic_sort);
      addPrototypeFunctionAlias(proto, "$BgsortOn", asProto.generic_sortOn);
  
      addPrototypeFunctionAlias(proto, "$BghasOwnProperty", asProto.native_hasOwnProperty);
      addPrototypeFunctionAlias(proto, "$BgpropertyIsEnumerable",
                                asProto.native_propertyIsEnumerable);
      addPrototypeFunctionAlias(proto, '$BgtoLocaleString', asProto.generic_toString);
    }
  
    constructor() {
      super();
      this.value = createArrayValueFromArgs(this.sec, <any>arguments);
    }
  
    native_hasOwnProperty(nm: string): boolean {
      return this.axHasOwnProperty(makeMultiname(nm));
    }
  
    native_propertyIsEnumerable(nm: string): boolean {
      if (typeof nm === 'number' || isNumeric(nm = axCoerceName(nm))) {
        var descriptor = Object.getOwnPropertyDescriptor(this.value, nm);
        return !!descriptor && descriptor.enumerable;
      }
      super.native_propertyIsEnumerable(nm);
    }
  
    $Bglength: number;
    value: any [];
  
    public static axApply(self: ASArray, args: any[]): ASArray {
      return this.sec.createArrayUnsafe(createArrayValueFromArgs(this.sec, args));
    }
  
    public static axConstruct(args: any[]): ASArray {
      return this.sec.createArrayUnsafe(createArrayValueFromArgs(this.sec, args));
    }
  
    push() {
      // Amazingly, AS3 doesn't throw an error if `push` would make the argument too large.
      // Instead, it just replaces the last element.
      if (this.value.length + arguments.length > 0xffffffff) {
        var limit = 0xffffffff - this.value.length;
        for (var i = 0; i < limit; i++) {
          this.value.push(arguments[i]);
        }
        return 0xffffffff;
      }
      return this.value.push.apply(this.value, arguments);
    }
  
    generic_push() {
      if (this && this.value instanceof Array) {
        return this.push.apply(this, arguments);
      }
  
      var n = this.axGetPublicProperty('length') >>> 0;
      for (var i = 0; i < arguments.length; i++) {
        this.axSetNumericProperty(n++, arguments[i]);
      }
      this.axSetPublicProperty('length', n);
      return n;
    }
  
    pop() {
      return this.value.pop();
    }
    generic_pop() {
      if (this && this.value instanceof Array) {
        return this.value.pop();
      }
  
      var len = this.axGetPublicProperty('length') >>> 0;
      if (!len) {
        this.axSetPublicProperty('length', 0);
        return;
      }
  
      var retVal = this.axGetNumericProperty(len - 1);
      rn.name = len - 1;
      rn.namespaces = [Namespace.PUBLIC];
      this.axDeleteProperty(rn);
      this.axSetPublicProperty('length', len - 1);
      return retVal;
    }
  
    shift() {
      return this.value.shift();
    }
    generic_shift() {
      return coerceArray(this).shift();
    }
  
    unshift() {
      return this.value.unshift.apply(this.value, arguments);
    }
    generic_unshift() {
      var self = coerceArray(this);
      return self.value.unshift.apply(self.value, arguments);
    }
  
    reverse() {
      this.value.reverse();
      return this;
    }
    generic_reverse() {
      return coerceArray(this).reverse();
    }
  
    concat() {
      var value = this.value.slice();
      for (var i = 0; i < arguments.length; i++) {
        var a = arguments[i];
        // Treat all objects with a `sec` property and a value that's an Array as
        // concat-spreadable.
        // TODO: verify that this is correct.
        if (typeof a === 'object' && a && a.sec && Array.isArray(a.value)) {
          value.push.apply(value, a.value);
        } else {
          value.push(a);
        }
      }
      return this.sec.createArrayUnsafe(value);
    }
    generic_concat() {
      return coerceArray(this).concat.apply(this, arguments);
    }
  
    slice(startIndex: number, endIndex: number) {
      return this.sec.createArray(this.value.slice(startIndex, endIndex));
    }
    generic_slice(startIndex: number, endIndex: number) {
      return coerceArray(this).slice(startIndex, endIndex);
    }
  
    splice(): any[] {
      var o = this.value;
      if (arguments.length === 0) {
        return undefined;
      }
      return this.sec.createArray(o.splice.apply(o, arguments));
    }
    generic_splice(): any[] {
      return coerceArray(this).splice.apply(this, arguments);
    }
  
    join(sep: string) {
      return this.value.join(sep);
    }
    generic_join(sep: string) {
      return coerceArray(this).join(sep);
    }
  
    toString() {
      return this.value.join(',');
    }
    generic_toString() {
      return coerceArray(this).join(',');
    }
  
    indexOf(value: any, fromIndex: number) {
      return this.value.indexOf(value, fromIndex|0);
    }
    generic_indexOf(value: any, fromIndex: number) {
      return coerceArray(this).indexOf(value, fromIndex|0);
    }
  
    lastIndexOf(value: any, fromIndex: number) {
      return this.value.lastIndexOf(value, arguments.length > 1 ? fromIndex : 0x7fffffff);
    }
    generic_lastIndexOf(value: any, fromIndex: number) {
      return coerceArray(this).lastIndexOf(value, arguments.length > 1 ? fromIndex : 0x7fffffff);
    }
  
    every(callbackfn: {value: Function}, thisArg?) {
      if (!callbackfn || !callbackfn.value || typeof callbackfn.value !== 'function') {
        return true;
      }
      thisArg = ensureBoxedReceiver(this.sec, thisArg, callbackfn);
      var o = this.value;
      for (var i = 0; i < o.length; i++) {
        if (callbackfn.value.call(thisArg, o[i], i, this) !== true) {
          return false;
        }
      }
      return true;
    }
    generic_every(callbackfn: {value: Function}, thisArg?) {
      return coerceArray(this).every(callbackfn, thisArg);
    }
  
    some(callbackfn: {value}, thisArg?) {
      if (!callbackfn || !callbackfn.value || typeof callbackfn.value !== 'function') {
        return false;
      }
      thisArg = ensureBoxedReceiver(this.sec, thisArg, callbackfn);
      var self = this;
      return this.value.some(function (currentValue, index, array) {
        return callbackfn.value.call(thisArg, currentValue, index, self);
      });
    }
    generic_some(callbackfn: {value}, thisArg?) {
      return coerceArray(this).some(callbackfn, thisArg);
    }
  
    forEach(callbackfn: {value}, thisArg?) {
      if (!callbackfn || !callbackfn.value || typeof callbackfn.value !== 'function') {
        return;
      }
      thisArg = ensureBoxedReceiver(this.sec, thisArg, callbackfn);
      var self = this;
      this.value.forEach(function (currentValue, index) {
        callbackfn.value.call(thisArg, currentValue, index, self);
      });
    }
    generic_forEach(callbackfn: {value}, thisArg?) {
      return coerceArray(this).forEach(callbackfn, thisArg);
    }
  
    map(callbackfn: {value}, thisArg?) {
      if (!callbackfn || !callbackfn.value || typeof callbackfn.value !== 'function') {
        return this.sec.createArrayUnsafe([]);
      }
      thisArg = ensureBoxedReceiver(this.sec, thisArg, callbackfn);
      var self = this;
      return this.sec.createArrayUnsafe(this.value.map(function (currentValue, index) {
        return callbackfn.value.call(thisArg, currentValue, index, self);
      }));
    }
    generic_map(callbackfn: {value}, thisArg?) {
      return coerceArray(this).map(callbackfn, thisArg);
    }
  
    filter(callbackfn: {value: Function}, thisArg?) {
      if (!callbackfn || !callbackfn.value || typeof callbackfn.value !== 'function') {
        return this.sec.createArrayUnsafe([]);
      }
      thisArg = ensureBoxedReceiver(this.sec, thisArg, callbackfn);
      var result = [];
      var o = this.value;
      for (var i = 0; i < o.length; i++) {
        if (callbackfn.value.call(thisArg, o[i], i, this) === true) {
          result.push(o[i]);
        }
      }
      return this.sec.createArrayUnsafe(result);
    }
    generic_filter(callbackfn: {value: Function}, thisArg?) {
      return coerceArray(this).filter(callbackfn, thisArg);
    }
  
    toLocaleString(): string {
      var value = this.sec.AXArray.axCoerce(this).value;
  
      var out: string = "";
      for (var i = 0, n = value.length; i < n; i++) {
        var val = value[i];
        if (val !== null && val !== undefined) {
          out += val.toLocaleString();
        }
        if (i + 1 < n) {
          out += ",";
        }
      }
      return out;
    }
  
    sort(): any {
      var o = this.value;
      if (arguments.length === 0) {
        o.sort();
        return this;
      }
      var compareFunction;
      var options = 0;
      if (this.sec.AXFunction.axIsInstanceOf(arguments[0])) {
        compareFunction = arguments[0].value;
      } else if (isNumber(arguments[0])) {
        options = arguments[0];
      }
      if (isNumber(arguments[1])) {
        options = arguments[1];
      }
      if (!options) {
        // Just passing compareFunction is ok because `undefined` is treated as not passed in JS.
        o.sort(compareFunction);
        return this;
      }
      if (!compareFunction) {
        compareFunction = axDefaultCompareFunction;
      }
      var sortOrder = options & SORT.DESCENDING ? -1 : 1;
      o.sort(function (a, b) {
        return axCompare(a, b, options, sortOrder, compareFunction);
      });
      return this;
    }
  
    generic_sort() {
      return coerceArray(this).sort.apply(this, arguments);
    }
  
    sortOn(names: any, options: any): any {
      if (arguments.length === 0) {
        this.sec.throwError(
                    "ArgumentError", Errors.WrongArgumentCountError,
                    "Array/http://adobe.com/AS3/2006/builtin::sortOn()", "1", "0");
      }
      // The following oddities in how the arguments are used are gleaned from Tamarin, so hush.
      var o = this.value;
      // The options we'll end up using.
      var optionsList: number[] = [];
      if (isString(names)) {
        names = [Multiname.getPublicMangledName(names)];
        // If the name is a string, coerce `options` to int.
        optionsList = [options | 0];
      } else if (names && Array.isArray(names.value)) {
        names = names.value;
        for (var i = 0; i < names.length; i++) {
          names[i] = Multiname.getPublicMangledName(names[i]);
        }
        if (options && Array.isArray(options.value)) {
          options = options.value;
          // Use the options Array only if it's the same length as names.
          if (options.length === names.length) {
            for (var i = 0; i < options.length; i++) {
              optionsList[i] = options[i] | 0;
            }
            // Otherwise, use 0 for all options.
          } else {
            for (var i = 0; i < names.length; i++) {
              optionsList[i] = 0;
            }
          }
        } else {
          var optionsVal = options | 0;
          for (var i = 0; i < names.length; i++) {
            optionsList[i] = optionsVal;
          }
        }
      } else {
        // Not supplying either a String or an Array means nothing is sorted on.
        return this;
      }
      release || assert(optionsList.length === names.length);
      // For use with uniqueSort and returnIndexedArray once we support them.
      var optionsVal: number = optionsList[0];
      release || Debug.assertNotImplemented(!(optionsVal & SORT.UNIQUESORT), "UNIQUESORT");
      release || Debug.assertNotImplemented(!(optionsVal & SORT.RETURNINDEXEDARRAY),
                                                    "RETURNINDEXEDARRAY");
  
      o.sort((a, b) => axCompareFields(a, b, names, optionsList));
      return this;
    }
  
    generic_sortOn() {
      return coerceArray(this).sortOn.apply(this, arguments);
    }
  
    get length(): number {
      return this.value.length;
    }
  
    set length(newLength: number) {
      this.value.length = newLength >>> 0;
    }
  
    axGetEnumerableKeys(): any [] {
      // Get the numeric Array keys first ...
      var keys = Object.keys(this.value);
      // ... then the keys that live on the array object.
      return keys.concat(super.axGetEnumerableKeys());
    }
  
    axHasPropertyInternal(mn: Multiname): boolean {
      var name = mn.name;
      if (typeof name === 'number' || isNumeric(name = axCoerceName(name))) {
        release || assert(mn.isRuntimeName());
        return name in this.value;
      }
      if (this.traits.getTrait(mn.namespaces, name)) {
        return true;
      }
      return '$Bg' + name in this;
    }
  
    axHasOwnProperty(mn: Multiname): boolean {
      var name = mn.name;
      if (typeof name === 'number' || isNumeric(name = axCoerceName(name))) {
        release || assert(mn.isRuntimeName());
        return this.value.hasOwnProperty(name);
      }
      return !!this.traits.getTrait(mn.namespaces, name) || this.hasOwnProperty('$Bg' + name);
    }
  
    axGetProperty(mn: Multiname): any {
      var name = mn.name;
      if (typeof name === 'number' || isNumeric(name = axCoerceName(name))) {
        return this.value[name];
      }
      return super.axGetProperty(mn);
    }
  
    axSetProperty(mn: Multiname, value: any, bc: Bytecode) {
      release || checkValue(value);
      var name = mn.name;
      if (typeof name === 'number' || isNumeric(name = axCoerceName(name))) {
        this.value[name] = value;
        return;
      }
      super.axSetProperty(mn, value, bc);
    }
  
    axDeleteProperty(mn: Multiname): any {
      var name = mn.name;
      if (typeof name === 'number' || isNumeric(name = axCoerceName(name))) {
        return delete this.value[name];
      }
      // Cannot delete array traits.
      if (this.traits.getTrait(mn.namespaces, name)) {
        return false;
      }
      return delete this['$Bg' + name];
    }
  
    axGetPublicProperty(nm: any): any {
      if (typeof nm === 'number' || isNumeric(nm = axCoerceName(nm))) {
        return this.value[nm];
      }
      return this['$Bg' + nm];
    }
  
    axSetPublicProperty(nm: string, value: any) {
      release || checkValue(value);
      if (typeof nm === 'number' || isNumeric(nm = axCoerceName(nm))) {
        this.value[nm] = value;
        return;
      }
      this['$Bg' + nm] = value;
    }
  }