import { ABCFile } from "./ABCFile";
import { CONSTANT, getCONSTANTName } from "./CONSTANT";
import { Namespace } from "./Namespace";
import { NamespaceType } from "./NamespaceType";
import { internNamespace } from "./internNamespace";
import { release } from "../../../base/utilities/Debug";
import { assert } from "@awayjs/graphics";
import { internPrefixedNamespace } from "./internPrefixedNamespace";
import { axCoerceString } from "../../run/axCoerceString";
import { isNumeric } from "../../../base/utilities";
import { ScriptInfo } from "./ScriptInfo";
import { AXObject } from "../../run/AXObject"

export class Multiname {
    private static _nextID = 1;
    public id: number = Multiname._nextID ++;
    private _mangledName: string = null;

    public script: ScriptInfo = null
    public numeric: boolean = false
    public numericValue: any = 0
    public resolved: object = {}
    public scope: AXObject = null
    public value: AXObject = null

    constructor(
      public abc: ABCFile,
      public index: number,
      public kind: CONSTANT,
      public namespaces: Namespace [],
      public name: any,
      public parameterType: Multiname = null,
      public mutable: boolean = false
    ) {
      // ...
    }

    private others: object = null

    public rename(name : string): Multiname {
        if (this.others == null)
            this.others = {}
            
        let rn = this.others[name]
        
        if (rn === undefined) {
            rn = new Multiname(this.abc, -1, null, this.namespaces, name, this.parameterType)
            rn.script = this.script
            this.others[name] = rn
        }
        
        return rn
    }
  
    public static FromFQNString(fqn: string, nsType: NamespaceType) {
      var lastDot = fqn.lastIndexOf('.');
      var uri = lastDot === -1 ? '' : fqn.substr(0, lastDot);
      var name = lastDot === -1 ? fqn : fqn.substr(lastDot + 1);
      var ns = internNamespace(nsType, uri);
      return new Multiname(null, 0, CONSTANT.RTQName, [ns], name);
    }
  
    private _nameToString(): string {
      if (this.isAnyName()) {
        return "*";
      }
      return this.isRuntimeName() ? "[" + this.name + "]" : this.name;
    }
  
    public isRuntime(): boolean {
      switch (this.kind) {
        case CONSTANT.QName:
        case CONSTANT.QNameA:
        case CONSTANT.Multiname:
        case CONSTANT.MultinameA:
          return false;
      }
      return true;
    }
  
    public isRuntimeName(): boolean {
      switch (this.kind) {
        case CONSTANT.RTQNameL:
        case CONSTANT.RTQNameLA:
        case CONSTANT.MultinameL:
        case CONSTANT.MultinameLA:
          return true;
      }
      return false;
    }
  
    public isRuntimeNamespace(): boolean {
      switch (this.kind) {
        case CONSTANT.RTQName:
        case CONSTANT.RTQNameA:
        case CONSTANT.RTQNameL:
        case CONSTANT.RTQNameLA:
          return true;
      }
      return false;
    }
  
    public isAnyName(): boolean {
      return this.name === null;
    }
  
    public isAnyNamespace(): boolean {
      if (this.isRuntimeNamespace() || this.namespaces.length > 1) {
        return false;
      }
      return this.namespaces.length === 0 || this.namespaces[0].uri === "";
  
      // x.* has the same meaning as x.*::*, so look for the former case and give
      // it the same meaning of the latter.
      // return !this.isRuntimeNamespace() &&
      //  (this.namespaces.length === 0 || (this.isAnyName() && this.namespaces.length !== 1));
    }
  
    public isQName(): boolean {
      var kind = this.kind;
      var result = kind === CONSTANT.TypeName ||
                    kind === CONSTANT.QName || kind === CONSTANT.QNameA ||
                    kind >= CONSTANT.RTQName && kind <= CONSTANT.RTQNameLA;
      release || assert(!(result && this.namespaces.length !== 1));
      return result;
    }
  
    public get namespace(): Namespace {
      release || assert(this.isQName());
      return this.namespaces[0];
    }
  
    public get uri(): string {
      release || assert(this.isQName());
      return this.namespaces[0].uri;
    }
  
    public get prefix(): string {
      release || assert(this.isQName());
      return this.namespaces[0].prefix;
    }
  
