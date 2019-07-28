import { AXSecurityDomain } from "./AXSecurityDomain";
import { AXClass } from "./AXClass";
import { Errors } from "../errors";

export function validateConstruct(sec: AXSecurityDomain, axClass: AXClass, argc: number) {
    if (!axClass || !axClass.axConstruct) {
      var name = axClass && axClass.classInfo ?
                  axClass.classInfo.instanceInfo.getName().name :
                  'value';
      sec.throwError('TypeError', Errors.ConstructOfNonFunctionError, name);
    }
    var methodInfo = axClass.classInfo.getInitializer();
    if (argc < methodInfo.minArgs) {
      sec.throwError('ArgumentError', Errors.WrongArgumentCountError,
                      axClass.classInfo.instanceInfo.getName().name,
                      methodInfo.minArgs, argc);
    }
  }