/*
 * Copyright 2015 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// The code derived from:
/* LzmaSpec.c -- LZMA Reference Decoder
 2013-07-28 : Igor Pavlov : Public domain */

import { IDataDecoder } from './utilities/ArrayUtilities';

class InputStream {
	available: number;
	pos: number;
	buffer: Uint8Array;

	constructor() {
		this.available = 0;
		this.pos = 0;
		this.buffer = new Uint8Array(2000);
	}

	append(data: Uint8Array) {
		const length = this.pos + this.available;
		const needLength = length + data.length;
		if (needLength > this.buffer.length) {
			let newLength = this.buffer.length * 2;
			while (newLength < needLength) {
				newLength *= 2;
			}
			const newBuffer = new Uint8Array(newLength);
			newBuffer.set(this.buffer);
			this.buffer = newBuffer;
		}
		this.buffer.set(data, length);
		this.available += data.length;
	}

	compact(): void {
		if (this.available === 0) {
			return;
		}
		this.buffer.set(this.buffer.subarray(this.pos, this.pos + this.available), 0);
		this.pos = 0;
	}

	readByte(): number {
		if (this.available <= 0) {
			throw new Error('Unexpected end of file');
		}
		this.available--;
		return this.buffer[this.pos++];
	}
}

class OutputStream {
	onData: (data: Uint8Array) => void;
	processed: number;

	constructor (onData: (data: Uint8Array) => void) {
		this.onData = onData;
		this.processed = 0;
	}

	writeBytes(data: Uint8Array) {
		this.onData.call(null, data);
		this.processed += data.length;
	}
}

class OutWindow {
	outStream: OutputStream;
	buf: Uint8Array;
	pos: number;
	size: number;
	isFull: boolean;
	writePos: number;
	totalPos: number;

	constructor(outStream: OutputStream) {
		this.outStream = outStream;
		this.buf = null;
		this.pos = 0;
		this.size = 0;
		this.isFull = false;
		this.writePos = 0;

		this.totalPos = 0;
	}

	create(dictSize: number): void {
		this.buf = new Uint8Array(dictSize);
		this.pos = 0;
		this.size = dictSize;
		this.isFull = false;
		this.writePos = 0;
		this.totalPos = 0;
	}

	putByte(b: number): void {
		this.totalPos++;
		this.buf[this.pos++] = b;
		if (this.pos === this.size) {
			this.flush();
			this.pos = 0;
			this.isFull = true;
		}
	}

	getByte(dist: number): number {
		return this.buf[dist <= this.pos ? this.pos - dist : this.size - dist + this.pos];
	}

	flush(): void {
		if (this.writePos < this.pos) {
			this.outStream.writeBytes(this.buf.subarray(this.writePos, this.pos));
			this.writePos = this.pos === this.size ? 0 : this.pos;
		}
	}

	copyMatch(dist: number, len: number): void {
		let pos = this.pos;
		const size = this.size;
		const buffer = this.buf;
		let getPos = dist <= pos ? pos - dist : size - dist + pos;
		let left = len;
		while (left > 0) {
			const chunk = Math.min(Math.min(left, size - pos), size - getPos);
			for (let i = 0; i < chunk; i++) {
				const b = buffer[getPos++];
				buffer[pos++] = b;
			}
			if (pos === size) {
				this.pos = pos;
				this.flush();
				pos = 0;
				this.isFull = true;
			}
			if (getPos === size) {
				getPos = 0;
			}
			left -= chunk;
		}
		this.pos = pos;
		this.totalPos += len;
	}

	checkDistance(dist: number): boolean {
		return dist <= this.pos || this.isFull;
	}

	isEmpty(): boolean {
		return this.pos === 0 && !this.isFull;
	}
}

const kNumBitModelTotalBits = 11;
const kNumMoveBits = 5;

const PROB_INIT_VAL = ((1 << kNumBitModelTotalBits) >> 1);

function createProbsArray(length: number): Uint16Array {
	const p = new Uint16Array(length);
	for (let i = 0; i < length; i++) {
		p[i] = PROB_INIT_VAL;
	}
	return p;
}

