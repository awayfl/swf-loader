

export function axIsTypeInt(x): boolean {
    return typeof x === "number" && ((x | 0) === x);
  }