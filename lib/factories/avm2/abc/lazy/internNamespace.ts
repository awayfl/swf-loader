import { _namespaces } from "./_namespaces";
import { NamespaceType } from "./NamespaceType";
import { Namespace } from "./Namespace";

export function internNamespace(type: NamespaceType, uri: string) {
    var key = type + uri;
    return _namespaces[key] || (_namespaces[key] = new Namespace(type, uri, ''));
  }
  