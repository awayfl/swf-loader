

export function axIsCallable(value): boolean {
    return (value && typeof value.axApply === 'function');
  }