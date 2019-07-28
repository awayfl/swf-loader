import { AXSecurityDomain } from "../run/AXSecurityDomain";
import { Errors } from "../errors";
import { isNullOrUndefined } from "@awayjs/graphics";

export function FlashNetScript_navigateToURL(sec: AXSecurityDomain, request, window_) {
    if (request === null || request === undefined) {
      sec.throwError('TypeError', Errors.NullPointerError, 'request');
    }
    var RequestClass = (<any>sec).flash.net.URLRequest.axClass;
    if (!RequestClass.axIsType(request)) {
      sec.throwError('TypeError', Errors.CheckTypeFailedError, request, 'flash.net.URLRequest');
    }
    var url = request.url;
    if (isNullOrUndefined(url)) {
      sec.throwError('TypeError', Errors.NullPointerError, 'url');
    }
    if (url.toLowerCase().indexOf('fscommand:') === 0) {
      var fscommand = (<any>sec).flash.system.fscommand.value;
      fscommand(sec, url.substring('fscommand:'.length), window_);
      return;
    }
    // TODO handle other methods than GET
    console.log("TODO: FlashNetScript_navigateToURL: FileLoadingService")
    //FileLoadingService.navigateTo(url, window_);
  }