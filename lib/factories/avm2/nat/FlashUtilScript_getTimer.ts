import { AXSecurityDomain } from "../run/AXSecurityDomain";


export function FlashUtilScript_getTimer(sec: AXSecurityDomain) {
    return Date.now() - (<any>sec).flash.display.Loader.axClass.runtimeStartTime;
  }
  