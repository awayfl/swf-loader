
export const enum METHOD {
    NeedArguments       = 0x1,
    Activation          = 0x2,
    NeedRest            = 0x4,
    HasOptional         = 0x8,
    IgnoreRest          = 0x10,
    Native              = 0x20,
    Setsdxns            = 0x40,
    HasParamNames       = 0x80,
    // Flags that're derived at runtime, not present in the bytecode.
    HasBody             = 0x100,
    InstanceInitializer = 0x200,
    ClassInitializer    = 0x400,
    ScriptInitializer   = 0x800
  }