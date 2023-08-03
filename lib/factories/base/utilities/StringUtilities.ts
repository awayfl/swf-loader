
import { assert, release } from './Debug';

export function repeatString(c: string, n: number): string {
	let s = '';
	for (let i = 0; i < n; i++) {
		s += c;
	}
	return s;
}

export function memorySizeToString(value: number) {
	value |= 0;
	const K = 1024;
	const M = K * K;
	if (value < K) {
		return value + ' B';
	} else if (value < M) {
		return (value / K).toFixed(2) + 'KB';
	} else {
		return (value / M).toFixed(2) + 'MB';
	}
}

/**
 * Returns a reasonably sized description of the |value|, to be used for debugging purposes.
 */
export function toSafeString(value) {
	if (typeof value === 'string') {
		return '"' + value + '"';
	}
	if (typeof value === 'number' || typeof value === 'boolean') {
		return String(value);
	}
	if (value instanceof Array) {
		return '[] ' + value.length;
	}
	return typeof value;
}

export function toSafeArrayString(array) {
	const str = [];
	for (let i = 0; i < array.length; i++) {
		str.push(toSafeString(array[i]));
	}
	return str.join(', ');
}

function utf8decode_impl(str: string): Uint8Array {
	const bytes = new Uint8Array(str.length * 4);
	let b = 0;
	for (let i = 0, j = str.length; i < j; i++) {
		let code = str.charCodeAt(i);
		if (code <= 0x7f) {
			bytes[b++] = code;
			continue;
		}

		if (0xD800 <= code && code <= 0xDBFF) {
			const codeLow = str.charCodeAt(i + 1);
			if (0xDC00 <= codeLow && codeLow <= 0xDFFF) {
				// convert only when both high and low surrogates are present
				code = ((code & 0x3FF) << 10) + (codeLow & 0x3FF) + 0x10000;
				++i;
			}
		}

		if ((code & 0xFFE00000) !== 0) {
			bytes[b++] = 0xF8 | ((code >>> 24) & 0x03);
			bytes[b++] = 0x80 | ((code >>> 18) & 0x3F);
			bytes[b++] = 0x80 | ((code >>> 12) & 0x3F);
			bytes[b++] = 0x80 | ((code >>> 6) & 0x3F);
			bytes[b++] = 0x80 | (code & 0x3F);
		} else if ((code & 0xFFFF0000) !== 0) {
			bytes[b++] = 0xF0 | ((code >>> 18) & 0x07);
			bytes[b++] = 0x80 | ((code >>> 12) & 0x3F);
			bytes[b++] = 0x80 | ((code >>> 6) & 0x3F);
			bytes[b++] = 0x80 | (code & 0x3F);
		} else if ((code & 0xFFFFF800) !== 0) {
			bytes[b++] = 0xE0 | ((code >>> 12) & 0x0F);
			bytes[b++] = 0x80 | ((code >>> 6) & 0x3F);
			bytes[b++] = 0x80 | (code & 0x3F);
		} else {
			bytes[b++] = 0xC0 | ((code >>> 6) & 0x1F);
			bytes[b++] = 0x80 | (code & 0x3F);
		}
	}
	return bytes.slice(0, b);
}

function utf8encode_impl(bytes: Uint8Array): string {
	let j = 0, str = '';
	while (j < bytes.length) {
		const b1 = bytes[j++] & 0xFF;
		if (b1 <= 0x7F) {
			str += String.fromCharCode(b1);
		} else {
			let currentPrefix = 0xC0;
			let validBits = 5;
			do {
				const mask = (currentPrefix >> 1) | 0x80;
				if ((b1 & mask) === currentPrefix) break;
				currentPrefix = (currentPrefix >> 1) | 0x80;
				--validBits;
			} while (validBits >= 0);

			if (validBits <= 0) {
				// Invalid UTF8 character -- copying as is
				str += String.fromCharCode(b1);
				continue;
			}
			let code = (b1 & ((1 << validBits) - 1));
			let invalid = false;
			for (var i = 5; i >= validBits; --i) {
				const bi = bytes[j++];
				if ((bi & 0xC0) != 0x80) {
					// Invalid UTF8 character sequence
					invalid = true;
					break;
				}
				code = (code << 6) | (bi & 0x3F);
			}
			if (invalid) {
				// Copying invalid sequence as is
				for (let k = j - (7 - i); k < j; ++k) {
					str += String.fromCharCode(bytes[k] & 255);
				}
				continue;
			}
			if (code >= 0x10000) {
				str += String.fromCharCode((((code - 0x10000) >> 10) & 0x3FF) |
					0xD800, (code & 0x3FF) | 0xDC00);
			} else {
				str += String.fromCharCode(code);
			}
		}
	}
	return str;
}

