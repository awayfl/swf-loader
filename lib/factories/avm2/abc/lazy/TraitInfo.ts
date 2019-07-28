import { TRAIT, getTRAITName } from "./TRAIT";
import { Info } from "./Info";
import { MetadataInfo } from "./MetadataInfo";
import { ABCFile } from "./ABCFile";
import { Multiname } from "./Multiname";


export class TraitInfo {
    public holder: Info;
    public metadata: MetadataInfo [] | Uint32Array;
  
    constructor(
      public abc: ABCFile,
      public kind: TRAIT,
      public name: Multiname | number
    ) {
      this.metadata = null;
      this.holder = null;
    }
  
    getMetadata(): MetadataInfo [] {
      if (!this.metadata) {
        return null;
      }
      if (this.metadata instanceof Uint32Array) {
        var metadata = new Array(this.metadata.length);
        for (var i = 0; i < this.metadata.length; i++) {
          metadata[i] = this.abc.getMetadataInfo(<number>this.metadata[i]);
        }
        this.metadata = metadata;
      }
      return <MetadataInfo []>this.metadata;
    }
  
    getName(): Multiname {
      return <Multiname>this.name;
    }
  
    resolve() {
      if (typeof this.name === "number") {
        this.name = this.abc.getMultiname(<number>this.name);
      }
    }
  
    toString() {
      return getTRAITName(this.kind) + " " + this.name;
    }
  
    toFlashlogString(): string {
      this.resolve();
      return this.getName().toFlashlogString();
    }
  
    isConst(): boolean {
      return this.kind === TRAIT.Const;
    }
  
    isSlot(): boolean {
      return this.kind === TRAIT.Slot;
    }
  
    isMethod(): boolean {
      return this.kind === TRAIT.Method;
    }
  
    isGetter(): boolean {
      return this.kind === TRAIT.Getter;
    }
  
    isSetter(): boolean {
      return this.kind === TRAIT.Setter;
    }
  
    isAccessor(): boolean {
      return this.kind === TRAIT.Getter ||
              this.kind === TRAIT.Setter;
    }
  
    isMethodOrAccessor(): boolean {
      return this.isAccessor() || this.kind === TRAIT.Method;
    }
  }
  