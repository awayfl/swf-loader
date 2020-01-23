import {assert} from "@awayjs/graphics"


import {Scope} from "./run/Scope"
import {HasNext2Info} from "./run/HasNext2Info"
import {AXSecurityDomain} from "./run/AXSecurityDomain"
import {validateCall} from "./run/validateCall"
import {validateConstruct} from "./run/validateConstruct"
import {axCoerceString} from "./run/axCoerceString"
import {release} from "../base/utilities/Debug"
import {Multiname} from "./abc/lazy/Multiname"
import {CONSTANT} from "./abc/lazy/CONSTANT"
import {MethodInfo} from "./abc/lazy/MethodInfo"
import {AXClass} from "./run/AXClass"
import {axCoerceName} from "./run/axCoerceName"
import {isNumeric} from "../base/utilities"
import {ABCFile} from "./abc/lazy/ABCFile"
import {ScriptInfo} from "./abc/lazy/ScriptInfo"
import {b2Class} from "./btd"
import {recording, resolver} from "./rsl"
import {AXGlobal} from "./run/AXGlobal"

export enum Bytecode {
    BKPT = 0x01,
    NOP = 0x02,
    THROW = 0x03,
    GETSUPER = 0x04,
    GETSUPER_DYN = 0x0104,
    SETSUPER = 0x05,
    SETSUPER_DYN = 0x0105,
    DXNS = 0x06,
    DXNSLATE = 0x07,
    KILL = 0x08,
    LABEL = 0x09,
    LF32X4 = 0x0A,
    SF32X4 = 0x0B,
    IFNLT = 0x0C,
    IFNLE = 0x0D,
    IFNGT = 0x0E,
    IFNGE = 0x0F,
    JUMP = 0x10,
    IFTRUE = 0x11,
    IFFALSE = 0x12,
    IFEQ = 0x13,
    IFNE = 0x14,
    IFLT = 0x15,
    IFLE = 0x16,
    IFGT = 0x17,
    IFGE = 0x18,
    IFSTRICTEQ = 0x19,
    IFSTRICTNE = 0x1A,
    LOOKUPSWITCH = 0x1B,
    PUSHWITH = 0x1C,
    POPSCOPE = 0x1D,
    NEXTNAME = 0x1E,
    HASNEXT = 0x1F,
    PUSHNULL = 0x20,
    PUSHUNDEFINED = 0x21,
    PUSHFLOAT = 0x22,
    NEXTVALUE = 0x23,
    PUSHBYTE = 0x24,
    PUSHSHORT = 0x25,
    PUSHTRUE = 0x26,
    PUSHFALSE = 0x27,
    PUSHNAN = 0x28,
    POP = 0x29,
    DUP = 0x2A,
    SWAP = 0x2B,
    PUSHSTRING = 0x2C,
    PUSHINT = 0x2D,
    PUSHUINT = 0x2E,
    PUSHDOUBLE = 0x2F,
    PUSHSCOPE = 0x30,
    PUSHNAMESPACE = 0x31,
    HASNEXT2 = 0x32,
    LI8 = 0x35,
    LI16 = 0x36,
    LI32 = 0x37,
    LF32 = 0x38,
    LF64 = 0x39,
    SI8 = 0x3A,
    SI16 = 0x3B,
    SI32 = 0x3C,
    SF32 = 0x3D,
    SF64 = 0x3E,
    NEWFUNCTION = 0x40,
    CALL = 0x41,
    CONSTRUCT = 0x42,
    CALLMETHOD = 0x43,
    CALLSTATIC = 0x44,
    CALLSUPER = 0x45,
    CALLSUPER_DYN = 0x45,
    CALLPROPERTY = 0x46,
    CALLPROPERTY_DYN = 0x0146,
    RETURNVOID = 0x47,
    RETURNVALUE = 0x48,
    CONSTRUCTSUPER = 0x49,
    CONSTRUCTSUPER_DYN = 0x0149,
    CONSTRUCTPROP = 0x4A,
    CONSTRUCTPROP_DYN = 0x014A,
    CALLSUPERID = 0x4B,
    CALLPROPLEX = 0x4C,
    CALLPROPLEX_DYN = 0x014C,
    CALLINTERFACE = 0x4D,
    CALLSUPERVOID = 0x4E,
    CALLSUPERVOID_DYN = 0x014E,
    CALLPROPVOID = 0x4F,
    SXI1 = 0x50,
    SXI8 = 0x51,
    SXI16 = 0x52,
    APPLYTYPE = 0x53,
    PUSHFLOAT4 = 0x54,
    NEWOBJECT = 0x55,
    NEWARRAY = 0x56,
    NEWACTIVATION = 0x57,
    NEWCLASS = 0x58,
    GETDESCENDANTS = 0x59,
    NEWCATCH = 0x5A,
    FINDPROPSTRICT = 0x5D,
    FINDPROPSTRICT_DYN = 0x015D,
    FINDPROPERTY = 0x5E,
    FINDPROPERTY_DYN = 0x015E,
    FINDDEF = 0x5F,
    GETLEX = 0x60,
    GETLEX_DYN = 0x0160,
    SETPROPERTY = 0x61,
    SETPROPERTY_DYN = 0x0161,
    GETLOCAL = 0x62,
    SETLOCAL = 0x63,
    GETGLOBALSCOPE = 0x64,
    GETSCOPEOBJECT = 0x65,
    GETPROPERTY = 0x66,
    GETPROPERTY_DYN = 0x0166,
    GETOUTERSCOPE = 0x67,
    INITPROPERTY = 0x68,
    UNUSED_69 = 0x69,
    DELETEPROPERTY = 0x6A,
    DELETEPROPERTY_DYN = 0x016A,
    UNUSED_6B = 0x6B,
    GETSLOT = 0x6C,
    SETSLOT = 0x6D,
    GETGLOBALSLOT = 0x6E,
    SETGLOBALSLOT = 0x6F,
    CONVERT_S = 0x70,
    ESC_XELEM = 0x71,
    ESC_XATTR = 0x72,
    CONVERT_I = 0x73,
    CONVERT_U = 0x74,
    CONVERT_D = 0x75,
    CONVERT_B = 0x76,
    CONVERT_O = 0x77,
    CHECKFILTER = 0x78,
    CONVERT_F = 0x79,
    UNPLUS = 0x7a,
    CONVERT_F4 = 0x7b,
    BC_7C = 0x7c,
    BC_7D = 0x7d,
    BC_7E = 0x7e,
    BC_7F = 0x7f,
    COERCE = 0x80,
    COERCE_DYN = 0x0180,
    COERCE_B = 0x81,
    COERCE_A = 0x82,
    COERCE_I = 0x83,
    COERCE_D = 0x84,
    COERCE_S = 0x85,
    ASTYPE = 0x86,
    ASTYPELATE = 0x87,
    COERCE_U = 0x88,
    COERCE_O = 0x89,
    NEGATE = 0x90,
    INCREMENT = 0x91,
    INCLOCAL = 0x92,
    DECREMENT = 0x93,
    DECLOCAL = 0x94,
    TYPEOF = 0x95,
    NOT = 0x96,
    BITNOT = 0x97,
    UNUSED_98 = 0x98,
    UNUSED_99 = 0x99,
    UNUSED_9A = 0x9A,
    UNUSED_9B = 0x9B,
    UNUSED_9C = 0x9C,
    UNUSED_9D = 0x9D,
    UNUSED_9E = 0x9E,
    UNUSED_9F = 0x9F,
    ADD = 0xA0,
    SUBTRACT = 0xA1,
    MULTIPLY = 0xA2,
    DIVIDE = 0xA3,
    MODULO = 0xA4,
    LSHIFT = 0xA5,
    RSHIFT = 0xA6,
    URSHIFT = 0xA7,
    BITAND = 0xA8,
    BITOR = 0xA9,
    BITXOR = 0xAA,
    EQUALS = 0xAB,
    STRICTEQUALS = 0xAC,
    LESSTHAN = 0xAD,
    LESSEQUALS = 0xAE,
    GREATERTHAN = 0xAF,
    GREATEREQUALS = 0xB0,
    INSTANCEOF = 0xB1,
    ISTYPE = 0xB2,
    ISTYPELATE = 0xB3,
    IN = 0xB4,
    UNUSED_B5 = 0xB5,
    UNUSED_B6 = 0xB6,
    UNUSED_B7 = 0xB7,
    UNUSED_B8 = 0xB8,
    UNUSED_B9 = 0xB9,
    UNUSED_BA = 0xBA,
    UNUSED_BB = 0xBB,
    UNUSED_BC = 0xBC,
    UNUSED_BD = 0xBD,
    UNUSED_BE = 0xBE,
    UNUSED_BF = 0xBF,
    INCREMENT_I = 0xC0,
    DECREMENT_I = 0xC1,
    INCLOCAL_I = 0xC2,
    DECLOCAL_I = 0xC3,
    NEGATE_I = 0xC4,
    ADD_I = 0xC5,
    SUBTRACT_I = 0xC6,
    MULTIPLY_I = 0xC7,
    UNUSED_C8 = 0xC8,
    UNUSED_C9 = 0xC9,
    UNUSED_CA = 0xCA,
    UNUSED_CB = 0xCB,
    UNUSED_CC = 0xCC,
    UNUSED_CD = 0xCD,
    UNUSED_CE = 0xCE,
    UNUSED_CF = 0xCF,
    GETLOCAL0 = 0xD0,
    GETLOCAL1 = 0xD1,
    GETLOCAL2 = 0xD2,
    GETLOCAL3 = 0xD3,
    SETLOCAL0 = 0xD4,
    SETLOCAL1 = 0xD5,
    SETLOCAL2 = 0xD6,
    SETLOCAL3 = 0xD7,
    UNUSED_D8 = 0xD8,
    UNUSED_D9 = 0xD9,
    UNUSED_DA = 0xDA,
    UNUSED_DB = 0xDB,
    UNUSED_DC = 0xDC,
    UNUSED_DD = 0xDD,
    UNUSED_DE = 0xDE,
    UNUSED_DF = 0xDF,
    UNUSED_E0 = 0xE0,
    UNUSED_E1 = 0xE1,
    UNUSED_E2 = 0xE2,
    UNUSED_E3 = 0xE3,
    UNUSED_E4 = 0xE4,
    UNUSED_E5 = 0xE5,
    UNUSED_E6 = 0xE6,
    UNUSED_E7 = 0xE7,
    UNUSED_E8 = 0xE8,
    UNUSED_E9 = 0xE9,
    UNUSED_EA = 0xEA,
    UNUSED_EB = 0xEB,
    UNUSED_EC = 0xEC,
    UNUSED_ED = 0xED,
    UNUSED_EE = 0xEE,
    INVALID = 0xED,
    DEBUG = 0xEF,

