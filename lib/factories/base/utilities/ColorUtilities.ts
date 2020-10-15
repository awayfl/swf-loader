
import { concat9 } from './StringUtilities';
import { Cache } from './Cache';
import { ImageType } from '../utilities';
import { assert, release, somewhatImplemented } from './Debug';
import { swap32 } from './IntegerUtilities';

export function RGBAToARGB(rgba: number): number {
	return ((rgba >> 8) & 0x00ffffff) | ((rgba & 0xff) << 24);
}

export function ARGBToRGBA(argb: number): number {
	return argb << 8 | ((argb >> 24) & 0xff);
}

/**
 * Cache frequently used rgba -> css style conversions.
 */
const rgbaToCSSStyleCache = new Cache(1024);

export function rgbaToCSSStyle(rgba: number): string {
	let result = rgbaToCSSStyleCache.get(rgba);
	if (typeof result === 'string') {
		return result;
	}
	result = concat9('rgba(', rgba >> 24 & 0xff, ',', rgba >> 16 & 0xff, ',', rgba >> 8 & 0xff, ',', (rgba & 0xff) / 0xff, ')');
	rgbaToCSSStyleCache.set(rgba, result);
	return result;
}

/**
 * Cache frequently used css -> rgba styles conversions.
 */
const cssStyleToRGBACache = new Cache(1024);

export function cssStyleToRGBA(style: string) {
	let result = cssStyleToRGBACache.get(style);
	if (typeof result === 'number') {
		return result;
	}
	result =  0xff0000ff; // Red
	if (style[0] === '#') {
		if (style.length === 7) {
			result = (parseInt(style.substring(1), 16) << 8) | 0xff;
		}
	} else if (style[0] === 'r') {
		// We don't parse all types of rgba(....) color styles. We only handle the
		// ones we generate ourselves.
		const values = style.substring(5, style.length - 1).split(',');
		const r = parseInt(values[0]);
		const g = parseInt(values[1]);
		const b = parseInt(values[2]);
		const a = parseFloat(values[3]);
		result = (r & 0xff) << 24 |
			(g & 0xff) << 16 |
			(b & 0xff) << 8  |
			((a * 255) & 0xff);
	}
	cssStyleToRGBACache.set(style, result);
	return result;
}

export function hexToRGB(color: string): number {
	return parseInt(color.slice(1), 16);
}

export function rgbToHex(color: number): string {
	return '#' + ('000000' + (color >>> 0).toString(16)).slice(-6);
}

export function isValidHexColor(value: any): boolean {
	return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
}

export function clampByte(value: number) {
	return Math.max(0, Math.min(255, value));
}

/**
 * Unpremultiplies the given |pARGB| color value.
 */
export function unpremultiplyARGB(pARGB: number) {
	let b = (pARGB >>  0) & 0xff;
	let g = (pARGB >>  8) & 0xff;
	let r = (pARGB >> 16) & 0xff;
	const a = (pARGB >> 24) & 0xff;
	r = Math.imul(255, r) / a & 0xff;
	g = Math.imul(255, g) / a & 0xff;
	b = Math.imul(255, b) / a & 0xff;
	return a << 24 | r << 16 | g << 8 | b;
}

/**
 * Premultiplies the given |pARGB| color value.
 */
export function premultiplyARGB(uARGB: number) {
	let b = (uARGB >>  0) & 0xff;
	let g = (uARGB >>  8) & 0xff;
	let r = (uARGB >> 16) & 0xff;
	const a = (uARGB >> 24) & 0xff;
	r = ((Math.imul(r, a) + 127) / 255) | 0;
	g = ((Math.imul(g, a) + 127) / 255) | 0;
	b = ((Math.imul(b, a) + 127) / 255) | 0;
	return a << 24 | r << 16 | g << 8 | b;
}

let premultiplyTable: Uint8Array;

/**
 * All possible alpha values and colors 256 * 256 = 65536 entries. Experiments
 * indicate that doing unpremultiplication this way is roughly 5x faster.
 *
 * To lookup a color |c| in the table at a given alpha value |a| use:
 * |(a << 8) + c| to compute the index. This layout order was chosen to make
 * table lookups cache friendly, it actually makes a difference.
 *
 * TODO: Figure out if memory / speed tradeoff is worth it.
 */
let unpremultiplyTable: Uint8Array;

/**
 * Make sure to call this before using the |unpremultiplyARGBUsingTableLookup| or
 * |premultiplyARGBUsingTableLookup| functions. We want to execute this lazily so
 * we don't incur any startup overhead.
 */
export function ensureUnpremultiplyTable() {
	if (!unpremultiplyTable) {
		unpremultiplyTable = new Uint8Array(256 * 256);
		for (let c = 0; c < 256; c++) {
			for (let a = 0; a < 256; a++) {
				unpremultiplyTable[(a << 8) + c] = Math.imul(255, c) / a;
			}
		}
	}
}

export function getUnpremultiplyTable(): Uint8Array {
	ensureUnpremultiplyTable();
	return unpremultiplyTable;
}

