import { ASObject } from "../../avm2/nat/ASObject";
import { DataBuffer } from "@awayjs/graphics";
import { Point } from "./Point";
import { Bounds } from "../../base/utilities";
import { Vector3D } from "./Vector3D";
import { Matrix as AwayMatrix } from '@awayjs/core';
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
// Class: Matrix
export class Matrix extends ASObject
{
  private _adaptee:AwayMatrix;

  static axClass: typeof Matrix;

  static classInitializer() {
    this.FROZEN_IDENTITY_MATRIX = Object.freeze(this.axConstruct([]));
    this.TEMP_MATRIX = this.axConstruct([]);
  }
  static classSymbols: string [] = null; // [];
  static instanceSymbols: string [] = null; // ["a", "b", "c", "d", "tx", "ty", "concat",
                                            // "invert", "identity", "createBox",
                                            // "createGradientBox", "rotate", "translate",
                                            // "scale", "deltaTransformPoint", "transformPoint",
                                            // "copyFrom", "setTo", "copyRowTo", "copyColumnTo",
                                            // "copyRowFrom", "copyColumnFrom", "clone",
                                            // "toString"];

                                              
  public get adaptee():AwayMatrix
  {
    return this._adaptee;
  }

  /**
   * The value that affects the positioning of pixels along the <i>x</i> axis
   * when scaling or rotating an image.
   */
  public get a():number
  {
    return this._adaptee.rawData[0];
  }

  public set a(value:number)
  {
    this._adaptee.rawData[0] = value;
  }

  /**
   * The value that affects the positioning of pixels along the <i>y</i> axis
   * when rotating or skewing an image.
   */
  public get b():number
  {
    return this._adaptee.rawData[2];
  }

  public set b(value:number)
  {
    this._adaptee.rawData[2] = value;
  }

  /**
   * The value that affects the positioning of pixels along the <i>x</i> axis
   * when rotating or skewing an image.
   */
  public get c():number
  {
    return this._adaptee.rawData[1];
  }

  public set c(value:number)
  {
    this._adaptee.rawData[1] = value;
  }

  /**
   * The value that affects the positioning of pixels along the <i>y</i> axis
   * when scaling or rotating an image.
   */
  public get d():number
  {
    return this._adaptee.rawData[3];
  }

  public set d(value:number)
  {
    this._adaptee.rawData[3] = value;
  }

  /**
   * The distance by which to translate each point along the <i>x</i> axis.
   */
  public get tx():number
  {
    return this._adaptee.rawData[4];
  }

  public set tx(value:number)
  {
    this._adaptee.rawData[4] = value;
  }

  /**
   * The distance by which to translate each point along the <i>y</i> axis.
   */
  public get ty():number
  {
    return this._adaptee.rawData[5];
  }

  public set ty(value:number)
  {
    this._adaptee.rawData[5] = value;
  }

  /**
   * Creates a new Matrix object with the specified parameters. In matrix
   * notation, the properties are organized like this:
   *
   * <p>If you do not provide any parameters to the <code>new Matrix()</code>
   * constructor, it creates an <i>identity matrix</i> with the following
   * values:</p>
   *
   * <p>In matrix notation, the identity matrix looks like this:</p>
   *
   * @param a  The value that affects the positioning of pixels along the
   *           <i>x</i> axis when scaling or rotating an image.
   * @param b  The value that affects the positioning of pixels along the
   *           <i>y</i> axis when rotating or skewing an image.
   * @param c  The value that affects the positioning of pixels along the
   *           <i>x</i> axis when rotating or skewing an image.
   * @param d  The value that affects the positioning of pixels along the
   *           <i>y</i> axis when scaling or rotating an image..
   * @param tx The distance by which to translate each point along the <i>x</i>
   *           axis.
   * @param ty The distance by which to translate each point along the <i>y</i>
   *           axis.
   */
  constructor(aAdaptee: number | AwayMatrix = 1, b: number = 0, c: number = 0, d: number = 1, tx: number = 0, ty: number = 0)
  {
    super();

    this._adaptee = (aAdaptee instanceof AwayMatrix)? aAdaptee : new AwayMatrix(+aAdaptee, +b, +c, +d, +tx, +ty);
  }