    DEBUGLINE = 0xF0,
    DEBUGFILE = 0xF1,
    BKPTLINE = 0xF2,
    TIMESTAMP = 0xF3,

    RESTARGC = 0xF4,
    RESTARG = 0xF5,

    UNUSED_F6 = 0xF6,
    UNUSED_F7 = 0xF7,
    UNUSED_F8 = 0xF8,
    UNUSED_F9 = 0xF9,
    UNUSED_FA = 0xFA,
    UNUSED_FB = 0xFB,
    UNUSED_FC = 0xFC,
    UNUSED_FD = 0xFD,
    UNUSED_FE = 0xFE,

    END = 0xFF
}

export let BytecodeName = Bytecode

class Instruction {
    public stack: number = -1024
    public scope: number = -1024

    constructor(readonly position: number, readonly name: Bytecode, readonly params: Array<any> = [], readonly delta: number = 0, readonly deltaScope: number = 0, readonly terminal: boolean = false, readonly refs: Array<number> = []) {
    }

    toString() {
        return `Instruction(${this.position}, ${BytecodeName[this.name]} (${this.name}), [${this.params}], ${this.stack} -> ${this.stack + this.delta}, ${this.scope} -> ${this.scope + this.deltaScope}, ${this.terminal}, [${this.refs}])`
    }
}

