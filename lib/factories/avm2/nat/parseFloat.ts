import { wrapJSGlobalFunction } from "./wrapJSGlobalFunction";
import { jsGlobal } from "../../base/utilities/jsGlobal";


export var parseFloat: (string: string) => number = wrapJSGlobalFunction(jsGlobal.parseFloat);