const kTopValue = 1 << 24;

class RangeDecoder {
	inStream: InputStream;
	range: number;
	code: number;
	corrupted: boolean;

	constructor(inStream: InputStream) {
		this.inStream = inStream;
		this.range = 0;
		this.code = 0;
		this.corrupted = false;
	}

	init(): void {
		if (this.inStream.readByte() !== 0) {
			this.corrupted = true;
		}

		this.range = 0xFFFFFFFF | 0;
		let code = 0;
		for (let i = 0; i < 4; i++) {
			code = (code << 8) | this.inStream.readByte();
		}

		if (code === this.range) {
			this.corrupted = true;
		}
		this.code = code;
	}

	isFinishedOK(): boolean {
		return this.code === 0;
	}

	decodeDirectBits(numBits: number): number {
		let res = 0;
		let range = this.range;
		let code = this.code;
		do {
			range = (range >>> 1) | 0;
			code = (code - range) | 0;
			const t = code >> 31; // if high bit set -1, otherwise 0
			code = (code + (range & t)) | 0;

			if (code === range) {
				this.corrupted = true;
			}

			if (range >= 0 && range < kTopValue) {
				range = range << 8;
				code = (code << 8) | this.inStream.readByte();
			}

			res = ((res << 1) + t + 1) | 0;
		} while (--numBits);
		this.range = range;
		this.code = code;
		return res;
	}

	decodeBit(prob: Uint16Array, index: number): number {
		let range = this.range;
		let code = this.code;
		let v = prob[index];
		const bound = (range >>> kNumBitModelTotalBits) * v; // keep unsigned
		let symbol;
		if ((code >>> 0) < bound) {
			v = (v + (((1 << kNumBitModelTotalBits) - v) >> kNumMoveBits)) | 0;
			range = bound | 0;
			symbol = 0;
		} else {
			v = (v - (v >> kNumMoveBits)) | 0;
			code = (code - bound) | 0;
			range = (range - bound) | 0;
			symbol = 1;
		}
		prob[index] = v & 0xFFFF;

		if (range >= 0 && range < kTopValue) {
			range = range << 8;
			code = (code << 8) | this.inStream.readByte();
		}
		this.range = range;
		this.code = code;

		return symbol;
	}
}

function bitTreeReverseDecode(probs: Uint16Array, offset: number,
							  numBits: number, rc: RangeDecoder): number {
	let m = 1;
	let symbol = 0;
	for (let i = 0; i < numBits; i++) {
		const bit = rc.decodeBit(probs, m + offset);
		m = (m << 1) + bit;
		symbol |= bit << i;
	}
	return symbol;
}

class BitTreeDecoder {
	numBits: number;
	probs: Uint16Array;

	constructor(numBits: number) {
		this.numBits = numBits;
		this.probs = createProbsArray(1 << numBits);
	}

	decode(rc: RangeDecoder) {
		let m = 1;
		for (let i = 0; i < this.numBits; i++) {
			m = (m << 1) + rc.decodeBit(this.probs, m);
		}
		return m - (1 << this.numBits);
	}

	reverseDecode(rc: RangeDecoder) {
		return bitTreeReverseDecode(this.probs, 0, this.numBits, rc);
	}
}

function createBitTreeDecoderArray(numBits: number, length: number): BitTreeDecoder[] {
	const p: BitTreeDecoder[] = [];
	p.length = length;
	for (let i = 0; i < length; i++) {
		p[i] = new BitTreeDecoder(numBits);
	}
	return p;
}

const kNumPosBitsMax = 4;

const kNumStates = 12;
const kNumLenToPosStates = 4;
const kNumAlignBits = 4;
const kStartPosModelIndex = 4;
const kEndPosModelIndex = 14;
const kNumFullDistances = 1 << (kEndPosModelIndex >> 1);
const kMatchMinLen = 2;

class LenDecoder {
	choice: Uint16Array;
	lowCoder: BitTreeDecoder[];
	midCoder: BitTreeDecoder[];
	highCoder: BitTreeDecoder;

