import { release } from '../../../base/utilities/Debug';

export const enum NamespaceType {
    Public          = 0,
    Protected       = 1,
    PackageInternal = 2,
    Private         = 3,
    Explicit        = 4,
    StaticProtected = 5
  }
  
  var namespaceTypeNames = ["Public", "Protected", "PackageInternal", "Private", "Explicit", "StaticProtected"];
  
  export function getNamespaceTypeName(namespaceType: NamespaceType): string {
    return release ? String(namespaceType) : namespaceTypeNames[namespaceType];
  }
  