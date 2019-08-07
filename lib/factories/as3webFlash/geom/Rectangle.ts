import { ASObject } from "../../avm2/nat/ASObject";
import { Bounds } from "../../base/utilities";
import { Point } from "./Point";
import { IExternalizable } from "../utils/IExternalizable";

import { Rectangle as AwayRectangle } from '@awayjs/core';
import { IDataInput } from '../utils/IDataInput';
import { IDataOutput } from '../utils/IDataOutput';

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
// Class: Rectangle

export class Rectangle extends ASObject implements IExternalizable
{
  private _adaptee:AwayRectangle;

  static axClass: typeof Rectangle;

  // Called whenever the class is initialized.
  static classInitializer: any = null;

  // List of static symbols to link.
  static classSymbols: string [] = null; // [];

  // List of instance symbols to link.
  static instanceSymbols: string [] = null;

  public get adaptee():AwayRectangle
  {
    return this._adaptee;
  }

	/**
	 * The height of the rectangle, in pixels. Changing the <code>height</code>
	 * value of a Rectangle object has no effect on the <code>x</code>,
	 * <code>y</code>, and <code>width</code> properties.
	 */
	public get height():number
	{
		return   this._adaptee._rawData[3];
	}

	public set height(value:number)
	{
		  this._adaptee._rawData[3] = +value;
	}

	/**
	 * The width of the rectangle, in pixels. Changing the <code>width</code>
	 * value of a Rectangle object has no effect on the <code>x</code>,
	 * <code>y</code>, and <code>height</code> properties.
	 */
	public get width():number
	{
		return   this._adaptee._rawData[2];
	}

	public set width(value:number)
	{
		  this._adaptee._rawData[2] = +value;
	}

	/**
	 * The <i>x</i> coordinate of the top-left corner of the rectangle. Changing
	 * the value of the <code>x</code> property of a Rectangle object has no
	 * effect on the <code>y</code>, <code>width</code>, and <code>height</code>
	 * properties.
	 *
	 * <p>The value of the <code>x</code> property is equal to the value of the
	 * <code>left</code> property.</p>
	 */
	public get x():number
	{
		return   this._adaptee._rawData[0];
	}

	public set x(value:number)
	{
		  this._adaptee._rawData[0] = +value;
	}

	/**
	 * The <i>y</i> coordinate of the top-left corner of the rectangle. Changing
	 * the value of the <code>y</code> property of a Rectangle object has no
	 * effect on the <code>x</code>, <code>width</code>, and <code>height</code>
	 * properties.
	 *
	 * <p>The value of the <code>y</code> property is equal to the value of the
	 * <code>top</code> property.</p>
	 */
	public get y():number
	{
		return   this._adaptee._rawData[1];
	}

	public set y(value:number)
	{
		  this._adaptee._rawData[1] = +value;
	}

	/**
	 * The sum of the <code>y</code> and <code>height</code> properties.
	 */
	public get bottom():number
	{
		return this._adaptee.bottom;
	}

	public set bottom(value:number)
	{
		this._adaptee.bottom = +value;
	}

	/**
	 * The location of the Rectangle object's bottom-right corner, determined by
	 * the values of the <code>right</code> and <code>bottom</code> properties.
	 */
	public get bottomRight():Point
	{
		return new Point(this._adaptee.bottomRight);
	}

  public set bottomRight(value: Point)
  {
    this.bottom = value.y;
    this.right = value.x;
  }

	/**
	 * The <i>x</i> coordinate of the top-left corner of the rectangle. Changing
	 * the <code>left</code> property of a Rectangle object has no effect on the
	 * <code>y</code> and <code>height</code> properties. However it does affect
	 * the <code>width</code> property, whereas changing the <code>x</code> value
	 * does <i>not</i> affect the <code>width</code> property.
	 *
	 * <p>The value of the <code>left</code> property is equal to the value of
	 * the <code>x</code> property.</p>
	 */
	public get left():number
	{
		return this._adaptee.left;
	}

	public set left(value:number)
	{
		this._adaptee.left = +value;
	}

	/**
	 * The sum of the <code>x</code> and <code>width</code> properties.
	 */
	public get right():number
	{
		return this._adaptee.right;
	}

