import { Namespace } from '../abc/lazy/Namespace';
import { Multiname } from '../abc/lazy/Multiname';
import { CONSTANT } from '../abc/lazy/CONSTANT';

export function makeMultiname(v: any, namespace?: Namespace) {
    var rn = new Multiname(null, 0, CONSTANT.RTQNameL, [], null);
    rn.namespaces = namespace ? [namespace] : [Namespace.PUBLIC];
    rn.name = v;
    return rn;
  }
  