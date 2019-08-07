import { ASObject } from "../../avm2/nat/ASObject";

import { Vector3D as AwayVector3D } from '@awayjs/core';

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
// Class: Vector3D
export class Vector3D extends ASObject
{
  private _adaptee:AwayVector3D;

  static classInitializer() {
    this.X_AXIS = <any>Object.freeze(this.Create(1, 0, 0, 0));
    this.Y_AXIS = <any>Object.freeze(this.Create(1, 0, 0, 0));
    this.Z_AXIS = <any>Object.freeze(this.Create(1, 0, 0, 0));
  }

  static Create(x: number, y: number, z: number, w: number) {
    var v: Vector3D = Object.create(this.tPrototype);
    v.x = x;
    v.y = y;
    v.z = z;
    v.w = w;
    return v;
  }

  public static X_AXIS: Vector3D;
  public static Y_AXIS: Vector3D;
  public static Z_AXIS: Vector3D;

  public get adaptee(): AwayVector3D
  {
    return this._adaptee;
  }

  /**
   * The first element of a Vector3D object, such as the x coordinate of
   * a point in the three-dimensional space. The default value is 0.
   */
  public get x(): number
  {
    return this._adaptee._rawData[0];
  }

  public set x(value: number)
  {
    this._adaptee._rawData[0] = value;
  }

  /*
   *The second element of a Vector3D object, such as the y coordinate of
   * a point in the three-dimensional space. The default value is 0.
   */
  public get y(): number
  {
    return this._adaptee._rawData[1];
  }

  public set y(value: number)
  {
    this._adaptee._rawData[1] = value;
  }

  /**
   * The third element of a Vector3D object, such as the z coordinate of
   * a point in the three-dimensional space. The default value is 0.
   */
  public get z(): number
  {
    return this._adaptee._rawData[2];
  }

  public set z(value: number)
  {
    this._adaptee._rawData[2] = value;
  }

  /**
   * The fourth element of a Vector3D object (in addition to the x, y,
   * and z properties) can hold data such as the angle of rotation. The
   * default value is 0.
   *
   * <p>Quaternion notation employs an angle as the fourth element in
   * its calculation of three-dimensional rotation. The w property can
   * be used to define the angle of rotation about the Vector3D object.
   * The combination of the rotation angle and the coordinates (x,y,z)
   * determines the display object's orientation.</p>
   *
   * <p>In addition, the w property can be used as a perspective warp
   * factor for a projected three-dimensional position or as a projection
   * transform value in representing a three-dimensional coordinate
   * projected into the two-dimensional space. For example, you can
   * create a projection matrix using the <code>Matrix3D.rawData</code>
   * property, that, when applied to a Vector3D object, produces a
   * transform value in the Vector3D object's fourth element (the w
   * property). Dividing the Vector3D object's other elements by the
   * transform value then produces a projected Vector3D object. You can
   * use the <code>Vector3D.project()</code> method to divide the first
   * three elements of a Vector3D object by its fourth element.</p>
   */
  public get w(): number
  {
    return this._adaptee._rawData[3];
  }

  public set w(value: number)
  {
    this._adaptee._rawData[3] = value;
  }

  /**
   * The length, magnitude, of the current Vector3D object from the
   * origin (0,0,0) to the object's x, y, and z coordinates. The w
   * property is ignored. A unit vector has a length or magnitude of
   * one.
   */
  public get length(): number
  {
    return this._adaptee.length;
  }

  /**
   * The square of the length of the current Vector3D object, calculated
   * using the x, y, and z properties. The w property is ignored. Use the
   * <code>lengthSquared()</code> method whenever possible instead of the
   * slower <code>Math.sqrt()</code> method call of the
   * <code>Vector3D.length()</code> method.
   */
  public get lengthSquared(): number
  {
    return this._adaptee.lengthSquared;
  }

  /**
   * Creates an instance of a Vector3D object. If you do not specify a
   * parameter for the constructor, a Vector3D object is created with
   * the elements (0,0,0,0).
   *
   * @param x The first element, such as the x coordinate.
   * @param y The second element, such as the y coordinate.
   * @param z The third element, such as the z coordinate.
   * @param w An optional element for additional data such as the angle
   *          of rotation.
   */
  constructor (xAdaptee: number | AwayVector3D = 0, y: number = 0, z: number = 0, w: number = 0)
  {
    super();

    this._adaptee = (xAdaptee instanceof AwayVector3D)? xAdaptee : new AwayVector3D(+xAdaptee, +y, +z, +w);
  }

  /**
   * Returns the angle in radians between two vectors. The returned angle
   * is the smallest radian the first Vector3D object rotates until it
   * aligns with the second Vector3D object.
   *
   * <p>The <code>angleBetween()</code> method is a static method. You
   * can use it directly as a method of the Vector3D class.</p>
   *
   * <p>To convert a degree to a radian, you can use the following
   * formula:</p>
   *
   * <p><code>radian = Math.PI/180 * degree</code></p>
   *
   * @param a The first Vector3D object.
   * @param b The second Vector3D object.
   * @returns The angle between two Vector3D objects.
   */
  public static angleBetween(a: Vector3D, b: Vector3D): number
  {
    return AwayVector3D.angleBetween(a.adaptee, b.adaptee);
  }