	constructor() {
		this.choice = createProbsArray(2);
		this.lowCoder = createBitTreeDecoderArray(3, 1 << kNumPosBitsMax);
		this.midCoder = createBitTreeDecoderArray(3, 1 << kNumPosBitsMax);
		this.highCoder = new BitTreeDecoder(8);
	}

	decode(rc: RangeDecoder, posState: number): number {
		if (rc.decodeBit(this.choice, 0) === 0) {
			return this.lowCoder[posState].decode(rc);
		}
		if (rc.decodeBit(this.choice, 1) === 0) {
			return 8 + this.midCoder[posState].decode(rc);
		}
		return 16 + this.highCoder.decode(rc);
	}
}

function updateState_Literal(state: number): number {
	if (state < 4) {
		return 0;
	} else if (state < 10) {
		return state - 3;
	} else {
		return state - 6;
	}
}
function updateState_Match(state: number): number {
	return state < 7 ? 7 : 10;
}
function updateState_Rep(state: number): number {
	return state < 7 ? 8 : 11;
}
function updateState_ShortRep(state: number): number {
	return state < 7 ? 9 : 11;
}

const LZMA_DIC_MIN = 1 << 12;

const MAX_DECODE_BITS_CALLS = 48;

class LzmaDecoderInternal {
	rangeDec: RangeDecoder;
	outWindow: OutWindow;
	markerIsMandatory: boolean;
	lc: number;
	pb: number;
	lp: number;
	dictSize: number;
	dictSizeInProperties: number;
	unpackSize: number;
	leftToUnpack: number;
	reps: Int32Array;
	state: number;

	constructor(inStream: InputStream, outStream: OutputStream) {
		this.rangeDec = new RangeDecoder(inStream);
		this.outWindow = new OutWindow(outStream);

		this.markerIsMandatory = false;
		this.lc = 0;
		this.pb = 0;
		this.lp = 0;
		this.dictSize = 0;
		this.dictSizeInProperties = 0;
		this.unpackSize = undefined;
		this.leftToUnpack = undefined;

		this.reps = new Int32Array(4);
		this.state = 0;
	}

	decodeProperties(properties: Uint8Array) {
		let d = properties[0];
		if (d >= (9 * 5 * 5)) {
			throw new Error('Incorrect LZMA properties');
		}
		this.lc = d % 9;
		d = (d / 9) | 0;
		this.pb = (d / 5) | 0;
		this.lp = d % 5;
		this.dictSizeInProperties = 0;
		for (let i = 0; i < 4; i++) {
			this.dictSizeInProperties |= properties[i + 1] << (8 * i);
		}
		this.dictSize = this.dictSizeInProperties;
		if (this.dictSize < LZMA_DIC_MIN) {
			this.dictSize = LZMA_DIC_MIN;
		}
	}

	create(): void {
		this.outWindow.create(this.dictSize);

		this.init();
		this.rangeDec.init();

		this.reps[0] = 0;
		this.reps[1] = 0;
		this.reps[2] = 0;
		this.reps[3] = 0;
		this.state = 0;
		this.leftToUnpack = this.unpackSize;
	}

	decodeLiteral(state: number, rep0: number): number {
		const outWindow = this.outWindow;
		const rangeDec = this.rangeDec;

		let prevByte = 0;
		if (!outWindow.isEmpty()) {
			prevByte = outWindow.getByte(1);
		}

		let symbol = 1;
		const litState = ((outWindow.totalPos & ((1 << this.lp) - 1)) << this.lc) + (prevByte >> (8 - this.lc));
		const probsIndex = 0x300 * litState;

		if (state >= 7) {
			let matchByte = outWindow.getByte(rep0 + 1);
			do {
				const matchBit = (matchByte >> 7) & 1;
				matchByte <<= 1;
				const bit = rangeDec.decodeBit(this.litProbs, probsIndex + (((1 + matchBit) << 8) + symbol));
				symbol = (symbol << 1) | bit;
				if (matchBit !== bit) {
					break;
				}
			} while (symbol < 0x100);
		}
		while (symbol < 0x100) {
			symbol =
				(symbol << 1) | rangeDec.decodeBit(this.litProbs, probsIndex + symbol);
		}
		return (symbol - 0x100) & 0xFF;
	}

