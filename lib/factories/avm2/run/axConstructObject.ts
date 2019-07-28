
export function axConstructObject(args) {
    var x = args[0];
    if (x == null) {
      return Object.create(this.tPrototype);
    }
    return x;
  }