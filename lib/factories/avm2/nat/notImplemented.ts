import { wrapJSGlobalFunction } from "./wrapJSGlobalFunction";
import { jsGlobal } from "../../base/utilities/jsGlobal";


export var notImplemented: (x: any) => void = wrapJSGlobalFunction(jsGlobal.Shumway.Debug.notImplemented);
