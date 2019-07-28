import { AXApplicationDomain } from "../../run/AXApplicationDomain";
import { assert } from "@awayjs/graphics";
import { release, unexpected, warning } from "../../../base/utilities/Debug";
import { Namespace } from "./Namespace";
import { Multiname } from "./Multiname";
import { MetadataInfo } from "./MetadataInfo";
import { MethodInfo } from "./MethodInfo";
import { MethodBodyInfo } from "./MethodBodyInfo";
import { ClassInfo } from "./ClassInfo";
import { ScriptInfo } from "./ScriptInfo";
import { InstanceInfo } from "./InstanceInfo";
import { CONSTANT } from "./CONSTANT";
import { Errors } from "../../errors";
import { NamespaceType } from "./NamespaceType";
import { internNamespace } from "./internNamespace";
import { METHOD } from "./METHOD";
import { ParameterInfo } from "./ParameterInfo";
import { Traits } from "./Traits";
import { TraitInfo } from "./TraitInfo";
import { TRAIT } from "./TRAIT";
import { SlotTraitInfo } from "./SlotTraitInfo";
import { MethodTraitInfo } from "./MethodTraitInfo";
import { ClassTraitInfo } from "./ClassTraitInfo";
import { ATTR } from "./ATTR";
import { ExceptionInfo } from "./ExceptionInfo";
import { IndentingWriter } from "../../../base/utilities";
import { AbcStream } from "../stream";

export class ABCFile {
    public ints: Int32Array;
    public uints: Uint32Array;
    public doubles: Float64Array;
  
    /**
     * Environment this ABC is loaded into.
     * In the shell, this is just a wrapper around an applicationDomain, but in the
     * SWF player, it's a flash.display.LoaderInfo object.
     */
    public env: {app: AXApplicationDomain; url: string};
  
    public get applicationDomain() {
      release || assert(this.env.app);
      return this.env.app;
    }
  
    private _stream: AbcStream;
  
    private _strings: string [];
    private _stringOffsets: Uint32Array;
  
    private _namespaces: Namespace [];
    private _namespaceOffsets: Uint32Array;
  
    private _namespaceSets: Namespace [][];
    private _namespaceSetOffsets: Uint32Array;
  
    private _multinames: Multiname [];
    private _multinameOffsets: Uint32Array;
  
    private _metadata: MetadataInfo [];
    private _metadataInfoOffsets: Uint32Array;
  
    private _methods: MethodInfo [];
    private _methodBodies: MethodBodyInfo [];
    private _methodInfoOffsets: Uint32Array;
  
    public classes: ClassInfo [];
    public scripts: ScriptInfo [];
    public instances: InstanceInfo [];
  
    constructor(
      env: {app: AXApplicationDomain; url: string},
      private _buffer: Uint8Array
    ) {
      this.env = env;
      this._stream = new AbcStream(_buffer);
      this._checkMagic();
  
      this._parseConstantPool();
      this._parseNamespaces();
      this._parseNamespaceSets();
      this._parseMultinames();
  
      this._parseMethodInfos();
      this._parseMetaData();
      this._parseInstanceAndClassInfos();
      this._parseScriptInfos();
      this._parseMethodBodyInfos();
    }
  
    private _parseConstantPool() {
      this._parseNumericConstants();
      this._parseStringConstants();
    }
  
    private _parseNumericConstants() {
      var n = 0, s = this._stream;
  
      // Parse Signed Integers
      n = s.readU30();
      var ints = new Int32Array(n);
      ints[0] = 0;
      for (var i = 1; i < n; i++) {
        ints[i] = s.readS32();
      }
      this.ints = ints;
  
      // Parse Unsigned Integers
      n = s.readU30();
      var uints = new Uint32Array(n);
      uints[0] = 0;
      for (var i = 1; i < n; i++) {
        uints[i] = s.readS32();
      }
      this.uints = uints;
  
      // Parse Doubles
      n = s.readU30();
      var doubles = new Float64Array(n);
      doubles[0] = NaN;
      for (var i = 1; i < n; i++) {
        doubles[i] = s.readDouble();
      }
      this.doubles = doubles;
    }
  