const textEncoder = self.TextEncoder ? new self.TextEncoder() : null;
const textDecoder = self.TextDecoder ? new self.TextDecoder() : null;

let useNativeUT8: boolean = true;

export function setNativeUTF8Decoding(value: boolean) {
	useNativeUT8 = value;
}

export function getNativeUTF8Decoding() {
	return useNativeUT8;
}

/**
 * Encoder utf to byte array
 * @param str string
 */
export function utf8decode(str: string): Uint8Array {
	if (!textEncoder || !useNativeUT8)
		return utf8decode_impl(str);

	try {
		return textEncoder.encode(str);
	} catch (e) {
		return utf8decode_impl(str);
	}
}

/**
 * Decode utf string from byte array
 * @param buffer
 */
export function utf8encode(buffer: Uint8Array): string {
	if (!textDecoder || !useNativeUT8)
		return utf8encode_impl(buffer);

	try {
		return textDecoder.decode(buffer);
	} catch (e) {
		return utf8encode_impl(buffer);
	}
}

export function base64EncodeBytes(bytes: Uint8Array) {
	return self.btoa(fromCharCodeArray(bytes));
}

const base64DecodeMap = [ // starts at 0x2B
	62, 0, 0, 0, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61,
	0, 0, 0, 0, 0, 0, 0, // 0x3A-0x40
	0,  1,  2,  3,  4,  5,  6, 7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
	19, 20, 21, 22, 23, 24, 25, 0, 0, 0, 0, 0, 0, // 0x5B-0x0x60
	26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43,
	44, 45, 46, 47, 48, 49, 50, 51];
const base64DecodeMapOffset = 0x2B;
const base64EOF = 0x3D;

/**
 * Decodes the result of encoding with base64EncodeBytes, but not necessarily any other
 * base64-encoded data. Note that this also doesn't do any error checking.
 */
export function decodeRestrictedBase64ToBytes(encoded: string): Uint8Array {
	const byteStr = window.atob(encoded);
	const len = byteStr.length;
	const bytes = new Uint8Array(len);

	for (let i = 0; i < len; i++) {
		bytes[i] = byteStr.charCodeAt(i);
	}

	return bytes;
}

export function escapeString(str: string) {
	if (str !== undefined) {
		str = str.replace(/[^\w$]/gi,'$'); /* No dots, colons, dashes and /s */
		if (/^\d/.test(str)) { /* No digits at the beginning */
			str = '$' + str;
		}
	}
	return str;
}

/**
 * Workaround for max stack size limit.
 */
export function fromCharCodeArray(buffer: Uint8Array | Uint32Array): string {
	let str = '', SLICE = 1024 * 5;
	for (let i = 0; i < buffer.length; i += SLICE) {
		const chunk = Math.min(buffer.length - i, SLICE);
		str += String.fromCharCode.apply(null, buffer.subarray(i, i + chunk));
	}
	return str;
}

const _encoding = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$_';
export function variableLengthEncodeInt32(n) {
	const e = _encoding;
	const bitCount = (32 - Math.clz32(n));
	release || assert (bitCount <= 32, bitCount);
	const l = Math.ceil(bitCount / 6);
	// Encode length followed by six bit chunks.
	let s = e[l];
	for (let i = l - 1; i >= 0; i--) {
		const offset = (i * 6);
		s += e[(n >> offset) & 0x3F];
	}
	release || assert (StringUtilities.variableLengthDecodeInt32(s) === n, n + ' : ' + s + ' - ' + l + ' bits: ' + bitCount);
	return s;
}