export function compile(methodInfo: MethodInfo) {
    let abc = methodInfo.abc
    let code = methodInfo.getBody().code

    let q: Instruction[] = []

    for (let i: number = 0; i < code.length;) {
        let u30 = function (): number {
            let u = code[i++]
            if (u & 0x80) {
                u = u & 0x7f | code[i++] << 7
                if (u & 0x4000) {
                    u = u & 0x3fff | code[i++] << 14
                    if (u & 0x200000) {
                        u = u & 0x1fffff | code[i++] << 21
                        if (u & 0x10000000) {
                            u = u & 0x0fffffff | code[i++] << 28
                            u = u & 0xffffffff
                        }
                    }
                }
            }
            return u >>> 0
        }

        let mn = function () {
            let index = u30()
            let name = abc.getMultiname(index)

            if (name.isRuntimeName())
                return [index, 256, -1]

            if (name.isRuntimeNamespace())
                return [index, 512, -1]

            return [index, 0, 0]
        }

        let s24 = function (): number {
            let u = code[i++] | (code[i++] << 8) | (code[i++] << 16)
            return (u << 8) >> 8
        }

        let s8 = function (): number {
            let u = code[i++]
            return (u << 24) >> 24
        }

        let oldi = i

        const z = code[i++]
        switch (z) {
            case Bytecode.LABEL:
                q.push(new Instruction(oldi, z))
                break

            case Bytecode.DEBUGFILE:
                q.push(new Instruction(oldi, z, [u30()]))
                break

            case Bytecode.DEBUGLINE:
                q.push(new Instruction(oldi, z, [u30()]))
                break

            case Bytecode.DEBUG:
                q.push(new Instruction(oldi, z, [s8(), u30(), s8(), u30()]))
                break

            case Bytecode.THROW:
                q.push(new Instruction(oldi, z, [], -1, 0, true))
                break

            
            case Bytecode.PUSHSCOPE:
                q.push(new Instruction(oldi, z, [], -1, 1))
                break

            case Bytecode.PUSHWITH:
                q.push(new Instruction(oldi, z, [], -1, 1))
                break

            case Bytecode.POPSCOPE:
                q.push(new Instruction(oldi, z, [], 0, -1))
                break

            case Bytecode.GETSCOPEOBJECT:
                q.push(new Instruction(oldi, z, [s8()], 1, 0))
                break

            case Bytecode.GETGLOBALSCOPE:
                q.push(new Instruction(oldi, z, [], 1))
                break


                
            case Bytecode.GETSLOT:
                q.push(new Instruction(oldi, z, [u30()], 0))
                break

            case Bytecode.SETSLOT:
                q.push(new Instruction(oldi, z, [u30()], -2))
                break

            
            case Bytecode.NEXTNAME:
                q.push(new Instruction(oldi, z, [], -1))
                break

            case Bytecode.NEXTVALUE:
                q.push(new Instruction(oldi, z, [], -1))
                break

            case Bytecode.HASNEXT2:
                q.push(new Instruction(oldi, z, [u30(), u30()], 1))
                break

            case Bytecode.IN:
                q.push(new Instruction(oldi, z, [], -1))
                break

            
            case Bytecode.DUP:
                q.push(new Instruction(oldi, z, [], 1))
                break

            case Bytecode.POP:
                q.push(new Instruction(oldi, z, [], -1))
                break

            case Bytecode.SWAP:
                q.push(new Instruction(oldi, z, [], 0))
                break

            case Bytecode.PUSHTRUE:
                q.push(new Instruction(oldi, z, [], 1))
                break

            case Bytecode.PUSHFALSE:
                q.push(new Instruction(oldi, z, [], 1))
                break

            case Bytecode.PUSHBYTE:
                q.push(new Instruction(oldi, z, [s8()], 1))
                break

            case Bytecode.PUSHSHORT:
                q.push(new Instruction(oldi, z, [u30() << 16 >> 16], 1))
                break

            case Bytecode.PUSHINT:
                q.push(new Instruction(oldi, z, [u30()], 1))
                break

            case Bytecode.PUSHDOUBLE:
                q.push(new Instruction(oldi, z, [u30()], 1))
                break

            case Bytecode.PUSHNAN:
                q.push(new Instruction(oldi, z, [], 1))
                break

            case Bytecode.PUSHNULL:
                q.push(new Instruction(oldi, z, [], 1))
                break

            case Bytecode.PUSHUNDEFINED:
                q.push(new Instruction(oldi, z, [], 1))
                break

            case Bytecode.PUSHSTRING:
                q.push(new Instruction(oldi, z, [u30()], 1))
                break

            case Bytecode.IFEQ:
                var j = s24()
                q.push(new Instruction(oldi, z, [i + j], -2, 0, false, [i + j]))
                break

            case Bytecode.IFNE:
                var j = s24()
                q.push(new Instruction(oldi, z, [i + j], -2, 0, false, [i + j]))
                break

            case Bytecode.IFSTRICTEQ:
                var j = s24()
                q.push(new Instruction(oldi, z, [i + j], -2, 0, false, [i + j]))
                break
            case Bytecode.IFSTRICTNE:
                var j = s24()
                q.push(new Instruction(oldi, z, [i + j], -2, 0, false, [i + j]))
                break

            case Bytecode.IFGT:
            case Bytecode.IFNLE:
                var j = s24()
                q.push(new Instruction(oldi, Bytecode.IFGT, [i + j], -2, 0, false, [i + j]))
                break

            case Bytecode.IFGE:
            case Bytecode.IFNLT:
                var j = s24()
                q.push(new Instruction(oldi, Bytecode.IFGE, [i + j], -2, 0, false, [i + j]))
                break

            case Bytecode.IFLT:
            case Bytecode.IFNGE:
                var j = s24()
                q.push(new Instruction(oldi, Bytecode.IFLT, [i + j], -2, 0, false, [i + j]))
                break

            case Bytecode.IFLE:
            case Bytecode.IFNGT:
                var j = s24()
                q.push(new Instruction(oldi, Bytecode.IFLE, [i + j], -2, 0, false, [i + j]))
                break

            case Bytecode.IFTRUE:
                var j = s24()
                q.push(new Instruction(oldi, z, [i + j], -1, 0, false, [i + j]))
                break

            case Bytecode.IFFALSE:
                var j = s24()
                q.push(new Instruction(oldi, z, [i + j], -1, 0, false, [i + j]))
                break


            case Bytecode.LOOKUPSWITCH:
                var offset = oldi + s24()
                var cases = u30()

                var jumps = [offset]

                for (let j = 0; j <= cases; j++)
                    jumps.push(oldi + s24())

                q.push(new Instruction(oldi, z, jumps, -1, 0, true, jumps))
                break

            case Bytecode.JUMP:
                var j = s24()
                q.push(new Instruction(oldi, z, [i + j], 0, 0, true, [i + j]))
                break


            case Bytecode.RETURNVALUE:
                q.push(new Instruction(oldi, z, [], -1, 0, true))
                break

            case Bytecode.RETURNVOID:
                q.push(new Instruction(oldi, z, [], 0, 0, true))
                break


            case Bytecode.NOT:
                q.push(new Instruction(oldi, z, [], 0))
                break

            case Bytecode.BITNOT:
                q.push(new Instruction(oldi, z, [], 0))
                break

            case Bytecode.NEGATE:
                q.push(new Instruction(oldi, z, [], 0))
                break


            case Bytecode.INCREMENT:
                q.push(new Instruction(oldi, z, [], 0))
                break

            case Bytecode.DECREMENT:
                q.push(new Instruction(oldi, z, [], 0))
                break

            case Bytecode.INCREMENT_I:
                q.push(new Instruction(oldi, z, [], 0))
                break

            case Bytecode.DECREMENT_I:
                q.push(new Instruction(oldi, z, [], 0))
                break

            case Bytecode.INCLOCAL_I:
                q.push(new Instruction(oldi, z, [u30()], 0))
                break

            case Bytecode.DECLOCAL_I:
                q.push(new Instruction(oldi, z, [u30()], 0))
                break


            case Bytecode.ADD:
                q.push(new Instruction(oldi, z, [], -1))
                break
            case Bytecode.SUBTRACT:
                q.push(new Instruction(oldi, z, [], -1))
                break
            case Bytecode.MULTIPLY:
                q.push(new Instruction(oldi, z, [], -1))
                break
            case Bytecode.DIVIDE:
                q.push(new Instruction(oldi, z, [], -1))
                break
            case Bytecode.MODULO:
                q.push(new Instruction(oldi, z, [], -1))
                break


            case Bytecode.LSHIFT:
                q.push(new Instruction(oldi, z, [], -1))
                break
            case Bytecode.RSHIFT:
                q.push(new Instruction(oldi, z, [], -1))
                break
            case Bytecode.URSHIFT:
                q.push(new Instruction(oldi, z, [], -1))
                break


            case Bytecode.BITAND:
                q.push(new Instruction(oldi, z, [], -1))
                break
            case Bytecode.BITOR:
                q.push(new Instruction(oldi, z, [], -1))
                break
            case Bytecode.BITXOR:
                q.push(new Instruction(oldi, z, [], -1))
                break


            case Bytecode.EQUALS:
                q.push(new Instruction(oldi, z, [], -1))
                break
            case Bytecode.STRICTEQUALS:
                q.push(new Instruction(oldi, z, [], -1))
                break
            case Bytecode.GREATERTHAN:
                q.push(new Instruction(oldi, z, [], -1))
                break
            case Bytecode.GREATEREQUALS:
                q.push(new Instruction(oldi, z, [], -1))
                break
            case Bytecode.LESSTHAN:
                q.push(new Instruction(oldi, z, [], -1))
                break
            case Bytecode.LESSEQUALS:
                q.push(new Instruction(oldi, z, [], -1))
                break


            case Bytecode.ISTYPELATE:
                q.push(new Instruction(oldi, z, [], -1))
                break
            case Bytecode.ASTYPELATE:
                q.push(new Instruction(oldi, z, [], -1))
                break


            case Bytecode.CALL:
                var argnum = u30()
                q.push(new Instruction(oldi, z, [argnum], -argnum - 1))
                break
            case Bytecode.CONSTRUCT:
                var argnum = u30()
                q.push(new Instruction(oldi, z, [argnum, index], -argnum))
                break
            case Bytecode.CALLPROPERTY:
                var [index, dyn, d] = mn()
                var argnum = u30()
                q.push(new Instruction(oldi, z + dyn, [argnum, index], -argnum + d))
                break
            case Bytecode.CALLPROPVOID:
                var [index, dyn, d] = mn()
                var argnum = u30()
                q.push(new Instruction(oldi, z + dyn, [argnum, index], -(argnum + 1) + d))
                break
            case Bytecode.APPLYTYPE:
                var argnum = u30()
                q.push(new Instruction(oldi, z, [argnum], -argnum))
                break


            case Bytecode.FINDPROPSTRICT:
                var [index, dyn, d] = mn()
                q.push(new Instruction(oldi, z + dyn, [index], 1 + d))
                break
            case Bytecode.FINDPROPERTY:
                var [index, dyn, d] = mn()
                q.push(new Instruction(oldi, z + dyn, [index], 1 + d))
                break
            case Bytecode.NEWFUNCTION:
                q.push(new Instruction(oldi, z, [u30()], 1))
                break
            case Bytecode.NEWCLASS:
                q.push(new Instruction(oldi, z, [u30()], 0))
                break
            case Bytecode.NEWARRAY:
                var argnum = u30()
                q.push(new Instruction(oldi, z, [argnum], -argnum + 1))
                break
            case Bytecode.NEWOBJECT:
                var argnum = u30()
                q.push(new Instruction(oldi, z, [argnum], -2 * argnum + 1))
                break
            case Bytecode.NEWACTIVATION:
                q.push(new Instruction(oldi, z, [], 1))
                break
            case Bytecode.NEWCATCH:
                q.push(new Instruction(oldi, z, [u30()], 1))
                break


            case Bytecode.CONSTRUCTSUPER:
                var argnum = u30()
                q.push(new Instruction(oldi, z, [argnum], -(argnum + 1)))
                break
            case Bytecode.CALLSUPER:
                var [index, dyn, d] = mn()
                var argnum = u30()
                q.push(new Instruction(oldi, z + dyn, [argnum, index], -argnum + d))
                break
            case Bytecode.CALLSUPERVOID:
                var [index, dyn, d] = mn()
                var argnum = u30()
                q.push(new Instruction(oldi, z + dyn, [argnum, index], -(argnum + 1) + d))
                break


            case Bytecode.CONSTRUCTPROP:
                var [index, dyn, d] = mn()
                var argnum = u30()
                q.push(new Instruction(oldi, z + dyn, [argnum, index], -argnum + d))
                break


            case Bytecode.GETPROPERTY:
                var [index, dyn, d] = mn()
                q.push(new Instruction(oldi, Bytecode.GETPROPERTY + dyn, [index], 0 + d))
                break
            case Bytecode.INITPROPERTY:
            case Bytecode.SETPROPERTY:
                var [index, dyn, d] = mn()
                q.push(new Instruction(oldi, Bytecode.SETPROPERTY + dyn, [index], -2 + d))
                break
            case Bytecode.DELETEPROPERTY:
                var [index, dyn, d] = mn()
                q.push(new Instruction(oldi, z + dyn, [index], 0 + d))



            case Bytecode.GETSUPER:
                var [index, dyn, d] = mn()
                q.push(new Instruction(oldi, z + dyn, [index], 0 + d))
                break
            case Bytecode.SETSUPER:
                var [index, dyn, d] = mn()
                q.push(new Instruction(oldi, z + dyn, [index], -2 + d))
                break


            case Bytecode.COERCE:
                var [index, dyn, d] = mn()
                q.push(new Instruction(oldi, z + dyn, [index], 0 + d))
                break
            case Bytecode.COERCE_A:
                q.push(new Instruction(oldi, z, [], 0))
                break
            case Bytecode.COERCE_S:
                q.push(new Instruction(oldi, z, [], 0))
                break


            case Bytecode.CONVERT_I:
                q.push(new Instruction(oldi, z, [], 0))
                break
            case Bytecode.CONVERT_D:
                q.push(new Instruction(oldi, z, [], 0))
                break
            case Bytecode.CONVERT_B:
                q.push(new Instruction(oldi, z, [], 0))
                break
            case Bytecode.CONVERT_U:
                q.push(new Instruction(oldi, z, [], 0))
                break

            case Bytecode.GETLOCAL:
                q.push(new Instruction(oldi, Bytecode.GETLOCAL, [u30()], 1))
                break
            case Bytecode.GETLOCAL0:
                q.push(new Instruction(oldi, Bytecode.GETLOCAL, [0], 1))
                break
            case Bytecode.GETLOCAL1:
                q.push(new Instruction(oldi, Bytecode.GETLOCAL, [1], 1))
                break
            case Bytecode.GETLOCAL2:
                q.push(new Instruction(oldi, Bytecode.GETLOCAL, [2], 1))
                break
            case Bytecode.GETLOCAL3:
                q.push(new Instruction(oldi, Bytecode.GETLOCAL, [3], 1))
                break
            case Bytecode.SETLOCAL:
                q.push(new Instruction(oldi, Bytecode.SETLOCAL, [u30()], -1))
                break
            case Bytecode.SETLOCAL0:
                q.push(new Instruction(oldi, Bytecode.SETLOCAL, [0], -1))
                break
            case Bytecode.SETLOCAL1:
                q.push(new Instruction(oldi, Bytecode.SETLOCAL, [1], -1))
                break
            case Bytecode.SETLOCAL2:
                q.push(new Instruction(oldi, Bytecode.SETLOCAL, [2], -1))
                break
            case Bytecode.SETLOCAL3:
                q.push(new Instruction(oldi, Bytecode.SETLOCAL, [3], -1))
                break
            case Bytecode.KILL:
                q.push(new Instruction(oldi, z, [u30()], 0))
                break

            case Bytecode.GETLEX:
                var [index, dyn, d] = mn()
                q.push(new Instruction(oldi, z + dyn, [index], 1 + d))
                break

            default:
                console.log("UNKNOWN #" + code[i - 1].toString(16) + " " + BytecodeName[code[i - 1]] + " (method N" + methodInfo.index() + ")")
                return "UNKNOWN BYTECODE $" + code[i - 1].toString(16) + " (" + BytecodeName[code[i - 1]] + ") at " + oldi
        }

    }

    let propagate = function (position: number, stack: number) {
        let v = stack

        for (let i: number = 0; i < q.length; i++) {
            if (q[i].position >= position) {
                if (q[i].stack >= 0)
                    return

                q[i].stack = v
                v += q[i].delta

                for (let j: number = 0; j < q[i].refs.length; j++)
                    propagate(q[i].refs[j], v)

                if (q[i].terminal)
                    return
            }
        }
    }

    propagate(0, 0)

    let propagateScope = function (position: number, scope: number) {
        let v = scope

        for (let i: number = 0; i < q.length; i++) {
            if (q[i].position >= position) {
                if (q[i].scope >= 0)
                    return

                q[i].scope = v
                v += q[i].deltaScope

                for (let j: number = 0; j < q[i].refs.length; j++)
                    propagateScope(q[i].refs[j], v)

                if (q[i].terminal)
                    return
            }
        }
    }

    propagateScope(0, 0)

    let targets: number[] = []

    targets.push(0)

    for (let i: number = 0; i < q.length; i++)
        for (let j: number = 0; j < q[i].refs.length; j++)
            targets.push(q[i].refs[j])

    let maxstack = 0
    for (let i: number = 0; i < q.length; i++)
        if (q[i].stack > maxstack)
            maxstack = q[i].stack

    let maxlocal = 0
    for (let i: number = 0; i < q.length; i++)
        if (q[i].name == Bytecode.GETLOCAL || q[i].name == Bytecode.SETLOCAL)
            if (q[i].params[0] > maxlocal)
                maxlocal = q[i].params[0]

    let temp = false
    for (let i: number = 0; i < q.length; i++)
        if (q[i].name == Bytecode.NEWOBJECT || q[i].name == Bytecode.SWAP || q[i].name == Bytecode.HASNEXT2)
            temp = true

    let maxscope = 0
    for (let i: number = 0; i < q.length; i++)
        if (q[i].scope > maxscope)
            maxscope = q[i].scope

    let params = methodInfo.parameters

    const underrun = "[stack underrun]"
    
    let js = ["// (#" + methodInfo.index() + ") --- " + methodInfo]

    js.push("(function (context) { return function compiled_" + (methodInfo.getName()).replace(/([^a-z0-9]+)/gi, "_") + "(scope, self, args) {")

    for (let i: number = 0; i < params.length; i++)
        if (params[i].hasOptionalValue()) {
            js.push("    let argnum = args.length;")
            break
        }

    js.push("    let local0 = self;")

    for (let i: number = 0; i < params.length; i++) {
        let p = params[i]
        js.push("    let local" + (i + 1) + " = args[" + i + "];")

        if (params[i].hasOptionalValue())
            switch (p.optionalValueKind) {
                case CONSTANT.Utf8:
                    js.push("    if (argnum <= " + i + ") local" + (i + 1) + " = context.getstring(" + p.optionalValueIndex + ");")
                    break
                default:
                    js.push("    if (argnum <= " + i + ") local" + (i + 1) + " = " + p.getOptionalValue() + ";")
                    break
            }
    }

    for (let i: number = params.length + 1; i <= maxlocal; i++)
        js.push("    let local" + i + " = undefined;")

    for (let i: number = 0; i <= maxstack; i++)
        js.push("    let stack" + i + " = undefined;")

    for (let i: number = 0; i <= maxscope; i++)
        js.push("    let scope" + i + " = undefined;")

    if (temp)
        js.push("    let temp = undefined;")

    js.push("    let p = 0;")
    js.push("    while (true) {")
    js.push("        switch (p) {")
    
    let names: Multiname[] = []

    let getname = (n: number) => {
        let mn = abc.getMultiname(n)
        let i = names.indexOf(mn)
        if (i < 0) {
            i = names.length
            names.push(mn)
        }
        return "context.names[" + i + "]"
    }    
        
    for (let i: number = 0; i < q.length; i++) {
        let z = q[i]

        if (targets.indexOf(z.position) >= 0)
            js.push("            case " + z.position + ":")

        js.push("                    //" + BytecodeName[z.name] + " " + z.params.join(" / "))

        let stackF = (n: number) => ((z.stack - 1 - n) >= 0) ? ("stack" + (z.stack - 1 - n)) : underrun
        let stack0 = stackF(0)
        let stack1 = stackF(1)
        let stack2 = stackF(2)
        let stack3 = stackF(3)
        let stackN = stackF(-1)

        let scope = z.scope > 0 ? "scope" + (z.scope - 1) : "scope"
        let scopeN = "scope" + z.scope

        let local = (n: number) => "local" + n

        let param = (n: number) => z.params[n]

        resolver.extra = methodInfo.index() + " | " + z.position + " | "
        
        if (z.stack < 0) {
            js.push("                    // unreachable")
        }
        else
            switch (z.name) {
                case Bytecode.LABEL:
                    break
                case Bytecode.DEBUGFILE:
                    break
                case Bytecode.DEBUGLINE:
                    break
                case Bytecode.DEBUG:
                    break
                case Bytecode.THROW:
                    break
                case Bytecode.GETLOCAL:
                    js.push("                " + stackN + " = " + local(param(0)) + ";")
                    break
                case Bytecode.SETLOCAL:
                    js.push("                " + local(param(0)) + " = " + stack0 + ";")
                    break

                case Bytecode.GETSLOT:
                    js.push("                " + stack0 + " = context.getslot(" + param(0) + ", " + stack0 + ");")
                    break
                case Bytecode.SETSLOT:
                    js.push("                context.setslot(" + param(0) + ", " + stack1 + ", " + stack0 + ");")
                    break

                case Bytecode.GETGLOBALSCOPE:
                    js.push("                " + stackN + " = context.getglobalscope(scope);")
                    break
                case Bytecode.PUSHSCOPE:
                    js.push("                " + scopeN + " = context.pushscope(" + scope + ", " + stack0 + ");")
                    break
                case Bytecode.PUSHWITH:
                    js.push("                " + scopeN + " = context.pushwith(" + scope + ", " + stack0 + ");")
                    break
                case Bytecode.POPSCOPE:
                    js.push("                " + scope + " = undefined;")
                    break
                case Bytecode.GETSCOPEOBJECT:
                    js.push("                " + stackN + " = context.getscopeobject(" + "scope" + param(0) + ");")
                    break

                case Bytecode.NEXTNAME:
                    js.push("                " + stack1 + " = context.nextname(" + stack1 + ", " + stack0 + ");")
                    break
                case Bytecode.NEXTVALUE:
                    js.push("                " + stack1 + " = context.nextvalue(" + stack1 + ", " + stack0 + ");")
                    break
                case Bytecode.HASNEXT2:
                    js.push("                temp = context.hasnext2(" + local(param(0)) + ", " + local(param(1)) + ");")
                    js.push("                " + local(param(0)) + " = temp[0];")
                    js.push("                " + local(param(1)) + " = temp[1];")
                    js.push("                " + stackN + " = " + local(param(1)) + " > 0;")
                    break
                case Bytecode.IN:
                    js.push("                " + stack1 + " = context.isin(" + stack1 + ", " + stack0 + ");")
                    break

                case Bytecode.DUP:
                    js.push("                " + stackN + " = " + stack0 + ";")
                    break
                case Bytecode.POP:
                    js.push("                ;")
                    break
                case Bytecode.SWAP:
                    js.push("                temp = " + stack0 + ";")
                    js.push("                " + stack0 + " = " + stack1 + ";")
                    js.push("                " + stack1 + " = temp;")
                    js.push("                temp = undefined;")
                    break
                case Bytecode.PUSHTRUE:
                    js.push("                " + stackN + " = true;")
                    break
                case Bytecode.PUSHFALSE:
                    js.push("                " + stackN + " = false;")
                    break
                case Bytecode.PUSHBYTE:
                    js.push("                " + stackN + " = " + param(0) + ";")
                    break
                case Bytecode.PUSHSHORT:
                    js.push("                " + stackN + " = " + param(0) + ";")
                    break
                case Bytecode.PUSHINT:
                    js.push("                " + stackN + " = " + abc.ints[param(0)] + ";")
                    break
                case Bytecode.PUSHDOUBLE:
                    js.push("                " + stackN + " = " + abc.doubles[param(0)] + ";")
                    break
                case Bytecode.PUSHSTRING:
                    js.push("                " + stackN + " = context.getstring(" + param(0) + ");")
                    break
                case Bytecode.PUSHNAN:
                    js.push("                " + stackN + " = NaN;")
                    break
                case Bytecode.PUSHNULL:
                    js.push("                " + stackN + " = null;")
                    break
                case Bytecode.PUSHUNDEFINED:
                    js.push("                " + stackN + " = undefined;")
                    break
                case Bytecode.IFEQ:
                    js.push("                if (" + stack0 + " == " + stack1 + ") { p = " + param(0) + "; continue; };")
                    break
                case Bytecode.IFNE:
                    js.push("                if (" + stack0 + " != " + stack1 + ") { p = " + param(0) + "; continue; };")
                    break
                case Bytecode.IFSTRICTEQ:
                    js.push("                if (" + stack0 + " === " + stack1 + ") { p = " + param(0) + "; continue; };")
                    break
                case Bytecode.IFSTRICTNE:
                    js.push("                if (" + stack0 + " !== " + stack1 + ") { p = " + param(0) + "; continue; };")
                    break
                case Bytecode.IFGT:
                    js.push("                if (" + stack0 + " < " + stack1 + ") { p = " + param(0) + "; continue; };")
                    break
                case Bytecode.IFGE:
                    js.push("                if (" + stack0 + " <= " + stack1 + ") { p = " + param(0) + "; continue; };")
                    break
                case Bytecode.IFLT:
                    js.push("                if (" + stack0 + " > " + stack1 + ") { p = " + param(0) + "; continue; };")
                    break
                case Bytecode.IFLE:
                    js.push("                if (" + stack0 + " >= " + stack1 + ") { p = " + param(0) + "; continue; };")
                    break
                case Bytecode.IFFALSE:
                    js.push("                if (!" + stack0 + ") { p = " + param(0) + "; continue; };")
                    break
                case Bytecode.IFTRUE:
                    js.push("                if (" + stack0 + ") { p = " + param(0) + "; continue; };")
                    break
                case Bytecode.LOOKUPSWITCH:
                    var jj = z.params.concat()
                    var dj = jj.shift()
                    js.push("                if (" + stack0 + " >= 0 && " + stack0 + " < " + jj.length + ") { p = [" + jj.join(", ") + "][" + stack0 + "]; continue; } else { p = " + dj + "; continue; };")
                    break
                case Bytecode.JUMP:
                    js.push("                { p = " + param(0) + "; continue; };")
                    break
                case Bytecode.INCREMENT:
                    js.push("                " + stack0 + "++;")
                    break
                case Bytecode.DECREMENT:
                    js.push("                " + stack0 + "--;")
                    break
                case Bytecode.INCREMENT_I:
                    js.push("                " + stack0 + " |= 0;")
                    js.push("                " + stack0 + "++;")
                    break
                case Bytecode.DECREMENT_I:
                    js.push("                " + stack0 + " |= 0;")
                    js.push("                " + stack0 + "--;")
                    break
                case Bytecode.INCLOCAL_I:
                    js.push("                " + local(param(0)) + " |= 0;")
                    js.push("                " + local(param(0)) + "++;")
                    break
                case Bytecode.DECLOCAL_I:
                    js.push("                " + local(param(0)) + " |= 0;")
                    js.push("                " + local(param(0)) + "++;")
                    break
                case Bytecode.ADD:
                    js.push("                " + stack1 + " = " + stack1 + " + " + stack0 + ";")
                    break
                case Bytecode.SUBTRACT:
                    js.push("                " + stack1 + " = " + stack1 + " - " + stack0 + ";")
                    break
                case Bytecode.MULTIPLY:
                    js.push("                " + stack1 + " = " + stack1 + " * " + stack0 + ";")
                    break
                case Bytecode.DIVIDE:
                    js.push("                " + stack1 + " = " + stack1 + " / " + stack0 + ";")
                    break
                case Bytecode.MODULO:
                    js.push("                " + stack1 + " = " + stack1 + " % " + stack0 + ";")
                    break

                case Bytecode.LSHIFT:
                    js.push("                " + stack1 + " = " + stack1 + " << " + stack0 + ";")
                    break
                case Bytecode.RSHIFT:
                    js.push("                " + stack1 + " = " + stack1 + " >> " + stack0 + ";")
                    break
                case Bytecode.URSHIFT:
                    js.push("                " + stack1 + " = " + stack1 + " >>> " + stack0 + ";")
                    break

                case Bytecode.BITAND:
                    js.push("                " + stack1 + " = " + stack1 + " & " + stack0 + ";")
                    break
                case Bytecode.BITOR:
                    js.push("                " + stack1 + " = " + stack1 + " | " + stack0 + ";")
                    break
                case Bytecode.BITXOR:
                    js.push("                " + stack1 + " = " + stack1 + " ^ " + stack0 + ";")
                    break

                case Bytecode.EQUALS:
                    js.push("                " + stack1 + " = " + stack1 + " == " + stack0 + ";")
                    break
                case Bytecode.STRICTEQUALS:
                    js.push("                " + stack1 + " = " + stack1 + " === " + stack0 + ";")
                    break
                case Bytecode.GREATERTHAN:
                    js.push("                " + stack1 + " = " + stack1 + " > " + stack0 + ";")
                    break
                case Bytecode.GREATEREQUALS:
                    js.push("                " + stack1 + " = " + stack1 + " >= " + stack0 + ";")
                    break
                case Bytecode.LESSTHAN:
                    js.push("                " + stack1 + " = " + stack1 + " < " + stack0 + ";")
                    break
                case Bytecode.LESSEQUALS:
                    js.push("                " + stack1 + " = " + stack1 + " <= " + stack0 + ";")
                    break
                case Bytecode.NOT:
                    js.push("                " + stack0 + " = !" + stack0 + ";")
                    break
                case Bytecode.BITNOT:
                    js.push("                " + stack0 + " = ~" + stack0 + ";")
                    break
                case Bytecode.NEGATE:
                    js.push("                " + stack0 + " = -" + stack0 + ";")
                    break

                case Bytecode.ISTYPELATE:
                    js.push("                " + stack1 + " = context.istypelate(" + stack1 + ", " + stack0 + ");")
                    break
                case Bytecode.ASTYPELATE:
                    js.push("                " + stack1 + " = context.astypelate(" + stack1 + ", " + stack0 + ");")
                    break

                case Bytecode.CALL: {
                    let pp = []

                    for (let j: number = 1; j <= param(0); j++)
                        pp.push(stackF(param(0) - j))

                    js.push("                " + stackF(param(0) + 1) + " = context.call(" + stackF(param(0) + 1) + ", " + stackF(param(0)) + ", [" + pp.join(", ") + "]);")
                }
                    break
                case Bytecode.CONSTRUCT: {
                    let pp = []

                    for (let j: number = 1; j <= param(0); j++)
                        pp.push(stackF(param(0) - j))

                    js.push("                " + stackF(param(0)) + " = context.construct(" + stackF(param(0)) + ", [" + pp.join(", ") + "]);")
                }
                    break
                case Bytecode.CALLPROPERTY:
                    let pp = []

                    for (let j: number = 0; j <= param(0); j++)
                        pp.push(stackF(param(0) - j))

                    if (abc.getMultiname(param(1)).name == "getDefinitionByName") {
                        js.push("                " + stackF(param(0)) + " = context.getdefinitionbyname(" + scope + ", " + pp.shift() + ", [" + pp.join(", ") + "]);")
                    }
                    else {
                        js.push("                // " + abc.getMultiname(param(0)))
                        js.push("                " + stackF(param(0)) + " = context.callproperty(" + getname(param(1)) + ", " + pp.shift() + ", [" + pp.join(", ") + "]);")
                    }
                    break
                case Bytecode.CALLPROPVOID: {
                    let pp = []

                    for (let j: number = 0; j <= param(0); j++)
                        pp.push(stackF(param(0) - j))

                    js.push("                context.callpropvoid(" + getname(param(1)) + ", " + pp.shift() + ", [" + pp.join(", ") + "]);")
                }
                    break
                case Bytecode.APPLYTYPE: {
                    let pp = []

                    for (let j: number = 1; j <= param(0); j++)
                        pp.push(stackF(param(0) - j))

                    js.push("                " + stackF(param(0)) + " = context.applytype(" + stackF(param(0)) + ", [" + pp.join(", ") + "]);")
                }
                    break


                case Bytecode.FINDPROPSTRICT:
                    js.push("                // " + abc.getMultiname(param(0)))
                    js.push("                " + stackN + " = context.findpropstrict(" + getname(param(0)) + ", " + scope + ");")
                    break
                case Bytecode.FINDPROPERTY:
                    js.push("                // " + abc.getMultiname(param(0)))
                    js.push("                " + stackN + " = context.findproperty(" + getname(param(0)) + ", " + scope + ");")
                    break
                case Bytecode.NEWFUNCTION:
                    js.push("                // " + abc.getMethodInfo(param(0)))
                    js.push("                " + stackN + " = context.newfunction(" + param(0) + ", " + scope + ");")
                    break
                case Bytecode.NEWCLASS:
                    js.push("                // " + abc.classes[param(0)])
                    js.push("                " + stack0 + " = context.newclass(" + param(0) + ", " + scope + ", " + stack0 + ");")
                    break
                case Bytecode.NEWARRAY: {
                    let pp = []

                    for (let j: number = 1; j <= param(0); j++)
                        pp.push(stackF(param(0) - j))

                    js.push("                " + stackF(param(0) - 1) + " = context.newarray([" + pp.join(", ") + "]);")
                }
                    break
                case Bytecode.NEWOBJECT:
                    js.push("                temp = context.newobject();")

                    for (let j: number = 1; j <= param(0); j++) {
                        js.push("                context.setpublicproperty(temp, " + stackF(2 * param(0) - 2 * j + 1) + ", " + stackF(2 * param(0) - 2 * j) + ");")
                    }

                    js.push("                " + stackF(2 * param(0) - 1) + " = temp;")
                    js.push("                temp = undefined;")

                    break
                case Bytecode.NEWACTIVATION:
                    js.push("                " + stackN + " = context.newactivation(" + scope + ");")
                    break
                case Bytecode.NEWCATCH:
                    js.push("                " + stackN + " = context.newcatch(" + param(0) + ", " + scope + ");")
                    break
                case Bytecode.CONSTRUCTSUPER: {
                    let pp = []

                    for (let j: number = 1; j <= param(0); j++)
                        pp.push(stackF(param(0) - j))

                    js.push("                context.constructsuper(scope, " + stackF(param(0)) + ", [" + pp.join(", ") + "]);")
                }
                    break
                case Bytecode.CALLSUPER_DYN: {
                    let pp = []

                    for (let j: number = 1; j <= param(0); j++)
                        pp.push(stackF(param(0) - j))

                    js.push("                " + stackF(param(0) + 1) + " = context.callsuper(context.rutimename(" + stackF(param(0)) + ", " + param(1) + "), scope, " + stackF(param(0) + 1) + ", [" + pp.join(", ") + "]);")
                }
                    break
                case Bytecode.CALLSUPERVOID: {
                    let pp = []

                    for (let j: number = 1; j <= param(0); j++)
                        pp.push(stackF(param(0) - j))

                    js.push("                context.callsuper(" + getname(param(1)) + ", scope, " + stackF(param(0)) + ", [" + pp.join(", ") + "]);")
                }
                    break
                case Bytecode.CONSTRUCTPROP: {
                    let pp = []

                    for (let j: number = 1; j <= param(0); j++)
                        pp.push(stackF(param(0) - j))
                    
                    js.push("                " + stackF(param(0)) + " = context.constructprop(" + getname(param(1)) + ", " + stackF(param(0)) + ", [" + pp.join(", ") + "]);")
                }
                    break
                case Bytecode.GETPROPERTY:
                    var mn = abc.getMultiname(param(0))
                    js.push("                // " + mn)
                    
                    if (recording) {
                        js.push("                context.extra(\"" + resolver.extra + "\");")
                        js.push("                " + stack0 + " = context.getpropertydyn(" + getname(param(0)) + ", " + stack0 + ");")
                        js.push("                context.extra(\"@@@ | \");")
                    }
                    else {
                        let r = resolver.resolveGet(mn)

                        if (r) {
                            js.push("                " + stack0 + " = " + stack0 + ".__fast__ ? " + stack0 + "[\"" + mn.name + "\"] : " + stack0 + "[\"" + r + "\"];")
                        }
                        else {
                            js.push("                " + stack0 + " = context.getpropertydyn(" + getname(param(0)) + ", " + stack0 + ");")
                        }
                    }
                    break
                case Bytecode.GETPROPERTY_DYN:
                    js.push("                " + stack1 + " = context.getpropertydyn(context.runtimename(" + stack0 + ", " + param(0) + "), " + stack1 + ");")
                    break
                case Bytecode.SETPROPERTY:
                    var mn = abc.getMultiname(param(0))
                    js.push("                // " + mn)

                    if (recording) {
                        js.push("                context.extra(\"" + resolver.extra + "\");")
                        js.push("                context.setproperty(" + getname(param(0)) + ", " + stack0 + ", " + stack1 + ");")
                        js.push("                context.extra(\"@@@ | \");")
                    }
                    else {
                        let r = resolver.resolveSet(mn)

                        if (r) {
                            js.push("                if (" + stack1 + ".__fast__) {" + stack1 + "[\"" + mn.name + "\"] = " + stack0 + ";} else {" + stack1 + "[\"" + r + "\"] = " + stack0 + ";}")
                        }
                        else {
                            js.push("                context.setproperty(" + getname(param(0)) + ", " + stack0 + ", " + stack1 + ");")
                        }
                    }
                    break
                case Bytecode.SETPROPERTY_DYN:
                    js.push("                context.setproperty(context.runtimename(" + stack1 + ", " + param(0) + "), " + stack0 + ", " + stack2 + ");")
                    break
                case Bytecode.DELETEPROPERTY:
                    js.push("                // " + abc.getMultiname(param(0)))
                    js.push("                " + stack0 + " = context.deleteproperty(" + getname(param(0)) + ", " + stack0 + ");")
                    break
                case Bytecode.DELETEPROPERTY_DYN:
                    js.push("                " + stack1 + " = context.deleteproperty(context.runtimename(" + stack0 + ", " + param(0) + "), " + stack1 + ");")
                    break
                case Bytecode.GETSUPER:
                    js.push("                " + stack0 + " = context.getsuper(" + getname(param(0)) + ", scope, " + stack0 + ");")
                    break
                case Bytecode.GETSUPER_DYN:
                    js.push("                " + stack1 + " = context.getsuper(context.runtimename(" + stack0 + ", " + param(0) + "), scope, " + stack1 + ");")
                    break
                case Bytecode.SETSUPER:
                    js.push("                context.setsuper(" + getname(param(0)) + ", scope, " + stack0 + ", " + stack1 + ");")
                    break
                case Bytecode.SETSUPER_DYN:
                    js.push("                context.setsuper(context.runtimename(" + stack1 + ", " + param(0) + "), scope, " + stack0 + ", " + stack2 + ");")
                    break
                /*
                case Bytecode.GETLEX:
                    js.push("                " + stackN + " = context.getlex(" + getname(param(0)) + ", " + scope + ");")
                    break
                    */
                case Bytecode.GETLEX:
                    var mn = abc.getMultiname(param(0))
                    js.push("                // " + mn)

                    if (recording) {
                        js.push("                context.extra(\"" + resolver.extra + "\");")
                        js.push("                " + stackN + " = context.getlexrecording(" + getname(param(0)) + ", " + scope + ");")
                        js.push("                context.extra(\"@@@ | \");")
                    }
                    else {
                        let l = resolver.resolveLex(mn)
                        let r = resolver.resolveGet(mn)

                        if (r != null && l != 0) {
                            if (l > 0) {
                                let ps = ""
                                for (let j = 1; j < l; j++)
                                    ps = ps + ".parent"

                                js.push("                " + stackN + " = " + scope + ps + ".object[\"" + r + "\"];")
                            }
                            else {
                                js.push("                " + stackN + " = " + scope + ".global.object.applicationDomain.findProperty(" + getname(param(0)) + ", true, true)[\"" + r + "\"];")
                            }

                            // js.push("                var xyz = context.getlex(" + getname(param(0)) + ", " + scope + ");")
                            // js.push("                if (xyz !== " + stackN + ") console.log(\"expe\" + \"cted \" + xyz + \" got \" + " + stackN + ");")
                        }
                        else
                            js.push("                " + stackN + " = context.getlex(" + getname(param(0)) + ", " + scope + ");")
                    }
                    break
                case Bytecode.RETURNVALUE:
                    js.push("                return " + stack0 + ";")
                    break
                case Bytecode.RETURNVOID:
                    js.push("                return;")
                    break
                case Bytecode.COERCE:
                    js.push("                " + stack0 + " = context.coerce(" + getname(param(0)) + ", " + scope + ", " + stack0 + ");")
                    break
                case Bytecode.COERCE_A:
                    js.push("                ;")
                    break
                case Bytecode.COERCE_S:
                    js.push("                " + stack0 + " = context.coercestring(" + stack0 + ");")
                    break
                case Bytecode.CONVERT_I:
                    js.push("                " + stack0 + " |= 0;")
                    break
                case Bytecode.CONVERT_D:
                    js.push("                " + stack0 + " = +" + stack0 + ";")
                    break
                case Bytecode.CONVERT_B:
                    js.push("                " + stack0 + " = !!" + stack0 + ";")
                    break
                case Bytecode.CONVERT_U:
                    js.push("                " + stack0 + " >>>= 0;")
                    break
                case Bytecode.KILL:
                    js.push("                " + local(param(0)) + " = undefined;")
                    break
                default:
                    js.push("                //" + "unknown instruction " + q[i])
                    console.log("unknown instruction " + q[i] + " (method N" + methodInfo.index() + ")")
                    return "unhandled instruction " + z
            }
    }

    js.push("        }")
    js.push("    }")
    js.push("}})")
    
    let w = js.join("\n")
    
    if (w.indexOf(underrun) >= 0)
        return "STACK UNDERRUN"
    
    resolver.extra = "@@@ | "
    
    return eval(w)(new Context(methodInfo, names))
}

