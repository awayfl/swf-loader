/**
 * Returns the fully qualified class name of an object.
 */
export function getQualifiedClassName(_: AXSecurityDomain, value: any):string {
    release || checkValue(value);
    var valueType = typeof value;
    switch (valueType) {
      case 'undefined':
        return 'void';
      case 'object':
        if (value === null) {
          return 'null';
        }
        return value.classInfo.instanceInfo.name.toFQNString(true);
      case 'number':
        return (value | 0) === value ? 'int' : 'Number';
      case 'string':
        return 'String';
      case 'boolean':
        return 'Boolean';
    }
    release || assertUnreachable('invalid value type ' + valueType);
  }