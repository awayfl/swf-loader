

/**
 * Naming Conventions:
 *
 *  mn:   multiname;
 *  nm:   name
 *  ns:   namespace
 *  nss:  namespace set
 *
 * Parsing is a combination of lazy and eager evaluation. String parsing is deferred until
 * it is needed for multiname parsing.
 */
import {Namespace} from "./lazy/Namespace"
import {NamespaceType} from "./lazy/NamespaceType"
import {internNamespace} from "./lazy/internNamespace"

Namespace.PUBLIC = internNamespace(NamespaceType.Public, "");