class Context {
    private readonly mi: MethodInfo
    private readonly sec: AXSecurityDomain
    private readonly abc: ABCFile
    private readonly names: Multiname[]

    constructor(mi: MethodInfo, names:Multiname[]) {
        this.mi = mi
        this.abc = mi.abc
        this.sec = mi.abc.applicationDomain.sec
        this.names = names
    }

    extra(v : string): void {
        resolver.extra = v
    }

    call(value, obj, pp): any {
        validateCall(this.sec, value, pp.length)
        return value.axApply(obj, pp)
    }

    callproperty(mn, obj, pp) {
        if (obj && obj.__fast__)
            return obj[mn.name].apply(obj, pp)

        return this.sec.box(obj).axCallProperty(mn, pp, false)
    }

    callpropvoid(mn, obj, pp) {
        if (obj && obj.__fast__)
            return obj[mn.name].apply(obj, pp)

        return this.sec.box(obj).axCallProperty(mn, pp, false)
    }

    getdefinitionbyname(scope, obj, pp) {
        return (<ScriptInfo>(<any>scope.global.object).scriptInfo).abc.env.app.getClass(Multiname.FromSimpleName(pp[0]))
    }

    findpropstrict(mn, scope) {
        return scope.findScopeProperty(mn, true, false)
    }