    private _parseStringConstants() {
      var n = 0, s = this._stream;
      n = s.readU30();
      this._strings = new Array(n);
      this._strings[0] = null;
  
      // Record the offset of each string in |stringOffsets|. This array has one extra
      // element so that we can compute the length of the last string.
      var stringOffsets = this._stringOffsets = new Uint32Array(n);
      stringOffsets[0] = -1;
      for (var i = 1; i < n; i++) {
        stringOffsets[i] = s.position;
        s.advance(s.readU30());
      }
    }
  
    private _parseNamespaces() {
      var s = this._stream;
      var n = s.readU30();
      this._namespaces = new Array(n);
      var namespaceOffsets = this._namespaceOffsets = new Uint32Array(n);
      namespaceOffsets[0] = -1;
      for (var i = 1; i < n; i++) {
        namespaceOffsets[i] = s.position;
        s.readU8(); // Kind
        s.readU30(); // String
      }
    }
  
    private _parseNamespaceSets() {
      var s = this._stream;
      var n = s.readU30();
      this._namespaceSets = new Array(n);
      var namespaceSetOffsets = this._namespaceSetOffsets = new Uint32Array(n);
      namespaceSetOffsets[0] = -1;
      for (var i = 1; i < n; i++) {
        namespaceSetOffsets[i] = s.position;
        var c = s.readU30(); // Count
        for (var j = 0; j < c; j++) {
          s.readU30(); // Namespace
        }
      }
    }
  
    private _consumeMultiname() {
      var s = this._stream;
      var kind = s.readU8();
      switch (kind) {
        case CONSTANT.QName: case CONSTANT.QNameA:
          s.readU30();
          s.readU30();
          break;
        case CONSTANT.RTQName: case CONSTANT.RTQNameA:
          s.readU30();
          break;
        case CONSTANT.RTQNameL: case CONSTANT.RTQNameLA:
          break;
        case CONSTANT.Multiname: case CONSTANT.MultinameA:
          s.readU30();
          s.readU30();
          break;
        case CONSTANT.MultinameL: case CONSTANT.MultinameLA:
          s.readU30();
          break;
        case CONSTANT.TypeName:
          s.readU32();
          var typeParameterCount = s.readU32();
          release || assert(typeParameterCount === 1); // This is probably the number of type
                                                        // parameters.
          s.readU32();
          break;
        default:
          unexpected(kind);
          break;
      }
    }
  
    private _parseMultinames() {
      var s = this._stream;
      var n = s.readU30();
      this._multinames = new Array(n);
      var multinameOffsets = this._multinameOffsets = new Uint32Array(n);
      multinameOffsets[0] = -1;
      for (var i = 1; i < n; i++) {
        multinameOffsets[i] = s.position;
        this._consumeMultiname();
      }
    }
  
