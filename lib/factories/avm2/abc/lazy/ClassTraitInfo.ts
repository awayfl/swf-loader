import { SlotTraitInfo } from "./SlotTraitInfo";
import { ABCFile } from "./ABCFile";
import { TRAIT } from "./TRAIT";
import { Multiname } from "./Multiname";
import { ClassInfo } from "./ClassInfo";

export class ClassTraitInfo extends SlotTraitInfo {
    constructor(
      abc: ABCFile,
      kind: TRAIT,
      name: Multiname | number,
      slot: number,
      public classInfo: ClassInfo
    ) {
      super(abc, kind, name, slot, 0, 0, -1);
    }
  }