    getproperty(mn, obj) {
        if (obj.__fast__)
            return obj[mn.name]

        return obj.axGetProperty(mn)
    }

    getpropertydyn(mn, obj) {
        if (obj && obj.__fast__)
            return obj[mn.name]

        let b = this.sec.box(obj)

        if (recording)
            if (b !== obj)
                resolver.recordBox(mn)
        
        if (typeof mn === "number")
            return b.axGetNumericProperty(mn)

        return b.axGetProperty(mn)
    }

    setproperty(mn, value, obj) {
        if (obj && obj.__fast__)
            return obj[mn.name] = value

        if (typeof mn === "number")
            return this.sec.box(obj).axSetNumericProperty(mn, value)

        this.sec.box(obj).axSetProperty(mn, value, Bytecode.INITPROPERTY)
    }

    deleteproperty(name, obj) {
        let b = this.sec.box(obj);
        if(typeof name ==="number" || typeof name ==="string")
            return delete b[name];
        return b.axDeleteProperty(name)
    }

    getsuper(name, savedScope, obj) {
        return this.sec.box(obj).axGetSuper(name, savedScope)
    }

    setsuper(name, savedScope, value, obj) {
        return this.sec.box(obj).axSetSuper(name, savedScope, value)
    }

    getlexrecording(mn: Multiname, scope: Scope) {
        let a = scope.findScopeProperty(mn, true, false)

        if ((scope.global.object as AXGlobal).applicationDomain.findProperty(mn, true, true) === a)
            resolver.recordLex(mn, -1)
        else {
            let n = 1
            let s = scope

            while (true) {
                if (s.object === a) {
                    resolver.recordLex(mn, n)
                    break
                }
                
                if (s.parent != null) {
                    n += 1
                    s = s.parent
                }
                else {
                    resolver.recordLex(mn, 0)
                    break
                }
            }
        }


        let b = a.axGetProperty(mn)
        
        return b
    }
    