	public set right(value:number)
	{
		this._adaptee.right = +value;
	}

	/**
	 * The size of the Rectangle object, expressed as a Point object with the
	 * values of the <code>width</code> and <code>height</code> properties.
	 */
	public get size():Point
	{
		return new Point(this._adaptee.size);
	}

  public set size(value: Point)
  {
    this.width = value.x;
    this.height = value.y;
  }

	/**
	 * The <i>y</i> coordinate of the top-left corner of the rectangle. Changing
	 * the <code>top</code> property of a Rectangle object has no effect on the
	 * <code>x</code> and <code>width</code> properties. However it does affect
	 * the <code>height</code> property, whereas changing the <code>y</code>
	 * value does <i>not</i> affect the <code>height</code> property.
	 *
	 * <p>The value of the <code>top</code> property is equal to the value of the
	 * <code>y</code> property.</p>
	 */
	public get top():number
	{
		return this._adaptee.top;
	}

	public set top(value:number)
	{
		this._adaptee.top = +value;
	}

	/**
	 * The location of the Rectangle object's top-left corner, determined by the
	 * <i>x</i> and <i>y</i> coordinates of the point.
	 */
	public get topLeft():Point
	{
    return new Point(this._adaptee.topLeft);
	}

  public set topLeft(value: Point)
  {
    this.top = value.y;
    this.left = value.x;
  }

  public get area(): number
  {
    return this.width*this.height;
  }

	/**
	 * Creates a new Rectangle object with the top-left corner specified by the
	 * <code>x</code> and <code>y</code> parameters and with the specified
	 * <code>width</code> and <code>height</code> parameters. If you call this
	 * public without parameters, a rectangle with <code>x</code>,
	 * <code>y</code>, <code>width</code>, and <code>height</code> properties set
	 * to 0 is created.
	 *
	 * @param x      The <i>x</i> coordinate of the top-left corner of the
	 *               rectangle.
	 * @param y      The <i>y</i> coordinate of the top-left corner of the
	 *               rectangle.
	 * @param width  The width of the rectangle, in pixels.
	 * @param height The height of the rectangle, in pixels.
	 */
  constructor(xAdaptee: number | AwayRectangle = 0, y: number = 0, width: number = 0, height: number = 0)
  {
    super();

    this._adaptee = (xAdaptee instanceof AwayRectangle)? xAdaptee : new AwayRectangle(+xAdaptee, +y, +width, +height);
  }

  public static FromBounds(bounds: Bounds): Rectangle {
    var xMin = bounds.xMin;
    var yMin = bounds.yMin;
    return new Rectangle(xMin / 20, yMin / 20,
                                              (bounds.xMax - xMin) / 20,
                                              (bounds.yMax - yMin) / 20);
  }

	/**
	 * Returns a new Rectangle object with the same values for the
	 * <code>x</code>, <code>y</code>, <code>width</code>, and
	 * <code>height</code> properties as the original Rectangle object.
	 *
	 * @return A new Rectangle object with the same values for the
	 *         <code>x</code>, <code>y</code>, <code>width</code>, and
	 *         <code>height</code> properties as the original Rectangle object.
	 */
  public clone(): Rectangle
  {
    return new Rectangle(this._adaptee.clone());
  }

	/**
	 * Determines whether or not this Rectangle object is empty.
	 *
	 * @return A value of <code>true</code> if the Rectangle object's width or
	 *         height is less than or equal to 0; otherwise <code>false</code>.
	 */
  public isEmpty(): boolean
  {
    return this._adaptee.isEmpty();
  }

	/**
	 * Sets all of the Rectangle object's properties to 0. A Rectangle object is
	 * empty if its width or height is less than or equal to 0.
	 *
	 * <p> This method sets the values of the <code>x</code>, <code>y</code>,
	 * <code>width</code>, and <code>height</code> properties to 0.</p>
	 *
	 */
  public setEmpty(): void
  {
    return this._adaptee.setEmpty();
  }

