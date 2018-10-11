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
	import {ColorTransform} from "@awayjs/core";
	import {AVM1Object} from "../runtime/AVM1Object";
	import { AVM1Function } from "../runtime/AVM1Function";
	
	
	function defaultTo(v, defaultValue) {
		return v === undefined ? defaultValue : v;
	}
	
	export function toAS3ColorTransform(v: any): ColorTransform {
		var context = v.context;
		if (!(v instanceof AVM1Object)) {
			return new context.sec.flash.geom.ColorTransform(1, 1, 1, 1, 0, 0, 0, 0);
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
		return new context.sec.flash.geom.ColorTransform(
			alCoerceNumber(context, defaultTo(mul_r, 1)),
			alCoerceNumber(context, defaultTo(mul_g, 1)),
			alCoerceNumber(context, defaultTo(mul_b, 1)),
			alCoerceNumber(context, defaultTo(mul_a, 1)),
			alCoerceNumber(context, defaultTo(off_r, 0)),
			alCoerceNumber(context, defaultTo(off_g, 0)),
			alCoerceNumber(context, defaultTo(off_b, 0)),
			alCoerceNumber(context, defaultTo(off_a, 0)));
	}
	
	export function copyAS3ColorTransform(t: ColorTransform, v: AVM1Object) {
		v.alPut('redMultiplier', t.redMultiplier);
		v.alPut('greenMultiplier', t.greenMultiplier);
		v.alPut('blueMultiplier', t.blueMultiplier);
		v.alPut('alphaMultiplier', t.alphaMultiplier);
		v.alPut('redOffset', t.redOffset);
		v.alPut('greenOffset', t.greenOffset);
		v.alPut('blueOffset', t.blueOffset);
		v.alPut('alphaOffset', t.alphaOffset);
	}
	
	export class AVM1ColorTransform extends AVM1Object {
        public _ctAdaptee:ColorTransform;
		constructor(context: AVM1Context,
					redMultiplier: number = 1, greenMultiplier: number = 1, blueMultiplier: number = 1, alphaMultiplier: number = 1,
					redOffset: number = 0, greenOffset: number = 0, blueOffset: number = 0, alphaOffset: number = 0) {
            super(context);
            this._ctAdaptee=new ColorTransform(
                redMultiplier, greenMultiplier, blueMultiplier, alphaMultiplier,
                redOffset, greenOffset, blueOffset, alphaOffset
            )
			this.alPrototype = context.globals.ColorTransform.alGetPrototypeProperty();
			alDefineObjectProperties(this, {
				rgb: {
					get: this.getRgb,
					set: this.setRgb
                },
				ra: {
					get: this.getRedMultiplier,
					set: this.setRedMultiplier
				},
				ga: {
					get: this.getGreenMultiplier,
					set: this.setGreenMultiplier
				},
				ba: {
					get: this.getBlueMultiplier,
					set: this.setBlueMultiplier
				},
				aa: {
					get: this.getAlphaMultiplier,
					set: this.setAlphaMultiplier
				},
				rb: {
					get: this.getRedOffset,
					set: this.setRedOffset
				},
				gb: {
					get: this.getGreenOffset,
					set: this.setGreenOffset
				},
				bb: {
					get: this.getBlueOffset,
					set: this.setBlueOffset
				},
				ab: {
					get: this.getAlphaOffset,
					set: this.setAlphaOffset
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
			return this._ctAdaptee.redMultiplier;
		}	
		public setRedMultiplier(value: number) {
            this._ctAdaptee.redMultiplier=value;
        }

		public getGreenMultiplier(): number {
			return this._ctAdaptee.greenMultiplier;
		}	
		public setGreenMultiplier(value: number) {
            this._ctAdaptee.greenMultiplier=value;
        }

		public getBlueMultiplier(): number {
			return this._ctAdaptee.blueMultiplier;
		}	
		public setBlueMultiplier(value: number) {
            this._ctAdaptee.blueMultiplier=value;
        }

        public getAlphaMultiplier(): number {
			return this._ctAdaptee.alphaMultiplier;
		}	
		public setAlphaMultiplier(value: number) {
            this._ctAdaptee.redOffset=value;
        }  

		public getRedOffset(value: number) {
            this._ctAdaptee.redOffset=value;
        }
		public setRedOffset(value: number) {
            this._ctAdaptee.redOffset=value;
        }

		public getGreenOffset(): number {
			return this._ctAdaptee.greenOffset;
		}	
		public setGreenOffset(value: number) {
            this._ctAdaptee.greenOffset=value;
        }

		public getBlueOffset(): number {
			return this._ctAdaptee.blueOffset;
		}	
		public setBlueOffset(value: number) {
            this._ctAdaptee.blueOffset=value;
        }

		public getAlphaOffset(): number {
			return this._ctAdaptee.alphaOffset;
		}	
		public setAlphaOffset(value: number) {
            this._ctAdaptee.alphaOffset=value;
        }
        
		public getRgb(): number {
            return this._ctAdaptee.color;
		}
	
		public setRgb(rgb: number) {
            this._ctAdaptee.color=alToInt32(this.context, rgb);
		}
	
		public concat(second: AVM1ColorTransform): void {
			this._ctAdaptee.concat(toAS3ColorTransform(second));
		}
	
		public _toString(): string {
			return this._ctAdaptee.toString();
		}
		
	
		static fromAS3ColorTransform(context: AVM1Context, t:ColorTransform): AVM1ColorTransform  {
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
	