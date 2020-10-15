
const sharedBuffer = new ArrayBuffer(8);
export var i8 = new Int8Array(sharedBuffer);
export var u8 = new Uint8Array(sharedBuffer);
export var i32 = new Int32Array(sharedBuffer);
export var f32 = new Float32Array(sharedBuffer);
export var f64 = new Float64Array(sharedBuffer);
export var nativeLittleEndian = new Int8Array(new Int32Array([1]).buffer)[0] === 1;

declare global {
	interface Math {
		clz32(value: number): number;
		imul(value1: number, value2: number): number;
	}
}

/**
 * Convert a float into 32 bits.
 */
export function floatToInt32(v: number) {
	f32[0] = v; return i32[0];
}

/**
 * Convert 32 bits into a float.
 */
export function int32ToFloat(i: number) {
	i32[0] = i; return f32[0];
}

/**
 * Swap the bytes of a 16 bit number.
 */
export function swap16(i: number) {
	return ((i & 0xFF) << 8) | ((i >> 8) & 0xFF);
}

/**
 * Swap the bytes of a 32 bit number.
 */
export function swap32(i: number) {
	return ((i & 0xFF) << 24) | ((i & 0xFF00) << 8) | ((i >> 8) & 0xFF00) | ((i >> 24) & 0xFF);
}

/**
 * Converts a number to s8.u8 fixed point representation.
 */
export function toS8U8(v: number) {
	return ((v * 256) << 16) >> 16;
}

/**
 * Converts a number from s8.u8 fixed point representation.
 */
export function fromS8U8(i: number) {
	return i / 256;
}

/**
 * Round trips a number through s8.u8 conversion.
 */
export function clampS8U8(v: number) {
	return fromS8U8(toS8U8(v));
}

/**
 * Converts a number to signed 16 bits.
 */
export function toS16(v: number) {
	return (v << 16) >> 16;
}

export function bitCount(i: number): number {
	i = i - ((i >> 1) & 0x55555555);
	i = (i & 0x33333333) + ((i >> 2) & 0x33333333);
	return (((i + (i >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
}

export function ones(i: number): number {
	i = i - ((i >> 1) & 0x55555555);
	i = (i & 0x33333333) + ((i >> 2) & 0x33333333);
	return ((i + (i >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
}

export function trailingZeros(i: number): number {
	return ones((i & -i) - 1);
}
export function getFlags(i: number, flags: string[]): string {
	let str = '';
	for (var i = 0; i < flags.length; i++) {
		if (i & (1 << i)) {
			str += flags[i] + ' ';
		}
	}
	if (str.length === 0) {
		return '';
	}
	return str.trim();
}

export function isPowerOfTwo(x: number) {
	return x && ((x & (x - 1)) === 0);
}

export function roundToMultipleOfFour(x: number) {
	return (x + 3) & ~0x3;
}

export function nearestPowerOfTwo(x: number) {
	x--;
	x |= x >> 1;
	x |= x >> 2;
	x |= x >> 4;
	x |= x >> 8;
	x |= x >> 16;
	x++;
	return x;
}

export function roundToMultipleOfPowerOfTwo(i: number, powerOfTwo: number) {
	const x = (1 << powerOfTwo) - 1;
	return (i + x) & ~x; // Round up to multiple of power of two.
}

export function toHEX(i: number) {
	var i = (i < 0 ? 0xFFFFFFFF + i + 1 : i);
	return '0x' + ('00000000' + i.toString(16)).substr(-8);
}

/**
 * Polyfill imul.
 */
if (!Math.imul) {
	Math.imul = function imul(a, b) {
		const ah  = (a >>> 16) & 0xffff;
		const al = a & 0xffff;
		const bh  = (b >>> 16) & 0xffff;
		const bl = b & 0xffff;
		// the shift by 0 fixes the sign on the high part
		// the final |0 converts the unsigned value into a signed value
		return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
	};
}

/**
 * Polyfill clz32.
 */
if (!Math.clz32) {
	Math.clz32 = function clz32(i: number) {
		i |= (i >> 1);
		i |= (i >> 2);
		i |= (i >> 4);
		i |= (i >> 8);
		i |= (i >> 16);
		return 32 - ones(i);
	};
}

export const IntegerUtilities = {
	i8:i8,
	u8:u8,
	i32:i32,
	f32:f32,
	f64:f64,
	nativeLittleEndian:nativeLittleEndian,
	floatToInt32:floatToInt32,
	int32ToFloat:int32ToFloat,
	swap16:swap16,
	swap32:swap32,
	toS8U8:toS8U8,
	fromS8U8:fromS8U8,
	clampS8U8:clampS8U8,
	toS16:toS16,
	bitCount:bitCount,
	ones:ones,
	trailingZeros:trailingZeros,
	getFlags:getFlags,
	isPowerOfTwo:isPowerOfTwo,
	roundToMultipleOfFour:roundToMultipleOfFour,
	nearestPowerOfTwo:nearestPowerOfTwo,
	roundToMultipleOfPowerOfTwo:roundToMultipleOfPowerOfTwo,
	toHEX:toHEX
};