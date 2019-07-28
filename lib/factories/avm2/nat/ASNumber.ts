import { ASObject } from "./ASObject";
import { addPrototypeFunctionAlias } from "./addPrototypeFunctionAlias";
import { defineNonEnumerableProperty } from "../../base/utilities/ObjectUtilities";
import { Errors } from "../errors";

export class ASNumber extends ASObject {
    static classNatives: any [] = [Math];
  
    static classInitializer() {
      var proto: any = this.dPrototype;
      var asProto: any = ASNumber.prototype;
      addPrototypeFunctionAlias(proto, '$BgtoString', asProto.toString);
      addPrototypeFunctionAlias(proto, '$BgtoLocaleString', asProto.toString);
      addPrototypeFunctionAlias(proto, '$BgvalueOf', asProto.valueOf);
      addPrototypeFunctionAlias(proto, '$BgtoFixed', asProto.toFixed);
      addPrototypeFunctionAlias(proto, '$BgtoExponential', asProto.toExponential);
      addPrototypeFunctionAlias(proto, '$BgtoPrecision', asProto.toPrecision);
  
      defineNonEnumerableProperty(this, '$BgNaN', Number.NaN);
      defineNonEnumerableProperty(this, '$BgNEGATIVE_INFINITY', -1/0);
      defineNonEnumerableProperty(this, '$BgPOSITIVE_INFINITY', 1/0);
      defineNonEnumerableProperty(this, '$BgMAX_VALUE', Number.MAX_VALUE);
      defineNonEnumerableProperty(this, '$BgMIN_VALUE', Number.MIN_VALUE);
  
      defineNonEnumerableProperty(this, '$BgE', Math.E);
      defineNonEnumerableProperty(this, '$BgLN10', Math.LN10);
      defineNonEnumerableProperty(this, '$BgLN2', Math.LN2);
      defineNonEnumerableProperty(this, '$BgLOG10E', Math.LOG10E);
      defineNonEnumerableProperty(this, '$BgLOG2E', Math.LOG2E);
      defineNonEnumerableProperty(this, '$BgPI', Math.PI);
      defineNonEnumerableProperty(this, '$BgSQRT1_2', Math.SQRT2);
      defineNonEnumerableProperty(this, '$BgSQRT2', Math.SQRT2);
    }
  
    value: number;
  
    toString(radix: number) {
      if (arguments.length === 0) {
        radix = 10;
      } else {
        radix = radix|0;
        if (radix < 2 || radix > 36) {
          this.sec.throwError('RangeError', Errors.InvalidRadixError, radix);
        }
      }
      if (this.axClass !== this.sec.AXNumber) {
        this.sec.throwError('TypeError', Errors.InvokeOnIncompatibleObjectError,
                                        'Number.prototype.toString');
      }
  
      return this.value.toString(radix);
    }
  
    valueOf() {
      if (this.axClass !== this.sec.AXNumber) {
        this.sec.throwError('TypeError', Errors.InvokeOnIncompatibleObjectError,
                                        'Number.prototype.valueOf');
      }
      return this.value;
    }
  
    toExponential(p): string {
      p = p|0;
      if (p < 0 || p > 20) {
        this.sec.throwError('RangeError', Errors.InvalidPrecisionError);
      }
      if (this.axClass !== this.sec.AXNumber) {
        return 'NaN';
      }
      return this.value.toExponential(p);
    }
  
    toPrecision(p): string {
      if (!p) {
        p = 1;
      } else {
        p = p|0;
      }
      if (p < 1 || p > 21) {
        this.sec.throwError('RangeError', Errors.InvalidPrecisionError);
      }
      if (this.axClass !== this.sec.AXNumber) {
        return 'NaN';
      }
      return this.value.toPrecision(p);
    }
  
    toFixed(p): string {
      p = p|0;
      if (p < 0 || p > 20) {
        this.sec.throwError('RangeError', Errors.InvalidPrecisionError);
      }
      if (this.axClass !== this.sec.AXNumber) {
        return 'NaN';
      }
      return this.value.toFixed(p);
    }
  
    static _minValue(): number {
      return Number.MIN_VALUE;
    }
  
    // https://bugzilla.mozilla.org/show_bug.cgi?id=564839
    static convertStringToDouble(s: string): number {
      var i = s.indexOf(String.fromCharCode(0));
      if (i >= 0) {
        return +s.substring(0, i);
      }
      return +s;
    }
  }
  