    private _parseMultiname(i: number): Multiname {
      var stream = this._stream;
  
      var namespaceIsRuntime = false;
      var namespaceIndex;
      var useNamespaceSet = true;
      var nameIndex = 0;
  
      var kind = stream.readU8();
      switch (kind) {
        case CONSTANT.QName:
        case CONSTANT.QNameA:
          namespaceIndex = stream.readU30();
          useNamespaceSet = false;
          nameIndex = stream.readU30();
          break;
        case CONSTANT.RTQName: case CONSTANT.RTQNameA:
          namespaceIsRuntime = true;
          nameIndex = stream.readU30();
          break;
        case CONSTANT.RTQNameL: case CONSTANT.RTQNameLA:
          namespaceIsRuntime = true;
          break;
        case CONSTANT.Multiname: case CONSTANT.MultinameA:
          nameIndex = stream.readU30();
          namespaceIndex = stream.readU30();
          break;
        case CONSTANT.MultinameL: case CONSTANT.MultinameLA:
          namespaceIndex = stream.readU30();
          if (!release && namespaceIndex === 0) {
            // TODO: figure out what to do in this case. What would Tamarin do?
            warning("Invalid multiname: namespace-set index is 0");
          }
          break;
        /**
         * This is undocumented, looking at Tamarin source for this one.
         */
        case CONSTANT.TypeName:
          var mn = stream.readU32();
          var typeParameterCount = stream.readU32();
          if (!release && typeParameterCount !== 1) {
            // TODO: figure out what to do in this case. What would Tamarin do?
            warning("Invalid multiname: bad type parameter count " + typeParameterCount);
          }
          var typeParameter = this.getMultiname(stream.readU32());
          var factory = this.getMultiname(mn);
          return new Multiname(this, i, kind, factory.namespaces, factory.name, typeParameter);
        default:
          unexpected();
          break;
      }
  
      // A name index of 0 means that it's a runtime name.
      var name = nameIndex === 0 ? null : this.getString(nameIndex);
      var namespaces;
      if (namespaceIsRuntime) {
        namespaces = null;
      } else {
        namespaces = useNamespaceSet ?
                      this.getNamespaceSet(namespaceIndex) :
                      [this.getNamespace(namespaceIndex)];
      }
  
      return new Multiname(this, i, kind, namespaces, name);
    }
  
    private _checkMagic() {
      var magic = this._stream.readWord();
      var flashPlayerBrannan = 46 << 16 | 15;
      if (magic < flashPlayerBrannan) {
        this.env.app.sec.throwError('VerifierError', Errors.InvalidMagicError, magic >> 16,
                                    magic & 0xffff);
      }
    }
  
    /**
     * String duplicates exist in practice but are extremely rare.
     */
    private _checkForDuplicateStrings(): boolean {
      var a = [];
      for (var i = 0; i < this._strings.length; i++) {
        a.push(this.getString(i));
      }
      a.sort();
      for (var i = 0; i < a.length - 1; i++) {
        if (a[i] === a[i + 1]) {
          return true;
        }
      }
      return false;
    }
  
    /**
     * Returns the string at the specified index in the string table.
     */
    public getString(i: number): string {
      release || assert(i >= 0 && i < this._stringOffsets.length);
      var str = this._strings[i];
      if (str === undefined) {
        var s = this._stream;
        s.seek(this._stringOffsets[i]);
        var l = s.readU30();
        str = this._strings[i] = s.readUTFString(l);
      }
      return str;
    }
  
    /**
     * Returns the multiname at the specified index in the multiname table.
     */
    public getMultiname(i: number): Multiname {
      if (i < 0 || i >= this._multinameOffsets.length) {
        this.applicationDomain.sec.throwError("VerifierError",
                                                          Errors.CpoolIndexRangeError, i,
                                                          this._multinameOffsets.length);
      }
      if (i === 0) {
        return null;
      }
      var mn = this._multinames[i];
      if (mn === undefined) {
        var s = this._stream;
        s.seek(this._multinameOffsets[i]);
        mn = this._multinames[i] = this._parseMultiname(i);
      }
      return mn;
    }
  
