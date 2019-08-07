import { ASObject } from "../../avm2/nat/ASObject";

import { Point as AwayPoint } from '@awayjs/core';

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
// Class: Point
export class Point extends ASObject
{
  private _adaptee:AwayPoint;

  // Called whenever the class is initialized.
  static classInitializer: any = null;

  // List of static symbols to link.
  static classSymbols: string [] = null; // ["interpolate", "distance", "polar"];

  // List of instance symbols to link.
  static instanceSymbols: string [] = null; // ["x", "y", "length", "clone", "offset", "equals", "subtract", "add", "normalize", "copyFrom", "setTo", "toString"];
                                         
  public get adaptee():AwayPoint
  {
    return this._adaptee;
  }

  /**
   * The horizontal coordinate of the point. The default value is 0.
   */
  public get x():number
  {
    return this._adaptee._rawData[0];
  }

  public set x(value:number)
  {
    this._adaptee._rawData[0] = value;
  }

  /**
   * The vertical coordinate of the point. The default value is 0.
   */
  public get y():number
  {
    return this._adaptee._rawData[1];
  }

  public set y(value:number)
  {
    this._adaptee._rawData[1] = value;
  }

  /**
   * The length of the line segment from(0,0) to this point.
   */
  public get length(): number
  {
    return this._adaptee.length;
  }

  /**
   * Creates a new point. If you pass no parameters to this method, a point is
   * created at(0,0).
   *
   * @param x The horizontal coordinate.
   * @param y The vertical coordinate.
   */
  constructor(xAdaptee: number | AwayPoint = 0, y: number = 0)
  {
    super();

    this._adaptee = (xAdaptee instanceof AwayPoint)? xAdaptee : new AwayPoint(+xAdaptee, +y);
  }

  /**
   * Determines a point between two specified points. The parameter
   * <code>f</code> determines where the new interpolated point is located
   * relative to the two end points specified by parameters <code>pt1</code>
   * and <code>pt2</code>. The closer the value of the parameter <code>f</code>
   * is to <code>1.0</code>, the closer the interpolated point is to the first
   * point(parameter <code>pt1</code>). The closer the value of the parameter
   * <code>f</code> is to 0, the closer the interpolated point is to the second
   * point(parameter <code>pt2</code>).
   *
   * @param pt1 The first point.
   * @param pt2 The second point.
   * @param f   The level of interpolation between the two points. Indicates
   *            where the new point will be, along the line between
   *            <code>pt1</code> and <code>pt2</code>. If <code>f</code>=1,
   *            <code>pt1</code> is returned; if <code>f</code>=0,
   *            <code>pt2</code> is returned.
   * @return The new, interpolated point.
   */
  public static interpolate(pt1: Point, pt2: Point, f: number): Point
  {
    return new Point(AwayPoint.interpolate(pt1.adaptee, pt2.adaptee, f));
  }

  /**
   * Returns the distance between <code>pt1</code> and <code>pt2</code>.
   *
   * @param pt1 The first point.
   * @param pt2 The second point.
   * @return The distance between the first and second points.
   */
  public static distance(pt1: Point, pt2: Point): number
  {
    return AwayPoint.distance(pt1.adaptee, pt2.adaptee);
  }

  /**
   * Converts a pair of polar coordinates to a Cartesian point coordinate.
   *
   * @param len   The length coordinate of the polar pair.
   * @param angle The angle, in radians, of the polar pair.
   * @return The Cartesian point.
   */
  public static polar(len: number, angle: number): Point
  {
    return new Point(AwayPoint.polar(+len, +angle));
  }

  /**
   * Creates a copy of this Point object.
   *
   * @return The new Point object.
   */
  public clone(): Point
  {
    return new Point(this._adaptee.clone());
  }

  /**
   * Offsets the Point object by the specified amount. The value of
   * <code>dx</code> is added to the original value of <i>x</i> to create the
   * new <i>x</i> value. The value of <code>dy</code> is added to the original
   * value of <i>y</i> to create the new <i>y</i> value.
   *
   * @param dx The amount by which to offset the horizontal coordinate,
   *           <i>x</i>.
   * @param dy The amount by which to offset the vertical coordinate, <i>y</i>.
   */
  public offset(dx: number, dy: number): void
  {
    this._adaptee.offset(dx, dy);
  }

  /**
   * Determines whether two points are equal. Two points are equal if they have
   * the same <i>x</i> and <i>y</i> values.
   *
   * @param toCompare The point to be compared.
   * @return A value of <code>true</code> if the object is equal to this Point
   *         object; <code>false</code> if it is not equal.
   */
  public equals(toCompare: Point): boolean
  {
    return this._adaptee.equals(toCompare.adaptee);
  }

  /**
   * Subtracts the coordinates of another point from the coordinates of this
   * point to create a new point.
   *
   * @param v The point to be subtracted.
   * @return The new point.
   */
  public subtract(v: Point): Point
  {
    return new Point(this._adaptee.subtract(v.adaptee));
  }


  /**
   * Adds the coordinates of another point to the coordinates of this point to
   * create a new point.
   *
   * @param v The point to be added.
   * @return The new point.
   */
  public add(v: Point): Point
  {
    return new Point(this._adaptee.add(v.adaptee));
  }

  /**
   * Scales the line segment between(0,0) and the current point to a set
   * length.
   *
   * @param thickness The scaling value. For example, if the current point is
   *                 (0,5), and you normalize it to 1, the point returned is
   *                  at(0,1).
   */
  public normalize(thickness: number = 1): void
  {
    this._adaptee.normalize(+thickness);
  }

  public copyFrom(sourcePoint: Point): void
  {
    this._adaptee.copyFrom(sourcePoint.adaptee);
  }

  public setTo(x: number, y: number): void
  {
    this._adaptee.setTo(x, y);
  }

  public toString(): string
  {
    return "(x=" + this.x + ", y=" + this.y + ")";
  }
}