/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {SystemResourcesLoadingService} from "../base/utilities/SystemResourcesLoadingService"

import { PromiseWrapper } from "../base/utilities";
import { BrowserSystemResourcesLoadingService } from "./BrowserSystemResourcesLoadingService";
import { AXSecurityDomain } from "../avm2/run";
import { ABCFile, ABCCatalog } from "../avm2/abc/lazy";
import { release, assert } from "../base/utilities/Debug";

export enum AVM2LoadLibrariesFlags {
  Builtin = 1,
  Playerglobal = 2,
  Shell = 4
}

export function createSecurityDomain(
  libraries: AVM2LoadLibrariesFlags
): Promise<AXSecurityDomain> {
  var result = new PromiseWrapper<AXSecurityDomain>();
  console.log("createSecurityDomain");
  release || assert(!!(libraries & AVM2LoadLibrariesFlags.Builtin));
  console.log("Load builton.abc file");
  BrowserSystemResourcesLoadingService.getInstance()
    .load("https://github.com/mozilla/shumway/blob/gh-pages/build/libs/builtin.abc", "arrayBuffer")
    .then(function(buffer) {
      var sec = new AXSecurityDomain();
      var env = { url: "builtin.abc", app: sec.system };
      var builtinABC = new ABCFile(env, new Uint8Array(buffer));
      sec.system.loadABC(builtinABC);
      sec.initialize();
      sec.system.executeABC(builtinABC);
      //SWF.leaveTimeline();

      //// If library is shell.abc, then just go ahead and run it now since
      //// it's not worth doing it lazily given that it is so small.
      //if (!!(libraries & AVM2LoadLibrariesFlags.Shell)) {
      //  var shellABC = new Shumway.AVMX.ABCFile(new Uint8Array(buffer));
      //  sec.system.loadAndExecuteABC(shellABC);
      //  result.resolve(sec);
      //  SystemResourcesLoadingService.instance.load(SystemResourceId.ShellAbc).then(function (buffer) {
      //    var shellABC = new Shumway.AVMX.ABCFile(new Uint8Array(buffer));
      //    sec.system.loadAndExecuteABC(shellABC);
      //    result.resolve(sec);
      //  }, result.reject);
      //  return;
      //}

      if (!!(libraries & AVM2LoadLibrariesFlags.Playerglobal)) {
        return Promise.all([
            BrowserSystemResourcesLoadingService.getInstance().load(
            "https://github.com/mozilla/shumway/tree/gh-pages/build/playerglobal/playerglobal.abcs", "arrayBuffer"
          ),
          BrowserSystemResourcesLoadingService.getInstance().load(
            "https://github.com/mozilla/shumway/blob/gh-pages/build/playerglobal/playerglobal.json", "json"
          )
        ]).then(function(results) {
          var catalog = new ABCCatalog(
            sec.system,
            new Uint8Array(results[0]),
            results[1]
          );
          sec.addCatalog(catalog);
          result.resolve(sec);
        }, result.reject);
      }

      result.resolve(sec);
    }, result.reject);
  return result.promise;
}