  /**
   * Returns the distance between two Vector3D objects. The
   * <code>distance()</code> method is a static method. You can use it
   * directly as a method of the Vector3D export class to get the Euclidean
   * distance between two three-dimensional points.
   *
   * @param pt1 A Vector3D object as the first three-dimensional point.
   * @param pt2 A Vector3D object as the second three-dimensional point.
   * @returns The distance between two Vector3D objects.
   */
  public static distance(pt1: Vector3D, pt2: Vector3D): number
  {
    return AwayVector3D.distance(pt1.adaptee, pt2.adaptee);
  }

  /**
   * If the current Vector3D object and the one specified as the
   * parameter are unit vertices, this method returns the cosine of the
   * angle between the two vertices. Unit vertices are vertices that
   * point to the same direction but their length is one. They remove the
   * length of the vector as a factor in the result. You can use the
   * <code>normalize()</code> method to convert a vector to a unit
   * vector.
   *
   * <p>The <code>dotProduct()</code> method finds the angle between two
   * vertices. It is also used in backface culling or lighting
   * calculations. Backface culling is a procedure for determining which
   * surfaces are hidden from the viewpoint. You can use the normalized
   * vertices from the camera, or eye, viewpoint and the cross product of
   * the vertices of a polygon surface to get the dot product. If the dot
   * product is less than zero, then the surface is facing the camera or
   * the viewer. If the two unit vertices are perpendicular to each
   * other, they are orthogonal and the dot product is zero. If the two
   * vertices are parallel to each other, the dot product is one.</p>
   *
   * @param a The second Vector3D object.
   * @returns A scalar which is the dot product of the current Vector3D
   *          object and the specified Vector3D object.
   */
  public dotProduct(a: Vector3D): number
  {
    return this._adaptee.dotProduct(a.adaptee);
  }

  /**
   * Returns a new Vector3D object that is perpendicular (at a right
   * angle) to the current Vector3D and another Vector3D object. If the
   * returned Vector3D object's coordinates are (0,0,0), then the two
   * Vector3D objects are parallel to each other.
   *
   * <p>You can use the normalized cross product of two vertices of a
   * polygon surface with the normalized vector of the camera or eye
   * viewpoint to get a dot product. The value of the dot product can
   * identify whether a surface of a three-dimensional object is hidden
   * from the viewpoint.</p>
   *
   * @param a A second Vector3D object.
   * @returns A new Vector3D object that is perpendicular to the current
   *          Vector3D object and the Vector3D object specified as the
   *          parameter.
   */
  public crossProduct(a: Vector3D): Vector3D
  {
    return new Vector3D(this._adaptee.crossProduct(a.adaptee));
  }

  
  /**
   * Converts a Vector3D object to a unit vector by dividing the first
   * three elements (x, y, z) by the length of the vector. Unit vertices
   * are vertices that have a direction but their length is one. They
   * simplify vector calculations by removing length as a factor.
   */
  public normalize(): number
  {
    return this._adaptee.normalize();
  }

  /**
   * Scales the current Vector3D object by a scalar, a magnitude. The
   * Vector3D object's x, y, and z elements are multiplied by the scalar
   * number specified in the parameter. For example, if the vector is
   * scaled by ten, the result is a vector that is ten times longer. The
   * scalar can also change the direction of the vector. Multiplying the
   * vector by a negative number reverses its direction.
   *
   * @param s A multiplier (scalar) used to scale a Vector3D object.
   */
  public scaleBy(s: number): void
  {
    this._adaptee.scaleBy(+s);
  }

  /**
   * Increments the value of the x, y, and z elements of the current
   * Vector3D object by the values of the x, y, and z elements of a
   * specified Vector3D object. Unlike the <code>Vector3D.add()</code>
   * method, the <code>incrementBy()</code> method changes the current
   * Vector3D object and does not return a new Vector3D object.
   *
   * @param a The Vector3D object to be added to the current Vector3D
   *          object.
   */
  public incrementBy(a: Vector3D): void
  {
    this._adaptee.incrementBy(a.adaptee);
  }

  /**
   * Decrements the value of the x, y, and z elements of the current
   * Vector3D object by the values of the x, y, and z elements of
   * specified Vector3D object. Unlike the
   * <code>Vector3D.subtract()</code> method, the
   * <code>decrementBy()</code> method changes the current Vector3D
   * object and does not return a new Vector3D object.
   *
   * @param a The Vector3D object containing the values to subtract from
   *          the current Vector3D object.
   */
  public decrementBy(a: Vector3D): void
  {
    this._adaptee.decrementBy(a.adaptee);
  }
  
  /**
   * Adds the value of the x, y, and z elements of the current Vector3D
   * object to the values of the x, y, and z elements of another Vector3D
   * object. The <code>add()</code> method does not change the current
   * Vector3D object. Instead, it returns a new Vector3D object with
   * the new values.
   *
   * <p>The result of adding two vectors together is a resultant vector.
   * One way to visualize the result is by drawing a vector from the
   * origin or tail of the first vector to the end or head of the second
   * vector. The resultant vector is the distance between the origin
   * point of the first vector and the end point of the second vector.
   * </p>
   */
  public add(a: Vector3D): Vector3D
  {
    return new Vector3D(this._adaptee.add(a.adaptee));
  }

