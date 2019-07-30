import { ASObject } from "../../avm2/nat/ASObject";
import { ApplicationDomain } from "./ApplicationDomain";
import { SecurityDomain } from "./SecurityDomain";
import { DisplayObjectContainer } from "../display/DisplayObjectContainer";
import { ImageDecodingPolicy } from "./ImageDecodingPolicy";
import { AVM1Context } from '../../avm1/context';

/**
 * Copyright 2015 Mozilla Foundation
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
// Class: LoaderContext

export class LoaderContext extends ASObject {

  static classInitializer: any = null;

  static instanceSymbols: string [] = ["checkPolicyFile!", "applicationDomain!", "sec!",
                                        "allowCodeImport!", "requestedContentParent!",
                                        "parameters!", "imageDecodingPolicy!"];

  private $BgcheckPolicyFile: boolean;
  private $BgapplicationDomain: ApplicationDomain;
  private $BgsecurityDomain: SecurityDomain;
  private $BgallowCodeImport: boolean;
  private $BgrequestedContentParent: DisplayObjectContainer;
  private $Bgparameters: ASObject;
  private $BgimageDecodingPolicy: string;

  _avm1Context: AVM1Context;

  constructor(checkPolicyFile: boolean = false,
              applicationDomain: ApplicationDomain = null,
              securityDomain: SecurityDomain = null)
  {
    super();
    this.$BgcheckPolicyFile = !!checkPolicyFile;
    this.$BgapplicationDomain = applicationDomain;
    this.$BgsecurityDomain = securityDomain;
    this.$BgimageDecodingPolicy = ImageDecodingPolicy.ON_DEMAND;

    this._avm1Context = null;
  }

  public get imageDecodingPolicy(): string {
    return this.$BgimageDecodingPolicy;
  }

  public get parameters(): ASObject {
    return this.$Bgparameters;
  }

  public get requestedContentParent(): DisplayObjectContainer {
    return this.$BgrequestedContentParent;
  }

  public get allowCodeImport(): boolean {
    return this.$BgallowCodeImport;
  }

  public get securityDomain(): SecurityDomain {
    return this.$BgsecurityDomain;
  }

  public get applicationDomain(): ApplicationDomain {
    return this.$BgapplicationDomain;
  }

  public get checkPolicyFile(): boolean {
    return this.$BgcheckPolicyFile;
  }
}
