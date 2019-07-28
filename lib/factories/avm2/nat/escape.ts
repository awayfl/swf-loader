import { wrapJSGlobalFunction } from "./wrapJSGlobalFunction";
import { jsGlobal } from "../../base/utilities/jsGlobal";

export var escape: (x: any) => any = wrapJSGlobalFunction(jsGlobal.escape);