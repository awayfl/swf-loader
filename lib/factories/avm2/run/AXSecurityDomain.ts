import { AXApplicationDomain } from "./AXApplicationDomain";
import { ClassAliases } from "../amf";
import { AXClass } from "./AXClass";
import { AXMethodClosureClass } from "./AXMethodClosureClass";
import { AXXMLClass } from "./AXXMLClass";
import { AXXMLListClass } from "./AXXMLListClass";
import { AXQNameClass } from "./AXQNameClass";
import { AXNamespaceClass } from "./AXNamespaceClass";
import { GenericVector } from "../natives/GenericVector";
import { Int32Vector } from "../natives/int32Vector";
import { Uint32Vector } from "../natives/uint32Vector";
import { Float64Vector } from "../natives/float64Vector";
import { XMLParser } from "../natives/xml";
import { AXObject } from "./AXObject";
import { ABCCatalog } from "../abc/lazy/ABCCatalog";
import { Multiname } from "../abc/lazy/Multiname";
import { ABCFile } from "../abc/lazy/ABCFile";
import { NamespaceType } from "../abc/lazy/NamespaceType";
import { ClassInfo } from "../abc/lazy/ClassInfo";
import { RuntimeTraits } from "../abc/lazy/RuntimeTraits";
import { MethodInfo } from "../abc/lazy/MethodInfo";
import { ExceptionInfo } from "../abc/lazy/ExceptionInfo";
import { ScriptInfo } from "../abc/lazy/ScriptInfo";
import { runtimeWriter, sliceArguments } from "./writers";
import { formatErrorMessage, Errors } from "../errors";
import { transformJSValueToAS } from "../nat/transformJSValueToAS";
import { tryLinkNativeClass } from "../nat/tryLinkNativeClass";
import { getNativeInitializer } from "../nat/getNativeInitializer";
import { installClassLoaders } from "../nat/installClassLoaders";
import { installNativeFunctions } from "../nat/installNativeFunctions";
import { release } from "../../base/utilities/Debug";
import { assert } from "@awayjs/graphics";
import { checkValue } from "./checkValue";
import { isIndex, IndentingWriter } from "../../base/utilities";
import { Scope } from "./Scope";
import { axInterfaceInitializer } from "./axInterfaceInitializer";
import { axIsInstanceOfInterface } from "./axIsInstanceOfInterface";
import { axIsTypeInterface } from "./axIsTypeInterface";
import { defineNonEnumerableProperty, defineReadOnlyProperty } from "../../base/utilities/ObjectUtilities";
import { interpret } from "../int";
import { applyTraits } from "./applyTraits";
import { AXFunction } from "./AXFunction";
import { flashlog } from "../../base/flashlog";
import { jsGlobal } from "../../base/utilities/jsGlobal";
import { AXCallable } from "./AXCallable";
import { AXActivation } from "./AXActivation";
import { AXCatch } from "./AXCatch";
import { AXGlobal } from "./AXGlobal";
import { axCoerce } from "./axCoerce";
import { axIsInstanceOfObject } from "./axIsInstanceOfObject";
import { axConstruct } from "./axConstruct";
import { axDefaultApply } from "./axDefaultApply";
import { axDefaultInitializer } from "./axDefaultInitializer";
import { axGetArgumentsCallee } from "./axGetArgumentsCallee";
import { axCoerceBoolean } from "./axCoerceBoolean";
import { axIsTypeBoolean } from "./axIsTypeBoolean";
import { axConvertString } from "./axConvertString";
import { axIsTypeString } from "./axIsTypeString";
import { axCoerceString } from "./axCoerceString";
import { axCoerceNumber } from "./axCoerceNumber";
import { axIsTypeNumber } from "./axIsTypeNumber";
import { axCoerceInt } from "./axCoerceInt";
import { axFalse } from "./axFalse";
import { axIsTypeInt } from "./axIsTypeInt";
import { axCoerceUint } from "./axCoerceUint";
import { axIsTypeUint } from "./axIsTypeUint";
import { isPrimitiveJSValue } from "./isPrimitiveJSValue";
import { axBoxIdentity } from "./axBoxIdentity";
import { axIsTypeObject } from "./axIsTypeObject";
import { axAsType } from "./axAsType";
import { axBoxPrimitive } from "./axBoxPrimitive";
import { axApplyObject } from "./axApplyObject";
import { axConstructObject } from "./axConstructObject";
import { axCoerceObject } from "./axCoerceObject";

