import { scopeStacks } from "./scopeStacks";
import { ScriptInfo } from "../abc/lazy/ScriptInfo";
import { ABCFile } from '../abc/lazy/ABCFile';

export function getCurrentABC():ABCFile {
    if (scopeStacks.length === 0) {
      return null;
    }
    var globalObject = <any>scopeStacks[scopeStacks.length - 1].topScope().global.object;
    return (<ScriptInfo>globalObject.scriptInfo).abc;
  }