	decodeDistance(len: number) {
		let lenState = len;
		if (lenState > kNumLenToPosStates - 1) {
			lenState = kNumLenToPosStates - 1;
		}
		const rangeDec = this.rangeDec;
		const posSlot = this.posSlotDecoder[lenState].decode(rangeDec);
		if (posSlot < 4) {
			return posSlot;
		}
		const numDirectBits = (posSlot >> 1) - 1;
		let dist = (2 | (posSlot & 1)) << numDirectBits;
		if (posSlot < kEndPosModelIndex) {
			dist =
				(dist + bitTreeReverseDecode(this.posDecoders, dist - posSlot, numDirectBits, rangeDec)) | 0;
		} else {
			dist =
				(dist + (rangeDec.decodeDirectBits(numDirectBits - kNumAlignBits) << kNumAlignBits)) | 0;
			dist = (dist + this.alignDecoder.reverseDecode(rangeDec)) | 0;
		}
		return dist;
	}

	litProbs: Uint16Array;
	posSlotDecoder: BitTreeDecoder[];
	alignDecoder: BitTreeDecoder;
	posDecoders: Uint16Array;
	isMatch: Uint16Array;
	isRep: Uint16Array;
	isRepG0: Uint16Array;
	isRepG1: Uint16Array;
	isRepG2: Uint16Array;
	isRep0Long: Uint16Array;
	lenDecoder: LenDecoder;
	repLenDecoder: LenDecoder;

	init() {
		this.litProbs = createProbsArray(0x300 << (this.lc + this.lp));

		this.posSlotDecoder = createBitTreeDecoderArray(6, kNumLenToPosStates);
		this.alignDecoder = new BitTreeDecoder(kNumAlignBits);
		this.posDecoders =
			createProbsArray(1 + kNumFullDistances - kEndPosModelIndex);

		this.isMatch = createProbsArray(kNumStates << kNumPosBitsMax);
		this.isRep = createProbsArray(kNumStates);
		this.isRepG0 = createProbsArray(kNumStates);
		this.isRepG1 = createProbsArray(kNumStates);
		this.isRepG2 = createProbsArray(kNumStates);
		this.isRep0Long = createProbsArray(kNumStates << kNumPosBitsMax);

		this.lenDecoder = new LenDecoder();
		this.repLenDecoder = new LenDecoder();
	}

