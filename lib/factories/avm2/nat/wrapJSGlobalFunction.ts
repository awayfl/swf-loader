import { jsGlobal } from "../../base/utilities/jsGlobal";

export function wrapJSGlobalFunction(fun) {
    return function(sec, ...args) {
      return fun.apply(jsGlobal, args);
    };
  }
  