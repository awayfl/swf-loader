import { AXSecurityDomain } from "../run/AXSecurityDomain";
import { jsGlobal } from "../../base/utilities/jsGlobal";
import { Errors } from "../errors";
import { wrapJSGlobalFunction } from './wrapJSGlobalFunction';
import { checkValue } from '../run/checkValue';
import { release, assertUnreachable, notImplemented } from '../../base/utilities/Debug';
import { isNullOrUndefined } from '@awayjs/graphics';
import { AXClass } from '../run/AXClass';
import { axCoerceString } from '../run/axCoerceString';
import { getCurrentABC } from '../run/getCurrentABC';
import { NamespaceType } from '../abc/lazy/NamespaceType';
import { Multiname } from '../abc/lazy/Multiname';
import { describeType as describeTypeIntern} from '../natives/describeType';

/**
 * Other natives can live in this module
 */

export var Natives = {
    print: function(sec: AXSecurityDomain, expression: any, arg1?: any, arg2?: any, arg3?: any, arg4?: any) {
        var args = Array.prototype.slice.call(arguments, 1);
        if(args.length==1){
          console.log("%c Trace from SWF:", "color: DodgerBlue", args[0]);
        }
        else{
          console.log("%c Trace from SWF:", "color: DodgerBlue", args);
        }
        //jsGlobal.print.apply(null, args);
      },
    debugBreak: function(v: any) {
        /* tslint:disable */
        debugger;
        /* tslint:enable */
      },
    bugzilla: function(_: AXSecurityDomain, n) {
        switch (n) {
          case 574600: // AS3 Vector::map Bug
            return true;
        }
        return false;
      },
    decodeURI: function(sec: AXSecurityDomain, encodedURI: string): string {
        try {
          return jsGlobal.decodeURI(encodedURI);
        } catch (e) {
          sec.throwError('URIError', Errors.InvalidURIError, 'decodeURI');
        }
      },
    decodeURIComponent: function(sec: AXSecurityDomain, encodedURI: string): string {
        try {
          return jsGlobal.decodeURIComponent(encodedURI);
        } catch (e) {
          sec.throwError('URIError', Errors.InvalidURIError, 'decodeURIComponent');
        }
      },
    encodeURI: function(sec: AXSecurityDomain, uri: string): string {
        try {
          return jsGlobal.encodeURI(uri);
        } catch (e) {
          sec.throwError('URIError', Errors.InvalidURIError, 'encodeURI');
        }
      },
    encodeURIComponent: function(sec: AXSecurityDomain, uri: string): string {
      try {
        return jsGlobal.encodeURIComponent(uri);
      } catch (e) {
        sec.throwError('URIError', Errors.InvalidURIError, 'encodeURIComponent');
      }
    },
    isNaN: wrapJSGlobalFunction(jsGlobal.isNaN),
    isFinite: wrapJSGlobalFunction(jsGlobal.isFinite),
    parseInt: wrapJSGlobalFunction(jsGlobal.parseInt),
    parseFloat: wrapJSGlobalFunction(jsGlobal.parseFloat),
    escape: wrapJSGlobalFunction(jsGlobal.escape),
    unescape: wrapJSGlobalFunction(jsGlobal.unescape),
    isXMLName: function () {
      return false; // "FIX ME";
    },
    notImplemented: wrapJSGlobalFunction(notImplemented),

    /**
     * Returns the fully qualified class name of an object.
     */
    getQualifiedClassName(_: AXSecurityDomain, value: any):string {
      release || checkValue(value);
      var valueType = typeof value;
      switch (valueType) {
        case 'undefined':
          return 'void';
        case 'object':
          if (value === null) {
            return 'null';
          }
          return value.classInfo.instanceInfo.name.toFQNString(true);
        case 'number':
          return (value | 0) === value ? 'int' : 'Number';
        case 'string':
          return 'String';
        case 'boolean':
          return 'Boolean';
      }
      release || assertUnreachable('invalid value type ' + valueType);
    },

    /**
     * Returns the fully qualified class name of the base class of the object specified by the
     * |value| parameter.
     */
    getQualifiedSuperclassName(sec: AXSecurityDomain, value: any) {
      if (isNullOrUndefined(value)) {
        return "null";
      }
      value = sec.box(value);
      // The value might be from another domain, so don't use passed-in the current
      // AXSecurityDomain.
      var axClass = value.sec.AXClass.axIsType(value) ?
                    (<AXClass>value).superClass :
                    value.axClass.superClass;
      return this.getQualifiedClassName(sec, axClass);
    },
    /**
     * Returns the class with the specified name, or |null| if no such class exists.
     */
    getDefinitionByName(sec: AXSecurityDomain, name: string): AXClass {
      name = axCoerceString(name).replace("::", ".");
      var mn = Multiname.FromFQNString(name, NamespaceType.Public);
      return getCurrentABC().env.app.getClass(mn);
    },
    describeType(sec: AXSecurityDomain, value: any, flags: number):any {
      console.log("describeType not implemented");
      return describeTypeIntern(sec, value, flags);
    },
    describeTypeJSON(sec: AXSecurityDomain, value: any, flags: number) {
      console.log("describeTypeJSON not implemented");
      return null;//describeTypeJSON(sec, value, flags);
    },
    getArgv(): any [] {
      return null;
    }

  }