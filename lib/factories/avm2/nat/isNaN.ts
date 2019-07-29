
import {wrapJSGlobalFunction} from "./wrapJSGlobalFunction";
import { jsGlobal } from "../../base/utilities/jsGlobal";
export var isNaN: (number: number) => boolean = wrapJSGlobalFunction(jsGlobal.isNaN);