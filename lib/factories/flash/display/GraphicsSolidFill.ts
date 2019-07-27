import { ASObject } from "../../avm2/nat";
import { IGraphicsFill } from "./IGraphicsFill";
import { IGraphicsData } from "./IGraphicsData";

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
// Class: GraphicsSolidFill
export class GraphicsSolidFill extends ASObject implements IGraphicsFill, IGraphicsData {
  
  // Called whenever the class is initialized.
  static classInitializer: any = null;

  // List of static symbols to link.
  static classSymbols: string [] = null; // [];
  
  // List of instance symbols to link.
  static instanceSymbols: string [] = null; // ["color", "alpha"];
  
  constructor (color: number /*uint*/ = 0, alpha: number = 1) {
    super();
    this.color = color >>> 0;
    this.alpha = +alpha;
  }
  
  // JS -> AS Bindings
  
  color: number /*uint*/;
  alpha: number;
  
  // AS -> JS Bindings
  
}