  public static FromUntyped(object: any): Matrix {
    return new Matrix(object.a, object.b, object.c, object.d,
                                          object.tx, object.ty);
  }

  // Keep in sync with writeExternal below!
  public static FromDataBuffer(input: DataBuffer) {
    return new Matrix(input.readFloat(), input.readFloat(),
                                          input.readFloat(), input.readFloat(),
                                          input.readFloat(), input.readFloat());
  }

  public static FROZEN_IDENTITY_MATRIX: Matrix;

  // Must only be used in cases where the members are fully initialized and then directly used.
  public static TEMP_MATRIX: Matrix;

  /**
   * Concatenates a matrix with the current matrix, effectively combining the
   * geometric effects of the two. In mathematical terms, concatenating two
   * matrixes is the same as combining them using matrix multiplication.
   *
   * <p>For example, if matrix <code>m1</code> scales an object by a factor of
   * four, and matrix <code>m2</code> rotates an object by 1.5707963267949
   * radians(<code>Math.PI/2</code>), then <code>m1.concat(m2)</code>
   * transforms <code>m1</code> into a matrix that scales an object by a factor
   * of four and rotates the object by <code>Math.PI/2</code> radians. </p>
   *
   * <p>This method replaces the source matrix with the concatenated matrix. If
   * you want to concatenate two matrixes without altering either of the two
   * source matrixes, first copy the source matrix by using the
   * <code>clone()</code> method, as shown in the Class Examples section.</p>
   *
   * @param matrix The matrix to be concatenated to the source matrix.
   */
  public concat(other: Matrix): void
  {
    this._adaptee.concat(other.adaptee);
  }

  /**
   * Performs the opposite transformation of the original matrix. You can apply
   * an inverted matrix to an object to undo the transformation performed when
   * applying the original matrix.
   */
  public invert(): void
  {
    this._adaptee.invert();
  }

  /**
   * Sets each matrix property to a value that causes a null transformation. An
   * object transformed by applying an identity matrix will be identical to the
   * original.
   *
   * <p>After calling the <code>identity()</code> method, the resulting matrix
   * has the following properties: <code>a</code>=1, <code>b</code>=0,
   * <code>c</code>=0, <code>d</code>=1, <code>tx</code>=0,
   * <code>ty</code>=0.</p>
   *
   * <p>In matrix notation, the identity matrix looks like this:</p>
   *
   */
  public identity(): void {
    this._adaptee.identity();
  }

