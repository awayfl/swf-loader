import { AXSecurityDomain } from "../../run/AXSecurityDomain";



export function createGlobalNative(native: Function, sec: AXSecurityDomain) {

    return function() {
      switch (arguments.length) {
        case 0: return native(sec);
        case 1: return native(sec, arguments[0]);
        case 2: return native(sec, arguments[0], arguments[1]);
        case 3: return native(sec, arguments[0], arguments[1], arguments[2]);
        default:
          var args: any[] = [sec];
          for (var i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
          }
          return native.apply(this, args);
      }
    };
  }
  