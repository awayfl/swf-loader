import { AXApplicationDomain } from "../run/AXApplicationDomain";
import { Multiname } from "../abc/lazy/Multiname";
import { runtimeWriter } from "../run/writers";
import { release } from "../../base/utilities/Debug";
import { assert } from "@awayjs/graphics";

/**
 * Creates a self patching getter that lazily constructs the class and memoizes
 * to the class's instance constructor.
 */
export function defineClassLoader(
  applicationDomain: AXApplicationDomain,
  container: Object,
  mn: Multiname,
  classAlias: string
) {
  Object.defineProperty(container, classAlias, {
    get: function() {
      runtimeWriter && runtimeWriter.writeLn("Running Memoizer: " + mn.name);
      var axClass = applicationDomain.getClass(mn);
      release || assert(axClass, "Class " + mn + " is not found.");
      release || assert(axClass.axConstruct);
      var loader: any = function() {
        return axClass.axConstruct(<any>arguments);
      };
      loader.axIsType = function(value: any) {
        return axClass.axIsType(value);
      };
      loader.axClass = axClass;
      Object.defineProperty(container, classAlias, {
        value: loader,
        writable: false
      });
      return loader;
    },
    configurable: true
  });
}