    /**
     * Returns the namespace at the specified index in the namespace table.
     */
    public getNamespace(i: number): Namespace {
      if (i < 0 || i >= this._namespaceOffsets.length) {
        this.applicationDomain.sec.throwError("VerifierError", Errors.CpoolIndexRangeError, i,
                                              this._namespaceOffsets.length);
      }
      if (i === 0) {
        return Namespace.PUBLIC;
      }
      var ns = this._namespaces[i];
      if (ns !== undefined) {
        return ns;
      }
      var s = this._stream;
      s.seek(this._namespaceOffsets[i]);
      var kind = s.readU8();
      var uriIndex = s.readU30();
      var uri = uriIndex ? this.getString(uriIndex) : undefined;
      var type: NamespaceType;
      switch (kind) {
        case CONSTANT.Namespace:
        case CONSTANT.PackageNamespace:
          type = NamespaceType.Public;
          break;
        case CONSTANT.PackageInternalNs:
          type = NamespaceType.PackageInternal;
          break;
        case CONSTANT.ProtectedNamespace:
          type = NamespaceType.Protected;
          break;
        case CONSTANT.ExplicitNamespace:
          type = NamespaceType.Explicit;
          break;
        case CONSTANT.StaticProtectedNs:
          type = NamespaceType.StaticProtected;
          break;
        case CONSTANT.PrivateNs:
          type = NamespaceType.Private;
          break;
        default:
          this.applicationDomain.sec.throwError("VerifierError",
                                                Errors.CpoolEntryWrongTypeError, i);
      }
      if (uri && type !== NamespaceType.Private) {
        // TODO: deal with API versions here. Those are suffixed to the uri. We used to
        // just strip them out, but we also had an assert against them occurring at all,
        // so it might be the case that we don't even need to do anything at all.
      } else if (uri === undefined) {
        // Only private namespaces gets the empty string instead of undefined. A comment
        // in Tamarin source code indicates this might not be intentional, but oh well.
        uri = '';
      }
      ns = this._namespaces[i] = internNamespace(type, uri);
      return ns;
    }
  
    /**
     * Returns the namespace set at the specified index in the namespace set table.
     */
    public getNamespaceSet(i: number): Namespace [] {
      if (i < 0 || i >= this._namespaceSets.length) {
        this.applicationDomain.sec.throwError("VerifierError", Errors.CpoolIndexRangeError, i,
                                              this._namespaceSets.length);
      }
      if (i === 0) {
        return null;
      }
      var nss = this._namespaceSets[i];
      if (nss === undefined) {
        var s = this._stream;
        var o = this._namespaceSetOffsets[i];
        s.seek(o);
        var c = s.readU30(); // Count
        nss = this._namespaceSets[i] = new Array(c);
        o = s.position;
        for (var j = 0; j < c; j++) {
          s.seek(o);
          var x = s.readU30();
          o = s.position; // The call to |getNamespace| can change our current position.
          nss[j] = this.getNamespace(x);
        }
      }
      return nss;
    }
  
    private _parseMethodInfos() {
      var s = this._stream;
      var n = s.readU30();
      this._methods = new Array(n);
      this._methodInfoOffsets = new Uint32Array(n);
      for (var i = 0; i < n; ++i) {
        this._methodInfoOffsets[i] = s.position;
        this._consumeMethodInfo();
      }
    }
  
    private _consumeMethodInfo() {
      var s = this._stream;
      var parameterCount = s.readU30();
      s.readU30(); // Return Type
      var parameterOffset = s.position;
      for (var i = 0; i < parameterCount; i++) {
        s.readU30();
      }
      var nm = s.readU30();
      var flags = s.readU8();
      if (flags & METHOD.HasOptional) {
        var optionalCount = s.readU30();
        release || assert(parameterCount >= optionalCount);
        for (var i = parameterCount - optionalCount; i < parameterCount; i++) {
          s.readU30(); // Value Index
          s.readU8(); // Value Kind
        }
      }
      if (flags & METHOD.HasParamNames) {
        for (var i = 0; i < parameterCount; i++) {
          s.readU30();
        }
      }
    }
  