    getlex(mn, scope) {
        return scope.findScopeProperty(mn, true, false).axGetProperty(mn)
    }

    findproperty(mn, scope) {
        return scope.findScopeProperty(mn, false, false)
    }

    newfunction(index, scope) {
        return this.sec.createFunction(this.abc.getMethodInfo(index), scope, true)
    }

    getslot(index, obj) {
        return this.sec.box(obj).axGetSlot(index)
    }

    setslot(index, obj, value) {
        return this.sec.box(obj).axSetSlot(index, value)
    }

    getglobalscope(savedScope) {
        return savedScope.global.object
    }

    newclass(index, scope, value) {
        return this.sec.createClass(this.abc.classes[index], value, scope)
    }


    newactivation(scope) {
        return this.sec.createActivation(this.mi, scope)
    }


    newcatch(index, scope) {
        return this.sec.createCatch(this.mi.getBody().catchBlocks[index], scope)
    }


    newarray(pp) {
        return this.sec.AXArray.axBox(pp)
    }


    constructsuper(savedScope, obj, pp) {
        return (<any>savedScope.object).superClass.tPrototype.axInitializer.apply(obj, pp)
    }


    callsuper(name, savedScope, obj, pp) {
        return this.sec.box(obj).axCallSuper(name, savedScope, pp)
    }


