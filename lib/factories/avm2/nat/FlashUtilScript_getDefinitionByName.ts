import { AXSecurityDomain } from '../run/AXSecurityDomain';
import { Multiname } from '../abc/lazy/Multiname';
import { getCurrentABC } from '../run/getCurrentABC';
import { AXClass } from '../run/AXClass';
import { NamespaceType } from '../abc/lazy/NamespaceType';
export function FlashUtilScript_getDefinitionByName(sec: AXSecurityDomain, name: string): AXClass {
    var simpleName = String(name).replace("::", ".");
    return getCurrentABC().env.app.getClass(Multiname.FromFQNString(simpleName, NamespaceType.Public));
  }