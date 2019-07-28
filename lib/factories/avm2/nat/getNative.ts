import { release } from "../../base/utilities/Debug";
import { assert } from "@awayjs/graphics";
import { nativeFunctions } from "./nativeFunctions";
import { Natives } from "./Natives";

/**
 * Searches for natives using a string path "a.b.c...".
 */
export function getNative(path: string): Function {
    var chain = path.split(".");
    var v: any = Natives;
    for (var i = 0, j = chain.length; i < j; i++) {
      v = v && v[chain[i]];
    }
    if (!v) {
      v = nativeFunctions[path];
    }
    release || assert(v, "getNative(" + path + ") not found.");
    return v;
  }