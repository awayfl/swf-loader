/**
 * Copyright 2015 Mozilla Foundation
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

//module Shumway.AVM1.Lib {
	import {alCoerceNumber, alDefineObjectProperties, alToInt32} from "../runtime";
	import {AVM1Context} from "../context";
	import {ColorTransform, ColorUtils} from "@awayjs/core";
	import {AVM1Object} from "../runtime/AVM1Object";
	import { AVM1Function } from "../runtime/AVM1Function";
	
	
	function defaultTo(v, defaultValue) {
		return v === undefined ? defaultValue : v;
	}
	
	export function fromAVM1Object(v: AVM1Object): AVM1ColorTransform {
		var context = v.context;
		if (!(v instanceof AVM1Object)) {
			return new AVM1ColorTransform(context, 1, 1, 1, 1, 0, 0, 0, 0);
		}
		var off_a:number=v.alGet('alphaOffset');
		if(off_a==null) {
			off_a=v.alGet("ab");
		}
		var mul_a:number=v.alGet('alphaMultiplier');
		if(mul_a==null) {
			mul_a=v.alGet("aa");
			if(mul_a!=null){
				mul_a=mul_a/100;
			}
		}
		var off_r:number=v.alGet('redOffset');
		if(off_r==null) {
			off_r=v.alGet("rb");
		}
		var mul_r:number=v.alGet('redMultiplier');
		if(mul_r==null) {
			mul_r=v.alGet("ra");
			if(mul_r!=null){
				mul_r=mul_r/100;
			}
		}
		var off_g:number=v.alGet('greenOffset');
		if(off_g==null) {
			off_g=v.alGet("gb");
		}
		var mul_g:number=v.alGet('greenMultiplier');
		if(mul_g==null) {
			mul_g=v.alGet("ga");
			if(mul_g!=null){
				mul_g=mul_g/100;
			}
		}
		var off_b:number=v.alGet('blueOffset');
		if(off_b==null) {
			off_b=v.alGet("bb");
		}
		var mul_b:number=v.alGet('blueMultiplier');
		if(mul_b==null) {
			mul_b=v.alGet("ba");
			if(mul_b!=null){
				mul_b=mul_b/100;
			}
		}
		return new AVM1ColorTransform(context,
			alCoerceNumber(context, defaultTo(mul_r, 1)),
			alCoerceNumber(context, defaultTo(mul_g, 1)),
			alCoerceNumber(context, defaultTo(mul_b, 1)),
			alCoerceNumber(context, defaultTo(mul_a, 1)),
			alCoerceNumber(context, defaultTo(off_r, 0)),
			alCoerceNumber(context, defaultTo(off_g, 0)),
			alCoerceNumber(context, defaultTo(off_b, 0)),
			alCoerceNumber(context, defaultTo(off_a, 0)));
	}
	
	export function toAwayColorTransform(v: AVM1ColorTransform): ColorTransform {
		var context = v.context;
		if (!(v instanceof AVM1ColorTransform)) {
			return new ColorTransform(1, 1, 1, 1, 0, 0, 0, 0);
		}
		return new ColorTransform(
			alCoerceNumber(context, defaultTo(v._rawData[0], 1)),
			alCoerceNumber(context, defaultTo(v._rawData[1], 1)),
			alCoerceNumber(context, defaultTo(v._rawData[2], 1)),
			alCoerceNumber(context, defaultTo(v._rawData[3], 1)),
			alCoerceNumber(context, defaultTo(v._rawData[4], 0)),
			alCoerceNumber(context, defaultTo(v._rawData[5], 0)),
			alCoerceNumber(context, defaultTo(v._rawData[6], 0)),
			alCoerceNumber(context, defaultTo(v._rawData[7], 0)));
	}
	
	export function copyAS3ColorTransform(t: ColorTransform, v: AVM1ColorTransform) {
		v._rawData[0]=t.redMultiplier;
		v._rawData[1]=t.greenMultiplier;
		v._rawData[2]=t.blueMultiplier;
		v._rawData[3]=t.alphaMultiplier;
		v._rawData[4]=t.redOffset;
		v._rawData[5]=t.greenOffset;
		v._rawData[6]=t.blueOffset;
		v._rawData[7]=t.alphaOffset;
	}
	
	export class AVM1ColorTransform extends AVM1Object {
        public _rawData:number[];
		constructor(context: AVM1Context,
					redMultiplier: number = 1, greenMultiplier: number = 1, blueMultiplier: number = 1, alphaMultiplier: number = 1,
					redOffset: number = 0, greenOffset: number = 0, blueOffset: number = 0, alphaOffset: number = 0) {
            super(context);
            this._rawData=[redMultiplier, greenMultiplier, blueMultiplier, alphaMultiplier,
                redOffset, greenOffset, blueOffset, alphaOffset];
			this.alPrototype = context.globals.ColorTransform.alGetPrototypeProperty();
			alDefineObjectProperties(this, {
				rgb: {
					get: this.getRgb,
					set: this.setRgb
                },
				ra: {
					get: this.getRM,
					set: this.setRM
				},
				ga: {
					get: this.getGM,
					set: this.setGM
				},
				ba: {
					get: this.getBM,
					set: this.setBM
				},
				aa: {
					get: this.getAM,
					set: this.setAM
				},
				rb: {
					get: this.getRO,
					set: this.setRO
				},
				gb: {
					get: this.getGO,
					set: this.setGO
				},
				bb: {
					get: this.getBO,
					set: this.setBO
				},
				ab: {
					get: this.getAO,
					set: this.setAO
				},
				redMultiplier: {
					get: this.getRedMultiplier,
					set: this.setRedMultiplier
				},
				greenMultiplier: {
					get: this.getGreenMultiplier,
					set: this.setGreenMultiplier
				},
				blueMultiplier: {
					get: this.getBlueMultiplier,
					set: this.setBlueMultiplier
				},
				alphaMultiplier: {
					get: this.getAlphaMultiplier,
					set: this.setAlphaMultiplier
				},
				redOffset: {
					get: this.getRedOffset,
					set: this.setRedOffset
				},
				greenOffset: {
					get: this.getGreenOffset,
					set: this.setGreenOffset
				},
				blueOffset: {
					get: this.getBlueOffset,
					set: this.setBlueOffset
				},
				alphaOffset: {
					get: this.getAlphaOffset,
					set: this.setAlphaOffset
				},
				concat: {
					value: this.concat,
					writable: true
				},
				toString: {
					value: this._toString,
					writable: true
				}
			});
		}
	
		public getRedMultiplier(): number {
			return this._rawData[0];
		}	
		public setRedMultiplier(value: number) {
            this._rawData[0]=value;
        }

		public getGreenMultiplier(): number {
			return this._rawData[1];
		}	
		public setGreenMultiplier(value: number) {
            this._rawData[1]=value;
        }

		public getBlueMultiplier(): number {
			return this._rawData[2];
		}	
		public setBlueMultiplier(value: number) {
            this._rawData[2]=value;
        }

        public getAlphaMultiplier(): number {
			return this._rawData[3];
		}	
		public setAlphaMultiplier(value: number) {
            this._rawData[3]=value;
        }  

		public getRedOffset():number {
			return this._rawData[4];
        }
		public setRedOffset(value: number) {
            this._rawData[4]=value;
        }

		public getGreenOffset(): number {
			return this._rawData[5];
		}	
		public setGreenOffset(value: number) {
            this._rawData[5]=value;
        }

		public getBlueOffset(): number {
			return this._rawData[6];
		}	
		public setBlueOffset(value: number) {
            this._rawData[6]=value;
        }

		public getAlphaOffset(): number {
			return this._rawData[7];
		}	
		public setAlphaOffset(value: number) {
            this._rawData[7]=value;
        }

        
		public getRM(): number {
			return this._rawData[0]*100;
		}	
		public setRM(value: number) {
            this._rawData[0]=value/100;
        }

		public getGM(): number {
			return this._rawData[1]*100;
		}	
		public setGM(value: number) {
            this._rawData[1]=value/100;
        }

		public getBM(): number {
			return this._rawData[2]*100;
		}	
		public setBM(value: number) {
            this._rawData[2]=value/100;
        }

        public getAM(): number {
			return this._rawData[3]*100;
		}	
		public setAM(value: number) {
            this._rawData[3]=value/100;
        }  

		public getRO():number {
			return this._rawData[4];
        }
		public setRO(value: number) {
            this._rawData[4]=value;
        }

		public getGO(): number {
			return this._rawData[5];
		}	
		public setGO(value: number) {
            this._rawData[5]=value;
        }

		public getBO(): number {
			return this._rawData[6];
		}	
		public setBO(value: number) {
            this._rawData[6]=value;
        }

		public getAO(): number {
			return this._rawData[7];
		}	
		public setAO(value: number) {
            this._rawData[7]=value;
        }
        
		public getRgb(): number {
            return((this._rawData[4] << 16) | ( this._rawData[5] << 8) | this._rawData[6]);
		}
	
		public setRgb(rgb: number) {
            var argb:number[] = ColorUtils.float32ColorToARGB(rgb);
    
            this._rawData[4] = argb[1];  //(value >> 16) & 0xFF;
            this._rawData[5] = argb[2];  //(value >> 8) & 0xFF;
            this._rawData[6] = argb[3];  //value & 0xFF;
    
            this._rawData[0] = 0;
            this._rawData[1] = 0;
            this._rawData[2] = 0;
		}
	
		public concat(second: AVM1ColorTransform): void {
            console.warn("AVM1ColorTransform concat is not implemented");
			//this._ctAdaptee.concat(second._ctAdaptee);
		}
	
		public _toString(): string {
			return "[object Object]";
		}
		
	
		static fromAwayColorTransform(context: AVM1Context, t:ColorTransform): AVM1ColorTransform  {
            return new AVM1ColorTransform(context,
				t.redMultiplier, t.greenMultiplier, t.blueMultiplier, t.alphaMultiplier,
                t.redOffset, t.greenOffset, t.blueOffset, t.alphaOffset);
		}
	}
	
	export class AVM1ColorTransformFunction extends AVM1Function {
		constructor(context: AVM1Context) {
			super(context);
			alDefineObjectProperties(this, {
				prototype: {
					value: new AVM1ColorTransformPrototype(context, this)
				}
			});
		}
	
		alConstruct(args?: any[]): AVM1Object {
			var obj = Object.create(AVM1ColorTransform.prototype);
			args = args || [];
			AVM1ColorTransform.apply(obj, [this.context].concat(args));
			return obj;
		}
	}
	
	export class AVM1ColorTransformPrototype extends AVM1Object {
		constructor(context: AVM1Context, fn: AVM1Function) {
            super(context);
            
            this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
			alDefineObjectProperties(this, {
				constructor: {
					value: fn,
					writable: true
                }
            });
        }
	}
	