import { initializeAXBasePrototype, AXBasePrototype } from "./initializeAXBasePrototype";
import { ISecurityDomain } from '../../ISecurityDomain';
import { ByteArray, ByteArrayDataProvider } from '../natives/byteArray';
import { Namespace } from '../abc/lazy/Namespace';

/**
 * Provides security isolation between application domains.
 */
export class AXSecurityDomain implements ISecurityDomain{
    public static instance:ISecurityDomain;
    public system: AXApplicationDomain;
    public application: AXApplicationDomain;
    public classAliases: ClassAliases;
    public AXObject: AXClass;
    public AXArray: AXClass;
    public AXClass: AXClass;
    public AXFunction: AXClass;
    public AXMethodClosure: AXMethodClosureClass;
    public AXError: AXClass;
    public AXNumber: AXClass;
    public AXString: AXClass;
    public AXBoolean: AXClass;
    public AXRegExp: AXClass;
    public AXMath: AXClass;
    public AXDate: AXClass;
  
    public AXXML: AXXMLClass;
    public AXXMLList: AXXMLListClass;
    public AXNamespace: AXNamespaceClass;
    public AXQName: AXQNameClass;
  
    public ObjectVector: typeof GenericVector;
    public Int32Vector: typeof Int32Vector;
    public Uint32Vector: typeof Uint32Vector;
    public Float64Vector: typeof Float64Vector;
	static AXSecurityDomain: ISecurityDomain;
  
    public get xmlParser(): XMLParser {
      return this._xmlParser || (this._xmlParser = new XMLParser(this));
    }
  
    private _xmlParser: XMLParser;
  
    private AXPrimitiveBox;
    private AXGlobalPrototype;
    private AXActivationPrototype;
    private AXCatchPrototype;
    private _AXFunctionUndefinedPrototype;
  
    public get AXFunctionUndefinedPrototype() {
      return this._AXFunctionUndefinedPrototype ||
              (this._AXFunctionUndefinedPrototype = this.createObject());
    }
  
    public objectPrototype: AXObject;
    public argumentsPrototype: AXObject;
    private rootClassPrototype: AXObject;
  
    private nativeClasses: any;
    private vectorClasses: Map<AXClass, AXClass>;
  
    private _catalogs: ABCCatalog [];
  
    public flash:any;
    public player:any;
    constructor() {
      initializeAXBasePrototype();
      this.system = new AXApplicationDomain(this, null);
      this.application = new AXApplicationDomain(this, this.system);
      this.classAliases = new ClassAliases();
      this.nativeClasses = Object.create(null);
      this.vectorClasses = new Map<AXClass, AXClass>();
      this._catalogs = [];
    }
  
    addCatalog(abcCatalog: ABCCatalog) {
      this._catalogs.push(abcCatalog);
    }
  
    findDefiningABC(mn: Multiname): ABCFile {
      runtimeWriter && runtimeWriter.writeLn("findDefiningABC: " + mn);
      var abcFile = null;
      for (var i = 0; i < this._catalogs.length; i++) {
        var abcCatalog = this._catalogs[i];
        abcFile = abcCatalog.getABCByMultiname(mn);
        if (abcFile) {
          return abcFile;
        }
      }
      return null;
    }
  
    throwError(className: string, error: any, replacement1?: any,
                replacement2?: any, replacement3?: any, replacement4?: any) {
      throw this.createError.apply(this, arguments);
    }
  
