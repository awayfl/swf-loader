import { Info } from "./Info";
import { ClassInfo } from "./ClassInfo";
import { RuntimeTraits } from "./RuntimeTraits";
import { AXClass } from "../../run/AXClass";
import { ABCFile } from "./ABCFile";
import { Multiname } from "./Multiname";
import { MethodInfo } from "./MethodInfo";
import { Traits } from "./Traits";
import { IndentingWriter } from "../../../base/utilities";
import { CONSTANT } from "./CONSTANT";


export class InstanceInfo extends Info {
    public classInfo: ClassInfo = null;
    public runtimeTraits: RuntimeTraits = null;
    public key: string = null;
  
    private _interfaces: Set<AXClass>;
  
    constructor(
      public abc: ABCFile,
      public name: Multiname | number,
      public superName: Multiname | number,
      public flags: number,
      public protectedNs: number,
      public interfaceNameIndices: number [],
      public initializer: MethodInfo | number,
      public traits: Traits
    ) {
      super();
      this._interfaces = null;
    }
  
    getInitializer(): MethodInfo {
      if (typeof this.initializer === "number") {
        this.initializer = this.abc.getMethodInfo(<number>this.initializer);
      }
      return <MethodInfo>this.initializer;
    }
  
    getName(): Multiname {
      if (typeof this.name === "number") {
        this.name = this.abc.getMultiname(<number>this.name);
      }
      return <Multiname>this.name;
    }
  
    getClassName(): string {
      var name = this.getName();
      if (name.namespaces[0].uri) {
        return name.namespaces[0].uri + "." + name.name;
      }
      return name.name;
    }
  
    getSuperName(): Multiname {
      if (typeof this.superName === "number") {
        this.superName = this.abc.getMultiname(<number>this.superName);
      }
      return <Multiname>this.superName;
    }
  
    getInterfaces(ownerClass: AXClass): Set<AXClass> {
      if (this._interfaces) {
        return this._interfaces;
      }
  
      var superClassInterfaces;
      var superClass = ownerClass.superClass;
      if (superClass) {
        superClassInterfaces = superClass.classInfo.instanceInfo.getInterfaces(superClass);
      }
      var SetCtor: any = Set;
      var interfaces = this._interfaces = new SetCtor(superClassInterfaces);
      for (var i = 0; i < this.interfaceNameIndices.length; i++) {
        var mn = this.abc.getMultiname(this.interfaceNameIndices[i]);
        var type = this.abc.applicationDomain.getClass(mn);
        interfaces.add(type);
        var implementedInterfaces = type.classInfo.instanceInfo.getInterfaces(type);
        implementedInterfaces.forEach((iface) => interfaces.add(iface));
      }
      return interfaces;
    }
  
    toString() {
      return "InstanceInfo " + this.getName().name;
    }
  
    toFlashlogString(): string {
      return this.getName().toFlashlogString();
    }
  
    trace(writer: IndentingWriter) {
      writer.enter("InstanceInfo: " + this.getName());
      this.superName && writer.writeLn("Super: " + this.getSuperName());
      this.traits.trace(writer);
      writer.outdent();
    }
  
    isInterface(): boolean {
      return !!(this.flags & CONSTANT.ClassInterface);
    }
  
    isSealed(): boolean {
      return !!(this.flags & CONSTANT.ClassSealed);
    }
  
    isFinal(): boolean {
      return !!(this.flags & CONSTANT.ClassFinal);
    }
  }