    construct(obj, pp) {
        let mn = obj.classInfo.instanceInfo.getName()
        
        let r = b2Class(mn.name, pp)

        if (r != null)
            return r

        // if (mn.name.indexOf("b2") >= 0)
        //     console.log("*B2: " + mn.name)

        validateConstruct(this.sec, obj, pp.length)
        return obj.axConstruct(pp)
    }


    constructprop(mn, obj, pp) {
        let r = b2Class(mn.name, pp)

        if (r != null)
            return r

        // if (mn.name.indexOf("b2") >= 0)
        //     console.log("B2: " + mn.name)
        
        let b = this.sec.box(obj)
        let name = b.axResolveMultiname(mn)
        let ctor = b[name]

        validateConstruct(b.sec, ctor, pp.length)
        return ctor.axConstruct(pp)
    }


    getstring(index) {
        return this.abc.getString(index)
    }


    pushscope(scope, obj) {
        let b = this.sec.box(obj) 
        return scope.extend(b)
    }


    pushwith(scope, obj) {
        let b = this.sec.box(obj)
        return (scope.object === b && scope.isWith == true) ? scope : new Scope(scope, b, true)
    }


    getscopeobject(scope) {
        return scope.object
    }


    newobject() {
        return Object.create(this.sec.AXObject.tPrototype)
    }


