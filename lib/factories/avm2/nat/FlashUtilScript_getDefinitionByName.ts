import { AXSecurityDomain } from '../run/AXSecurityDomain';
import { ASClass } from './ASClass';
import { Multiname } from '../abc/lazy/Multiname';
import { getCurrentABC } from '../run/getCurrentABC';
export function FlashUtilScript_getDefinitionByName(sec: AXSecurityDomain, name: string): ASClass {
    var simpleName = String(name).replace("::", ".");
    return <any>getCurrentABC().env.app.getClass(Multiname.FromSimpleName(simpleName));
  }