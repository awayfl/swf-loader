import { AXSecurityDomain } from "../run/AXSecurityDomain";
import { jsGlobal } from "../../base/utilities/jsGlobal";
import { Errors } from "../errors";

/**
 * Other natives can live in this module
 */

export var Natives = {
    print: function(sec: AXSecurityDomain, expression: any, arg1?: any, arg2?: any, arg3?: any, arg4?: any) {
        var args = Array.prototype.slice.call(arguments, 1);
        jsGlobal.print.apply(null, args);
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
    }
  }