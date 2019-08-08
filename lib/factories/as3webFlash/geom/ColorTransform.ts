import { ASObject } from "../../avm2/nat/ASObject";
import { clampS8U8, toS16 } from "../../base/utilities/IntegerUtilities";
import { AbstractMethodError, ColorTransform as AwayColorTransform } from '@awayjs/core';

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
// Class: ColorTransform
export class ColorTransform extends ASObject
{
  private _adaptee:AwayColorTransform;

  static axClass: typeof ColorTransform;

  static classInitializer():void
  {
    this.FROZEN_IDENTITY_COLOR_TRANSFORM = Object.freeze(this.axConstruct([]));
    this.TEMP_COLOR_TRANSFORM = this.axConstruct([]);
  }
  static classSymbols: string [] = null; // [];
  static instanceSymbols: string [] = null; // ["redMultiplier", "greenMultiplier",
                                            // "blueMultiplier", "alphaMultiplier", "redOffset",
                                            // "greenOffset", "blueOffset", "alphaOffset",
                                            // "color", "color", "concat", "toString"];
  
  public get adaptee():AwayColorTransform
  {
    return this._adaptee;
  }

  constructor(redMultiplierAdaptee: number | AwayColorTransform = 1, greenMultiplier: number = 1, blueMultiplier: number = 1, alphaMultiplier: number = 1, redOffset: number = 0, greenOffset: number = 0, blueOffset: number = 0, alphaOffset: number = 0)
  {
    super();

    this._adaptee = (redMultiplierAdaptee instanceof AwayColorTransform)? redMultiplierAdaptee : new AwayColorTransform(+redMultiplierAdaptee, +greenMultiplier, +blueMultiplier, +alphaMultiplier, +redOffset, +greenOffset, +blueOffset, +alphaOffset);
  }

  public static FROZEN_IDENTITY_COLOR_TRANSFORM: ColorTransform;

  // Must only be used in cases where the members are fully initialized and then directly used.
  public static TEMP_COLOR_TRANSFORM: ColorTransform;

	/**
	 * A decimal value that is multiplied with the alpha transparency channel
	 * value.
	 *
	 * <p>If you set the alpha transparency value of a display object directly by
	 * using the <code>alpha</code> property of the DisplayObject instance, it
	 * affects the value of the <code>alphaMultiplier</code> property of that
	 * display object's <code>transform.colorTransform</code> property.</p>
	 */
	public get alphaMultiplier():number
	{
		return this._adaptee._rawData[3];
	}

	public set alphaMultiplier(value:number)
	{
		this._adaptee._rawData[3] = +value;
	}

	/**
	 * A number from -255 to 255 that is added to the alpha transparency channel
	 * value after it has been multiplied by the <code>alphaMultiplier</code>
	 * value.
	 */
	public get alphaOffset():number
	{
		return this._adaptee._rawData[7];
	}

	public set alphaOffset(value:number)
	{
		this._adaptee._rawData[7] = +value;
	}

	/**
	 * A decimal value that is multiplied with the blue channel value.
	 */
	public get blueMultiplier():number
	{
		return this._adaptee._rawData[2];
	}

	public set blueMultiplier(value:number)
	{
		this._adaptee._rawData[2] = +value;
	}

	/**
	 * A number from -255 to 255 that is added to the blue channel value after it
	 * has been multiplied by the <code>blueMultiplier</code> value.
	 */
	public get blueOffset():number
	{
		return this._adaptee._rawData[6];
	}

	public set blueOffset(value:number)
	{
		this._adaptee._rawData[6] = +value;
	}

	/**
	 * A decimal value that is multiplied with the green channel value.
	 */
	public get greenMultiplier():number
	{
		return this._adaptee._rawData[1];
	}

	public set greenMultiplier(value:number)
	{
		this._adaptee._rawData[1] = +value;
	}

	/**
	 * A number from -255 to 255 that is added to the green channel value after
	 * it has been multiplied by the <code>greenMultiplier</code> value.
	 */
	public get greenOffset():number
	{
		return this._adaptee._rawData[5];
	}

	public set greenOffset(value:number)
	{
		this._adaptee._rawData[5] = +value;
	}

	/**
	 * A decimal value that is multiplied with the red channel value.
	 */
	public get redMultiplier():number
	{
		return this._adaptee._rawData[0];
	}

	public set redMultiplier(value:number)
	{
		this._adaptee._rawData[0] = +value;
	}

	/**
	 * A number from -255 to 255 that is added to the red channel value after it
	 * has been multiplied by the <code>redMultiplier</code> value.
	 */
	public get redOffset():number
	{
		return this._adaptee._rawData[4];
	}