    public set prefix(prefix: string) {
      release || assert(this.isQName());
      var ns = this.namespaces[0];
      if (ns.prefix === prefix) {
        return;
      }
      this.namespaces[0] = internPrefixedNamespace(ns.type, ns.uri, prefix);
    }
  
    public equalsQName(mn: Multiname): boolean {
      release || assert(this.isQName());
      return this.name === mn.name && this.namespaces[0].uri === mn.namespaces[0].uri;
    }
  
    public matches(mn: Multiname): boolean {
      release || assert(this.isQName());
      var anyName = mn.isAnyName();
      if (anyName && !mn.isQName()) {
        return true;
      }
      if (!anyName && this.name !== mn.name) {
        return false;
      }
      var uri = this.namespaces[0].uri;
      for (var i = mn.namespaces.length; i--;) {
        if (mn.namespaces[i].uri === uri) {
          return true;
        }
      }
      return false;
    }
    public isAttribute(): boolean {
      switch (this.kind) {
        case CONSTANT.QNameA:
        case CONSTANT.RTQNameA:
        case CONSTANT.RTQNameLA:
        case CONSTANT.MultinameA:
        case CONSTANT.MultinameLA:
          return true;
      }
      return false;
    }
  
    public getMangledName(): string {
      release || assert(this.isQName());
      return this._mangledName || this._mangleName();
    }
  
    private _mangleName() {
      release || assert(!this._mangledName);
      var mangledName = "$" + this.namespaces[0].mangledName + axCoerceString(this.name);
      if (!this.isRuntime()) {
        this._mangledName = mangledName;
      }
      return mangledName;
    }
  
    public getPublicMangledName(): any {
      if (isNumeric(this.name)) {
        return this.name;
      }
      return "$Bg" + axCoerceString(this.name);
    }
  
    public static isPublicQualifiedName(value: any): boolean {
      return value.indexOf('$Bg') === 0;
    }
  
    public static getPublicMangledName(name: string): any {
      if (isNumeric(name)) {
        return name;
      }
      return "$Bg" + name;
    }
  
    public toFQNString(useColons: boolean) {
      release || assert(this.isQName());
      var prefix = this.namespaces[0].uri;
      if (prefix.length) {
        prefix += (useColons ? '::' : '.');
      }
      return prefix + this.name;
    }
  
    public toString() {
      var str = getCONSTANTName(this.kind) + " ";
      str += this.isAttribute() ? "@" : "";
      if (this.isRuntimeNamespace()) {
        var namespaces = this.namespaces ? this.namespaces.map(x => String(x)).join(", ") : null;
        str += "[" + namespaces + "]::" + this._nameToString();
      } else if (this.isQName()) {
        str += this.namespaces[0] + "::";
        str += this._nameToString();
      } else if (this.namespaces) {
        str += "{" + this.namespaces.map(x => String(x)).join(", ") + "}";
        str += "::" + this._nameToString();
      } else {
        str += "{" + this.namespaces + "}";
        str += "::" + this._nameToString();
      }
      if (this.parameterType) {
        str += "<" + this.parameterType + ">";
      }
      return str;
    }
  
    toFlashlogString(): string {
      var namespaceUri = this.uri;
      return namespaceUri ? namespaceUri + "::" + this.name : this.name;
    }
  
    /**
     * Removes the public prefix, or returns undefined if the prefix doesn't exist.
     */
    public static stripPublicMangledName(name: string): any {
      if (name.indexOf("$Bg") === 0) {
        return name.substring(3);
      }
      return undefined;
    }
  
    public static FromSimpleName(simpleName: string): Multiname {
      var nameIndex = simpleName.lastIndexOf(".");
      if (nameIndex <= 0) {
        nameIndex = simpleName.lastIndexOf(" ");
      }
  
      var uri = '';
      var name;
      if (nameIndex > 0 && nameIndex < simpleName.length - 1) {
        name = simpleName.substring(nameIndex + 1).trim();
        uri = simpleName.substring(0, nameIndex).trim();
      } else {
        name = simpleName;
      }
      var ns = internNamespace(NamespaceType.Public, uri);
      return new Multiname(null, 0, CONSTANT.RTQName, [ns], name);
    }
  }