    createError(className: string, error: any, replacement1?: any,
                replacement2?: any, replacement3?: any, replacement4?: any) {
      var message = formatErrorMessage.apply(null, sliceArguments(arguments, 1));
      var mn = Multiname.FromFQNString(className, NamespaceType.Public);
      var axClass: AXClass = <AXClass> this.system.getProperty(mn, true, true);
      return axClass.axConstruct([message, error.code]);
    }
  
    applyType(axClass: AXClass, types: AXClass []): AXClass {
      var vectorProto = (<AXClass><any>this.ObjectVector.axClass).superClass.dPrototype;
      if (!vectorProto.isPrototypeOf(axClass.dPrototype)) {
        this.throwError('TypeError', Errors.TypeAppOfNonParamType);
      }
      if (types.length !== 1) {
        this.throwError('TypeError', Errors.WrongTypeArgCountError, '__AS3__.vec::Vector', 1,
                        types.length);
      }
      var type = types[0] || this.AXObject;
      return this.getVectorClass(type);
    }
  
    getVectorClass(type: AXClass): AXClass {
      var vectorClass = this.vectorClasses.get(type);
      if (vectorClass) {
        return vectorClass;
      }
      var typeClassName = type ?
                          type.classInfo.instanceInfo.getName().getMangledName() :
                          '$BgObject';
      switch (typeClassName) {
        case "$BgNumber":
        case "$Bgdouble":
          vectorClass = <any>this.Float64Vector.axClass;
          break;
        case "$Bgint":
          vectorClass = <any>this.Int32Vector.axClass;
          break;
        case "$Bguint":
          vectorClass = <any>this.Uint32Vector.axClass;
          break;
        default:
          vectorClass = this.createVectorClass(type);
      }
      this.vectorClasses.set(type, vectorClass);
      return vectorClass;
    }
  
    createVectorClass(type: AXClass): AXClass {
      var genericVectorClass = this.ObjectVector.axClass;
      var axClass: AXClass = Object.create(genericVectorClass);
      // Put the superClass tPrototype on the prototype chain so we have access
      // to all factory protocol handlers by default.
      axClass.tPrototype = Object.create(genericVectorClass.tPrototype);
      axClass.tPrototype.axClass = axClass;
      // We don't need a new dPrototype object.
      axClass.dPrototype = <any>genericVectorClass.dPrototype;
      axClass.superClass = <any>genericVectorClass;
      (<any>axClass).type = type;
      return axClass;
    }
  
    /**
     * Constructs a plain vanilla object in this security domain.
     */
    createObject() {
      return Object.create(this.AXObject.tPrototype);
    }
  
    /**
     * Takes a JS Object and transforms it into an AXObject.
     */
    createObjectFromJS(value: Object, deep: boolean = false) {
      var keys = Object.keys(value);
      var result = this.createObject();
      for (var i = 0; i < keys.length; i++) {
        var v = value[keys[i]];
        if (deep) {
          v = transformJSValueToAS(this, v, true);
        }
        result.axSetPublicProperty(keys[i], v);
      }
      return result;
    }
  
    /**
     * Constructs an AXArray in this security domain and sets its value to the given array.
     * Warning: This doesn't handle non-indexed keys.
     */
    createArrayUnsafe(value: any[]) {
      var array = Object.create(this.AXArray.tPrototype);
      array.value = value;
      if (!release) { // Array values must only hold index keys.
        for (var k in value) {
          assert(isIndex(k));
          checkValue(value[k]);
        }
      }
      return array;
    }
  
    /**
     * Constructs an AXArray in this security domain and copies all enumerable properties of
     * the given array, setting them as public properties on the AXArray.
     * Warning: this does not use the given Array as the `value`.
     */
    createArray(value: any[]) {
      var array = this.createArrayUnsafe([]);
      for (var k in value) {
        array.axSetPublicProperty(k, value[k]);
        release || checkValue(value[k]);
      }
      array.length = value.length;
      return array;
    }
  
