

/**
 * Similar to |toString| but returns |null| for |null| or |undefined| instead
 * of "null" or "undefined".
 */
export function axCoerceString(x): string {
    if (typeof x === "string") {
      return x;
    } else if (x == undefined) {
      return null;
    }
    return x + '';
  }