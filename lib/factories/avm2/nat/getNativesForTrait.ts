import { TraitInfo } from '../abc/lazy/TraitInfo';
import { InstanceInfo } from '../abc/lazy/InstanceInfo';
import { assert } from '@awayjs/graphics';
import { release, assertUnreachable } from '../../base/utilities/Debug';
import { ClassInfo } from '../abc/lazy/ClassInfo';
import { pushMany } from '../../base/utilities/ArrayUtilities';
import { builtinNativeClasses, nativeClasses} from "./builtinNativeClasses";
export function getNativesForTrait(trait: TraitInfo): Object [] {
    var className = null;
    var natives: Object [];
  
    if (trait.holder instanceof InstanceInfo) {
      var instanceInfo = <InstanceInfo>trait.holder;
      className = instanceInfo.getClassName();
      var native = builtinNativeClasses[className] || nativeClasses[className];
      release || assert (native, "Class native is not defined: " + className);
      natives = [native.prototype];
      if (native.instanceNatives) {
        pushMany(natives, native.instanceNatives);
      }
    } else if (trait.holder instanceof ClassInfo) {
      var classInfo = <ClassInfo>trait.holder;
      className = classInfo.instanceInfo.getClassName();
      var native = builtinNativeClasses[className] || nativeClasses[className];
      release || assert (native, "Class native is not defined: " + className);
      natives = [native];
      if (native.classNatives) {
        pushMany(natives, native.classNatives);
      }
    } else {
      release || assertUnreachable('Invalid trait type');
    }
    return natives;
  }