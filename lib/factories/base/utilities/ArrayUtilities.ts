
import { nearestPowerOfTwo } from './IntegerUtilities';
import { assert, release } from './Debug';

/**
 * Pops elements from a source array into a destination array. This avoids
 * allocations and should be faster. The elements in the destination array
 * are pushed in the same order as they appear in the source array:
 *
 * popManyInto([1, 2, 3], 2, dst) => dst = [2, 3]
 */
export function popManyInto(src: any [], count: number, dst: any []) {
	release || assert(src.length >= count);
	for (let i = count - 1; i >= 0; i--) {
		dst[i] = src.pop();
	}
	dst.length = count;
}

export function popMany<T>(array: T [], count: number): T [] {
	release || assert(array.length >= count);
	const start = array.length - count;
	const result = array.slice(start, this.length);
	array.length = start;
	return result;
}

/**
 * Just deletes several array elements from the end of the list.
 */
export function popManyIntoVoid(array: any [], count: number) {
	release || assert(array.length >= count);
	array.length = array.length - count;
}

export function pushMany(dst: any [], src: any []) {
	for (let i = 0; i < src.length; i++) {
		dst.push(src[i]);
	}
}

export function top(array: any []) {
	return array.length && array[array.length - 1];
}

export function last(array: any []) {
	return array.length && array[array.length - 1];
}

export function peek(array: any []) {
	release || assert(array.length > 0);
	return array[array.length - 1];
}

export function indexOf<T>(array: T [], value: T): number {
	for (let i = 0, j = array.length; i < j; i++) {
		if (array[i] === value) {
			return i;
		}
	}
	return -1;
}

export function equals<T>(a: T [], b: T []): boolean {
	if (a.length !== b.length) {
		return false;
	}
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) {
			return false;
		}
	}
	return true;
}

export function pushUnique<T>(array: T [], value: T): number {
	for (let i = 0, j = array.length; i < j; i++) {
		if (array[i] === value) {
			return i;
		}
	}
	array.push(value);
	return array.length - 1;
}

export function unique<T>(array: T []): T [] {
	const result = [];
	for (let i = 0; i < array.length; i++) {
		pushUnique(result, array[i]);
	}
	return result;
}

export function copyFrom(dst: any [], src: any []) {
	dst.length = 0;
	pushMany(dst, src);
}

/**
 * Makes sure that a typed array has the requested capacity. If required, it creates a new
 * instance of the array's class with a power-of-two capacity at least as large as required.
 */
export function ensureTypedArrayCapacity<T extends TypedArray>(array: T, capacity: number): T {
	if (array.length < capacity) {
		const oldArray = array;
		array = new (<any>array).constructor(nearestPowerOfTwo(capacity));
		array.set(oldArray, 0);
	}
	return array;
}

export function memCopy<T extends TypedArray>(destination: T, source: T, doffset: number = 0,
											  soffset: number = 0, length: number = 0) {
	if (soffset > 0 || (length > 0 && length < source.length)) {
		if (length <= 0) {
			length = source.length - soffset;
		}
		destination.set(source.subarray(soffset, soffset + length), doffset);
	} else {
		destination.set(source, doffset);
	}
}

export interface TypedArray {
	buffer: ArrayBuffer;
	length: number;
	set: (array: TypedArray, offset?: number) => void;
	subarray: (begin: number, end?: number) => TypedArray;
}

export interface IDataDecoder {
	onData: (data: Uint8Array) => void;
	onError: (e) => void;
	push(data: Uint8Array);
	close();
}
