

export function filter(propertyName: string): boolean {
    return propertyName.indexOf("native_") !== 0;
  }