
/**
 * These values are allowed to exist without being boxed.
 */
export function isPrimitiveJSValue(value: any) {
    return value === null || value === undefined || typeof value === "number" ||
            typeof value === "string" || typeof value === "boolean";
  
  }