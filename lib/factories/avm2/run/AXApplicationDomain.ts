import { ISecurityDomain } from "../nat/ISecurityDomain";
import { ABCFile } from "../abc/lazy/ABCFile";
import { ScriptInfo } from "../abc/lazy/ScriptInfo";
import { Multiname } from "../abc/lazy/Multiname";
import { AXSecurityDomain } from "./AXSecurityDomain";
import { assert } from "@awayjs/graphics";
import { ScriptInfoState } from "./ScriptInfoState";
import { runtimeWriter } from "./writers";
import { interpret } from "../int";
import { AXGlobal } from "./AXGlobal";
import { release } from "../../base/utilities/Debug";
import { AXClass } from "./AXClass";
import { AXObject } from "./AXObject";

/**
 * All code lives within an application domain.
 */
export class AXApplicationDomain {
    /**
     * All application domains have a reference to the root, or system application domain.
     */
    public system: AXApplicationDomain;
  
    /**
     * Parent application domain.
     */
    public parent: AXApplicationDomain;
  
    public sec: any;//80pro todo: ISecurityDomain;
  
    private _abcs: ABCFile [];
  
    constructor(sec: AXSecurityDomain, parent: AXApplicationDomain) {
      this.sec = sec;
      this.parent = parent;
      this.system = parent ? parent.system : this;
      this._abcs = [];
    }
  
    public loadABC(abc: ABCFile) {
      assert (this._abcs.indexOf(abc) < 0);
      this._abcs.push(abc);
    }
  
    public loadAndExecuteABC(abc: ABCFile) {
      this.loadABC(abc);
      this.executeABC(abc);
    }
  
    public executeABC(abc: ABCFile) {
      var lastScript = abc.scripts[abc.scripts.length - 1];
      this.executeScript(lastScript);
    }
  
    public findClassInfo(name: string):any {
      for (var i = 0; i < this._abcs.length; i++) {
        var abc = this._abcs[i];
        for (var j = 0; j < abc.instances.length; j++) {
          var c = abc.classes[j];
          if (c.instanceInfo.getName().name === name) {
            return c;
          }
        }
      }
      return null;
    }
  
    public executeScript(scriptInfo: ScriptInfo) {
      assert (scriptInfo.state === ScriptInfoState.None);
  
      runtimeWriter && runtimeWriter.writeLn("Running Script: " + scriptInfo);
      var global = this.sec.createAXGlobal(this, scriptInfo);
      scriptInfo.global = global;
      scriptInfo.state = ScriptInfoState.Executing;
      interpret(<any>global, scriptInfo.getInitializer(), global.scope, [], null);
      scriptInfo.state = ScriptInfoState.Executed;
    }
  
    public findProperty(mn: Multiname, strict: boolean, execute: boolean): AXGlobal {
      release || assert(mn instanceof Multiname);
      var script = this.findDefiningScript(mn, execute);
      if (script) {
        return script.global;
      }
      return null;
    }
  
    public getClass(mn: Multiname): AXClass {
      release || assert(mn instanceof Multiname);
      return <any>this.getProperty(mn, true, true);
    }
  
    public getProperty(mn: Multiname, strict: boolean, execute: boolean): AXObject {
      release || assert(mn instanceof Multiname);
      var global: any = this.findProperty(mn, strict, execute);
      if (global) {
        return global.axGetProperty(mn);
      }
      return null;
    }
  
    public findDefiningScript(mn: Multiname, execute: boolean): ScriptInfo {
      release || assert(mn instanceof Multiname);
      // Look in parent domain first.
      var script: ScriptInfo;
      if (this.parent) {
        script = this.parent.findDefiningScript(mn, execute);
        if (script) {
          return script;
        }
      }
  
      // Search through the loaded abcs.
      for (var i = 0; i < this._abcs.length; i++) {
        var abc = this._abcs[i];
        script = this._findDefiningScriptInABC(abc, mn, execute);
        if (script) {
          return script;
        }
      }
  
      // Still no luck, so let's ask the security domain to load additional ABCs and try again.
      var abc:ABCFile = this.system.sec.findDefiningABC(mn);
      if (abc) {
        this.loadABC(abc);
        script = this._findDefiningScriptInABC(abc, mn, execute);
        release || assert(script, 'Shall find class in loaded ABC');
        return script;
      }
  
      return null;
    }
  
    private _findDefiningScriptInABC(abc: ABCFile, mn: Multiname, execute: boolean): ScriptInfo {
      var scripts = abc.scripts;
      for (var j = 0; j < scripts.length; j++) {
        var script = scripts[j];
        var traits = script.traits;
        traits.resolve();
        if (traits.getTrait(mn)) {
          // Ensure script is executed.
          if (execute && script.state === ScriptInfoState.None) {
            this.executeScript(script);
          }
          return script;
        }
      }
      return null;
    }
  }