    coerce(mn, scope, obj) {
        return (<AXClass> scope.getScopeProperty(mn, true, false)).axCoerce(obj)
    }


    coercestring(obj) {
        return axCoerceString(obj)
    }


    applytype(obj, pp) {
        return this.sec.applyType(obj, pp)
    }


    istypelate(obj, type) {
        return type.axIsType(obj)
    }


    astypelate(obj, type) {
        return type.axAsType(obj)
    }


    nextname(obj, v) {
        return this.sec.box(obj).axNextName(v)
    }


    nextvalue(obj, v) {
        return this.sec.box(obj).axNextValue(v)
    }


    hasnext2(obj, name) {
        let info = new HasNext2Info(null, 0)
        info.next(this.sec.box(obj), name)
        return [info.object, info.index]
    }
    
    isin(name, obj) {
        return (name && name.axClass === this.sec.AXQName) ? obj.axHasProperty(name.name) : obj.axHasPublicProperty(name);
    }


    setpublicproperty(obj, name, value) {
        return obj.axSetPublicProperty(name, value)
    }


    name(index) {
        return this.abc.getMultiname(index)
    }

    runtimename(name, index) {
        if (typeof name === "number")
            return name

        let mn = this.abc.getMultiname(index)

        if (name && name.axClass && name.axClass === name.sec.AXQName) {
            let rn = new Multiname(this.abc, 0, null, null, null)
            rn.numeric = false
            rn.id = mn.id
            rn.kind = mn.kind

            release || assert(name.name instanceof Multiname)
            rn.kind = mn.isAttribute() ? CONSTANT.RTQNameLA : CONSTANT.RTQNameL
            rn.id = name.name.id
            rn.name = name.name.name
            rn.namespaces = name.name.namespaces
            return rn
        }

        if (typeof name === "number" || isNumeric(axCoerceName(name))) {
            let rn = new Multiname(this.abc, 0, null, null, null)
            rn.numeric = false
            rn.id = mn.id
            rn.kind = mn.kind

            rn.numeric = true
            rn.numericValue = +(axCoerceName(name))
        }

        return mn.rename(name)
    }

}