    /**
   * Includes parameters for scaling, rotation, and translation. When applied
   * to a matrix it sets the matrix's values based on those parameters.
   *
   * <p>Using the <code>createBox()</code> method lets you obtain the same
   * matrix as you would if you applied the <code>identity()</code>,
   * <code>rotate()</code>, <code>scale()</code>, and <code>translate()</code>
   * methods in succession. For example, <code>mat1.createBox(2,2,Math.PI/4,
   * 100, 100)</code> has the same effect as the following:</p>
   *
   * @param scaleX   The factor by which to scale horizontally.
   * @param scaleY   The factor by which scale vertically.
   * @param rotation The amount to rotate, in radians.
   * @param tx       The number of pixels to translate(move) to the right
   *                 along the <i>x</i> axis.
   * @param ty       The number of pixels to translate(move) down along the
   *                 <i>y</i> axis.
   */
  public createBox(scaleX: number, scaleY: number, rotation: number = 0, tx: number = 0, ty: number = 0): void
  {
    this._adaptee.createBox(scaleX, scaleY, rotation, tx, ty);
  }

  
  /**
   * Creates the specific style of matrix expected by the
   * <code>beginGradientFill()</code> and <code>lineGradientStyle()</code>
   * methods of the Graphics class. Width and height are scaled to a
   * <code>scaleX</code>/<code>scaleY</code> pair and the
   * <code>tx</code>/<code>ty</code> values are offset by half the width and
   * height.
   *
   * <p>For example, consider a gradient with the following
   * characteristics:</p>
   *
   * <ul>
   *   <li><code>GradientType.LINEAR</code></li>
   *   <li>Two colors, green and blue, with the ratios array set to <code>[0,
   * 255]</code></li>
   *   <li><code>SpreadMethod.PAD</code></li>
   *   <li><code>InterpolationMethod.LINEAR_RGB</code></li>
   * </ul>
   *
   * <p>The following illustrations show gradients in which the matrix was
   * defined using the <code>createGradientBox()</code> method with different
   * parameter settings:</p>
   *
   * @param width    The width of the gradient box.
   * @param height   The height of the gradient box.
   * @param rotation The amount to rotate, in radians.
   * @param tx       The distance, in pixels, to translate to the right along
   *                 the <i>x</i> axis. This value is offset by half of the
   *                 <code>width</code> parameter.
   * @param ty       The distance, in pixels, to translate down along the
   *                 <i>y</i> axis. This value is offset by half of the
   *                 <code>height</code> parameter.
   */
  public createGradientBox(width: number, height: number, rotation: number = 0, tx: number = 0, ty: number = 0): void
  {
    this._adaptee.createGradientBox(width, height, rotation, tx, ty);
  }

  
  /**
   * Applies a rotation transformation to the Matrix object.
   *
   * <p>The <code>rotate()</code> method alters the <code>a</code>,
   * <code>b</code>, <code>c</code>, and <code>d</code> properties of the
   * Matrix object. In matrix notation, this is the same as concatenating the
   * current matrix with the following:</p>
   *
   * @param angle The rotation angle in radians.
   */
  public rotate(angle: number): void
  {
    this._adaptee.rotate(angle);
  }

  
  /**
   * Translates the matrix along the <i>x</i> and <i>y</i> axes, as specified
   * by the <code>dx</code> and <code>dy</code> parameters.
   *
   * @param dx The amount of movement along the <i>x</i> axis to the right, in
   *           pixels.
   * @param dy The amount of movement down along the <i>y</i> axis, in pixels.
   */
  public translate(dx: number, dy: number): void
  {
    this._adaptee.translate(dx, dy);
  }

  
  /**
   * Applies a scaling transformation to the matrix. The <i>x</i> axis is
   * multiplied by <code>sx</code>, and the <i>y</i> axis it is multiplied by
   * <code>sy</code>.
   *
   * <p>The <code>scale()</code> method alters the <code>a</code> and
   * <code>d</code> properties of the Matrix object. In matrix notation, this
   * is the same as concatenating the current matrix with the following
   * matrix:</p>
   *
   * @param sx A multiplier used to scale the object along the <i>x</i> axis.
   * @param sy A multiplier used to scale the object along the <i>y</i> axis.
   */
  public scale(sx: number, sy: number): void
  {
    this._adaptee.scale(sx, sy);
  }

  /**
   * Given a point in the pretransform coordinate space, returns the
   * coordinates of that point after the transformation occurs. Unlike the
   * standard transformation applied using the <code>transformPoint()</code>
   * method, the <code>deltaTransformPoint()</code> method's transformation
   * does not consider the translation parameters <code>tx</code> and
   * <code>ty</code>.
   *
   * @param point The point for which you want to get the result of the matrix
   *              transformation.
   * @return The point resulting from applying the matrix transformation.
   */
  public deltaTransformPoint(point: Point): Point
  {
    return new Point(this._adaptee.deltaTransformPoint(point.adaptee));
  }

