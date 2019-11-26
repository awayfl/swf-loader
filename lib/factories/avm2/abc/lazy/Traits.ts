import { TraitInfo } from "./TraitInfo";
import { Info } from "./Info";
import { release } from "../../../base/utilities/Debug";
import { assert } from "@awayjs/graphics";
import { IndentingWriter } from "../../../base/utilities";
import { Multiname } from "./Multiname";
import { RuntimeTraits } from "./RuntimeTraits";
import { Namespace } from "./Namespace";
import { Scope } from "../../run/Scope";
import { RuntimeTraitInfo } from "./RuntimeTraitInfo";
import { NamespaceType } from "./NamespaceType";
import { createMethodForTrait } from "./createMethodForTrait";
import { TRAIT } from "./TRAIT";
import { MethodTraitInfo } from "./MethodTraitInfo";
import { SlotTraitInfo } from "./SlotTraitInfo";



/**
 * The Traits class represents the collection of compile-time traits associated with a type.
 * It's not used for runtime name resolution on instances; instead, the combined traits for
 * a type and all its super types is resolved and translated to an instance of RuntimeTraits.
 */
export class Traits {
    private _resolved = false;
    constructor(
      public traits: TraitInfo []
    ) {
      // ...
    }
  
    resolve() {
      if (this._resolved) {
        return;
      }
      for (var i = 0; i < this.traits.length; i++) {
        this.traits[i].resolve();
      }
      this._resolved = true;
    }
  
    attachHolder(holder: Info) {
      for (var i = 0; i < this.traits.length; i++) {
        release || assert(!this.traits[i].holder);
        this.traits[i].holder = holder;
      }
    }
  
    trace(writer: IndentingWriter = new IndentingWriter()) {
      this.resolve();
      this.traits.forEach(x => writer.writeLn(x.toString()));
    }
  
    /**
     * Searches for a trait with the specified name.
     */
    private indexOf(mn: Multiname): number {
      release || assert(this._resolved);
      var mnName = mn.name;
      var nss = mn.namespaces;
      var traits = this.traits;
      for (var i = 0; i < traits.length; i++) {
        var trait = traits[i];
        var traitMn = <Multiname>trait.name;
        if (traitMn.name === mnName) {
          var ns = traitMn.namespaces[0];
          for (var j = 0; j < nss.length; j++) {
            if (ns === nss[j]) {
              return i;
            }
          }
        }
      }
      return -1;
    }
  
    private multinames: object = {}

    getTrait(mn: Multiname): TraitInfo {
        let t = this.multinames[mn.id]

        if (t === undefined) {
            let i = this.indexOf(mn)
            t = i >= 0 ? this.traits[i] : this
            this.multinames[mn.id] = t
        }

        return t === this ? null : t
    }
  
    /**
     * Turns a list of compile-time traits into runtime traits with resolved bindings.
     *
     * Runtime traits are stored in 2-dimensional maps. The outer dimension is keyed on the
     * trait's local name. The inner dimension is a map of mangled namespace names to traits.
     *
     * Lookups are thus O(n) in the number of namespaces present in the query, instead of O(n+m)
     * in the number of traits (n) on the type times the number of namespaces present in the
     * query (m).
     *
     * Negative result note: an implementation with ECMAScript Maps with Namespace objects as
     * keys was tried and found to be much slower than the Object-based one implemented here.
     * Mostly, the difference was in how well accesses are optimized in JS engines, with Maps
     * being new-ish and less well-optimized.
     *
     * Additionally, all protected traits get added to a map with their unqualified name as key.
     * That map is created with the super type's map on its prototype chain. If a type overrides
     * a protected trait, it gets set as that type's value for the unqualified name. Additionally,
     * its name is canonicalized to use the namespace used in the initially introducing type.
     * During name lookup, we first check for a hit in that map and (after verifying that the mn
     * has a correct protected name in its namespaces set) return the most recent trait. That way,
     * all lookups always get the most recent trait, even if they originate from a super class.
     */
    resolveRuntimeTraits(superTraits: RuntimeTraits, protectedNs: Namespace,
                          scope: Scope): RuntimeTraits {
      // Resolve traits so that indexOf works out.
      this.resolve();
  
      var protectedNsMappings = Object.create(superTraits ? superTraits.protectedNsMappings : null);
      var result = new RuntimeTraits(superTraits, protectedNs, protectedNsMappings);
  
      // Add all of the child traits, replacing or extending parent traits where necessary.
      for (var i = 0; i < this.traits.length; i++) {
        var trait = this.traits[i];
        var name = <Multiname>trait.name;
        var runtimeTrait = new RuntimeTraitInfo(name, trait.kind, trait.abc);
        if (name.namespaces[0].type === NamespaceType.Protected) {
          // Names for protected traits get canonicalized to the name of the type that initially
          // introduces the trait.
          if (result.protectedNsMappings[name.name]) {
            runtimeTrait.name = result.protectedNsMappings[name.name].name;
          }
          result.protectedNsMappings[name.name] = runtimeTrait;
        }
  
        var currentTrait = result.addTrait(runtimeTrait);
  
        switch (trait.kind) {
          case TRAIT.Method:
            var method = createMethodForTrait(<MethodTraitInfo>trait, scope);
            runtimeTrait.value = method;
            break;
          case TRAIT.Getter:
            runtimeTrait.get = createMethodForTrait(<MethodTraitInfo>trait, scope);
            if (currentTrait && currentTrait.set) {
              runtimeTrait.set = currentTrait.set;
              runtimeTrait.kind = TRAIT.GetterSetter;
            }
            break;
          case TRAIT.Setter:
            runtimeTrait.set = createMethodForTrait(<MethodTraitInfo>trait, scope);
            if (currentTrait && currentTrait.get) {
              runtimeTrait.get = currentTrait.get;
              runtimeTrait.kind = TRAIT.GetterSetter;
            }
            break;
          case TRAIT.Slot:
          case TRAIT.Const:
          case TRAIT.Class:
            // Only non-const slots need to be writable. Everything else is fixed.
            runtimeTrait.writable = true;
            var slotTrait = <SlotTraitInfo>trait;
            runtimeTrait.slot = slotTrait.slot;
            runtimeTrait.value = slotTrait.getDefaultValue();
            runtimeTrait.typeName = <Multiname>slotTrait.typeName;
            // TODO: Throw error for const without default.
            result.addSlotTrait(runtimeTrait);
        }
      }
      return result;
    }
  }