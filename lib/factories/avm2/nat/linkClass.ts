import { AXClass } from '../run/AXClass';
import { linkSymbols } from './linkSymbols';
import { filter } from './filter';
import { copyOwnPropertyDescriptors, copyPropertiesByList } from '../../base/utilities/ObjectUtilities';
import { release } from '../../base/utilities/Debug';
import { runtimeWriter } from '../run/writers';
import { traceASClass } from './traceASClass';
import { axTrapNames } from './axTrapNames';
import { ASObject } from './ASObject';
import { ASClass } from './ASClass';


export function linkClass(axClass: AXClass, asClass: ASClass) {
    // Save asClass on the axClass.
    axClass.asClass = asClass;
  
    // TypeScript's static inheritance can lead to subtle linking bugs. Make sure we don't fall
    // victim to this by checking that we don't inherit non-null static properties.
    /*if (false && !release && axClass.superClass) {
      if (asClass.classSymbols) {
        release || assert(asClass.classSymbols !== axClass.superClass.asClass.classSymbols,
          "Make sure class " + axClass + " doesn't inherit super class's classSymbols.");
      }
      if (asClass.instanceSymbols) {
        release || assert(asClass.instanceSymbols !== axClass.superClass.asClass.instanceSymbols,
          "Make sure class " + axClass + " doesn't inherit super class's instanceSymbols.");
      }
      if (asClass.classInitializer) {
        release || assert(asClass.classInitializer !== axClass.superClass.asClass.classInitializer,
          "Make sure class " + axClass + " doesn't inherit super class's class initializer.");
      }
    }*/
  
    if (asClass.classSymbols) {
      linkSymbols(asClass.classSymbols, axClass.classInfo.traits, axClass);
    }
  
    if (asClass.instanceSymbols) {
      linkSymbols(asClass.instanceSymbols, axClass.classInfo.instanceInfo.traits,  axClass.tPrototype);
    }
  
    // Copy class methods and properties.
    if (asClass.classNatives) {
      for (var i = 0; i < asClass.classNatives.length; i++) {
        copyOwnPropertyDescriptors(axClass, asClass.classNatives[i], filter);
      }
    }
    copyOwnPropertyDescriptors(axClass, asClass, filter, true, true);
  
    if (axClass.superClass) {
      // Inherit prototype descriptors from the super class. This is a bit risky because
      // it copies over all properties and may overwrite properties that we don't expect.
      // TODO: Look into a safer way to do this, for now it doesn't overwrite already
      // defined properties.
      // copyOwnPropertyDescriptors(axClass.dPrototype, axClass.superClass.dPrototype, null, false,
      // true);
    }
  
    // Copy instance methods and properties.
    if (asClass.instanceNatives) {
      for (var i = 0; i < asClass.instanceNatives.length; i++) {
        copyOwnPropertyDescriptors(axClass.dPrototype, asClass.instanceNatives[i], filter);
      }
    }
  
    // Inherit or override prototype descriptors from the template class.
    copyOwnPropertyDescriptors(axClass.dPrototype, asClass.prototype, filter);
  
    // Copy inherited traps. We want to make sure we copy all the in inherited traps, not just the
    // traps defined in asClass.Prototype.
    copyPropertiesByList(axClass.dPrototype, asClass.prototype, axTrapNames);
  
    if (asClass.classInitializer) {
      asClass.classInitializer.call(axClass, asClass);
      if (!release) {
        //Object.freeze(asClass); //robnet: causes some static variables to error when updated.
      }
    }
  
    runtimeWriter && traceASClass(axClass, asClass);
  }