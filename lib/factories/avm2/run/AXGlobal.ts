import { AXObject } from "./AXObject";
import { AXSecurityDomain } from "./AXSecurityDomain";
import { AXApplicationDomain } from "./AXApplicationDomain";
import { ScriptInfo } from "../abc/lazy/ScriptInfo";
import { Scope } from "./Scope";

export interface AXGlobal extends AXObject {
    sec: AXSecurityDomain;
    applicationDomain: AXApplicationDomain;
    scriptInfo: ScriptInfo;
    scope: Scope;
  }