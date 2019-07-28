import { MethodInfo } from "../abc/lazy/MethodInfo";

/**
 * Can be used wherever both AXFunctions and raw JS functions are valid values.
 */
export interface AXCallable {
    axApply(thisArg: any, argArray?: any[]): any;
    axCall(thisArg: any, arg0?: any, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any,
            arg6?: any, arg7?: any, arg8?: any, arg9?: any): any;
    apply(thisArg: any, argArray?: any[]): any;
    call(thisArg: any, arg0?: any, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any,
          arg6?: any, arg7?: any, arg8?: any, arg9?: any): any;
    methodInfo?: MethodInfo;
    length: number;
  }