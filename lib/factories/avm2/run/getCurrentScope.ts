import { Scope } from "./Scope";
import { scopeStacks } from "./scopeStacks";

export function getCurrentScope(): Scope {
    if (scopeStacks.length === 0) {
      return null;
    }
    return scopeStacks[scopeStacks.length - 1].topScope();
  }
  