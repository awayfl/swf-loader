console.debug("AwayFL - SWF-Loader - 0.4.95");

export { SWFFile } from "./lib/parsers/SWFFile";

export { AVMVERSION } from "./lib/factories/base/AVMVersion";

export { AVMEvent } from "./lib/AVMEvent";
export { AVMStage } from "./lib/AVMStage";
export { IAVMHandler } from "./lib/IAVMHandler";
export { IAVMStage } from "./lib/IAVMStage";

export {
  IRedirectRule,
  globalRedirectRules,
  matchRedirect,
} from "./lib/redirectResolver";
export { SWFABCExtractor } from "./lib/parsers/SWFABCExtractor";
export { SWFParser } from "./lib/parsers/SWFParser";

export { OpenTypeParser } from "./lib/parsers/utils/parser/OpenTypeParser";

export {
  Debug,
  release,
  notImplemented,
  somewhatImplemented,
  warning,
  assert,
  assertUnreachable,
  unexpected,
  assertNotImplemented,
  registerDebugMethod, // global _AWAY_DEBUG insterface
  IDebugMethodDeclaration,
} from "./lib/factories/base/utilities/Debug";

export { shumwayOptions } from "./lib/factories/base/settings";
export { Option, OptionSet } from "./lib/factories/base/options";

export { StageScaleMode } from "./lib/factories/as3webFlash/display/StageScaleMode";
export { StageAlign } from "./lib/factories/as3webFlash/display/StageAlign";
export { MovieClipSoundsManager } from "./lib/factories/timelinesounds/MovieClipSoundsManager";
export { MovieClipSoundStream } from "./lib/factories/timelinesounds/MovieClipSoundStream";

export {
  MapObject,
  isIndex,
  isNullOrUndefined,
  PromiseWrapper,
  isNumeric,
  isNumber,
  isString,
  toNumber,
  isObject,
  IndentingWriter,
  dumpLine,
  Bounds,
} from "./lib/factories/base/utilities";
export { jsGlobal } from "./lib/factories/base/utilities/jsGlobal";

export {
  AVM1ClipEvents,
  ColorMatrixFilter,
  ConvolutionFilter,
  GlowFilter,
  BlurFilter,
  FilterType,
} from "./lib/factories/base/SWFTags";

export {
  ErrorTypes,
  Telemetry,
} from "./lib/factories/base/utilities/Telemetry";

export { StringUtilities } from "./lib/factories/base/utilities/StringUtilities";
export {
  NumberUtilities,
  roundHalfEven,
} from "./lib/factories/base/utilities/NumberUtilities";
export {
  defineNonEnumerableProperty,
  getPropertyDescriptor,
  ObjectUtilities,
  hasOwnProperty,
  copyOwnPropertyDescriptors,
  copyPropertiesByList,
  hasOwnGetter,
  defineReadOnlyProperty,
  toKeyValueArray,
} from "./lib/factories/base/utilities/ObjectUtilities";
export {
  popManyInto,
  pushMany,
} from "./lib/factories/base/utilities/ArrayUtilities";

export { ClipboardService } from "./lib/factories/base/utilities/ClipboardService";

export {
  clampS8U8,
  toS16,
} from "./lib/factories/base/utilities/IntegerUtilities";

export { flashlog } from "./lib/factories/base/flashlog";

export { HashUtilities } from "./lib/factories/base/utilities/HashUtilities";

export { ExternalInterfaceService } from "./lib/factories/base/utilities/ExternalInterfaceService";

export { FileLoadingService } from "./lib/factories/base/utilities/FileLoadingService";

export { Stat, Record } from "./lib/stat/Stat";
