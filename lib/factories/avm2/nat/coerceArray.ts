

export function coerceArray(obj) {
    if (!obj || !obj.sec) {
      throw new TypeError('Conversion to Array failed');
    }
    return obj.sec.AXArray.axCoerce(obj);
  }