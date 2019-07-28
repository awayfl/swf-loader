import { Traits } from '../abc/lazy/Traits';
import { NamespaceType } from '../abc/lazy/NamespaceType';
import { assert } from '@awayjs/graphics';
import { release, notImplemented } from '../../base/utilities/Debug';
import { hasOwnGetter } from '../../base/utilities/ObjectUtilities';
import { containsSymbol } from './containsSymbol';

export function linkSymbols(symbols: string [], traits: Traits, object) {
    for (var i = 0; i < traits.traits.length; i++) {
      var trait = traits.traits[i];
      if (!containsSymbol(symbols, trait.getName().name)) {
        continue;
      }
      release || assert (trait.getName().namespace.type !== NamespaceType.Private, "Why are you linking against private members?");
      if (trait.isConst()) {
        release || release || notImplemented("Don't link against const traits.");
        return;
      }
      var name = trait.getName().name;
      var qn = trait.getName().getMangledName();
      if (trait.isSlot()) {
        Object.defineProperty(object, name, {
          get: <() => any>new Function("", "return this." + qn +
                                            "//# sourceURL=get-" + qn + ".as"),
          set: <(any) => void>new Function("v", "this." + qn + " = v;" +
                                                "//# sourceURL=set-" + qn + ".as")
        });
      } else if (trait.isGetter()) {
        release || assert (hasOwnGetter(object, qn), "There should be an getter method for this symbol.");
        Object.defineProperty(object, name, {
          get: <() => any>new Function("", "return this." + qn +
                                            "//# sourceURL=get-" + qn + ".as")
        });
      } else {
        notImplemented(trait.toString());
      }
    }
  }
  