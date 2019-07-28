import { MapObject } from "../../base/utilities";

import { ASClass } from "./ASClass";
import { ObjectUtilities } from "../../base/utilities/ObjectUtilities";
import { NamespaceType } from "../abc/lazy/NamespaceType";
export var builtinNativeClasses: MapObject<ASClass> = ObjectUtilities.createMap<ASClass>();
export var nativeClasses: MapObject<ASClass> = ObjectUtilities.createMap<ASClass>();
export var nativeClassLoaderNames: {
  name: string;
  alias: string;
  nsType: NamespaceType
} [] = [];