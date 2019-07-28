
/**
 * Default axApply.
 */
export function axDefaultApply(self, args: any []) {
    return this.axCoerce(args ? args[0] : undefined);
  }
  