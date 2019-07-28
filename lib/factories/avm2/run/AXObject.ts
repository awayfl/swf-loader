import { IMetaobjectProtocol } from "./IMetaobjectProtocol";
import { ITraits } from "./ITraits";
import { AXCallable } from "./AXCallable";
import { AXClass } from "./AXClass";

export interface AXObject extends ITraits, IMetaobjectProtocol {
    $BgtoString: AXCallable;
    $BgvalueOf: AXCallable;
    axInitializer: any;
    axClass: AXClass;
  }