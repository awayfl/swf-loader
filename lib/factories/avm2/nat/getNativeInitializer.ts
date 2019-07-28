import { ClassInfo } from "../abc/lazy/ClassInfo";
import { AXCallable } from "../run/AXCallable";
import { nativeClasses } from "./nativeClasses";
import { builtinNativeClasses } from './builtinNativeClasses';

export function getNativeInitializer(classInfo: ClassInfo): AXCallable {
    var methodInfo = classInfo.instanceInfo.getInitializer();
    var className = classInfo.instanceInfo.getClassName();
    var asClass = builtinNativeClasses[className] || nativeClasses[className];
    if (methodInfo.isNative()) {
      // Use TS constructor as the initializer function.
      return <any>asClass;
    }
    //// TODO: Assert eagerly.
    //return function () {
    //  release || assert (!methodInfo.isNative(), "Must supply a constructor for " + classInfo +
    // "."); }
    return null;
  }