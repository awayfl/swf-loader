import { Multiname } from "../abc/lazy/Multiname";
import { axCoerceString } from "../run/axCoerceString";
import { AXSecurityDomain } from "../run/AXSecurityDomain";

export function walk(sec: AXSecurityDomain, holder: any, name: string, reviver: Function) {
    var val = holder[name];
    if (Array.isArray(val)) {
      var v: any[] = <any>val;
      for (var i = 0, limit = v.length; i < limit; i++) {
        var newElement = walk(sec, v, axCoerceString(i), reviver);
        if (newElement === undefined) {
          delete v[i];
        } else {
          v[i] = newElement;
        }
      }
    } else if (val !== null && typeof val !== 'boolean' && typeof val !== 'number' &&
                typeof val !== 'string')
    {
  
      for (var p in val) {
        if (!val.hasOwnProperty(p) || !Multiname.isPublicQualifiedName(p)) {
          break;
        }
        var newElement = walk(sec, val, p, reviver);
        if (newElement === undefined) {
          delete val[p];
        } else {
          val[p] = newElement;
        }
      }
    }
    return reviver.call(holder, name, val);
  }