export function toEncoding(n) {
	return _encoding[n];
}

export function fromEncoding(c) {
	if (c >= 65 && c <= 90) {
		return c - 65;
	} else if (c >= 97 && c <= 122) {
		return c - 71;
	} else if (c >= 48 && c <= 57) {
		return c + 4;
	} else if (c === 36) {
		return 62;
	} else if (c === 95) {
		return 63;
	}
	release || assert (false, 'Invalid Encoding');
}

export function variableLengthDecodeInt32(s) {
	const l = fromEncoding(s.charCodeAt(0));
	let n = 0;
	for (let i = 0; i < l; i++) {
		const offset = ((l - i - 1) * 6);
		n |= fromEncoding(s.charCodeAt(1 + i)) << offset;
	}
	return n;
}

export function trimMiddle(s: string, maxLength: number): string {
	if (s.length <= maxLength) {
		return s;
	}
	const leftHalf = maxLength >> 1;
	const rightHalf = maxLength - leftHalf - 1;
	return s.substr(0, leftHalf) + '\u2026' + s.substr(s.length - rightHalf, rightHalf);
}

export function multiple(s: string, count: number): string {
	let o = '';
	for (let i = 0; i < count; i++) {
		o += s;
	}
	return o;
}

export function indexOfAny(s: string, chars: string [], position: number) {
	let index = s.length;
	for (let i = 0; i < chars.length; i++) {
		const j = s.indexOf(chars[i], position);
		if (j >= 0) {
			index = Math.min(index, j);
		}
	}
	return index === s.length ? -1 : index;
}

const _concat3array = new Array(3);
const _concat4array = new Array(4);
const _concat9array = new Array(9);

/**
 * The concatN() functions concatenate multiple strings in a way that
 * avoids creating intermediate strings, unlike String.prototype.concat().
 *
 * Note that these functions don't have identical behaviour to using '+',
 * because they will ignore any arguments that are |undefined| or |null|.
 * This usually doesn't matter.
 */

export function concat3(s0: any, s1: any, s2: any) {
	_concat3array[0] = s0;
	_concat3array[1] = s1;
	_concat3array[2] = s2;
	return _concat3array.join('');
}

export function concat4(s0: any, s1: any, s2: any, s3: any) {
	_concat4array[0] = s0;
	_concat4array[1] = s1;
	_concat4array[2] = s2;
	_concat4array[3] = s3;
	return _concat4array.join('');
}

export function concat9(s0: any, s1: any, s2: any, s3: any, s4: any,
	s5: any, s6: any, s7: any, s8: any) {
	_concat9array[0] = s0;
	_concat9array[1] = s1;
	_concat9array[2] = s2;
	_concat9array[3] = s3;
	_concat9array[4] = s4;
	_concat9array[5] = s5;
	_concat9array[6] = s6;
	_concat9array[7] = s7;
	_concat9array[8] = s8;
	return _concat9array.join('');
}

export const StringUtilities = {
	repeatString:repeatString,
	memorySizeToString:memorySizeToString,
	toSafeString:toSafeString,
	toSafeArrayString:toSafeArrayString,
	utf8decode:utf8decode,
	utf8encode:utf8encode,
	base64EncodeBytes:base64EncodeBytes,
	base64DecodeMap:base64DecodeMap,
	base64DecodeMapOffset:base64DecodeMapOffset,
	base64EOF:base64EOF,
	decodeRestrictedBase64ToBytes:decodeRestrictedBase64ToBytes,
	escapeString:escapeString,
	fromCharCodeArray:fromCharCodeArray,
	variableLengthEncodeInt32:variableLengthEncodeInt32,
	toEncoding:toEncoding,
	fromEncoding:fromEncoding,
	variableLengthDecodeInt32:variableLengthDecodeInt32,
	trimMiddle:trimMiddle,
	multiple:multiple,
	indexOfAny:indexOfAny,
	_concat3array:_concat3array,
	_concat4array:_concat4array,
	_concat9array:_concat9array,
	concat3:concat3,
	concat4:concat4,
	concat9:concat9
};