import { Info } from "./Info";
import { ExceptionInfo } from "./ExceptionInfo";
import { Traits } from "./Traits";
import { IndentingWriter } from "../../../base/utilities";
import { BytecodeStream, Bytecode, getBytecodeName } from "../ops";

export class MethodBodyInfo extends Info {
    public activationPrototype: Object = null;
    constructor(
      public maxStack: number,
      public localCount: number,
      public initScopeDepth: number,
      public maxScopeDepth: number,
      public code: Uint8Array,
      public catchBlocks: ExceptionInfo [],
      public traits: Traits
    ) {
      super();
    }
  
    trace(writer: IndentingWriter) {
      writer.writeLn("Code: " + this.code.length);
      var stream = new BytecodeStream(this.code);
      while (stream.currentBytecode() !== Bytecode.END) {
        writer.writeLn(stream.currentBCI + ": " + getBytecodeName(stream.currentBytecode()));
        stream.next();
      }
    }
  }
  