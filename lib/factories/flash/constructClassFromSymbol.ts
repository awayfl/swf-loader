import { ASClass } from "../avm2/nat/ASClass";
import { assert } from "@awayjs/graphics";
import { release } from '../base/utilities/Debug';
import {Symbol} from "./symbol";


export function constructClassFromSymbol(symbol: Symbol, axClass: ASClass) {
  var instance = Object.create(axClass.tPrototype);
  if (instance._symbol) {
    release || assert(instance._symbol === symbol);
  } else {
    instance._symbol = symbol;
  }
  instance.applySymbol();
  return instance;
}