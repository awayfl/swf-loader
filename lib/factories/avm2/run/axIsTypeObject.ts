

export function axIsTypeObject(x: any) {
    return this.dPrototype.isPrototypeOf(this.sec.box(x)) || x === this.dPrototype;
  }