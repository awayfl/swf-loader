
export function axApplyObject(_, args) {
    var x = args[0];
    if (x == null) {
      return Object.create(this.tPrototype);
    }
    return x;
  }