	decode(notFinal: boolean): number {
		const rangeDec = this.rangeDec;
		const outWindow = this.outWindow;
		const pb = this.pb;
		const dictSize = this.dictSize;
		const markerIsMandatory = this.markerIsMandatory;
		let leftToUnpack = this.leftToUnpack;

		const isMatch = this.isMatch;
		const isRep = this.isRep;
		const isRepG0 = this.isRepG0;
		const isRepG1 = this.isRepG1;
		const isRepG2 = this.isRepG2;
		const isRep0Long = this.isRep0Long;
		const lenDecoder = this.lenDecoder;
		const repLenDecoder = this.repLenDecoder;

		let rep0 = this.reps[0];
		let rep1 = this.reps[1];
		let rep2 = this.reps[2];
		let rep3 = this.reps[3];
		let state = this.state;

		while (true) {
			// Based on worse case scenario one byte consumed per decodeBit calls,
			// reserving keeping some amount of bytes in the input stream for
			// non-final data blocks.
			if (notFinal && rangeDec.inStream.available < MAX_DECODE_BITS_CALLS) {
				this.outWindow.flush();
				break;
			}

			if (leftToUnpack === 0 && !markerIsMandatory) {
				this.outWindow.flush();
				if (rangeDec.isFinishedOK()) {
					return LZMA_RES_FINISHED_WITHOUT_MARKER;
				}
			}

			const posState = outWindow.totalPos & ((1 << pb) - 1);

			if (rangeDec.decodeBit(isMatch, (state << kNumPosBitsMax) + posState) === 0) {
				if (leftToUnpack === 0) {
					return LZMA_RES_ERROR;
				}
				outWindow.putByte(this.decodeLiteral(state, rep0));
				state = updateState_Literal(state);
				leftToUnpack--;
				continue;
			}

			var len;
			if (rangeDec.decodeBit(isRep, state) !== 0) {
				if (leftToUnpack === 0) {
					return LZMA_RES_ERROR;
				}
				if (outWindow.isEmpty()) {
					return LZMA_RES_ERROR;
				}
				if (rangeDec.decodeBit(isRepG0, state) === 0) {
					if (rangeDec.decodeBit(isRep0Long, (state << kNumPosBitsMax) + posState) === 0) {
						state = updateState_ShortRep(state);
						outWindow.putByte(outWindow.getByte(rep0 + 1));
						leftToUnpack--;
						continue;
					}
				} else {
					var dist;
					if (rangeDec.decodeBit(isRepG1, state) === 0) {
						dist = rep1;
					} else {
						if (rangeDec.decodeBit(isRepG2, state) === 0) {
							dist = rep2;
						} else {
							dist = rep3;
							rep3 = rep2;
						}
						rep2 = rep1;
					}
					rep1 = rep0;
					rep0 = dist;
				}
				len = repLenDecoder.decode(rangeDec, posState);
				state = updateState_Rep(state);
			} else {
				rep3 = rep2;
				rep2 = rep1;
				rep1 = rep0;
				len = lenDecoder.decode(rangeDec, posState);
				state = updateState_Match(state);
				rep0 = this.decodeDistance(len);
				if (rep0 === -1) {
					this.outWindow.flush();
					return rangeDec.isFinishedOK() ?
						LZMA_RES_FINISHED_WITH_MARKER :
						LZMA_RES_ERROR;
				}

				if (leftToUnpack === 0) {
					return LZMA_RES_ERROR;
				}
				if (rep0 >= dictSize || !outWindow.checkDistance(rep0)) {
					return LZMA_RES_ERROR;
				}
			}
			len += kMatchMinLen;
			let isError = false;
			if (leftToUnpack !== undefined && leftToUnpack < len) {
				len = leftToUnpack;
				isError = true;
			}
			outWindow.copyMatch(rep0 + 1, len);
			leftToUnpack -= len;
			if (isError) {
				return LZMA_RES_ERROR;
			}
		}

		this.state = state;
		this.reps[0] = rep0;
		this.reps[1] = rep1;
		this.reps[2] = rep2;
		this.reps[3] = rep3;
		this.leftToUnpack = leftToUnpack;
		return LZMA_RES_NOT_COMPLETE;
	}

	flushOutput(): void {
		this.outWindow.flush();
	}
}

var LZMA_RES_ERROR = 0;
var LZMA_RES_FINISHED_WITH_MARKER = 1;
var LZMA_RES_FINISHED_WITHOUT_MARKER = 2;
var LZMA_RES_NOT_COMPLETE = 3;

const SWF_LZMA_HEADER_LENGTH = 17;
const STANDARD_LZMA_HEADER_LENGTH = 13;
const EXTRA_LZMA_BYTES_NEEDED = 5;

enum LzmaDecoderState {
	WAIT_FOR_LZMA_HEADER = 0,
	WAIT_FOR_SWF_HEADER = 1,
	PROCESS_DATA = 2,
	CLOSED = 3,
	ERROR = 4
}

export class LzmaDecoder implements IDataDecoder {
	public onData: (data: Uint8Array) => void;
	public onError: (e) => void;
	private _state: LzmaDecoderState;
	buffer: Uint8Array;
	private _inStream: InputStream;
	private _outStream: OutputStream;
	private _decoder: LzmaDecoderInternal;

	constructor(swfHeader: boolean = false) {
		this._state = swfHeader ? LzmaDecoderState.WAIT_FOR_SWF_HEADER :
			LzmaDecoderState.WAIT_FOR_LZMA_HEADER;
		this.buffer = null;
	}

