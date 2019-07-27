import { ASObject } from "../../avm2/nat";
import { IGraphicsFill } from "./IGraphicsFill";
import { IGraphicsData } from "./IGraphicsData";
import { Matrix } from "../geom/Matrix";

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
// Class: GraphicsShaderFill
export class GraphicsShaderFill extends ASObject implements IGraphicsFill, IGraphicsData {
  
  // Called whenever the class is initialized.
  static classInitializer: any = null;

  // List of static symbols to link.
  static classSymbols: string [] = null; // [];
  
  // List of instance symbols to link.
  static instanceSymbols: string [] = null; // ["shader", "matrix"];
  
  constructor (shader: Shader = null, matrix: Matrix = null) {
    super();
    this.shader = shader;
    this.matrix = matrix;
  }
  
  // JS -> AS Bindings
  
  shader: Shader;
  matrix: Matrix;
  
  // AS -> JS Bindings
  
}