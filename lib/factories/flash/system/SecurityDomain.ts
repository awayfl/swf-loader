import { ASObject } from "../../avm2/nat";
import { Errors } from "../../avm2/errors";
import { getCurrentABC } from "../../avm2/run";

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
export class SecurityDomain extends ASObject {
  
  static classInitializer: any = null;

  constructor () {
    super();
    this.sec.throwError('ArgumentError', Errors.CantInstantiateError, 'SecurityDomain');
  }

  static get currentDomain(): SecurityDomain {
    var currentABC = getCurrentABC();
    var sec = currentABC ? currentABC.env.app.sec : this.sec;
    // TODO: memoize the flash.system.SecurityDomain instance
    return Object.create(SecurityDomain.axClass.tPrototype);
  }
}
