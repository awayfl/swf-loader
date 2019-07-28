
/**
 * Same as |axCoerceString| except for returning "null" instead of |null| for
 * |null| or |undefined|, and calls |toString| instead of (implicitly) |valueOf|.
 */
export function axCoerceName(x): string {
    if (typeof x === "string") {
      return x;
    } else if (x == undefined) {
      return 'null';
    }
    return x.toString();
  }