	public set redOffset(value:number)
	{
		this._adaptee._rawData[4] = +value;
	}

  public get color(): number
  {
    return this._adaptee.color;
  }

  public set color(value: number)
  {
    this._adaptee.color = +value;
  }

  public concat(second: ColorTransform): void 
  {
    this._adaptee.concat(second.adaptee);
  }

  public preMultiply(second: ColorTransform): void
  {
    this._adaptee._rawData[4] += second.adaptee._rawData[4] * this._adaptee._rawData[0];
    this._adaptee._rawData[5] += second.adaptee._rawData[5] * this._adaptee._rawData[1];
    this._adaptee._rawData[6] += second.adaptee._rawData[6] * this._adaptee._rawData[2];
    this._adaptee._rawData[7] += second.adaptee._rawData[7] * this._adaptee._rawData[3];
    this._adaptee._rawData[0] *= second.adaptee._rawData[0];
    this._adaptee._rawData[1] *= second.adaptee._rawData[1];
    this._adaptee._rawData[2] *= second.adaptee._rawData[2];
    this._adaptee._rawData[3] *= second.adaptee._rawData[3];
  }

  public copyFrom(sourceColorTransform: ColorTransform): void
  {
    this._adaptee.copyFrom(sourceColorTransform.adaptee);
  }

  public setTo(redMultiplier: number, greenMultiplier: number, blueMultiplier: number, alphaMultiplier: number, redOffset: number, greenOffset: number, blueOffset: number, alphaOffset: number): void
    {
    this._adaptee._rawData[0] = redMultiplier;
    this._adaptee._rawData[1] = greenMultiplier;
    this._adaptee._rawData[2] = blueMultiplier;
    this._adaptee._rawData[3] = alphaMultiplier;
    this._adaptee._rawData[4] = redOffset;
    this._adaptee._rawData[5] = greenOffset;
    this._adaptee._rawData[6] = blueOffset;
    this._adaptee._rawData[7] = alphaOffset;
  }

  public clone(): ColorTransform
  {
    return new this.sec.flash.geom.ColorTransform(
      this._adaptee._rawData[0],
      this._adaptee._rawData[1],
      this._adaptee._rawData[2],
      this._adaptee._rawData[3],
      this._adaptee._rawData[4],
      this._adaptee._rawData[5],
      this._adaptee._rawData[6],
      this._adaptee._rawData[7]
    );
  }

  public convertToFixedPoint(): ColorTransform
  {
    this._adaptee._rawData[0] = clampS8U8(this._adaptee._rawData[0]);
    this._adaptee._rawData[1] = clampS8U8(this._adaptee._rawData[1]);
    this._adaptee._rawData[2] = clampS8U8(this._adaptee._rawData[2]);
    this._adaptee._rawData[3] = clampS8U8(this._adaptee._rawData[3]);
    this._adaptee._rawData[4] = toS16(this._adaptee._rawData[4]);
    this._adaptee._rawData[5] = toS16(this._adaptee._rawData[5]);
    this._adaptee._rawData[6] = toS16(this._adaptee._rawData[6]);
    this._adaptee._rawData[7] = toS16(this._adaptee._rawData[7]);
    return this;
  }

  public dispose():void
	{
		throw new AbstractMethodError();
  }
  
  public equals(other: ColorTransform): boolean
  {
    if (this === other)
      return true;

    return this._adaptee._rawData[0] === other._adaptee._rawData[0] &&
            this._adaptee._rawData[1] === other._adaptee._rawData[1] &&
            this._adaptee._rawData[2] === other._adaptee._rawData[2] &&
            this._adaptee._rawData[3] === other._adaptee._rawData[3] &&
            this._adaptee._rawData[4] === other._adaptee._rawData[4] &&
            this._adaptee._rawData[5] === other._adaptee._rawData[5] &&
            this._adaptee._rawData[6] === other._adaptee._rawData[6] &&
            this._adaptee._rawData[7] === other._adaptee._rawData[7];
  }

  public toString(): string
  {
    return "(redMultiplier=" + this._adaptee._rawData[0] +
      ", greenMultiplier=" + this._adaptee._rawData[1] +
      ", blueMultiplier=" + this._adaptee._rawData[2] +
      ", alphaMultiplier=" + this._adaptee._rawData[3] +
      ", redOffset=" + this._adaptee._rawData[4] +
      ", greenOffset=" + this._adaptee._rawData[5] +
      ", blueOffset=" + this._adaptee._rawData[6] +
      ", alphaOffset=" + this._adaptee._rawData[7] +
      ")";
  }
}
