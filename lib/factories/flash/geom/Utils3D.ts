import { release, notImplemented } from "../../base/utilities/Debug";
import { Float64Vector } from "../../avm2/natives/float64Vector";
import { Vector3D } from "./Vector3D";
import { Matrix3D } from "./Matrix3D";
import { ASObject } from "../../avm2/nat";

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
// Class: Utils3D
export class Utils3D extends ASObject {
  
  // Called whenever the class is initialized.
  static classInitializer: any = null;

  // List of static symbols to link.
  static classSymbols: string [] = null; // [];
  
  // List of instance symbols to link.
  static instanceSymbols: string [] = null; // [];
  
  constructor () {
    super();
  }

  // AS -> JS Bindings
  static projectVector(m: Matrix3D, v: Vector3D): Vector3D {
    m = m; v = v;
    release || notImplemented("public flash.geom.Utils3D::static projectVector"); return;
  }
  static projectVectors(m: Matrix3D, verts: Float64Vector, projectedVerts: Float64Vector, uvts: Float64Vector): void {
    m = m; verts = verts; projectedVerts = projectedVerts; uvts = uvts;
    release || notImplemented("public flash.geom.Utils3D::static projectVectors"); return;
  }
  static pointTowards(percent: number, mat: Matrix3D, pos: Vector3D, at: Vector3D = null, up: Vector3D = null): Matrix3D {
    percent = +percent; mat = mat; pos = pos; at = at; up = up;
    release || notImplemented("public flash.geom.Utils3D::static pointTowards"); return;
  }
  
}