import { AXClass } from "../run/AXClass";
import { builtinNativeClasses, nativeClasses } from "./builtinNativeClasses";
import { linkClass } from "./linkClass";

export function tryLinkNativeClass(axClass: AXClass) {
    var className = axClass.classInfo.instanceInfo.getClassName();
    var asClass = builtinNativeClasses[className] || nativeClasses[className];
    if (asClass) {
      linkClass(axClass, asClass);
    }
  }