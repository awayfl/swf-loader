import { AXClass } from "./AXClass";
import { ASNamespace } from "../natives/xml";
import { Namespace } from "../abc/lazy/Namespace";


export interface AXNamespaceClass extends AXClass {
    Create(uriOrPrefix?: any, uri?: any): ASNamespace;
    FromNamespace(ns: Namespace): ASNamespace;
    defaultNamespace: Namespace;
  }