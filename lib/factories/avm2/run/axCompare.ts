import { SORT } from "../abc/lazy/SORT";
import { assertNotImplemented, release } from "../../base/utilities/Debug";

export function axCompare(a: any, b: any, options: SORT, sortOrder: number,
    compareFunction: (a, b) => number) {
release || assertNotImplemented(!(options & SORT.UNIQUESORT), "UNIQUESORT");
release || assertNotImplemented(!(options & SORT.RETURNINDEXEDARRAY),
                          "RETURNINDEXEDARRAY");
var result = 0;
if (options & SORT.CASEINSENSITIVE) {
a = String(a).toLowerCase();
b = String(b).toLowerCase();
}
if (options & SORT.NUMERIC) {
a = +a;
b = +b;
result = a < b ? -1 : (a > b ? 1 : 0);
} else {
result = compareFunction(a, b);
}
return result * sortOrder;
}