	public push(data: Uint8Array) {
		if (this._state < LzmaDecoderState.PROCESS_DATA) {
			const buffered = this.buffer ? this.buffer.length : 0;
			const headerBytesExpected =
				(this._state === LzmaDecoderState.WAIT_FOR_SWF_HEADER ?
					SWF_LZMA_HEADER_LENGTH : STANDARD_LZMA_HEADER_LENGTH) +
				EXTRA_LZMA_BYTES_NEEDED;
			if (buffered + data.length < headerBytesExpected) {
				const newBuffer = new Uint8Array(buffered + data.length);
				if (buffered > 0) {
					newBuffer.set(this.buffer);
				}
				newBuffer.set(data, buffered);
				this.buffer = newBuffer;
				return;
			}

			const header = new Uint8Array(headerBytesExpected);
			if (buffered > 0) {
				header.set(this.buffer);
			}
			header.set(data.subarray(0, headerBytesExpected - buffered), buffered);

			this._inStream = new InputStream();
			this._inStream.append(header.subarray(headerBytesExpected - EXTRA_LZMA_BYTES_NEEDED));

			this._outStream = new OutputStream(function (data) {
				this.onData.call(null, data);
			}.bind(this));

			this._decoder = new LzmaDecoderInternal(this._inStream, this._outStream);
			// See http://helpx.adobe.com/flash-player/kb/exception-thrown-you-decompress-lzma-compressed.html
			if (this._state === LzmaDecoderState.WAIT_FOR_SWF_HEADER) {
				this._decoder.decodeProperties(header.subarray(12, 17));
				this._decoder.markerIsMandatory = false;
				this._decoder.unpackSize = ((header[4] | (header[5] << 8) |
					(header[6] << 16) | (header[7] << 24)) >>> 0) - 8;
			} else {
				this._decoder.decodeProperties(header.subarray(0, 5));
				let unpackSize = 0;
				let unpackSizeDefined = false;
				for (let i = 0; i < 8; i++) {
					const b = header[5 + i];
					if (b !== 0xFF) {
						unpackSizeDefined = true;
					}
					unpackSize |= b << (8 * i);
				}
				this._decoder.markerIsMandatory = !unpackSizeDefined;
				this._decoder.unpackSize = unpackSizeDefined ? unpackSize : undefined;
			}
			this._decoder.create();

			data = data.subarray(headerBytesExpected);
			this._state = LzmaDecoderState.PROCESS_DATA;
		} else if (this._state !== LzmaDecoderState.PROCESS_DATA) {
			return;
		}

		try {
			this._inStream.append(data);
			const res = this._decoder.decode(true);
			this._inStream.compact();

			if (res !== LZMA_RES_NOT_COMPLETE) {
				this._checkError(res);
			}
		} catch (e) {
			this._decoder.flushOutput();
			this._decoder = null;
			this._error(e);
		}
	}

	public close() {
		if (this._state !== LzmaDecoderState.PROCESS_DATA) {
			return;
		}
		this._state = LzmaDecoderState.CLOSED;
		try {
			const res = this._decoder.decode(false);
			this._checkError(res);
		} catch (e) {
			this._decoder.flushOutput();
			this._error(e);
		}
		this._decoder = null;
	}

	private _error(error) {
		// Stopping processing any data if an error occurs.
		this._state = LzmaDecoderState.ERROR;
		if (this.onError) {
			this.onError(error);
		}
	}

	private _checkError(res) {
		let error;
		if (res === LZMA_RES_ERROR) {
			error = 'LZMA decoding error';
		} else if (res === LZMA_RES_NOT_COMPLETE) {
			error = 'Decoding is not complete';
		} else if (res === LZMA_RES_FINISHED_WITH_MARKER) {
			if (this._decoder.unpackSize !== undefined &&
				this._decoder.unpackSize !== this._outStream.processed) {
				error = 'Finished with end marker before than specified size';
			}
		} else {
			error = 'Internal LZMA Error';
		}

		if (error) {
			this._error(error);
		}
	}
}
