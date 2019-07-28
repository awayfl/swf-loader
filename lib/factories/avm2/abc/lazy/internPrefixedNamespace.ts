import { NamespaceType } from "./NamespaceType";
import { Namespace } from "./Namespace";
import { _namespaces } from "./_namespaces";

export function internPrefixedNamespace(type: NamespaceType, uri: string, prefix: string) {
    var key = type + uri + prefix;
    var ns = _namespaces[key];
    if (!ns) {
      ns = _namespaces[key] = new Namespace(type, uri, prefix);
    }
    return ns;
  }