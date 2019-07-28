import { safeGetPrototypeOf } from "./safeGetPrototypeOf";
import { isNullOrUndefined } from "../../base/utilities";
import { AXObject } from "./AXObject";


export class HasNext2Info {
    constructor(public object: AXObject, public index: number) {
      // ...
    }
  
    /**
     * Determine if the given object has any more properties after the specified |index| and if so,
     * return the next index or |zero| otherwise. If the |obj| has no more properties then continue
     * the search in
     * |obj.__proto__|. This function returns an updated index and object to be used during
     * iteration.
     *
     * the |for (x in obj) { ... }| statement is compiled into the following pseudo bytecode:
     *
     * index = 0;
     * while (true) {
     *   (obj, index) = hasNext2(obj, index);
     *   if (index) { #1
     *     x = nextName(obj, index); #2
     *   } else {
     *     break;
     *   }
     * }
     *
     * #1 If we return zero, the iteration stops.
     * #2 The spec says we need to get the nextName at index + 1, but it's actually index - 1, this
     * caused me two hours of my life that I will probably never get back.
     *
     * TODO: We can't match the iteration order semantics of Action Script, hopefully programmers
     * don't rely on it.
     */
    next(object: AXObject, index: number) {
      if (isNullOrUndefined(object)) {
        this.index = 0;
        this.object = null;
        return;
      } else {
        this.object = object;
        this.index = index;
      }
      var nextIndex = object.axNextNameIndex(this.index);
      if (nextIndex > 0) {
        this.index = nextIndex;
        return;
      }
      // If there are no more properties in the object then follow the prototype chain.
      while (true) {
        var object = safeGetPrototypeOf(object);
        if (!object) {
          this.index = 0;
          this.object = null;
          return;
        }
        nextIndex = object.axNextNameIndex(0);
        if (nextIndex > 0) {
          this.index = nextIndex;
          this.object = object;
          return;
        }
      }
    }
  }