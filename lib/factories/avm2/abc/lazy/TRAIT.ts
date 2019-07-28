import { release } from "../../../base/utilities/Debug";


export const enum TRAIT {
    Slot               = 0,
    Method             = 1,
    Getter             = 2,
    Setter             = 3,
    Class              = 4,
    Function           = 5,
    Const              = 6,
    GetterSetter       = 7 // This is a runtime addition, not a valid ABC Trait type.
  }
  
  var TRAITNames = ["Slot", "Method", "Getter", "Setter", "Class", "Function", "Const", "GetterSetter"];
  
  export function getTRAITName(trait: TRAIT): string {
    return release ? String(trait) : TRAITNames[trait];
  }