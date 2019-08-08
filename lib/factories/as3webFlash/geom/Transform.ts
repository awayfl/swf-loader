import { ASObject } from "../../avm2/nat/ASObject";
import { Errors } from "../../avm2/errors";
import { Matrix } from "./Matrix";
import { ColorTransform } from "./ColorTransform";
import { Rectangle } from "./Rectangle";
import { Matrix3D } from "./Matrix3D";
import { release, somewhatImplemented, notImplemented } from "../../base/utilities/Debug";
import { checkNullParameter } from "../../avm2/run/checkNullParameter";
import { PerspectiveProjection } from "./PerspectiveProjection";
import { DisplayObject } from '../display/DisplayObject';

import { Transform as AwayTransform } from '@awayjs/core';

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
// Class: Transform
export class Transform extends ASObject
{
  private _adaptee:AwayTransform;

  static classInitializer: any = null;

  public get adaptee():AwayTransform
  {
    return this._adaptee;
  }

  constructor (displayObjectAdaptee: DisplayObject | AwayTransform)
  {
    super();

    if (!displayObjectAdaptee)
      this.sec.throwError("ArgumentError", Errors.NullPointerError, "displayObject");

    this._adaptee = (displayObjectAdaptee instanceof AwayTransform)? displayObjectAdaptee : new AwayTransform();
    this._adaptee.avm2Adapter=this;
  }

  public get matrix(): Matrix
  {
    return new Matrix(this._adaptee.matrix);
  }

  public set matrix(value: Matrix)
  {
    this._adaptee.matrix = value.adaptee;
  }

  public get colorTransform(): ColorTransform
  {
    return new ColorTransform(this._adaptee.colorTransform);
  }

  public set colorTransform(value: ColorTransform)
  {
    this._adaptee.colorTransform = value.adaptee;
  }

  public get concatenatedMatrix(): Matrix
  {
    return new Matrix(this._adaptee.matrix);
  }

  public get concatenatedColorTransform(): ColorTransform
  {
    release || notImplemented("public flash.geom.Transform::get concatenatedColorTransform");

    return new ColorTransform(this._adaptee.colorTransform);
  }

  public get pixelBounds(): Rectangle
  {
    // Only somewhat implemented because this is largely untested.
    release || notImplemented("public flash.geom.Transform::get pixelBounds");

    return new Rectangle(this._adaptee.pixelBounds);
  }

  public get matrix3D(): Matrix3D
  {
    return new Matrix3D(this._adaptee.matrix3D);
  }

  public set matrix3D(m: Matrix3D)
  {
    release || notImplemented("public flash.geom.Transform::set matrix3D");
  }

  public getRelativeMatrix3D(relativeTo: DisplayObject): Matrix3D
  {
    checkNullParameter(relativeTo, "relativeTo", this.sec);
    release || notImplemented("public flash.geom.Transform::getRelativeMatrix3D");

    // TODO: actually calculate the relative matrix.
    return new Matrix3D(this._adaptee.matrix3D);
  }

  public get perspectiveProjection(): PerspectiveProjection
  {
    release || notImplemented("public flash.geom.Transform::get perspectiveProjection");

    return new PerspectiveProjection();
  }

  public set perspectiveProjection(projection: PerspectiveProjection)
  {
    release || notImplemented("public flash.geom.Transform::set perspectiveProjection");
  }
}
