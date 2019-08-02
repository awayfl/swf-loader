import { AXClass } from "../run/AXClass";
import { builtinNativeClasses, nativeClasses } from "./builtinNativeClasses";
import { linkClass } from "./linkClass";
import { ASObject } from './ASObject';
import { ASClass } from './ASClass';

export function tryLinkNativeClass(axClass: AXClass) {
    var className = axClass.classInfo.instanceInfo.getClassName();
    var asClass:ASClass = builtinNativeClasses[className] || nativeClasses[className];
    if (asClass) {
      linkClass(axClass, asClass);
    }
  }