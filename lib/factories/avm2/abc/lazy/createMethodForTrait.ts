import { MethodTraitInfo } from "./MethodTraitInfo";
import { Scope } from "../../run/Scope";
import { ScriptInfo } from "./ScriptInfo";
import { METHOD } from "./METHOD";
import { createGlobalNative } from "./createGlobalNative";
import { release } from "../../../base/utilities/Debug";
import { flashlog } from "../../../base/flashlog";
import { jsGlobal } from "../../../base/utilities/jsGlobal";
import { interpret } from "../../int";
import { getNative } from "../../nat/getNative";
import { getMethodOrAccessorNative } from "../../nat/getMethodOrAccessorNative";


export function createMethodForTrait(methodTraitInfo: MethodTraitInfo, scope: Scope) {
    if (methodTraitInfo.method) {
      return methodTraitInfo.method;
    }
    var methodInfo = methodTraitInfo.getMethodInfo();
    var method;
    if (methodInfo.flags & METHOD.Native) {
      var metadata = methodInfo.getNativeMetadata();
      if (metadata || methodTraitInfo.holder instanceof ScriptInfo) {
        if (metadata) {
          method = getNative(metadata.getValueAt(0));
        } else {
          var mn = methodTraitInfo.getName();
          method = getNative(mn.uri + '.' + mn.name);
        }
        method = createGlobalNative(method, scope.object.sec);
      } else {
        method = getMethodOrAccessorNative(methodTraitInfo);
      }
      if (!release) {
        method.toString = function () {
          return "Native " + methodTraitInfo.toString();
        };
        method.isInterpreted = false;
      }
    } else {
      method = interpret(methodInfo, scope, null);

      if (!release) {
        method.toString = function () {
          return "Interpreted " + methodTraitInfo.toString();
        };
        method.isInterpreted = true;
      }
    }
    if (!release && flashlog && methodInfo.trait) {
      method = (function (wrapped, methodInfo) {
        var traceMsg = methodInfo.toFlashlogString();
        var result: any = function () {
          flashlog.writeAS3Trace(traceMsg);
          return wrapped.apply(this, arguments);
        };
        result.toString = wrapped.toString;
        result.isInterpreted = wrapped.isInterpreted;
        return result;
      })(method, methodInfo);
    }
  
    methodTraitInfo.method = method;
    method.methodInfo = methodInfo;
    if (!release) {
      try {
        Object.defineProperty(method, 'name', {value: methodInfo.getName()});
      } catch (e) {
        // Ignore errors in browsers that don't allow overriding Function#length;
      }
    }
    method.methodInfo = methodInfo;
    return method;
  }