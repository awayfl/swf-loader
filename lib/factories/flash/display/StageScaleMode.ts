import { ASObject } from "../../avm2/nat";
import { StageScaleMode as Remoting_StageScaleMode } from "../../base/remoting";

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
// Class: StageScaleMode
export class StageScaleMode extends ASObject {
  
  // Called whenever the class is initialized.
  static classInitializer: any = null;

  // List of static symbols to link.
  static classSymbols: string [] = null; // [];
  
  // List of instance symbols to link.
  static instanceSymbols: string [] = null; // [];
  
  constructor () {
    super();
  }
  
  // JS -> AS Bindings
  static SHOW_ALL: string = "showAll";
  static EXACT_FIT: string = "exactFit";
  static NO_BORDER: string = "noBorder";
  static NO_SCALE: string = "noScale";

  static SHOW_ALL_LOWERCASE: string = "showall";
  static EXACT_FIT_LOWERCASE: string = "exactfit";
  static NO_BORDER_LOWERCASE: string = "noborder";
  static NO_SCALE_LOWERCASE: string = "noscale";

  // AS -> JS Bindings

  static fromNumber(n: number): string {
    switch (n) {
      case Remoting_StageScaleMode.ShowAll:
        return StageScaleMode.SHOW_ALL;
      case Remoting_StageScaleMode.ExactFit:
        return StageScaleMode.EXACT_FIT;
      case Remoting_StageScaleMode.NoBorder:
        return StageScaleMode.NO_BORDER;
      case Remoting_StageScaleMode.NoScale:
        return StageScaleMode.NO_SCALE;
      default:
        return null;
    }
  }

  static toNumber(value: string): number {
    switch (value.toLowerCase()) {
      case StageScaleMode.SHOW_ALL_LOWERCASE:
        return Remoting_StageScaleMode.ShowAll;
      case StageScaleMode.EXACT_FIT_LOWERCASE:
        return Remoting_StageScaleMode.ExactFit;
      case StageScaleMode.NO_BORDER_LOWERCASE:
        return Remoting_StageScaleMode.NoBorder;
      case StageScaleMode.NO_SCALE_LOWERCASE:
        return Remoting_StageScaleMode.NoScale;
      default:
        return -1;
    }
  }
}