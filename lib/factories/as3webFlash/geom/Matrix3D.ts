import { Vector3D } from "./Vector3D";
import { ASObject } from "../../avm2/nat/ASObject";
import { ISecurityDomain } from "../../avm2/nat/ISecurityDomain";
import { notImplemented, release, somewhatImplemented } from "../../base/utilities/Debug";
import { Errors } from "../../avm2/errors";
import { axCoerceString, assert } from "@awayjs/graphics";
import { Float64Vector } from "../../avm2/natives/float64Vector";
import { Matrix3D as AwayMatrix3D } from '@awayjs/core';
import { GenericVector } from '../../avm2/natives/GenericVector';

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
// Class: Matrix3D
/*
  * _matrix stores data by columns
  *  | 0  4  8  12 |
  *  | 1  5  9  13 |
  *  | 2  6 10  14 |
  *  | 3  7 11  15 |
  */

var transposeTransform = new Uint32Array([
  0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15
]);

export class Matrix3D extends ASObject
{
  private _adaptee:AwayMatrix3D;

  static classInitializer = null;

  static axClass: typeof Matrix3D;

  public get adaptee():AwayMatrix3D
  {
    return this._adaptee;
  }

  constructor (v: Float64Vector | AwayMatrix3D = null)
  {
    super();

    if (v instanceof AwayMatrix3D) {
      this._adaptee = v;
    } else {
      this._adaptee = new AwayMatrix3D();

      if (v && v.length >= 16) {
        this.copyRawDataFrom(v, 0, false);
      } else {
        this.identity();
      }
    }
  }
  
  static interpolate(thisMat: Matrix3D, toMat: Matrix3D, percent: number): Matrix3D {
    thisMat = thisMat; toMat = toMat; percent = +percent;
    release || notImplemented("public flash.geom.Matrix3D::static interpolate"); return;
  }

  public get rawData(): Float64Vector
  {
    var result: Float64Vector = new this.sec.Float64Vector();
    this.copyRawDataTo(result, 0, false);
    return result;
  }

  public set rawData(v: Float64Vector)
  {
    this.copyRawDataFrom(v, 0, false);
  }

  public get position(): Vector3D
  {
    return new this.sec.flash.geom.Vector3D(this._adaptee.position);
  }

  public set position(pos: Vector3D)
  {
    this.copyColumnFrom(3, pos);
  }

  public get determinant(): number
  {
    return this._adaptee.determinant;
  }

  public clone(): Matrix3D
  {
    return new this.sec.flash.geom.Matrix3D(this._adaptee.clone());
  }

  public copyToMatrix3D(dest: Matrix3D): void
  {
    this._adaptee.copyTo(dest.adaptee);
  }

  public append(lhs: Matrix3D): void 
  {
    this._adaptee.append(lhs.adaptee);
  }

  public prepend(rhs: Matrix3D): void
  {
    this._adaptee.prepend(rhs.adaptee);
  }

  public invert(): boolean
  {
    return this._adaptee.invert();
  }

  public identity(): void
  {
    this._adaptee.identity();
  }

  public decompose(orientationStyle: string = "eulerAngles"): GenericVector
  {
    this._adaptee.decompose(orientationStyle);

    orientationStyle = axCoerceString(orientationStyle);
    release || notImplemented("public flash.geom.Matrix3D::decompose"); return;
  }

  public recompose(components: Float64Vector, orientationStyle: string = "eulerAngles"): boolean
  {
    //this._adaptee.recompose()
    orientationStyle = axCoerceString(orientationStyle);
    release || notImplemented("public flash.geom.Matrix3D::recompose"); return;
  }

  public appendTranslation(x: number, y: number, z: number): void
  {
    this._adaptee.appendTranslation(+x, +y, +z);
  }

  public appendRotation(degrees: number, axis: Vector3D, pivotPoint: Vector3D = null): void
  {
    release || somewhatImplemented("public flash.geom.Matrix3D::appendRotation");

    this._adaptee.appendRotation(+degrees, axis.adaptee);
  }

  public appendScale(xScale: number, yScale: number, zScale: number): void
  {
    this._adaptee.appendScale(+xScale, +yScale, +zScale);
  }

  public prependTranslation(x: number, y: number, z: number): void
  {
    this._adaptee.prependTranslation(+x, +y, +z);
  }

