import { wrapJSGlobalFunction } from "./wrapJSGlobalFunction";
import { jsGlobal } from "../../base/utilities/jsGlobal";

export var parseInt: (s: string, radix?: number) => number = wrapJSGlobalFunction(jsGlobal.parseInt);