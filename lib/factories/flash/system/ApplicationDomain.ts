import { ASObject } from "../../avm2/nat/ASObject";
import { axCoerceString } from "../../avm2/run/axCoerceString";
import { getCurrentABC } from "../../avm2/run/getCurrentABC";
import { AXApplicationDomain } from "../../avm2/run/AXApplicationDomain";
import { assert, release, notImplemented } from "../../base/utilities/Debug";
import { ByteArray } from "../../avm2/natives/byteArray";
import { Errors } from "../../avm2/errors";
import { Multiname } from "../../avm2/abc/lazy/Multiname";
import { NamespaceType } from "../../avm2/abc/lazy/NamespaceType";
import { GenericVector } from "../../avm2/natives/GenericVector";

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
// Class: ApplicationDomain

export class ApplicationDomain extends ASObject {

  axDomain: AXApplicationDomain;

  constructor (parentDomainOrAXDomain: any = null) {
    super();
    release || assert(!(this instanceof ApplicationDomain));
    if (parentDomainOrAXDomain instanceof AXApplicationDomain) {
      this.axDomain = parentDomainOrAXDomain;
      return;
    }
    var parentRuntimeDomain: AXApplicationDomain = null;
    if (ApplicationDomain.axIsType(parentDomainOrAXDomain)) {
      parentRuntimeDomain = (<ApplicationDomain>parentDomainOrAXDomain).axDomain;
    } else {
      parentRuntimeDomain = this.sec.application;
    }
    this.axDomain = new AXApplicationDomain(this.sec, parentRuntimeDomain);
  }

  // This must return a new object each time.
  static get currentDomain(): ApplicationDomain {
    var currentABC = getCurrentABC();
    var app = currentABC ? currentABC.env.app : this.sec.application;
    return new ApplicationDomain(app);
  }

  static get MIN_DOMAIN_MEMORY_LENGTH(): number /*uint*/ {
    release || notImplemented("public flash.system.ApplicationDomain::get MIN_DOMAIN_MEMORY_LENGTH"); return;
    // return this._MIN_DOMAIN_MEMORY_LENGTH;
  }

  get parentDomain(): ApplicationDomain {
    var currentABC = getCurrentABC();
    var app = currentABC ? currentABC.env.app : this.sec.application;
    release || assert(app.parent !== undefined);
    return new ApplicationDomain(app.parent);
  }

  get domainMemory(): ByteArray {
    release || notImplemented("public flash.system.ApplicationDomain::get domainMemory"); return;
    // return this._domainMemory;
  }

  set domainMemory(mem: ByteArray) {
    mem = mem;
    release || notImplemented("public flash.system.ApplicationDomain::set domainMemory"); return;
    // this._domainMemory = mem;
  }

  getDefinition(name: string): Object {
    var definition = this.getDefinitionImpl(name);
    if (!definition) {
      this.sec.throwError('ReferenceError', Errors.UndefinedVarError, name);
    }
    return definition;
  }

  hasDefinition(name: string): boolean {
    return !!this.getDefinitionImpl(name);
  }

  private getDefinitionImpl(name) {
    name = axCoerceString(name);
    if (!name) {
      this.sec.throwError('TypeError', Errors.NullPointerError, 'definitionName');
    }
    var simpleName = name.replace("::", ".");
    var mn = Multiname.FromFQNString(simpleName, NamespaceType.Public);
    return this.axDomain.getProperty(mn, false, false);
  }

  getQualifiedDefinitionNames(): GenericVector {
    release || notImplemented("public flash.system.ApplicationDomain::getQualifiedDefinitionNames"); return;
  }
}
