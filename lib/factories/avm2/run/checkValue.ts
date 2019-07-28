import { release } from "../../base/utilities/Debug";
import { assert } from "@awayjs/graphics";
import { isValidASValue } from "./initializeAXBasePrototype";

export function checkValue(value: any) {
    if (!release) {
      if (!isValidASValue(value)) {
        // Stringifying the value is potentially costly, so only do it if necessary,
        // even in debug mode.
        assert(false, "Value: " + value + " is not allowed to flow into AS3.");
      }
    }
  }
  