    /**
     * Constructs an AXFunction in this security domain and sets its value to the given function.
     */
    boxFunction(value: Function) {
      var fn = Object.create(this.AXFunction.tPrototype);
      fn.value = value;
      return fn;
    }
  
    createClass(classInfo: ClassInfo, superClass: AXClass, scope: Scope): AXClass {
      var instanceInfo = classInfo.instanceInfo;
      var className = instanceInfo.getName().toFQNString(false);
      var axClass: AXClass = this.nativeClasses[className] ||
                              Object.create(this.AXClass.tPrototype);
      var classScope = new Scope(scope, axClass);
      if (!this.nativeClasses[className]) {
        if (instanceInfo.isInterface()) {
          axClass.dPrototype = Object.create(this.objectPrototype);
          axClass.tPrototype = Object.create(axClass.dPrototype);
          axClass.tPrototype.axInitializer = axInterfaceInitializer;
          axClass.axIsInstanceOf = axIsInstanceOfInterface;
          axClass.axIsType = axIsTypeInterface;
        } else {
          // For direct descendants of Object, we want the dynamic prototype to inherit from
          // Object's tPrototype because Foo.prototype is always a proper instance of Object.
          // For all other cases, the dynamic prototype should extend the parent class's
          // dynamic prototype not the tPrototype.
          if (superClass === this.AXObject) {
            axClass.dPrototype = Object.create(this.objectPrototype);
          } else {
            axClass.dPrototype = Object.create(superClass.dPrototype);
          }
          axClass.tPrototype = Object.create(axClass.dPrototype);
          axClass.tPrototype.axInitializer = this.createInitializerFunction(classInfo, classScope);
        }
      } else {
        axClass.tPrototype.axInitializer = this.createInitializerFunction(classInfo, classScope);
        // Native classes have their inheritance structure set up during initial SecurityDomain
        // creation.
        release || assert(axClass.dPrototype);
        release || assert(axClass.tPrototype);
      }
  
      axClass.classInfo = (<any>axClass.dPrototype).classInfo = classInfo;
      (<any>axClass.dPrototype).axClass = axClass;
      axClass.superClass = superClass;
      axClass.scope = scope;
  
      // Object and Class have their traits initialized earlier to avoid circular dependencies.
      if (className !== 'Object' && className !== 'Class') {
        this.initializeRuntimeTraits(axClass, superClass, classScope);
      }
  
      // Add the |constructor| property on the class dynamic prototype so that all instances can
      // get to their class constructor, and FooClass.prototype.constructor returns FooClass.
      defineNonEnumerableProperty(axClass.dPrototype, "$Bgconstructor", axClass);
  
      // Copy over all TS symbols.
      tryLinkNativeClass(axClass);
  
      // Run the static initializer.
      var initializer = classInfo.getInitializer();
      var initializerCode = initializer.getBody().code;
      // ... except if it's the standard class initializer that doesn't really do anything.
      if (initializerCode[0] !== 208 || initializerCode[1] !== 48 || initializerCode[2] !== 71) {
        interpret(axClass, initializer, classScope, [axClass], null);
      }
      return axClass;
    }
  
