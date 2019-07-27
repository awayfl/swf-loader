import { release, notImplemented } from "../../base/utilities/Debug";
import { ASXML } from "../../avm2/natives/xml";
import { ByteArray } from "../../avm2/natives/byteArray";
import { ApplicationInstaller } from "./ApplicationInstaller";
import { axCoerceString } from "../../avm2/run";
import { ASObject } from "../../avm2/nat";
import { URLStream } from "../net/URLStream";

/**
 * Copyright 2014 Mozilla Foundation
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// Class: AuthorizedFeatures
export class AuthorizedFeatures extends ASObject {
  
  // Called whenever the class is initialized.
  static classInitializer: any = null;

  // List of static symbols to link.
  static classSymbols: string [] = null; // [];
  
  // List of instance symbols to link.
  static instanceSymbols: string [] = null; // [];
  
  constructor () {
    super();
  }

  createApplicationInstaller(strings: ASXML, icon: ByteArray): ApplicationInstaller {
    strings = strings; icon = icon;
    release || notImplemented("public flash.system.AuthorizedFeatures::createApplicationInstaller"); return;
  }
  enableDiskCache(stream: URLStream): boolean {
    stream = stream;
    release || notImplemented("public flash.system.AuthorizedFeatures::enableDiskCache"); return;
  }
  isFeatureEnabled(feature: string, data: string = null): boolean {
    feature = axCoerceString(feature); data = axCoerceString(data);
    release || notImplemented("public flash.system.AuthorizedFeatures::isFeatureEnabled"); return;
  }
  isNegativeToken(): boolean {
    release || notImplemented("public flash.system.AuthorizedFeatures::isNegativeToken"); return;
  }
}