
export function axConvertString(x): string {
    if (typeof x === "string") {
      return x;
    }
    return x + '';
  }