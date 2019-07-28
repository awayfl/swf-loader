import { AXClass } from "./AXClass";


export function axImplementsInterface(type: AXClass) {
    var interfaces = (<AXClass>this).classInfo.instanceInfo.getInterfaces(this.axClass);
    return interfaces.has(type);
  }