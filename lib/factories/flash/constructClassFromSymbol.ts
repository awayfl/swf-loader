import { assert } from "@awayjs/graphics";
import { release } from '../base/utilities/Debug';
import {Symbol} from "./symbol";
import { AXClass } from '../avm2/run/AXClass';


export function constructClassFromSymbol(symbol: Symbol, axClass: AXClass) {
  var instance = Object.create(axClass.tPrototype);
  if (instance._symbol) {
    release || assert(instance._symbol === symbol);
  } else {
    instance._symbol = symbol;
  }
  instance.applySymbol();
  return instance;
}