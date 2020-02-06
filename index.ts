

console.debug("AwayJS - SWF-viewer - 0.3.118");


export {SWFParser} from "./lib/parsers/SWFParser";

export {AVMAwayStage} from "./lib/factories/avm1/AVMAwayStage";
export {AVM1SceneGraphFactory} from "./lib/factories/avm1/AVM1SceneGraphFactory";
export {AVM1ContextImpl} from "./lib/factories/avm1/interpreter";
export {LoaderInfo} from "./lib/factories/avm1/customAway/LoaderInfo";
export {SecurityDomain} from "./lib/factories/avm1/ISecurityDomain";
export {AVM1MovieClip} from "./lib/factories/avm1/lib/AVM1MovieClip";
export {AVM1Globals, TraceLevel} from "./lib/factories/avm1/lib/AVM1Globals";
export {IAVMRandomProvider} from "./lib/factories/avm1/IAVMRandomProvider";
export {ISoftKeyboardManager} from "./lib/factories/avm1/ISoftKeyboardManager";
export { AVM1Object } from "./lib/factories/avm1/runtime/AVM1Object";

export {AVM1PropertyFlags} from "./lib/factories/avm1/runtime";
export {AVM1PropertyDescriptor} from "./lib/factories/avm1/runtime/AVM1PropertyDescriptor";
export {wrapAVM1NativeClass} from "./lib/factories/avm1/lib/AVM1Utils";
export {AVM1Context} from "./lib/factories/avm1/context";
export {Debug, release} from "./lib/factories/base/utilities/Debug";
export {alIsFunction} from "./lib/factories/avm1/runtime";


export {BaseVector} from "./lib/factories/avm2/natives/GenericVector";
export {Player} from "./lib/factories/player/Player";
export {PlayerAVM1} from "./lib/factories/player/PlayerAVM1";

export { alIsArray } from './lib/factories/avm1/runtime';

export { alNewObject } from './lib/factories/avm1/runtime';

export { AVM1ArrayNative } from './lib/factories/avm1/natives';