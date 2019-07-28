
export function axBoxPrimitive(value) {
    var boxed = Object.create(this.tPrototype);
    boxed.value = value;
    return boxed;
  }
  