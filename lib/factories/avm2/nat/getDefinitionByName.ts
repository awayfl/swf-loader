import { AXSecurityDomain } from "../run/AXSecurityDomain";
import { AXClass } from "../run/AXClass";
import { axCoerceString } from "../run/axCoerceString";
import { getCurrentABC } from "../run/getCurrentABC";
import { NamespaceType, Multiname } from "../abc/lazy";

/**
 * Returns the class with the specified name, or |null| if no such class exists.
 */
export function getDefinitionByName(sec: AXSecurityDomain, name: string): AXClass {
    name = axCoerceString(name).replace("::", ".");
    var mn = Multiname.FromFQNString(name, NamespaceType.Public);
    return getCurrentABC().env.app.getClass(mn);
  }