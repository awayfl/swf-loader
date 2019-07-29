
import { ASClass } from "./ASClass";
import { NamespaceType } from "../abc/lazy/NamespaceType";
import { ASObject } from "./ASObject";
import { ASFunction } from "./ASFunction";
import { ASMethodClosure } from "./ASMethodClosure";
import { ASNumber } from "./ASNumber";
import { ASInt } from "./ASInt";
import { ASString } from "./ASString";
import { ASUint } from "./ASUint";
import { ASBoolean } from "./ASBoolean";
import { ASArray } from "./ASArray";
import { Int32Vector } from "../natives/int32Vector";
import { GenericVector, Vector } from "../natives/GenericVector";
import { Uint32Vector } from "../natives/uint32Vector";
import { Float64Vector } from "../natives/float64Vector";
import { ASMath } from "./ASMath";
import { ASRegExp } from "./ASRegExp";
import { ASJSON } from "./ASJSON";
import { assert } from "@awayjs/graphics";
import { release } from "../../base/utilities/Debug";
import { FlashUtilScript_getDefinitionByName } from "./FlashUtilScript_getDefinitionByName";
import { FlashUtilScript_getTimer } from "./FlashUtilScript_getTimer";
import { FlashNetScript_navigateToURL } from "./FlashNetScript_navigateToURL";
import { FlashNetScript_sendToURL } from "./FlashNetScript_sendToURL";
import { wrapJSGlobalFunction } from "./wrapJSGlobalFunction";
import { Toplevel_registerClassAlias } from "./Toplevel_registerClassAlias";
import { Toplevel_getClassByAlias } from "./Toplevel_getClassByAlias";
import { ASError, ASArgumentError, ASUninitializedError, ASVerifyError, ASURIError, ASTypeError, ASSyntaxError, ASSecurityError, ASReferenceError, ASRangeError, ASEvalError, ASDefinitionError, ASIllegalOperationError, ASMemoryError, ASEOFError, ASIOError } from "./ASError";

/* 80pro: todo: XML
import { XMLParser } from '../natives/xml';
import { XMLNode } from '../natives/xml';
import { XMLNodeType } from '../../customAway/xml/XMLNodeType';*/
import { nativeFunctions } from './nativeFunctions';
import { jsGlobal } from '../../base/utilities/jsGlobal';


import { ASDate } from "../natives/Date";
import { ASProxy } from "../natives/proxy";
import { Dictionary } from "../natives/dictionary";
import { ByteArray } from "../natives/byteArray";
import { OriginalSystem } from "../natives/system";
import {builtinNativeClasses} from"./builtinNativeClasses";
import {nativeClasses} from"./builtinNativeClasses";
import {nativeClassLoaderNames} from"./builtinNativeClasses";
import { ASNamespace, ASQName, ASXML, ASXMLList } from '../natives/xml';

import {isNaN} from "./isNaN";

console.log("isNaN", isNaN);

