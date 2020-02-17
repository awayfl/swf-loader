import { RuntimeTraitInfo } from "./RuntimeTraitInfo";
import { MapObject } from "../../../base/utilities";
import { Namespace } from "./Namespace";
import { release } from "../../../base/utilities/Debug";
import { assert } from "@awayjs/graphics";
import { NamespaceType } from "./NamespaceType";
import { Multiname } from "./Multiname";


export class RuntimeTraits {
    public slots: RuntimeTraitInfo[] = [];
  
    private _traits: MapObject<MapObject<RuntimeTraitInfo>>;
    private _nextSlotID: number = 1;
  
    constructor(public superTraits: RuntimeTraits,
                public protectedNs: Namespace, public protectedNsMappings: any) {
      var traits = this._traits = Object.create(null);
      if (!superTraits) {
        return;
      }
      var superMappings = superTraits._traits;
      for (var key in superMappings) {
        traits[key] = Object.create(superMappings[key]);
      }
    }
  
    /**
     * Adds the given trait and returns any trait that might already exist under that name.
     *
     * See the comment for `Trait#resolveRuntimeTraits` for an explanation of the lookup scheme.
     */
    public addTrait(trait: RuntimeTraitInfo): RuntimeTraitInfo {
      var mn = trait.name;
      var mappings = this._traits[mn.name];
      if (!mappings) {
        mappings = this._traits[mn.name] = Object.create(null);
      }
      var nsName = mn.namespaces[0].mangledName;
      var current = mappings[nsName];
      mappings[nsName] = trait;
      return current;
    }
  
    public addSlotTrait(trait: RuntimeTraitInfo) {
      var slot = trait.slot;
      if (!slot) {
        slot = trait.slot = this._nextSlotID++;
      } else {
        this._nextSlotID = slot + 1;
      }
      release || assert(!this.slots[slot]);
      this.slots[slot] = trait;
    }

    private multinames: object = {}
    
    getTraitMultiname(mn: Multiname): RuntimeTraitInfo {
        if (mn.mutable)
            return this.getTrait(mn.namespaces, mn.name)
        
        return this.multinames[mn.id] || (this.multinames[mn.id] = this.getTrait(mn.namespaces, mn.name));
    }
  
    /**
     * Returns the trait matching the given multiname parts, if any.
     *
     * See the comment for `Trait#resolveRuntimeTraits` for an explanation of the lookup scheme.
     */
    getTrait(namespaces: Namespace[], name: string): RuntimeTraitInfo {
      release || assert(typeof name === 'string');
      var mappings = this._traits[name];
      if (!mappings) {
        return null;
      }
      var trait: RuntimeTraitInfo;
      for (var i = 0; i < namespaces.length; i++) {
        var ns = namespaces[i];
        trait = mappings[ns.mangledName];
        if (trait) {
          return trait;
        }
        if (ns.type === NamespaceType.Protected) {
          var protectedScope:RuntimeTraits = this;
          while (protectedScope) {
            if (protectedScope.protectedNs === ns) {
              trait = protectedScope.protectedNsMappings[name];
              if (trait) {
                return trait;
              }
            }
            protectedScope = protectedScope.superTraits;
          }
        }
      }
      return null;
    }
  
    getTraitsList() {
      var list = [];
      var names = this._traits;
      for (var name in names) {
        var mappings = names[name];
        for (var nsName in mappings) {
          list.push(mappings[nsName]);
        }
      }
      return list;
    }
  
    getSlotPublicTraitNames(): string [] {
      var slots = this.slots;
      var names = [];
      for (var i = 1; i < slots.length; i++) {
        var slot = slots[i];
        if (!(<Multiname>slot.name).namespace.isPublic()) {
          continue;
        }
        names.push((<Multiname>slot.name).name);
      }
      return names;
    }
  
    getSlot(i: number): RuntimeTraitInfo {
      return this.slots[i];
    }
  }
  