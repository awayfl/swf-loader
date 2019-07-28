import { Multiname } from "../abc/lazy/Multiname";
import { Scope } from "./Scope";
import { Bytecode } from "../abc/ops";

/**
 * MetaobjectProtocol interface.
 */
export interface IMetaobjectProtocol {
    axResolveMultiname(mn: Multiname): any;
    axHasProperty(mn: Multiname): boolean;
    axDeleteProperty(mn: Multiname): boolean;
  
    axCallProperty(mn: Multiname, argArray: any [], isLex: boolean): any;
    axCallSuper(mn: Multiname, scope: Scope, argArray: any []): any;
    axConstructProperty(mn: Multiname, args: any []): any;
    axHasPropertyInternal(mn: Multiname): boolean;
    axHasOwnProperty(mn: Multiname): boolean;
  
    axSetProperty(mn: Multiname, value: any, bc: Bytecode);
    axGetProperty(mn: Multiname): any;
    axGetSuper(mn: Multiname, scope: Scope): any;
    axSetSuper(mn: Multiname, scope: Scope, value: any);
  
    axNextNameIndex(index: number): any;
    axNextName(index: number): any;
    axNextValue(index: number): any;
  
    axEnumerableKeys: any [];
    axGetEnumerableKeys(): any [];
  
    axHasPublicProperty(nm: any): boolean;
    axSetPublicProperty(nm: any, value: any);
    axGetPublicProperty(nm: any): any;
    axCallPublicProperty(nm: any, argArray: any []): any;
    axDeletePublicProperty(nm: any): boolean;
  
    axSetNumericProperty(nm: number, value: any);
    axGetNumericProperty(nm: number): any;
  
    axGetSlot(i: number): any;
    axSetSlot(i: number, value: any);
  
    getPrototypeOf(): any;
  }
  