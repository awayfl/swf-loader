import { ASXML } from "../natives/xml";
import { AXClass } from "./AXClass";

export interface AXXMLClass extends AXClass {
    Create(value?: any): ASXML;
    resetSettings: () => void;
    _flags: number;
    _prettyIndent: number;
    prettyPrinting: boolean;
    ignoreComments: boolean;
    ignoreWhitespace: boolean;
    ignoreProcessingInstructions: boolean;
  }