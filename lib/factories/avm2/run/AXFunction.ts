import { AXObject } from "./AXObject";

export interface AXFunction extends AXObject {
    axApply(thisArg: any, argArray?: any[]): any;
    axCall(thisArg: any): any;
    value;
  }
  