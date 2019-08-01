import { ASObject } from "../nat/ASObject";
import { axImplementsInterface } from "./axImplementsInterface";
import { RuntimeTraits } from "../abc/lazy/RuntimeTraits";
import { AXBasePrototype_$BgtoString } from "./AXBasePrototype_";
import { defineNonEnumerableProperty } from "../../base/utilities/ObjectUtilities";
import { isPrimitiveJSValue } from './isPrimitiveJSValue';

function AXBasePrototype_toString() {
    return this.$BgtoString.axCall(this);
  };
  function AXBasePrototype_$BgvalueOf() {
    return this;
  };
  function AXBasePrototype_valueOf() {
    return this.$BgvalueOf.axCall(this);
  };
  
var D = defineNonEnumerableProperty;

export var AXBasePrototype = null;

export function isValidASValue(value: any) {
  //80pro: todo: AXBasePrototype.isPrototypeOf(v) fails for us, thats why i added the || v.axResolveMultiname
    return AXBasePrototype.isPrototypeOf(value) || isPrimitiveJSValue(value) || value.axResolveMultiname;
  }
  
/**
 * Execute this lazily because we want to make sure the AS package is available.
 */
export function initializeAXBasePrototype() {
    if (AXBasePrototype) {
      return;
    }
    var Op = ASObject.prototype;
    AXBasePrototype = Object.create(null);
    D(AXBasePrototype, "axHasPropertyInternal", Op.axHasPropertyInternal);
    D(AXBasePrototype, "axHasProperty", Op.axHasProperty);
    D(AXBasePrototype, "axSetProperty", Op.axSetProperty);
    D(AXBasePrototype, "axHasProperty", Op.axHasProperty);
    D(AXBasePrototype, "axHasPublicProperty", Op.axHasPublicProperty);
    D(AXBasePrototype, "axSetPublicProperty", Op.axSetPublicProperty);
    D(AXBasePrototype, "axGetPublicProperty", Op.axGetPublicProperty);
    D(AXBasePrototype, "axCallPublicProperty", Op.axCallPublicProperty);
    D(AXBasePrototype, "axDeletePublicProperty", Op.axDeletePublicProperty);
    D(AXBasePrototype, "axGetProperty", Op.axGetProperty);
    D(AXBasePrototype, "axDeleteProperty", Op.axDeleteProperty);
    D(AXBasePrototype, "axGetSuper", Op.axGetSuper);
    D(AXBasePrototype, "axSetSuper", Op.axSetSuper);
    D(AXBasePrototype, "axSetSlot", Op.axSetSlot);
    D(AXBasePrototype, "axGetSlot", Op.axGetSlot);
    D(AXBasePrototype, "axCallProperty", Op.axCallProperty);
    D(AXBasePrototype, "axCallSuper", Op.axCallSuper);
    D(AXBasePrototype, "axConstructProperty", Op.axConstructProperty);
    D(AXBasePrototype, "axResolveMultiname", Op.axResolveMultiname);
    D(AXBasePrototype, "axNextNameIndex", Op.axNextNameIndex);
    D(AXBasePrototype, "axNextName", Op.axNextName);
    D(AXBasePrototype, "axNextValue", Op.axNextValue);
    D(AXBasePrototype, "axGetEnumerableKeys", Op.axGetEnumerableKeys);
    D(AXBasePrototype, "axImplementsInterface", axImplementsInterface);
  
    // Dummy traits object so Object.prototype lookups succeed.
    D(AXBasePrototype, "traits", new RuntimeTraits(null, null, Object.create(null)));
  
    // Helper methods borrowed from Object.prototype.
    D(AXBasePrototype, "isPrototypeOf", Object.prototype.isPrototypeOf);
    D(AXBasePrototype, "hasOwnProperty", Object.prototype.hasOwnProperty);
  
    AXBasePrototype.$BgtoString = AXBasePrototype_$BgtoString;
    AXBasePrototype.toString = AXBasePrototype_toString;
    AXBasePrototype.$BgvalueOf = AXBasePrototype_$BgvalueOf;
    AXBasePrototype.valueOf = AXBasePrototype_valueOf;
  }
  