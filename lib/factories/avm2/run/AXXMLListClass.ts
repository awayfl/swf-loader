import { AXClass } from "./AXClass";
import { ASXMLList, ASXML } from "../natives/xml";
import { Multiname } from "../abc/lazy/Multiname";


export interface AXXMLListClass extends AXClass {
    Create(value?: any): ASXMLList;
    CreateList(targetObject: ASXML, targetProperty: Multiname): ASXMLList;
  }
  