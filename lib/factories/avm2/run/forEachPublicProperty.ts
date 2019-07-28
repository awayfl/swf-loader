import { ASObject } from "../nat/ASObject";


export function forEachPublicProperty(object: ASObject, callbackfn: (property: any, value: any) => void, thisArg?: any) {
    // REDUX: Do we need to walk the proto chain here?
    var properties = object.axGetEnumerableKeys();
    for (var i = 0; i < properties.length; i++) {
      var property = properties[i];
      var value = object.axGetPublicProperty(property);
      callbackfn.call(thisArg, property, value);
    }
  }
  