    private initializeRuntimeTraits(axClass: AXClass, superClass: AXClass, scope: Scope) {
      var classInfo = axClass.classInfo;
      var instanceInfo = classInfo.instanceInfo;
  
      // Prepare class traits.
      var classTraits: RuntimeTraits;
      if (axClass === this.AXClass) {
        classTraits = instanceInfo.traits.resolveRuntimeTraits(null, null, scope);
      } else {
        var rootClassTraits = this.AXClass.classInfo.instanceInfo.runtimeTraits;
        release || assert(rootClassTraits);
        // Class traits don't capture the class' scope. This is relevant because it allows
        // referring to global names that would be shadowed if the class scope were active.
        // Haxe's stdlib uses just such constructs, e.g. Std.parseFloat calls the global
        // parseFloat.
        classTraits = classInfo.traits.resolveRuntimeTraits(rootClassTraits, null, scope.parent);
      }
      classInfo.runtimeTraits = classTraits;
      applyTraits(axClass, classTraits);
  
      // Prepare instance traits.
      var superInstanceTraits = superClass ? superClass.classInfo.instanceInfo.runtimeTraits : null;
      var protectedNs = classInfo.abc.getNamespace(instanceInfo.protectedNs);
      var instanceTraits = instanceInfo.traits.resolveRuntimeTraits(superInstanceTraits,
                                                                    protectedNs, scope);
      instanceInfo.runtimeTraits = instanceTraits;
      applyTraits(axClass.tPrototype, instanceTraits);
    }
  
    createFunction(methodInfo: MethodInfo, scope: Scope, hasDynamicScope: boolean): AXFunction {
      var traceMsg = !release && flashlog && methodInfo.trait ? methodInfo.toFlashlogString() : null;
      var fun = this.boxFunction(function () {
        release || (traceMsg && flashlog.writeAS3Trace(methodInfo.toFlashlogString()));
        var self = this === jsGlobal ? scope.global.object : this;
        return interpret(self, methodInfo, scope, <any>arguments, fun);
      });
      //fun.methodInfo = methodInfo;
      fun.receiver = {scope: scope};
      if (!release) {
        try {
          Object.defineProperty(fun.value, 'name', {value: methodInfo.getName()});
        } catch (e) {
          // Ignore errors in browsers that don't allow overriding Function#length;
        }
      }
      return fun;
    }
  
    createInitializerFunction(classInfo: ClassInfo, scope: Scope): AXCallable {
      var methodInfo = classInfo.instanceInfo.getInitializer();
      var traceMsg = !release && flashlog && methodInfo.trait ? methodInfo.toFlashlogString() : null;
      var fun = getNativeInitializer(classInfo);
      if (!fun) {
        release || assert(!methodInfo.isNative(), "Must provide a native initializer for " +
                                                  classInfo.instanceInfo.getClassName());      
        var binarySymbol=this.application.getBinarySymbol(classInfo.instanceInfo.getClassName());    
        if(binarySymbol)   {   
          binarySymbol.buffer=binarySymbol.data;                        
          fun = <any> function () {
            console.log("create instance for binary data:", classInfo.instanceInfo.getClassName());  
            ByteArrayDataProvider.symbolForConstructor=binarySymbol;
            release || (traceMsg && flashlog.writeAS3Trace(methodInfo.toFlashlogString()));
            return interpret(this, methodInfo, scope, <any>arguments, null);
          };
        }    
        else{            
          fun = <any> function () {
            release || (traceMsg && flashlog.writeAS3Trace(methodInfo.toFlashlogString()));
            return interpret(this, methodInfo, scope, <any>arguments, null);
          };
        }       
        if (!release) {
          try {
            var className = classInfo.instanceInfo.getName().toFQNString(false);
            Object.defineProperty(fun, 'name', {value: className});
          } catch (e) {
            // Ignore errors in browsers that don't allow overriding Function#length;
          }
        }
        // REDUX: enable arg count checking on native ctors. Currently impossible because natives
        // are frozen.
        fun.methodInfo = methodInfo;
      }
      return fun;
    }
  
    createActivation(methodInfo: MethodInfo, scope: Scope): AXActivation {
      var body = methodInfo.getBody();
      if (!body.activationPrototype) {
        body.traits.resolve();
        body.activationPrototype = Object.create(this.AXActivationPrototype);
        defineReadOnlyProperty(body.activationPrototype, "traits", body.traits.resolveRuntimeTraits(null, null, scope));
      }
      return Object.create(body.activationPrototype);
    }
  
