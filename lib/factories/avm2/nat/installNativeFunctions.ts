import { AXSecurityDomain } from '../run/AXSecurityDomain';
import { nativeFunctions } from './nativeFunctions';
import { createContainersFromPath } from '../nat/createContainersFromPath';

/**
 * Installs all the previously registered native functions on the AXSecurityDomain.
 *
 * Note that this doesn't use memoizers and doesn't run the functions' AS3 script.
 */
export function installNativeFunctions(sec: AXSecurityDomain) {
    for (var i in nativeFunctions) {
      var pathTokens = i.split('.');
      var funName = pathTokens.pop();
      var container = createContainersFromPath(pathTokens, sec);
      container[funName] = sec.boxFunction(nativeFunctions[i]);
    }
  }
  