import { MethodTraitInfo } from "./MethodTraitInfo";
import { MethodBodyInfo } from "./MethodBodyInfo";
import { AXClass } from "../../run/AXClass";
import { ABCFile } from "./ABCFile";
import { ParameterInfo } from "./ParameterInfo";
import { MetadataInfo } from "./MetadataInfo";
import { TRAIT } from "./TRAIT";
import { InstanceInfo } from "./InstanceInfo";
import { ClassInfo } from "./ClassInfo";
import { METHOD } from "./METHOD";

export class MethodInfo {
    public trait: MethodTraitInfo = null;
    public minArgs: number;
    private _body: MethodBodyInfo;
    private _returnType: AXClass;
    constructor(
      public abc: ABCFile,
      private _index: number,
      public name: number,
      public returnTypeNameIndex: number,
      public parameters: ParameterInfo [],
      public optionalCount: number,
      public flags: number
    ) {
      this._body = null;
      this.minArgs = parameters.length - optionalCount;
    }
  
    getNativeMetadata(): MetadataInfo {
      if (!this.trait) {
        return null;
      }
      var metadata = this.trait.getMetadata();
      if (!metadata) {
        return null;
      }
      for (var i = 0; i < metadata.length; i++) {
        if (metadata[i].getName() === "native") {
          return metadata[i];
        }
      }
      return null;
    }
  
    getBody(): MethodBodyInfo {
      return this._body || (this._body = this.abc.getMethodBodyInfo(this._index));
    }
  
    getType(): AXClass {
      if (this._returnType !== undefined) {
        return this._returnType;
      }
      if (this.returnTypeNameIndex === 0) {
        this._returnType = null;
      } else {
        var mn = this.abc.getMultiname(this.returnTypeNameIndex);
        this._returnType = this.abc.applicationDomain.getClass(mn);
      }
      return this._returnType;
    }
  
    getName(): string {
      if (this.name) {
        return this.abc.getString(this.name);
      }
      if (this.trait) {
        return this.trait.getName().name;
      }
      return 'anonymous';
    }
  
    toString() {
      var str = "anonymous";
      if (this.name) {
        str = this.abc.getString(this.name);
      }
      str += " (" + this.parameters.join(", ") + ")";
      if (this.returnTypeNameIndex) {
        str += ": " + this.abc.getMultiname(this.returnTypeNameIndex).name;
      }
      return str;
    }
  
    toFlashlogString(): string {
      var trait = this.trait;
      var prefix = trait.kind === TRAIT.Getter ? 'get ' :
                    trait.kind === TRAIT.Setter ? 'set ' : '';
      var name = trait.toFlashlogString();
      var holder = trait.holder;
      var holderName;
      if (holder && holder instanceof InstanceInfo) {
        holderName = (<InstanceInfo>holder).toFlashlogString();
        prefix = holderName + '/' + prefix;
      }
      if (holder && holder instanceof ClassInfo && (<ClassInfo>holder).trait) {
        holderName = (<ClassInfo>holder).trait.toFlashlogString();
        prefix = holderName + '$/' + prefix;
      }
      var prefixPos;
      if (holderName && (prefixPos = name.indexOf('::')) > 0 &&
          holderName.indexOf(name.substring(0, prefixPos + 2)) === 0) {
        name = name.substring(prefixPos + 2);
      }
      return 'MTHD ' + prefix + name + ' ()';
    }
  
    isNative(): boolean {
      return !!(this.flags & METHOD.Native);
    }
  
    needsRest(): boolean {
      return !!(this.flags & METHOD.NeedRest);
    }
  
    needsArguments(): boolean {
      return !!(this.flags & METHOD.NeedArguments);
    }
  }