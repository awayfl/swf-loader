import { AXClass } from "./AXClass";
import { ASQName } from "../natives/xml";
import { Multiname } from "../abc/lazy/Multiname";



export interface AXQNameClass extends AXClass {
    Create(nameOrNS?: any, name?: any): ASQName;
    FromMultiname(mn: Multiname): ASQName;
  }