    private _parseMethodInfo(j: number) {
      var s = this._stream;
      var parameterCount = s.readU30();
      var returnType = s.readU30();
      var parameterOffset = s.position;
      var parameters = new Array<ParameterInfo>(parameterCount);
      for (var i = 0; i < parameterCount; i++) {
        parameters[i] = new ParameterInfo(this, s.readU30(), 0, -1, -1);
      }
      var name = s.readU30();
      var flags = s.readU8();
      var optionalCount = 0;
      if (flags & METHOD.HasOptional) {
        optionalCount = s.readU30();
        release || assert(parameterCount >= optionalCount);
        for (var i = parameterCount - optionalCount; i < parameterCount; i++) {
          parameters[i].optionalValueIndex = s.readU30();
          parameters[i].optionalValueKind = s.readU8();
        }
      }
      if (flags & METHOD.HasParamNames) {
        for (var i = 0; i < parameterCount; i++) {
          // NOTE: We can't get the parameter name as described in the spec because some SWFs have
          // invalid parameter names. Tamarin ignores parameter names and so do we.
          parameters[i].name = s.readU30();
        }
      }
      return new MethodInfo(this, j, name, returnType, parameters, optionalCount, flags);
    }
  
    /**
     * Returns the method info at the specified index in the method info table.
     */
    public getMethodInfo(i: number) {
      release || assert(i >= 0 && i < this._methodInfoOffsets.length);
      var mi = this._methods[i];
      if (mi === undefined) {
        var s = this._stream;
        s.seek(this._methodInfoOffsets[i]);
        mi = this._methods[i] = this._parseMethodInfo(i);
      }
      return mi;
    }
  
    public getMethodBodyInfo(i: number) {
      return this._methodBodies[i];
    }
  
    private _parseMetaData() {
      var s = this._stream;
      var n = s.readU30();
      this._metadata = new Array(n);
      var metadataInfoOffsets = this._metadataInfoOffsets = new Uint32Array(n);
      for (var i = 0; i < n; i++) {
        metadataInfoOffsets[i] = s.position;
        s.readU30(); // Name
        var itemCount = s.readU30(); // Item Count
        for (var j = 0; j < itemCount; j++) {
          s.readU30();
          s.readU30();
        }
      }
    }
  
    public getMetadataInfo(i: number): MetadataInfo {
      release || assert(i >= 0 && i < this._metadata.length);
      var mi = this._metadata[i];
      if (mi === undefined) {
        var s = this._stream;
        s.seek(this._metadataInfoOffsets[i]);
        var name = s.readU30(); // Name
        var itemCount = s.readU30(); // Item Count
        var keys = new Uint32Array(itemCount);
        for (var j = 0; j < itemCount; j++) {
          keys[j] = s.readU30();
        }
        var values = new Uint32Array(itemCount);
        for (var j = 0; j < itemCount; j++) {
          values[j] = s.readU30();
        }
        mi = this._metadata[i] = new MetadataInfo(this, name, keys, values);
      }
      return mi;
    }
  
    private _parseInstanceAndClassInfos() {
      var s = this._stream;
      var n = s.readU30();
      var instances = this.instances = new Array(n);
      for (var i = 0; i < n; i++) {
        instances[i] = this._parseInstanceInfo();
      }
      this._parseClassInfos(n);
      var o = s.position;
      for (var i = 0; i < n; i++) {
        instances[i].classInfo = this.classes[i];
      }
      s.seek(o);
    }
  
    private _parseInstanceInfo(): InstanceInfo {
      var s = this._stream;
      var name = s.readU30();
      var superName = s.readU30();
      var flags = s.readU8();
      var protectedNsIndex = 0;
      if (flags & CONSTANT.ClassProtectedNs) {
        protectedNsIndex = s.readU30();
      }
      var interfaceCount = s.readU30();
      var interfaces = [];
      for (var i = 0; i < interfaceCount; i++) {
        interfaces[i] = s.readU30();
      }
      var initializer = s.readU30();
      var traits = this._parseTraits();
      var instanceInfo = new InstanceInfo(this, name, superName, flags, protectedNsIndex,
                                          interfaces, initializer, traits);
      traits.attachHolder(instanceInfo);
      return instanceInfo;
    }
  
    private _parseTraits() {
      var s = this._stream;
      var n = s.readU30();
      var traits = [];
      for (var i = 0; i < n; i++) {
        traits.push(this._parseTrait());
      }
      return new Traits(traits);
    }
  
