import { assert } from "@awayjs/graphics";
import { release } from '../base/utilities/Debug';
import { AXClass } from './run/AXClass';


export function constructClassFromSymbol(symbol: any, axClass: AXClass) {
  var instance = Object.create(axClass.tPrototype);
  if (instance._symbol) {
    release || assert(instance._symbol === symbol);
  } else {
    instance._symbol = symbol;
  }
  if(instance.applySmybol)
    instance.applySymbol();
  return instance;
}