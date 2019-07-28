import { release } from "../../../base/utilities/Debug";

export const enum CONSTANT {
    Undefined          = 0x00,
    Utf8               = 0x01,
    Float              = 0x02,
    Int                = 0x03,
    UInt               = 0x04,
    PrivateNs          = 0x05,
    Double             = 0x06,
    QName              = 0x07,
    Namespace          = 0x08,
    Multiname          = 0x09,
    False              = 0x0A,
    True               = 0x0B,
    Null               = 0x0C,
    QNameA             = 0x0D,
    MultinameA         = 0x0E,
    RTQName            = 0x0F,
    RTQNameA           = 0x10,
    RTQNameL           = 0x11,
    RTQNameLA          = 0x12,
    NameL              = 0x13,
    NameLA             = 0x14,
    NamespaceSet       = 0x15,
    PackageNamespace   = 0x16,
    PackageInternalNs  = 0x17,
    ProtectedNamespace = 0x18,
    ExplicitNamespace  = 0x19,
    StaticProtectedNs  = 0x1A,
    MultinameL         = 0x1B,
    MultinameLA        = 0x1C,
    TypeName           = 0x1D,
  
    ClassSealed        = 0x01,
    ClassFinal         = 0x02,
    ClassInterface     = 0x04,
    ClassProtectedNs   = 0x08
  }
  
var CONSTANTNames = ["Undefined","Utf8|ClassSealed","Float|ClassFinal","Int","UInt|ClassInterface","PrivateNs","Double","QName","Namespace|ClassProtectedNs","Multiname","False","True","Null","QNameA","MultinameA","RTQName","RTQNameA","RTQNameL","RTQNameLA","NameL","NameLA","NamespaceSet","PackageNamespace","PackageInternalNs","ProtectedNamespace","ExplicitNamespace","StaticProtectedNs","MultinameL","MultinameLA","TypeName"];

export function getCONSTANTName(constant: CONSTANT): string {
  return release ? String(constant) : CONSTANTNames[constant];
}