	/**
	 * Increases the size of the Rectangle object by the specified amounts, in
	 * pixels. The center point of the Rectangle object stays the same, and its
	 * size increases to the left and right by the <code>dx</code> value, and to
	 * the top and the bottom by the <code>dy</code> value.
	 *
	 * @param dx The value to be added to the left and the right of the Rectangle
	 *           object. The following equation is used to calculate the new
	 *           width and position of the rectangle:
	 * @param dy The value to be added to the top and the bottom of the
	 *           Rectangle. The following equation is used to calculate the new
	 *           height and position of the rectangle:
	 */
  public inflate(dx: number, dy: number): void
  {
    this._adaptee.inflate(+dx, +dy);
  }

	/**
	 * Increases the size of the Rectangle object. This method is similar to the
	 * <code>Rectangle.inflate()</code> method except it takes a Point object as
	 * a parameter.
	 *
	 * <p>The following two code examples give the same result:</p>
	 *
	 * @param point The <code>x</code> property of this Point object is used to
	 *              increase the horizontal dimension of the Rectangle object.
	 *              The <code>y</code> property is used to increase the vertical
	 *              dimension of the Rectangle object.
	 */
  public inflatePoint(point: Point): void
  {
    this._adaptee.inflatePoint(point.adaptee);
  }

	/**
	 * Adjusts the location of the Rectangle object, as determined by its
	 * top-left corner, by the specified amounts.
	 *
	 * @param dx Moves the <i>x</i> value of the Rectangle object by this amount.
	 * @param dy Moves the <i>y</i> value of the Rectangle object by this amount.
	 */
  public offset(dx: number, dy: number): void
  {
    this._adaptee.offset(+dx, +dy);
  }

	/**
	 * Adjusts the location of the Rectangle object using a Point object as a
	 * parameter. This method is similar to the <code>Rectangle.offset()</code>
	 * method, except that it takes a Point object as a parameter.
	 *
	 * @param point A Point object to use to offset this Rectangle object.
	 */
  public offsetPoint(point: Point): void
  {
    this._adaptee.offsetPoint(point.adaptee);
  }

	/**
	 * Determines whether the specified point is contained within the rectangular
	 * region defined by this Rectangle object.
	 *
	 * @param x The <i>x</i> coordinate(horizontal position) of the point.
	 * @param y The <i>y</i> coordinate(vertical position) of the point.
	 * @return A value of <code>true</code> if the Rectangle object contains the
	 *         specified point; otherwise <code>false</code>.
	 */
  public contains(x: number, y: number): boolean
  {
    return this._adaptee.contains(+x, +y);
  }

	/**
	 * Determines whether the specified point is contained within the rectangular
	 * region defined by this Rectangle object. This method is similar to the
	 * <code>Rectangle.contains()</code> method, except that it takes a Point
	 * object as a parameter.
	 *
	 * @param point The point, as represented by its <i>x</i> and <i>y</i>
	 *              coordinates.
	 * @return A value of <code>true</code> if the Rectangle object contains the
	 *         specified point; otherwise <code>false</code>.
	 */
  public containsPoint(point: Point): boolean
  {
    return this._adaptee.containsPoint(point.adaptee);
  }

	/**
	 * Determines whether the Rectangle object specified by the <code>rect</code>
	 * parameter is contained within this Rectangle object. A Rectangle object is
	 * said to contain another if the second Rectangle object falls entirely
	 * within the boundaries of the first.
	 *
	 * @param rect The Rectangle object being checked.
	 * @return A value of <code>true</code> if the Rectangle object that you
	 *         specify is contained by this Rectangle object; otherwise
	 *         <code>false</code>.
	 */
  public containsRect(rect: Rectangle): boolean
  {
    return this._adaptee.containsRect(rect.adaptee);
  }

  
	/**
	 * If the Rectangle object specified in the <code>toIntersect</code>
	 * parameter intersects with this Rectangle object, returns the area of
	 * intersection as a Rectangle object. If the rectangles do not intersect,
	 * this method returns an empty Rectangle object with its properties set to
	 * 0.
	 *
	 * @param toIntersect The Rectangle object to compare against to see if it
	 *                    intersects with this Rectangle object.
	 * @return A Rectangle object that equals the area of intersection. If the
	 *         rectangles do not intersect, this method returns an empty
	 *         Rectangle object; that is, a rectangle with its <code>x</code>,
	 *         <code>y</code>, <code>width</code>, and <code>height</code>
	 *         properties set to 0.
	 */
  public intersection(toIntersect: Rectangle): Rectangle
  {
    return new Rectangle(this._adaptee.intersection(toIntersect.adaptee));
  }

