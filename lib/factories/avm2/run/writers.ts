import { IndentingWriter, dumpLine } from "../../base/utilities";
import { WriterFlags } from "./WriterFlags";

var writer = new IndentingWriter(false, function (x) { dumpLine(x); } );
export var runtimeWriter = null;
export var executionWriter = null;
export var interpreterWriter = null;

export function sliceArguments(args, offset: number) {
  return Array.prototype.slice.call(args, offset);
}

export function setWriters(flags: WriterFlags) {
  runtimeWriter = (flags & WriterFlags.Runtime) ? writer : null;
  executionWriter = (flags & (WriterFlags.Execution | WriterFlags.Interpreter)) ? writer : null;
  interpreterWriter = (flags & WriterFlags.Interpreter) ? writer : null;
}