  /**
   * Returns the result of applying the geometric transformation represented by
   * the Matrix object to the specified point.
   *
   * @param point The point for which you want to get the result of the Matrix
   *              transformation.
   * @return The point resulting from applying the Matrix transformation.
   */
  public transformPoint(point: Point): Point
  {
    return new Point(this._adaptee.transformPoint(point.adaptee));
  }
  
  /**
   * Copies all of the matrix data from the source Point object into the
   * calling Matrix object.
   *
   * @param sourceMatrix The Matrix object from which to copy the data.
   */
  public copyFrom(sourceMatrix: Matrix): void
  {
    this._adaptee.copyFrom(sourceMatrix.adaptee);
  }

  /**
   * Sets the members of Matrix to the specified values.
   *
   * @param a  The value that affects the positioning of pixels along the
   *           <i>x</i> axis when scaling or rotating an image.
   * @param b  The value that affects the positioning of pixels along the
   *           <i>y</i> axis when rotating or skewing an image.
   * @param c  The value that affects the positioning of pixels along the
   *           <i>x</i> axis when rotating or skewing an image.
   * @param d  The value that affects the positioning of pixels along the
   *           <i>y</i> axis when scaling or rotating an image..
   * @param tx The distance by which to translate each point along the <i>x</i>
   *           axis.
   * @param ty The distance by which to translate each point along the <i>y</i>
   *           axis.
   */
  public setTo(a: number, b: number, c: number, d: number, tx: number, ty: number): void
  {
    this._adaptee.setTo(a, b, c, d, tx, ty);
  }

  /**
   * Copies specific row of the calling Matrix object into the Vector3D object.
   * The w element of the Vector3D object will not be changed.
   *
   * @param row      The row from which to copy the data from.
   * @param vector3D The Vector3D object from which to copy the data.
   */
  public copyRowTo(row: number, vector3D: Vector3D): void
  {
    this._adaptee.copyRowTo(row, vector3D.adaptee);
  }

  /**
   * Copies specific column of the calling Matrix object into the Vector3D
   * object. The w element of the Vector3D object will not be changed.
   *
   * @param column   The column from which to copy the data from.
   * @param vector3D The Vector3D object from which to copy the data.
   */
  public copyColumnTo(column: number, vector3D: Vector3D): void
  {
    this._adaptee.copyColumnTo(column, vector3D.adaptee);
  }

  
	/**
	 * Copies a Vector3D object into specific row of the calling Matrix object.
	 *
	 * @param row      The row from which to copy the data from.
	 * @param vector3D The Vector3D object from which to copy the data.
	 */
  public copyRowFrom(row: number, vector3D: Vector3D): void
  {
    this._adaptee.copyRowFrom(row, vector3D.adaptee);
  }

	/**
	 * Copies a Vector3D object into specific column of the calling Matrix3D
	 * object.
	 *
	 * @param column   The column from which to copy the data from.
	 * @param vector3D The Vector3D object from which to copy the data.
	 */
  public copyColumnFrom(column: number, vector3D: Vector3D): void
  {
    this._adaptee.copyColumnFrom(column, vector3D.adaptee);
  }

	/**
	 * Returns a new Matrix object that is a clone of this matrix, with an exact
	 * copy of the contained object.
	 *
	 * @return A Matrix object.
	 */
  public clone(): Matrix
  {
    return new Matrix(this._adaptee.clone());
  }

  public toString(): string
  {
    var m = this._adaptee.rawData;

    return "(a=" + m[0] + ", b=" + m[1] + ", c=" + m[2] + ", d=" + m[3] + ", tx=" + m[4] + ", ty=" + m[5] + ")";
  }

  // Keep in sync with static FromDataBuffer above!
  public writeExternal(output: DataBuffer)
  {
    var m = this._adaptee.rawData;

    output.writeFloat(m[0]);
    output.writeFloat(m[1]);
    output.writeFloat(m[2]);
    output.writeFloat(m[3]);
    output.writeFloat(m[4]);
    output.writeFloat(m[5]);
  }
}
