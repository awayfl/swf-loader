import { transformJStoASRegExpMatchArray } from "./transformJStoASRegExpMatchArray";
import { ASObject } from "./ASObject";
import { addPrototypeFunctionAlias } from "./addPrototypeFunctionAlias";
import { Errors } from "../errors";
import { ASArray } from "./ASArray";

export class ASRegExp extends ASObject {
    private static UNMATCHABLE_PATTERN = '^(?!)$';
  
    static classInitializer() {
      var proto: any = this.dPrototype;
      var asProto: any = ASRegExp.prototype;
      addPrototypeFunctionAlias(proto, '$BgtoString', asProto.ecmaToString);
      addPrototypeFunctionAlias(proto, '$Bgexec', asProto.exec);
      addPrototypeFunctionAlias(proto, '$Bgtest', asProto.test);
    }
  
    value: RegExp;
  
    private _dotall: boolean;
    private _extended: boolean;
    private _source: string;
    private _captureNames: string [];
  
    constructor(pattern: any, flags?: string) {
      super();
      this._dotall = false;
      this._extended = false;
      this._captureNames = [];
      var source;
      if (pattern === undefined) {
        pattern = source = '';
      } else if (this.sec.AXRegExp.axIsType(pattern)) {
        if (flags) {
          this.sec.throwError("TypeError", Errors.RegExpFlagsArgumentError);
        }
        source = pattern.source;
        pattern = pattern.value;
      } else {
        pattern = String(pattern);
        // Escape all forward slashes.
        source = pattern.replace(/(^|^[\/]|(?:\\\\)+)\//g, '$1\\/');
        if (flags) {
          var f = flags;
          flags = '';
          for (var i = 0; i < f.length; i++) {
            var flag = f[i];
            switch (flag) {
              case 's':
                // With the s flag set, . will match the newline character.
                this._dotall = true;
                break;
              case 'x':
                // With the x flag set, spaces in the regular expression, will be ignored as part of
                // the pattern.
                this._extended = true;
                break;
              case 'g':
              case 'i':
              case 'm':
                // Only keep valid flags since an ECMAScript compatible RegExp implementation will
                // throw on invalid ones. We have to avoid that in ActionScript.
                flags += flag;
            }
          }
        }
        pattern = this._parse(source);
      }
      try {
        this.value = new RegExp(pattern, flags);
      } catch (e) {
        // Our pattern pre-parser should have eliminated most errors, but in some cases we can't
        // meaningfully detect them. If that happens, just catch the error and substitute an
        // unmatchable pattern here.
        this.value = new RegExp(ASRegExp.UNMATCHABLE_PATTERN, flags);
      }
      this._source = source;
    }
  
    // Parses and sanitizes a AS3 RegExp pattern to be used in JavaScript. Silently fails and
    // returns an unmatchable pattern of the source turns out to be invalid.
    private _parse(pattern: string): string {
      var result = '';
      var captureNames = this._captureNames;
      var parens = [];
      var atoms = 0;
      for (var i = 0; i < pattern.length; i++) {
        var char = pattern[i];
        switch (char) {
          case '(':
            result += char;
            parens.push(atoms > 1 ? atoms - 1 : atoms);
            atoms = 0;
            if (pattern[i + 1] === '?') {
              switch (pattern[i + 2]) {
                case ':':
                case '=':
                case '!':
                  result += '?' + pattern[i + 2];
                  i += 2;
                  break;
                default:
                  if (/\(\?P<([\w$]+)>/.exec(pattern.substr(i))) {
                    var name = RegExp.$1;
                    if (name !== 'length') {
                      captureNames.push(name);
                    }
                    if (captureNames.indexOf(name) > -1) {
                      // TODO: Handle the case were same name is used for multiple groups.
                    }
                    i += RegExp.lastMatch.length - 1;
                  } else {
                    return ASRegExp.UNMATCHABLE_PATTERN;
                  }
              }
            } else {
              captureNames.push(null);
            }
            // 406 seems to be the maximum number of capturing groups allowed in a pattern.
            // Examined by testing.
            if (captureNames.length > 406) {
              return ASRegExp.UNMATCHABLE_PATTERN;
            }
            break;
          case ')':
            if (!parens.length) {
              return ASRegExp.UNMATCHABLE_PATTERN;
            }
            result += char;
            atoms = parens.pop() + 1;
            break;
          case '|':
            result += char;
            break;
          case '\\':
            result += char;
            if (/\\|c[A-Z]|x[0-9,a-z,A-Z]{2}|u[0-9,a-z,A-Z]{4}|./.exec(pattern.substr(i + 1))) {
              result += RegExp.lastMatch;
              i += RegExp.lastMatch.length;
            }
            if (atoms <= 1) {
              atoms++;
            }
            break;
          case '[':
            if (/\[[^\]]*\]/.exec(pattern.substr(i))) {
              result += RegExp.lastMatch;
              i += RegExp.lastMatch.length - 1;
              if (atoms <= 1) {
                atoms++;
              }
            } else {
              return ASRegExp.UNMATCHABLE_PATTERN;
            }
            break;
          case '{':
            if (/\{[^\{]*?(?:,[^\{]*?)?\}/.exec(pattern.substr(i))) {
              result += RegExp.lastMatch;
              i += RegExp.lastMatch.length - 1;
            } else {
              return ASRegExp.UNMATCHABLE_PATTERN;
            }
            break;
          case '.':
            if (this._dotall) {
              result += '[\\s\\S]';
            } else {
              result += char;
            }
            if (atoms <= 1) {
              atoms++;
            }
            break;
          case '?':
          case '*':
          case '+':
            if (!atoms) {
              return ASRegExp.UNMATCHABLE_PATTERN;
            }
            result += char;
            if (pattern[i + 1] === '?') {
              i++;
              result += '?';
            }
            break;
          case ' ':
            if (this._extended) {
              break;
            }
          default:
            result += char;
            if (atoms <= 1) {
              atoms++;
            }
        }
        // 32767 seams to be the maximum allowed length for RegExps in SpiderMonkey.
        // Examined by testing.
        if (result.length > 0x7fff) {
          return ASRegExp.UNMATCHABLE_PATTERN;
        }
      }
      if (parens.length) {
        return ASRegExp.UNMATCHABLE_PATTERN;
      }
      return result;
    }
  
    ecmaToString(): string {
      var out = "/" + this._source + "/";
      if (this.value.global)     out += "g";
      if (this.value.ignoreCase) out += "i";
      if (this.value.multiline)  out += "m";
      if (this._dotall)          out += "s";
      if (this._extended)        out += "x";
      return out;
    }
  
    axCall(ignoredThisArg: any): any {
      return this.exec.apply(this, arguments);
    }
  
    axApply(ignoredThisArg: any, argArray?: any[]): any {
      return this.exec.apply(this, argArray);
    }
  
    get source(): string {
      return this._source;
    }
  
    get global(): boolean {
      return this.value.global;
    }
  
    get ignoreCase(): boolean {
      return this.value.ignoreCase;
    }
  
    get multiline(): boolean {
      return this.value.multiline;
    }
  
    get lastIndex(): number {
      return this.value.lastIndex;
    }
  
    set lastIndex(value: number) {
      this.value.lastIndex = value;
    }
  
    get dotall(): boolean {
      return this._dotall;
    }
  
    get extended(): boolean {
      return this._extended;
    }
  
    exec(str: string = ''): ASArray {
      var result = this.value.exec(str);
      if (!result) {
        return null;
      }
      var axResult = transformJStoASRegExpMatchArray(this.sec, result);
      var captureNames = this._captureNames;
      if (captureNames) {
        for (var i = 0; i < captureNames.length; i++) {
          var name = captureNames[i];
          if (name !== null) {
            // In AS3, non-matched named capturing groups return an empty string.
            var value = result[i + 1] || '';
            result[name] = value;
            axResult.axSetPublicProperty(name, value);
          }
        }
        return axResult;
      }
    }
  
    test(str: string = ''): boolean {
      return this.exec(str) !== null;
    }
  }