    createCatch(exceptionInfo: ExceptionInfo, scope: Scope): AXCatch {
      if (!exceptionInfo.catchPrototype) {
        var traits = exceptionInfo.getTraits();
        exceptionInfo.catchPrototype = Object.create(this.AXCatchPrototype);
        defineReadOnlyProperty(exceptionInfo.catchPrototype, "traits",
                                traits.resolveRuntimeTraits(null, null, scope));
      }
      return Object.create(exceptionInfo.catchPrototype);
    }
  
    box(v: any) {
        if (v == undefined)
            return v

        if (v.constructor === Array)
            return this.AXArray.axBox(v)

        const t = typeof v

        if (t === "number")
            return this.AXNumber.axBox(v)

        if (t === "boolean")
            return this.AXBoolean.axBox(v)

        if (t === "string")
            return this.AXString.axBox(v)

        release || assert(AXBasePrototype.isPrototypeOf(v))

        return v
    }
  
    isPrimitive(v: any) {
      return isPrimitiveJSValue(v) || this.AXPrimitiveBox.dPrototype.isPrototypeOf(v);
    }
  
    createAXGlobal(applicationDomain: AXApplicationDomain, scriptInfo: ScriptInfo) {
      var global: AXGlobal = Object.create(this.AXGlobalPrototype);
      global.applicationDomain = applicationDomain;
      global.scriptInfo = scriptInfo;
  
      var scope = global.scope = new Scope(null, global, false);
      var objectTraits = this.AXObject.classInfo.instanceInfo.runtimeTraits;
      var traits = scriptInfo.traits.resolveRuntimeTraits(objectTraits, null, scope);
      applyTraits(global, traits);
      return global;
    }

  
    /**
     * Prepares the dynamic Class prototype that all Class instances (including Class) have in
     * their prototype chain.
     *
     * This prototype defines the default hooks for all classes. Classes can override some or
     * all of them.
     */
    prepareRootClassPrototype() {
      var dynamicClassPrototype: AXObject = Object.create(this.objectPrototype);
      var rootClassPrototype: AXObject = Object.create(dynamicClassPrototype);
      rootClassPrototype.$BgtoString = <any> function axClassToString() {
        return "[class " + this.classInfo.instanceInfo.getName().name + "]";
      };
  
      var D = defineNonEnumerableProperty;
      D(rootClassPrototype, "axBox", axBoxIdentity);
      D(rootClassPrototype, "axCoerce", axCoerce);
      D(rootClassPrototype, "axIsType", axIsTypeObject);
      D(rootClassPrototype, "axAsType", axAsType);
      D(rootClassPrototype, "axIsInstanceOf", axIsInstanceOfObject);
      D(rootClassPrototype, "axConstruct", axConstruct);
      D(rootClassPrototype, "axApply", axDefaultApply);
      Object.defineProperty(rootClassPrototype, 'name', {
        get: function () {
          return this.classInfo.instanceInfo.name;
        }
      });
  
      this.rootClassPrototype = rootClassPrototype;
    }
  
