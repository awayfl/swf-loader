import { Info } from "./Info";
import { ClassTraitInfo } from "./ClassTraitInfo";
import { RuntimeTraits } from "./RuntimeTraits";
import { ABCFile } from "./ABCFile";
import { InstanceInfo } from "./InstanceInfo";
import { MethodInfo } from "./MethodInfo";
import { Traits } from "./Traits";
import { MetadataInfo } from "./MetadataInfo";
import { IndentingWriter } from "../../../base/utilities";

export class ClassInfo extends Info {
    public trait: ClassTraitInfo = null;
    public runtimeTraits: RuntimeTraits = null;
    constructor(
      public abc: ABCFile,
      public instanceInfo: InstanceInfo,
      public initializer: MethodInfo | number,
      public traits: Traits
    ) {
      super();
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
  
    getInitializer(): MethodInfo {
      if (typeof this.initializer === "number") {
        return this.initializer = this.abc.getMethodInfo(<number>this.initializer);
      }
      return <MethodInfo>this.initializer;
    }
  
    toString() {
      return "ClassInfo " + this.instanceInfo.getName();
    }
  
    trace(writer: IndentingWriter) {
      writer.enter("ClassInfo");
      this.traits.trace(writer);
      writer.outdent();
    }
  }
  