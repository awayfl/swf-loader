import { AXSecurityDomain } from "../run/AXSecurityDomain";
import { isNullOrUndefined } from "@awayjs/graphics";
import { Errors } from "../errors";

export function FlashNetScript_sendToURL(sec: AXSecurityDomain, request) {
    if (isNullOrUndefined(request)) {
      sec.throwError('TypeError', Errors.NullPointerError, 'request');
    }
    var RequestClass = (<any>sec).flash.net.URLRequest.axClass;
    if (!RequestClass.axIsType(request)) {
      sec.throwError('TypeError', Errors.CheckTypeFailedError, request, 'flash.net.URLRequest');
    }
    console.log("TODO: FlashNetScript_sendToURL: FileLoadingService")
    /*var session = FileLoadingService.createSession();
    session.onprogress = function () {
      // ...
    };
    session.open(request);*/
  }