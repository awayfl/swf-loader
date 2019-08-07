import { ASObject } from "../../avm2/nat/ASObject";

import { Orientation3D as AwayOrientation3D } from '@awayjs/core';

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
// Class: Orientation3D
export class Orientation3D extends ASObject
{
  
  // Called whenever the class is initialized.
  static classInitializer: any = null;

  // List of static symbols to link.
  static classSymbols: string [] = null; // [];
  
  // List of instance symbols to link.
  static instanceSymbols: string [] = null; // [];
  
  constructor ()
  {
    super();
  }
  
  // JS -> AS Bindings
  public static EULER_ANGLES: string = AwayOrientation3D.EULER_ANGLES;
  public static AXIS_ANGLE: string = AwayOrientation3D.AXIS_ANGLE;
  public static QUATERNION: string = AwayOrientation3D.QUATERNION;
  
  
  // AS -> JS Bindings
  
}