	/**
	 * Determines whether the object specified in the <code>toIntersect</code>
	 * parameter intersects with this Rectangle object. This method checks the
	 * <code>x</code>, <code>y</code>, <code>width</code>, and
	 * <code>height</code> properties of the specified Rectangle object to see if
	 * it intersects with this Rectangle object.
	 *
	 * @param toIntersect The Rectangle object to compare against this Rectangle
	 *                    object.
	 * @return A value of <code>true</code> if the specified object intersects
	 *         with this Rectangle object; otherwise <code>false</code>.
	 */
  public intersects(toIntersect: Rectangle): boolean
  {
    return this._adaptee.intersects(toIntersect.adaptee);
  }

	/**
	 * Adds two rectangles together to create a new Rectangle object, by filling
	 * in the horizontal and vertical space between the two rectangles.
	 *
	 * <p><b>Note:</b> The <code>union()</code> method ignores rectangles with
	 * <code>0</code> as the height or width value, such as: <code>var
	 * rect2:Rectangle = new Rectangle(300,300,50,0);</code></p>
	 *
	 * @param toUnion A Rectangle object to add to this Rectangle object.
	 * @return A new Rectangle object that is the union of the two rectangles.
	 */
  public union(toUnion: Rectangle): Rectangle
  {
    return new Rectangle(this._adaptee.union(toUnion.adaptee));
  }

  /**
	 * Determines whether the object specified in the <code>toCompare</code>
	 * parameter is equal to this Rectangle object. This method compares the
	 * <code>x</code>, <code>y</code>, <code>width</code>, and
	 * <code>height</code> properties of an object against the same properties of
	 * this Rectangle object.
	 *
	 * @param toCompare The rectangle to compare to this Rectangle object.
	 * @return A value of <code>true</code> if the object has exactly the same
	 *         values for the <code>x</code>, <code>y</code>, <code>width</code>,
	 *         and <code>height</code> properties as this Rectangle object;
	 *         otherwise <code>false</code>.
	 */
  public equals(toCompare: Rectangle): boolean
  {
    return this._adaptee.equals(toCompare.adaptee);
  }

	/**
	 * Copies all of rectangle data from the source Rectangle object into the
	 * calling Rectangle object.
	 *
	 * @param sourceRect The Rectangle object from which to copy the data.
	 */
  public copyFrom(sourceRect: Rectangle): void
  {
    this._adaptee.copyFrom(sourceRect.adaptee);
  }

	/**
	 * Sets the members of Rectangle to the specified values
	 *
	 * @param xa      The <i>x</i> coordinate of the top-left corner of the
	 *                rectangle.
	 * @param ya      The <i>y</i> coordinate of the top-left corner of the
	 *                rectangle.
	 * @param widtha  The width of the rectangle, in pixels.
	 * @param heighta The height of the rectangle, in pixels.
	 */
  public setTo(x: number, y: number, width: number, height: number): void
  {
    this._adaptee.setTo(+x, +y, +width, +height);
  }

  
	/**
	 * Builds and returns a string that lists the horizontal and vertical
	 * positions and the width and height of the Rectangle object.
	 *
	 * @return A string listing the value of each of the following properties of
	 *         the Rectangle object: <code>x</code>, <code>y</code>,
	 *         <code>width</code>, and <code>height</code>.
	 */
  public toString(): string
  {
    return "(x=" + this.x + ", y=" + this.y + ", w=" + this.width + ", h=" + this.height + ")";
  }

  public hashCode(): number {
    var hash = 0;
    hash += this.x * 20 | 0;      hash *= 37;
    hash += this.y * 20 | 0;      hash *= 37;
    hash += this.width * 20 | 0;  hash *= 37;
    hash += this.height * 20 | 0;
    return hash;
  }

  public writeExternal(output: IDataOutput) {
    output.writeFloat(this.x);
    output.writeFloat(this.y);
    output.writeFloat(this.width);
    output.writeFloat(this.height);
  }

  public readExternal(input: IDataInput) {
    this.x = input.readFloat();
    this.y = input.readFloat();
    this.width = input.readFloat();
    this.height = input.readFloat();
  }
}