    private _parseTrait() {
      var s = this._stream;
      var name = s.readU30();
      var tag = s.readU8();
  
      var kind = tag & 0x0F;
      var attributes = (tag >> 4) & 0x0F;
  
      var trait: TraitInfo;
      switch (kind) {
        case TRAIT.Slot:
        case TRAIT.Const:
          var slot = s.readU30();
          var type = s.readU30();
          var valueIndex = s.readU30();
          var valueKind = -1;
          if (valueIndex !== 0) {
            valueKind = s.readU8();
          }
          trait = new SlotTraitInfo(this, kind, name, slot, type, valueKind, valueIndex);
          break;
        case TRAIT.Method:
        case TRAIT.Getter:
        case TRAIT.Setter:
          var dispID = s.readU30(); // Tamarin optimization.
          var methodInfoIndex = s.readU30();
          var o = s.position;
          var methodInfo = this.getMethodInfo(methodInfoIndex);
          trait = methodInfo.trait = new MethodTraitInfo(this, kind, name, methodInfo);
          s.seek(o);
          break;
        case TRAIT.Class:
          var slot = s.readU30();
          var classInfo = this.classes[s.readU30()];
          trait = classInfo.trait = new ClassTraitInfo(this, kind, name, slot, classInfo);
          break;
        default:
          this.applicationDomain.sec.throwError("VerifierError",
                                                            Errors.UnsupportedTraitsKindError, kind);
      }
  
      if (attributes & ATTR.Metadata) {
        var n = s.readU30();
        var metadata = new Uint32Array(n);
        for (var i = 0; i < n; i++) {
          metadata[i] = s.readU30();
        }
        trait.metadata = metadata;
      }
      return trait;
    }
  
    private _parseClassInfos(n: number) {
      var s = this._stream;
      var classes = this.classes = new Array(n);
      for (var i = 0; i < n; i++) {
        classes[i] = this._parseClassInfo(i);
      }
    }
  
    private _parseClassInfo(i: number) {
      var s = this._stream;
      var initializer = s.readU30();
      var traits = this._parseTraits();
      var classInfo = new ClassInfo(this, this.instances[i], initializer, traits);
      traits.attachHolder(classInfo);
      return classInfo;
    }
  
    private _parseScriptInfos() {
      var s = this._stream;
      var n = s.readU30();
      var scripts = this.scripts = new Array(n);
      for (var i = 0; i < n; i++) {
        scripts[i] = this._parseScriptInfo();
      }
    }
  
    private _parseScriptInfo() {
      var s = this._stream;
      var initializer = s.readU30();
      var traits = this._parseTraits();
      var scriptInfo = new ScriptInfo(this, initializer, traits);
      traits.attachHolder(scriptInfo);
      return scriptInfo;
    }
  
    private _parseMethodBodyInfos() {
      var s = this._stream;
      var methodBodies = this._methodBodies = new Array(this._methods.length);
      var n = s.readU30();
      var o = s.position;
      for (var i = 0; i < n; i++) {
        var methodInfo = s.readU30();
        var maxStack = s.readU30();
        var localCount = s.readU30();
        var initScopeDepth = s.readU30();
        var maxScopeDepth = s.readU30();
        var code = s.viewU8s(s.readU30());
  
        var e = s.readU30();
        var exceptions = new Array(e);
        for (var j = 0; j < e; ++j) {
          exceptions[j] = this._parseException();
        }
        var traits = this._parseTraits();
        methodBodies[methodInfo] = new MethodBodyInfo(maxStack, localCount, initScopeDepth, maxScopeDepth, code, exceptions, traits);
        traits.attachHolder(methodBodies[methodInfo]);
      }
    }
  
    private _parseException() {
      var s = this._stream;
      var start = s.readU30();
      var end = s.readU30();
      var target = s.readU30();
      var type = s.readU30();
      var varName = s.readU30();
      return new ExceptionInfo(this, start, end, target, type, varName);
    }
  