export function tableLookupUnpremultiplyARGB(pARGB): number {
	pARGB = pARGB | 0;
	const a = (pARGB >> 24) & 0xff;
	if (a === 0) {
		return 0;
	} else if (a === 0xff) {
		return pARGB;
	}
	let b = (pARGB >>  0) & 0xff;
	let g = (pARGB >>  8) & 0xff;
	let r = (pARGB >> 16) & 0xff;
	const o = a << 8;
	const T = unpremultiplyTable;
	r = T[o + r];
	g = T[o + g];
	b = T[o + b];
	return a << 24 | r << 16 | g << 8 | b;
}

/**
 * The blending equation for unpremultiplied alpha is:
 *
 *   (src.rgb * src.a) + (dst.rgb * (1 - src.a))
 *
 * For premultiplied alpha src.rgb and dst.rgb are already
 * premultiplied by alpha, so the equation becomes:
 *
 *   src.rgb + (dst.rgb * (1 - src.a))
 *
 * TODO: Not sure what to do about the dst.rgb which is
 * premultiplied by its alpah, but this appears to work.
 *
 * We use the "double blend trick" (http://stereopsis.com/doubleblend.html) to
 * compute GA and BR without unpacking them.
 */
declare interface Math{
	imul(a,b): number;
}

export function blendPremultipliedBGRA(tpBGRA: number, spBGRA: number) {
	const sA  = spBGRA & 0xff;
	const sGA = spBGRA      & 0x00ff00ff;
	const sBR = spBGRA >> 8 & 0x00ff00ff;
	let tGA = tpBGRA      & 0x00ff00ff;
	let tBR = tpBGRA >> 8 & 0x00ff00ff;
	const A  = 256 - sA;
	tGA = Math.imul(tGA, A) >> 8;
	tBR = Math.imul(tBR, A) >> 8;
	return ((sBR + tBR & 0x00ff00ff) << 8) | (sGA + tGA & 0x00ff00ff);
}

export function convertImage(sourceFormat: ImageType, targetFormat: ImageType, source: Int32Array, target: Int32Array) {
	if (source !== target) {
		release || assert(source.buffer !== target.buffer, 'Can\'t handle overlapping views.');
	}
	const length = source.length;
	if (sourceFormat === targetFormat) {
		if (source === target) {
			return;
		}
		for (var i = 0; i < length; i++) {
			target[i] = source[i];
		}
		return;
	}
	// enterTimeline("convertImage", ImageType[sourceFormat] + " to " + ImageType[targetFormat] + " (" + memorySizeToString(source.length));
	if (sourceFormat === ImageType.PremultipliedAlphaARGB &&
		targetFormat === ImageType.StraightAlphaRGBA) {
		ensureUnpremultiplyTable();
		for (var i = 0; i < length; i++) {
			const pBGRA = source[i];
			const a = pBGRA & 0xff;
			if (a === 0) {
				target[i] = 0;
			} else if (a === 0xff) {
				target[i] = 0xff000000 | ((pBGRA >> 8) & 0x00ffffff);
			} else {
				let b = (pBGRA >> 24) & 0xff;
				let g = (pBGRA >> 16) & 0xff;
				let r = (pBGRA >>  8) & 0xff;
				const o = a << 8;
				const T = unpremultiplyTable;
				r = T[o + r];
				g = T[o + g];
				b = T[o + b];
				target[i] = a << 24 | b << 16 | g << 8 | r;
			}
		}
	} else if (sourceFormat === ImageType.StraightAlphaARGB &&
		targetFormat === ImageType.StraightAlphaRGBA) {
		for (var i = 0; i < length; i++) {
			target[i] = swap32(source[i]);
		}
	} else if (sourceFormat === ImageType.StraightAlphaRGBA &&
		targetFormat === ImageType.PremultipliedAlphaARGB) {
		for (var i = 0; i < length; i++) {
			const uABGR = source[i];
			const uARGB = (uABGR & 0xFF00FF00)  | // A_G_
				(uABGR >> 16) & 0xff  | // A_GB
				(uABGR & 0xff) << 16;   // ARGR
			target[i] = swap32(premultiplyARGB(uARGB));
		}
	} else {
		release || somewhatImplemented('Image Format Conversion: ' + ImageType[sourceFormat] + ' -> ' + ImageType[targetFormat]);
		// Copy the buffer over for now, we should at least get some image output.
		for (var i = 0; i < length; i++) {
			target[i] = source[i];
		}
	}
	// leaveTimeline("convertImage");
}

export const ColorUtilitites = {
	RGBAToARGB:RGBAToARGB,
	ARGBToRGBA:ARGBToRGBA,
	cssStyleToRGBACache:cssStyleToRGBACache,
	rgbaToCSSStyle:rgbaToCSSStyle,
	cssStyleToRGBA:cssStyleToRGBA,
	hexToRGB:hexToRGB,
	rgbToHex:rgbToHex,
	isValidHexColor:isValidHexColor,
	clampByte:clampByte,
	unpremultiplyARGB:unpremultiplyARGB,
	premultiplyARGB:premultiplyARGB,
	premultiplyTable:premultiplyTable,
	unpremultiplyTable:unpremultiplyTable,
	ensureUnpremultiplyTable:ensureUnpremultiplyTable,
	getUnpremultiplyTable:getUnpremultiplyTable,
	tableLookupUnpremultiplyARGB:tableLookupUnpremultiplyARGB,
	blendPremultipliedBGRA:blendPremultipliedBGRA,
	convertImage:convertImage
};