  /**
   * Subtracts the value of the x, y, and z elements of the current
   * Vector3D object from the values of the x, y, and z elements of
   * another Vector3D object. The <code>subtract()</code> method does not
   * change the current Vector3D object. Instead, this method returns a
   * new Vector3D object with the new values.
   *
   * @param a The Vector3D object to be subtracted from the current
   *          Vector3D object.
   * @returns A new Vector3D object that is the difference between the
   *          current Vector3D and the specified Vector3D object.
   */
  public subtract(a: Vector3D): Vector3D
  {
    return new Vector3D(this._adaptee.subtract(a.adaptee));
  }

  /**
   * Sets the current Vector3D object to its inverse. The inverse object
   * is also considered the opposite of the original object. The value of
   * the x, y, and z properties of the current Vector3D object is changed
   * to -x, -y, and -z.
   */
  public negate(): void
  {
    this._adaptee.negate();
  }

  /**
   * Determines whether two Vector3D objects are equal by comparing the
   * x, y, and z elements of the current Vector3D object with a
   * specified Vector3D object. If the values of these elements are the
   * same, the two Vector3D objects are equal. If the second optional
   * parameter is set to true, all four elements of the Vector3D objects,
   * including the w property, are compared.
   *
   * @param toCompare The Vector3D object to be compared with the current
   *                  Vector3D object.
   * @param allFour   An optional parameter that specifies whether the w
   *                  property of the Vector3D objects is used in the
   *                  comparison.
   * @returns A value of true if the specified Vector3D object is equal
   *          to the current Vector3D object; false if it is not equal.
   */
  public equals(toCompare: Vector3D, allFour?: boolean): boolean
  {
    return this._adaptee.equals(toCompare.adaptee, allFour);
  }

  /**
   * Compares the elements of the current Vector3D object with the
   * elements of a specified Vector3D object to determine whether they
   * are nearly equal. The two Vector3D objects are nearly equal if the
   * value of all the elements of the two vertices are equal, or the
   * result of the comparison is within the tolerance range. The
   * difference between two elements must be less than the number
   * specified as the tolerance parameter. If the third optional
   * parameter is set to <code>true</code>, all four elements of the
   * Vector3D objects, including the <code>w</code> property, are
   * compared. Otherwise, only the x, y, and z elements are included in
   * the comparison.
   *
   * @param toCompare The Vector3D object to be compared with the current
   *                  Vector3D object.
   * @param tolerance A number determining the tolerance factor. If the
   *                  difference between the values of the Vector3D
   *                  element specified in the toCompare parameter and
   *                  the current Vector3D element is less than the
   *                  tolerance number, the two values are considered
   *                  nearly equal.
   * @param allFour   An optional parameter that specifies whether the w
   *                  property of the Vector3D objects is used in the
   *                  comparison.
   * @returns A value of true if the specified Vector3D object is nearly
   *          equal to the current Vector3D object; false if it is not
   *          equal.
   */
  public nearEquals(toCompare: Vector3D, tolerance: number, allFour?: boolean): boolean
  {
    return this._adaptee.nearEquals(toCompare.adaptee, tolerance, allFour);
  }
  
  /**
   * Divides the value of the <code>x</code>, <code>y</code>, and
   * <code>z</code> properties of the current Vector3D object by the
   * value of its <code>w</code> property.
   *
   * <p>If the current Vector3D object is the result of multiplying a
   * Vector3D object by a projection Matrix3D object, the w property can
   * hold the transform value. The <code>project()</code> method then can
   * complete the projection by dividing the elements by the
   * <code>w</code> property. Use the <code>Matrix3D.rawData</code>
   * property to create a projection Matrix3D object.</p>
   */
  public project(): void
  {
    this._adaptee.project();
  }

  /**
   * Copies all of vector data from the source Vector3D object into the
   * calling Vector3D object.
   *
   * @param sourceVector3D The Vector3D object from which to copy the data.
   */
  public copyFrom(sourceVector3D: Vector3D): void
  {
    this._adaptee.copyFrom(sourceVector3D.adaptee);
  }

  /**
   * Sets the members of Vector3D to the specified values
   *
   * @param xa The first element, such as the x coordinate.
   * @param ya The second element, such as the y coordinate.
   * @param za The third element, such as the z coordinate.
   */
  public setTo(xa: number, ya: number, za: number): void
  {
    this._adaptee.setTo(xa, ya, za);
  }

  /**
   * Returns a new Vector3D object that is an exact copy of the current
   * Vector3D object.
   *
   * @returns A new Vector3D object that is a copy of the current
   * Vector3D object.
   */
  public clone(): Vector3D
  {
    return new Vector3D(this._adaptee.clone());
  }

  public toString(): string
  {
    return "Vector3D(" + this.x + ", " + this.y + ", " + this.z + ")";
  }
}