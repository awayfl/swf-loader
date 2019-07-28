import { ITraits } from "./ITraits";
import { RuntimeTraits} from "../abc/lazy/RuntimeTraits";
import { Namespace} from "../abc/lazy/Namespace";
import { TRAIT} from "../abc/lazy/TRAIT";
import { assert } from "@awayjs/graphics";
import { release } from "../../base/utilities/Debug";
import { defineReadOnlyProperty } from "../../base/utilities/ObjectUtilities";
import { ASNamespace } from "../natives/xml";
import { checkValue } from "./checkValue";

export function applyTraits(object: ITraits, traits: RuntimeTraits) {
    release || assert(!object.hasOwnProperty("traits"));
    defineReadOnlyProperty(object, "traits", traits);
    var T = traits.getTraitsList();
    for (var i = 0; i < T.length; i++) {
      var t = T[i];
      var p: PropertyDescriptor = t;
      if (p.value instanceof Namespace) {
        // We can't call |object.sec.AXNamespace.FromNamespace(...)| because the
        // AXNamespace class may not have been loaded yet. However, at this point we do have a
        // valid reference to |object.sec.AXNamespace| because |prepareNativeClass| has
        // been called.
        p = { value: ASNamespace.FromNamespace.call(object.sec.AXNamespace, p.value) };
      }
      if (!release && (t.kind === TRAIT.Slot || t.kind === TRAIT.Const)) {
        checkValue(p.value);
      }
      Object.defineProperty(object, t.name.getMangledName(), p);
    }
  }