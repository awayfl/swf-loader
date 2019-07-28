import { StringUtilities } from "../../base/utilities/StringUtilities";

export function AXBasePrototype_$BgtoString() {
    // Dynamic prototypes just return [object Object], so we have to special-case them.
    // Since the dynamic object is the one holding the direct reference to `classInfo`,
    // we can check for that.
    var name = this.hasOwnProperty('classInfo') ?
                'Object' :
                this.classInfo.instanceInfo.name.name;
    return StringUtilities.concat3("[object ", name, "]");
  };