    private initializeCoreNatives() {
      // Some facts:
      // - The Class constructor is itself an instance of Class.
      // - The Class constructor is an instance of Object.
      // - The Object constructor is an instance of Class.
      // - The Object constructor is an instance of Object.
  
      this.prepareRootClassPrototype();
      var AXClass = this.prepareNativeClass("AXClass", "Class", false);
      AXClass.classInfo = this.system.findClassInfo("Class");
      AXClass.defaultValue = null;
  
      var AXObject = this.prepareNativeClass("AXObject", "Object", false);
      AXObject.classInfo = this.system.findClassInfo("Object");
  
      var AXObject = this.AXObject;
  
      // AXFunction needs to exist for runtime trait resolution.
      var AXFunction = this.prepareNativeClass("AXFunction", "Function", false);
      defineNonEnumerableProperty(AXFunction, "axBox", axBoxPrimitive);
  
      // Initialization of the core classes' traits is a messy multi-step process:
  
      // First, create a scope for looking up all the things.
      var scope = new Scope(null, AXClass, false);
  
      // Then, create the runtime traits all Object instances share.
      var objectCI = this.AXObject.classInfo;
      var objectII = objectCI.instanceInfo;
      var objectRTT = objectII.runtimeTraits = objectII.traits.resolveRuntimeTraits(null, null,
                                                                                    scope);
      applyTraits(this.AXObject.tPrototype, objectRTT);
  
      // Building on that, create the runtime traits all Class instances share.
      var classCI = this.AXClass.classInfo;
      var classII = classCI.instanceInfo;
      classII.runtimeTraits = classII.traits.resolveRuntimeTraits(objectRTT, null, scope);
      applyTraits(this.AXClass.tPrototype, classII.runtimeTraits);
  
      // As sort of a loose end, also create the one class trait Class itself has.
      classCI.runtimeTraits = classCI.traits.resolveRuntimeTraits(objectRTT, null, scope);
      applyTraits(this.AXClass, classCI.runtimeTraits);
  
      // Now we can create Object's runtime class traits.
      objectCI.runtimeTraits = objectCI.traits.resolveRuntimeTraits(classII.runtimeTraits, null,
                                                                    scope);
      applyTraits(this.AXObject, objectCI.runtimeTraits);
      return AXObject;
    }
  
    prepareNativeClass(exportName: string, name: string, isPrimitiveClass: boolean) {
      var axClass: AXClass = Object.create(this.rootClassPrototype);
  
      // For Object and Class, we've already created the instance prototype to break
      // circular dependencies.
      if (name === 'Object') {
        axClass.dPrototype = <any>Object.getPrototypeOf(this.objectPrototype);
        axClass.tPrototype = this.objectPrototype;
      } else if (name === 'Class') {
        axClass.dPrototype = <any>Object.getPrototypeOf(this.rootClassPrototype);
        axClass.tPrototype = this.rootClassPrototype;
      } else {
        var instancePrototype = isPrimitiveClass ?
                                this.AXPrimitiveBox.dPrototype :
                                exportName === 'AXMethodClosure' ?
                                  this.AXFunction.dPrototype :
                                  this.objectPrototype;
        axClass.dPrototype = Object.create(instancePrototype);
        axClass.tPrototype = Object.create(axClass.dPrototype);
      }
      this[exportName] = this.nativeClasses[name] = axClass;
      return axClass;
    }
  
    preparePrimitiveClass(exportName: string, name: string, convert, defaultValue, coerce,
                          isType, isInstanceOf) {
      var axClass = this.prepareNativeClass(exportName, name, true);
      var D = defineNonEnumerableProperty;
      D(axClass, 'axBox', axBoxPrimitive);
      D(axClass, "axApply", function axApply(_ , args: any []) {
        return convert(args && args.length ? args[0] : defaultValue);
      });
      D(axClass, "axConstruct", function axConstruct(args: any []) {
        return convert(args && args.length ? args[0] : defaultValue);
      });
      D(axClass, "axCoerce", coerce);
      D(axClass, "axIsType", isType);
      D(axClass, "axIsInstanceOf", isInstanceOf);
      D(axClass.dPrototype, "value", defaultValue);
      return axClass;
    }
  
