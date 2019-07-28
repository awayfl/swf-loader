import { isIndex } from "../../base/utilities";


export function qualifyPublicName(v: any) {
    return isIndex(v) ? v : '$Bg' + v;
  }