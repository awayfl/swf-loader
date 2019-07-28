import { Info } from "./Info";
import { AXGlobal } from "../../run/AXGlobal";
import { ScriptInfoState } from "../../run/ScriptInfoState";
import { ABCFile } from "./ABCFile";
import { Traits } from "./Traits";
import { MethodInfo } from "./MethodInfo";
import { IndentingWriter } from "../../../base/utilities";

export class ScriptInfo extends Info {
    public global: AXGlobal = null;
    public state: ScriptInfoState = ScriptInfoState.None;
    constructor(
      public abc: ABCFile,
      public initializer: number,
      public traits: Traits
    ) {
      super();
    }
  
    getInitializer(): MethodInfo {
      return this.abc.getMethodInfo(this.initializer);
    }
  
    trace(writer: IndentingWriter) {
      writer.enter("ScriptInfo");
      this.traits.trace(writer);
      writer.outdent();
    }
  }