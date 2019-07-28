import { SORT } from "../abc/lazy/SORT";
import { release } from "../../base/utilities/Debug";
import { assert } from "@awayjs/graphics";

export function axCompareFields(objA: any, objB: any, names: string[], optionsList: SORT[]) {
    release || assert(names.length === optionsList.length);
    release || assert(names.length > 0);
    var result = 0;
    var i;
    for (i = 0; i < names.length && result === 0; i++) {
      var name = names[i];
      var a = objA[name];
      var b = objB[name];
      var options = optionsList[i];
      if (options & SORT.CASEINSENSITIVE) {
        a = String(a).toLowerCase();
        b = String(b).toLowerCase();
      }
      if (options & SORT.NUMERIC) {
        a = +a;
        b = +b;
        result = a < b ? -1 : (a > b ? 1 : 0);
      } else {
        result = String(a).localeCompare(String(b));
      }
    }
    if (optionsList[i - 1] & SORT.DESCENDING) {
      result *= -1;
    }
    return result;
  }