export function initializeBuiltins() {
  builtinNativeClasses["Object"]              = ASObject;
  builtinNativeClasses["Class"]               = ASClass;
  builtinNativeClasses["Function"]            = ASFunction;
  builtinNativeClasses["Boolean"]             = ASBoolean;
  builtinNativeClasses["builtin.as$0.MethodClosure"] = ASMethodClosure;

  builtinNativeClasses["Number"]              = ASNumber;
  builtinNativeClasses["int"]                 = ASInt;
  builtinNativeClasses["uint"]                = ASUint;
  builtinNativeClasses["String"]              = ASString;
  builtinNativeClasses["Array"]               = ASArray;

  builtinNativeClasses["__AS3__.vec.Vector"]        = Vector;
  builtinNativeClasses["__AS3__.vec.Vector$object"] = GenericVector;
  builtinNativeClasses["__AS3__.vec.Vector$int"]    = Int32Vector;
  builtinNativeClasses["__AS3__.vec.Vector$uint"]   = Uint32Vector;
  builtinNativeClasses["__AS3__.vec.Vector$double"] = Float64Vector;

  builtinNativeClasses["Namespace"]           = ASNamespace;
  builtinNativeClasses["QName"]               = ASQName;
  builtinNativeClasses["XML"]                 = ASXML;
  builtinNativeClasses["XMLList"]             = ASXMLList;

/*
  builtinNativeClasses["flash.xml.XMLNode"] = XMLNode;
  builtinNativeClasses["flash.xml.XMLDocument"] = XMLDocument;
  builtinNativeClasses["flash.xml.XMLParser"] = XMLParser;
  builtinNativeClasses["flash.xml.XMLTag"] = XMLTag;
  builtinNativeClasses["flash.xml.XMLNodeType"] = XMLNodeType;
  */

  builtinNativeClasses["Math"]                = ASMath;
  builtinNativeClasses["Date"]                = ASDate;
  builtinNativeClasses["RegExp"]              = ASRegExp;
  builtinNativeClasses["JSON"]                = ASJSON;

  builtinNativeClasses["flash.utils.Proxy"]      = ASProxy;
  builtinNativeClasses["flash.utils.Dictionary"] = Dictionary;
  builtinNativeClasses["flash.utils.ByteArray"]  = ByteArray;

  builtinNativeClasses["avmplus.System"]  = OriginalSystem;

  // Errors
  builtinNativeClasses["Error"]               = ASError;
  builtinNativeClasses["DefinitionError"]     = ASDefinitionError;
  builtinNativeClasses["EvalError"]           = ASEvalError;
  builtinNativeClasses["RangeError"]          = ASRangeError;
  builtinNativeClasses["ReferenceError"]      = ASReferenceError;
  builtinNativeClasses["SecurityError"]       = ASSecurityError;
  builtinNativeClasses["SyntaxError"]         = ASSyntaxError;
  builtinNativeClasses["TypeError"]           = ASTypeError;
  builtinNativeClasses["URIError"]            = ASURIError;
  builtinNativeClasses["VerifyError"]         = ASVerifyError;
  builtinNativeClasses["UninitializedError"]  = ASUninitializedError;
  builtinNativeClasses["ArgumentError"]       = ASArgumentError;
  builtinNativeClasses["flash.errors.IOError"] = ASIOError;
  builtinNativeClasses["flash.errors.EOFError"] = ASEOFError;
  builtinNativeClasses["flash.errors.MemoryError"] = ASMemoryError;
  builtinNativeClasses["flash.errors.IllegalOperationError"] = ASIllegalOperationError;
}

export function registerNativeClass(name: string, asClass: ASClass, alias: string = name,
    nsType: NamespaceType = NamespaceType.Public) {
release || assert (!nativeClasses[name], "Native class: " + name + " is already registered.");
nativeClasses[name] = asClass;
nativeClassLoaderNames.push({name: name, alias: alias, nsType: nsType});
}

export function registerNativeFunction(path: string, fun: Function) {
release || assert (!nativeFunctions[path], "Native function: " + path + " is already registered.");
nativeFunctions[path] = fun;
}

registerNativeClass("__AS3__.vec.Vector$object", GenericVector, 'ObjectVector', NamespaceType.PackageInternal);
registerNativeClass("__AS3__.vec.Vector$int", Int32Vector, 'Int32Vector', NamespaceType.PackageInternal);
registerNativeClass("__AS3__.vec.Vector$uint", Uint32Vector, 'Uint32Vector', NamespaceType.PackageInternal);
registerNativeClass("__AS3__.vec.Vector$double", Float64Vector, 'Float64Vector', NamespaceType.PackageInternal);



registerNativeFunction('FlashUtilScript::getDefinitionByName',
                        FlashUtilScript_getDefinitionByName);

registerNativeFunction('FlashUtilScript::getTimer', FlashUtilScript_getTimer);

registerNativeFunction('FlashUtilScript::navigateToURL', FlashNetScript_navigateToURL);
registerNativeFunction('FlashNetScript::navigateToURL', FlashNetScript_navigateToURL);
registerNativeFunction('FlashNetScript::sendToURL', FlashNetScript_sendToURL);

registerNativeFunction('FlashUtilScript::escapeMultiByte', wrapJSGlobalFunction(jsGlobal.escape));
registerNativeFunction('FlashUtilScript::unescapeMultiByte', wrapJSGlobalFunction(jsGlobal.unescape));

registerNativeFunction('Toplevel::registerClassAlias', Toplevel_registerClassAlias);
registerNativeFunction('Toplevel::getClassByAlias', Toplevel_getClassByAlias);