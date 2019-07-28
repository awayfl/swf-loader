import { wrapJSGlobalFunction } from "./wrapJSGlobalFunction";
import { jsGlobal } from "../../base/utilities/jsGlobal";

export var unescape: (x: any) => any = wrapJSGlobalFunction(jsGlobal.unescape);