    /**
     * Configures all the builtin Objects.
     */
    initialize() {
      var D = defineNonEnumerableProperty;
      
      // The basic dynamic prototype that all objects in this security domain have in common.
      var dynamicObjectPrototype = Object.create(AXBasePrototype);
      dynamicObjectPrototype.sec = this;
      // The basic traits prototype that all objects in this security domain have in common.
      Object.defineProperty(this, 'objectPrototype',
                            {value: Object.create(dynamicObjectPrototype)});
      this.initializeCoreNatives();
  
      // Debugging Helper
      release || (this.objectPrototype['trace'] = function trace() {
        var self = this;
        var writer = new IndentingWriter();
        this.traits.traits.forEach(t => {
          writer.writeLn(t + ": " + self[t.getName().getMangledName()]);
        });
      });
  
      this.AXGlobalPrototype = Object.create(this.objectPrototype);
      this.AXGlobalPrototype.$BgtoString = function() {
        return '[object global]';
      };
  
      this.AXActivationPrototype = Object.create(this.objectPrototype);
      this.AXActivationPrototype.$BgtoString = function() {
        return '[Activation]';
      };
  
      this.AXCatchPrototype = Object.create(this.objectPrototype);
      this.AXCatchPrototype.$BgtoString = function() {
        return '[Catch]';
      };
  
      // The core classes' MOP hooks and dynamic prototype methods are defined
      // here to keep all the hooks initialization in one place.
      var AXObject = this.AXObject;
      var AXFunction = this.AXFunction;
  
      // Object(null) creates an object, and this behaves differently than:
      // (function (x: Object) { trace (x); })(null) which prints null.
      D(AXObject, "axApply", axApplyObject);
      D(AXObject, "axConstruct", axConstructObject);
      D(AXObject.tPrototype, "axInitializer", axDefaultInitializer);
      D(AXObject, "axCoerce", axCoerceObject);
  
      this.prepareNativeClass("AXMethodClosure", "builtin.as$0.MethodClosure", false);
      this.prepareNativeClass("AXError", "Error", false);
  
      this.prepareNativeClass("AXMath", "Math", false);
      this.prepareNativeClass("AXDate", "Date", false);
  
      this.prepareNativeClass("AXXML", "XML", false);
      this.prepareNativeClass("AXXMLList", "XMLList", false);
      this.prepareNativeClass("AXQName", "QName", false);
      this.prepareNativeClass("AXNamespace", "Namespace", false);

      var AXArray = this.prepareNativeClass("AXArray", "Array", false);
      D(AXArray, 'axBox', axBoxPrimitive);
      AXArray.tPrototype.$BgtoString = AXFunction.axBox(function () {
        return this.value.toString();
      });
      // Array.prototype is an Array, and behaves like one.
      AXArray.dPrototype['value'] = [];
  
      this.argumentsPrototype = Object.create(this.AXArray.tPrototype);
      Object.defineProperty(this.argumentsPrototype, '$Bgcallee', {get: axGetArgumentsCallee});
  
      var AXRegExp = this.prepareNativeClass("AXRegExp", "RegExp", false);
      // RegExp.prototype is an (empty string matching) RegExp, and behaves like one.
      AXRegExp.dPrototype['value'] = /(?:)/;
  
      // Boolean, int, Number, String, and uint are primitives in AS3. We create a placeholder
      // base class to help us with instanceof tests.
      var AXPrimitiveBox = this.prepareNativeClass("AXPrimitiveBox", "PrimitiveBox", false);
      D(AXPrimitiveBox.dPrototype, '$BgtoString',
        AXFunction.axBox(function () { return this.value.toString(); }));
      var AXBoolean = this.preparePrimitiveClass("AXBoolean", "Boolean", axCoerceBoolean, false,
                                                  axCoerceBoolean, axIsTypeBoolean, axIsTypeBoolean);
  
      var AXString = this.preparePrimitiveClass("AXString", "String", axConvertString, '',
                                                  axCoerceString, axIsTypeString, axIsTypeString);
  
      var AXNumber = this.preparePrimitiveClass("AXNumber", "Number", axCoerceNumber, 0,
                                                axCoerceNumber, axIsTypeNumber, axIsTypeNumber);
  
      var AXInt = this.preparePrimitiveClass("AXInt", "int", axCoerceInt, 0, axCoerceInt,
                                              axIsTypeInt, axFalse);
  
      var AXUint = this.preparePrimitiveClass("AXUint", "uint", axCoerceUint, 0, axCoerceUint,
                                              axIsTypeUint, axFalse);
  
      // Install class loaders on the security domain.
      installClassLoaders(this.application, this);
      installNativeFunctions(this);
    }
  }