import { MapObject } from "../../../base/utilities";
import { AXApplicationDomain } from "../../run/AXApplicationDomain";
import { ObjectUtilities } from "../../../base/utilities/ObjectUtilities";
import { release } from "../../../base/utilities/Debug";
import { assert } from "@awayjs/graphics";
import { ABCFile } from "./ABCFile";
import { Multiname } from "./Multiname";

export class ABCCatalog {
    map: MapObject<MapObject<string>>;
    abcs: Uint8Array;
    scripts: MapObject<any>;
    app: AXApplicationDomain;
  
    constructor(app: AXApplicationDomain, abcs: Uint8Array, index: any) {
      this.app = app;
      this.map = ObjectUtilities.createMap<MapObject<string>>();
      this.abcs = abcs;
      this.scripts = ObjectUtilities.createMap<string>();
      for (var i = 0; i < index.length; i++) {
        var abc = index[i];
        this.scripts[abc.name] = abc;
        release || assert(Array.isArray(abc.defs));
        for (var j = 0; j < abc.defs.length; j++) {
          var def = abc.defs[j].split(':');
          var nameMappings = this.map[def[1]];
          if (!nameMappings) {
            nameMappings = this.map[def[1]] = Object.create(null);
          }
          nameMappings[def[0]] = abc.name;
        }
      }
    }
  
    getABCByScriptName(scriptName: string): ABCFile {
      var entry = this.scripts[scriptName];
      if (!entry) {
        return null;
      }
      var env = {url: scriptName, app: this.app};
      return new ABCFile(env, this.abcs.subarray(entry.offset, entry.offset + entry.length));
    }
  
    getABCByMultiname(mn: Multiname): ABCFile {
      var mappings = this.map[mn.name];
      if (!mappings) {
        return null;
      }
      var namespaces = mn.namespaces;
      for (var i = 0; i < namespaces.length; i++) {
        var ns = namespaces[i];
        var scriptName = mappings[ns.uri];
        if (scriptName) {
          return this.getABCByScriptName(scriptName);
        }
      }
      return null;
    }
  }