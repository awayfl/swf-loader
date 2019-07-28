import { AXClass } from "./AXClass";
import { AXObject } from "./AXObject";
import { AXFunction } from "./AXFunction";

export interface AXMethodClosureClass extends AXClass {
    Create(receiver: AXObject, method: Function): AXFunction;
  }