  public prependRotation(degrees: number, axis: Vector3D, pivotPoint: Vector3D = null): void
  {
    release || somewhatImplemented("public flash.geom.Matrix3D::prependRotation");

    this._adaptee.prependRotation(+degrees, axis.adaptee);
  }

  public prependScale(xScale: number, yScale: number, zScale: number): void
  {
    this._adaptee.prependScale(+xScale, +yScale, +zScale);
  }

  public transformVector(v: Vector3D): Vector3D
  {
    return new this.sec.flash.geom.Vector3D(this._adaptee.transformVector(v.adaptee));
  }

  public deltaTransformVector(v: Vector3D): Vector3D
  {
    return new this.sec.flash.geom.Vector3D(this._adaptee.deltaTransformVector(v.adaptee));
  }

  public transformVectors(vin: Float64Vector, vout: Float64Vector): void
  {
    var m:Float32Array = this._adaptee._rawData;
    var m11 = m[0], m12 = m[4], m13 = m[8 ], m14 = m[12],
        m21 = m[1], m22 = m[5], m23 = m[9 ], m24 = m[13],
        m31 = m[2], m32 = m[6], m33 = m[10], m34 = m[14];

    for (var i = 0; i < vin.length - 2; i += 3) {
      var x = vin.axGetNumericProperty(i),
          y = vin.axGetNumericProperty(i + 1),
          z = vin.axGetNumericProperty(i + 2);
      vout.push(m11 * x + m12 * y + m13 * z + m14);
      vout.push(m21 * x + m22 * y + m23 * z + m24);
      vout.push(m31 * x + m32 * y + m33 * z + m34);
    }
  }

  public transpose(): void
  {
    this._adaptee.transpose();
  }

  public pointAt(pos: Vector3D, at: Vector3D = null, up: Vector3D = null): void
  {
    pos = pos; at = at; up = up;
    release || notImplemented("public flash.geom.Matrix3D::pointAt"); return;
  }

  public interpolateTo(toMat: Matrix3D, percent: number): void
  {
    toMat = toMat; percent = +percent;
    release || notImplemented("public flash.geom.Matrix3D::interpolateTo"); return;
  }

  public copyFrom(sourceMatrix3D: Matrix3D): void
  {
    this._adaptee.copyFrom(sourceMatrix3D.adaptee);
  }

  public copyRawDataTo(vector: Float64Vector, index: number /*uint*/ = 0, transpose: boolean = false): void
  {
    vector = vector; index = index >>> 0; transpose = !!transpose;
    var m:Float32Array = this._adaptee._rawData;
    if (transpose) {
      for (var i = 0, j = index | 0; i < 16; i++, j++) {
        vector.axSetNumericProperty(j, m[transposeTransform[i]]);
      }
    } else {
      for (var i = 0, j = index | 0; i < 16; i++, j++) {
        vector.axSetNumericProperty(j, m[i]);
      }
    }
  }

  public copyRawDataFrom(vector: Float64Vector, index: number /*uint*/ = 0, transpose: boolean = false): void
  {
    vector = vector; index = index >>> 0; transpose = !!transpose;
    var m = this._adaptee._rawData;
    if (transpose) {
      for (var i = 0, j = index | 0; i < 16; i++, j++) {
        m[transposeTransform[i]] = vector.axGetNumericProperty(j) || 0; // removing NaN
      }
    } else {
      for (var i = 0, j = index | 0; i < 16; i++, j++) {
        m[i] = vector.axGetNumericProperty(j) || 0; // removing NaN
      }
    }
  }

  public copyRowTo(row: number /*uint*/, vector3D: Vector3D): void
  {
    this._adaptee.copyRowTo(row >>> 0, vector3D.adaptee);
  }

  public copyColumnTo(column: number /*uint*/, vector3D: Vector3D): void
  {
    this._adaptee.copyColumnTo(column >>> 0, vector3D.adaptee);
  }

  public copyRowFrom(row: number /*uint*/, vector3D: Vector3D): void
  {
    this._adaptee.copyRowFrom(row >>> 0, vector3D.adaptee);
  }

  public copyColumnFrom(column: number /*uint*/, vector3D: Vector3D): void
  {
    this._adaptee.copyColumnFrom(column >>> 0, vector3D.adaptee);
  }
}