    public getConstant(kind: CONSTANT, i: number): any {
      switch (kind) {
        case CONSTANT.Int:
          return this.ints[i];
        case CONSTANT.UInt:
          return this.uints[i];
        case CONSTANT.Double:
          return this.doubles[i];
        case CONSTANT.Utf8:
          return this.getString(i);
        case CONSTANT.True:
          return true;
        case CONSTANT.False:
          return false;
        case CONSTANT.Null:
          return null;
        case CONSTANT.Undefined:
          return undefined;
        case CONSTANT.Namespace:
        case CONSTANT.PackageInternalNs:
          return this.getNamespace(i);
        case CONSTANT.QName:
        case CONSTANT.MultinameA:
        case CONSTANT.RTQName:
        case CONSTANT.RTQNameA:
        case CONSTANT.RTQNameL:
        case CONSTANT.RTQNameLA:
        case CONSTANT.NameL:
        case CONSTANT.NameLA:
          return this.getMultiname(i);
        case CONSTANT.Float:
          warning("TODO: CONSTANT.Float may be deprecated?");
          break;
        default:
          release || assert(false, "Not Implemented Kind " + kind);
      }
    }
  
    stress() {
      for (var i = 0; i < this._multinames.length; i++) {
        this.getMultiname(i);
      }
      for (var i = 0; i < this._namespaceSets.length; i++) {
        this.getNamespaceSet(i);
      }
      for (var i = 0; i < this._namespaces.length; i++) {
        this.getNamespace(i);
      }
      for (var i = 0; i < this._strings.length; i++) {
        this.getString(i);
      }
    }
  
    trace(writer: IndentingWriter) {
      writer.writeLn("Multinames: " + this._multinames.length);
      if (true) {
        writer.indent();
        for (var i = 0; i < this._multinames.length; i++) {
          writer.writeLn(i + " " + this.getMultiname(i));
        }
        writer.outdent();
      }
  
      writer.writeLn("Namespace Sets: " + this._namespaceSets.length);
      if (true) {
        writer.indent();
        for (var i = 0; i < this._namespaceSets.length; i++) {
          writer.writeLn(i + " " + this.getNamespaceSet(i));
        }
        writer.outdent();
      }
  
      writer.writeLn("Namespaces: " + this._namespaces.length);
      if (true) {
        writer.indent();
        for (var i = 0; i < this._namespaces.length; i++) {
          writer.writeLn(i + " " + this.getNamespace(i));
        }
        writer.outdent();
      }
  
      writer.writeLn("Strings: " + this._strings.length);
      if (true) {
        writer.indent();
        for (var i = 0; i < this._strings.length; i++) {
          writer.writeLn(i + " " + this.getString(i));
        }
        writer.outdent();
      }
  
      writer.writeLn("MethodInfos: " + this._methods.length);
      if (true) {
        writer.indent();
        for (var i = 0; i < this._methods.length; i++) {
          writer.writeLn(i + " " + this.getMethodInfo(i));
          if (this._methodBodies[i]) {
            this._methodBodies[i].trace(writer);
          }
        }
        writer.outdent();
      }
  
      writer.writeLn("InstanceInfos: " + this.instances.length);
      if (true) {
        writer.indent();
        for (var i = 0; i < this.instances.length; i++) {
          writer.writeLn(i + " " + this.instances[i]);
          this.instances[i].trace(writer);
        }
        writer.outdent();
      }
  
      writer.writeLn("ClassInfos: " + this.classes.length);
      if (true) {
        writer.indent();
        for (var i = 0; i < this.classes.length; i++) {
          this.classes[i].trace(writer);
        }
        writer.outdent();
      }
  
      writer.writeLn("ScriptInfos: " + this.scripts.length);
      if (true) {
        writer.indent();
        for (var i = 0; i < this.scripts.length; i++) {
          this.scripts[i].trace(writer);
        }
        writer.outdent();
      }
    }
  }