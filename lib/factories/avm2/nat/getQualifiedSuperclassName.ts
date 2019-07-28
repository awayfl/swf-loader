
/**
 * Returns the fully qualified class name of the base class of the object specified by the
 * |value| parameter.
 */
export function getQualifiedSuperclassName(sec: AXSecurityDomain, value: any) {
    if (isNullOrUndefined(value)) {
      return "null";
    }
    value = sec.box(value);
    // The value might be from another domain, so don't use passed-in the current
    // AXSecurityDomain.
    var axClass = value.sec.AXClass.axIsType(value) ?
                  (<AXClass>value).superClass :
                  value.axClass.superClass;
    return getQualifiedClassName(sec, axClass);
  }