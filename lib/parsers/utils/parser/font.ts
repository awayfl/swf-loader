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

import { FontTag, FontFlags, SwfTagCode } from '../../../factories/base/SWFTags';
import { Font, TesselatedFontTable, DefaultFontManager, DeviceFontManager, FontStyleName } from '@awayjs/scene';
import { GraphicsPath, ShapeRecordFlags } from '@awayjs/graphics';
import { OpenTypeParser } from './OpenTypeParser';

const pow = Math.pow;
const min = Math.min;
const max = Math.max;
const logE = Math.log;
const fromCharCode = String.fromCharCode;

const nextFontId = 1;

function maxPower2(num) {
	let maxPower = 0;
	let val = num;
	while (val >= 2) {
		val /= 2;
		++maxPower;
	}
	return pow(2, maxPower);
}
function toString16(val) {
	return fromCharCode((val >> 8) & 0xff, val & 0xff);
}
function toString32(val) {
	return toString16(val >> 16) + toString16(val);
}

/**
 * Heuristic to detect if DefineFont2 was scaled as Font3: scanning all
 * x and y coordinates of the glyphs and if their bounding box dimensions
 * greater than 5000 (that's more than enough for normal TrueType font),
 * then the font coordinates were scaled by 20.
 */
function isScaledFont2(glyphs) {
	let xMin = 0,
		yMin = 0,
		xMax = 0,
		yMax = 0;
	for (let i = 0; i < glyphs.length; i++) {
		const records = glyphs[i];
		if (!records) {
			continue;
		}
		var record;
		let x = 0;
		let y = 0;

		for (let j = 0; j < records.length; j++) {
			record = records[j];
			if (record.type) {
				if (record.flags & ShapeRecordFlags.IsStraight) {
					x += record.deltaX || 0;
					y += -(record.deltaY || 0);
				} else {
					x += record.controlDeltaX;
					y += -record.controlDeltaY;
					x += record.anchorDeltaX;
					y += -record.anchorDeltaY;
				}
			} else {
				if (record.flags & ShapeRecordFlags.Move) {
					x = record.moveX;
					y = -record.moveY;
				}
			}

			if (xMin > x) {
				xMin = x;
			}
			if (yMin > y) {
				yMin = y;
			}
			if (xMax < x) {
				xMax = x;
			}
			if (yMax < y) {
				yMax = y;
			}
		}
	}
	const maxDimension = Math.max(xMax - xMin, yMax - yMin);
	return maxDimension > 5000;
}

export function defineFont(tag: FontTag, ns: string): any {
	const uniqueName = 'swf-font-' + tag.id;
	let fontName = tag.name || uniqueName;

	if (fontName == 'Helvetica') fontName = 'arial';

	let openTypeFont;
	if (tag.code == SwfTagCode.CODE_DEFINE_FONT4) {
		openTypeFont = OpenTypeParser.parseData(tag);
	}

	const glyphs = tag.glyphs;
	const glyphCount = glyphs ? glyphs.length : 0;

	const font = {
		type: 'font',
		id: tag.id,
		name: fontName,
		bold: !!(tag.flags & FontFlags.Bold),
		italic: !!(tag.flags & FontFlags.Italic),
		codes: tag.codes,
		metrics: null,
		data: tag.data,
		originalSize: false,
		away: null,
		fontStyleName: FontStyleName.STANDART,
	};
	let fontStyleName = FontStyleName.STANDART;
	if (font.bold && !font.italic) {
		fontStyleName = FontStyleName.BOLD;
	} else if (!font.bold && font.italic) {
		fontStyleName = FontStyleName.ITALIC;
	} else if (font.bold && font.italic) {
		fontStyleName = FontStyleName.BOLDITALIC;
	}
	font.fontStyleName = fontStyleName;

	if (!glyphCount && !openTypeFont) {
		font.away = DeviceFontManager.getDeviceFont(fontName);
		return font;
	}
	let fontAJS: Font;
	if (openTypeFont)
		fontAJS = DefaultFontManager.defineFont_CFF(fontName, ns);
	else
		fontAJS = DefaultFontManager.defineFont(fontName, ns);

	font.away = fontAJS;
	fontAJS.name = fontName;
	//console.log("define font", fontName, " - ", fontStyleName);
	const tessFontTableAJS: TesselatedFontTable = <TesselatedFontTable>(
		fontAJS.create_font_table(fontStyleName, TesselatedFontTable.assetType)
	);
	if (openTypeFont) {
		tessFontTableAJS.changeOpenTypeFont(openTypeFont);
		return font;

	}
	//var tessFontTableAJS:TesselatedFontTable=new TesselatedFontTable();
	//fontAJS.font_styles.push(tessFontTableAJS);

	//console.log("parsed font = ", fontName, fontStyleName);

	const tables = {};
	const codes = [];
	const glyphIndex = {};
	const ranges = [];

	let originalCode;
	const generateAdvancement = !('advance' in tag);
	const correction = 0;
	const isFont2 = tag.code === SwfTagCode.CODE_DEFINE_FONT2;
	const isFont3 = tag.code === SwfTagCode.CODE_DEFINE_FONT3;

	if (generateAdvancement) {
		tag.advance = [];
	}

	let maxCode = Math.max.apply(null, tag.codes) || 35;

	if (tag.codes) {
		for (var i = 0; i < tag.codes.length; i++) {
			var code = tag.codes[i];
			//console.log(code);
			if (code < 32 || code in glyphIndex) {
				maxCode++;
				if (maxCode == 8232) {
					maxCode = 8240;
				}
				code = maxCode;
			}
			codes.push(code);
			glyphIndex[code] = i;
		}

		originalCode = codes.concat();

		codes.sort(function (a, b) {
			return a - b;
		});
		var i = 0;
		var code: number;
		var indices;
		while ((code = codes[i++]) !== undefined) {
			var start = code;
			var end = start;
			indices = [i - 1];
			while ((code = codes[i]) !== undefined && end + 1 === code) {
				++end;
				indices.push(i);
				++i;
			}
			ranges.push([start, end, indices]);
		}
	} else {
		indices = [];
		const UAC_OFFSET = 0xe000;
		for (var i = 0; i < glyphCount; i++) {
			code = UAC_OFFSET + i;
			//console.log(code);
			codes.push(code);
			glyphIndex[code] = i;
			indices.push(i);
		}
		ranges.push([UAC_OFFSET, UAC_OFFSET + glyphCount - 1, indices]);
		originalCode = codes.concat();
	}

	let resolution = tag.resolution || 1;
	if (isFont2 && isScaledFont2(glyphs)) {
		// some DefineFont2 without layout using DefineFont3 resolution, why?
		resolution = 20;
		font.originalSize = true;
	}
	const ascent = Math.ceil(tag.ascent / resolution) || 1024;
	let descent = -Math.ceil(tag.descent / resolution) || 0;

	if (tessFontTableAJS.ascent != 0) {
	} else {
		tessFontTableAJS.ascent = ascent;
		tessFontTableAJS.descent = descent;
	}

	const offsetY = tessFontTableAJS.ascent;
	const leading = tag.leading / resolution || 0;
	tables['OS/2'] = '';

	let startCount = '';
	let endCount = '';
	let idDelta = '';
	let idRangeOffset = '';
	var i = 0;
	let range;
	while ((range = ranges[i++])) {
		var start: number = range[0];
		var end: number = range[1];
		var code: number = range[2][0];
		startCount += toString16(start);
		endCount += toString16(end);
		idDelta += toString16((code - start + 1) & 0xffff);
		idRangeOffset += toString16(0);
	}
	endCount += '\xff\xff';
	startCount += '\xff\xff';
	idDelta += '\x00\x01';
	idRangeOffset += '\x00\x00';
	const segCount = ranges.length + 1;
	var searchRange = maxPower2(segCount) * 2;
	const rangeShift = 2 * segCount - searchRange;
	const format314 =
		'\x00\x00' + // language
		toString16(segCount * 2) + // segCountX2
		toString16(searchRange) +
		toString16(logE(segCount) / logE(2)) + // entrySelector
		toString16(rangeShift) +
		endCount +
		'\x00\x00' + // reservedPad
		startCount +
		idDelta +
		idRangeOffset;
	tables['cmap'] =
		'\x00\x00' + // version
		'\x00\x01' + // numTables
		'\x00\x03' + // platformID
		'\x00\x01' + // encodingID
		'\x00\x00\x00\x0c' + // offset
		'\x00\x04' + // format
		toString16(format314.length + 4) + // length
		format314;

	const glyf = '\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x31\x00';
	const loca = '\x00\x00';
	const offset = 16;
	let maxPoints = 0;
	const xMins = [];
	const xMaxs = [];
	const yMins = [];
	const yMaxs = [];
	let maxContours = 0;
	var i = 0;
	var code: number;
	const rawData = {};
	while ((code = codes[i++]) !== undefined) {
		var records = glyphs[glyphIndex[code]];
		var x = 0;
		var y = 0;

		var myFlags = '';
		var myEndpts = '';
		var endPoint = 0;
		var segments = [];
		var segmentIndex = -1;

		for (var j = 0; j < records.length; j++) {
			record = records[j];
			if (record.type) {
				if (segmentIndex < 0) {
					segmentIndex = 0;
					segments[segmentIndex] = { data: [], commands: [], xMin: 0, xMax: 0, yMin: 0, yMax: 0 };
				}
				if (record.flags & ShapeRecordFlags.IsStraight) {
					segments[segmentIndex].commands.push(2);
					var dx = (record.deltaX || 0) / resolution;
					var dy = -(record.deltaY || 0) / resolution;
					x += dx;
					y += dy;
					segments[segmentIndex].data.push(x, y);
				} else {
					segments[segmentIndex].commands.push(3);
					var cx = record.controlDeltaX / resolution;
					var cy = -record.controlDeltaY / resolution;
					x += cx;
					y += cy;
					segments[segmentIndex].data.push(x, y);
					var dx = record.anchorDeltaX / resolution;
					var dy = -record.anchorDeltaY / resolution;
					x += dx;
					y += dy;
					segments[segmentIndex].data.push(x, y);
				}
			} else {
				if (record.flags & ShapeRecordFlags.Move) {
					segmentIndex++;
					segments[segmentIndex] = { data: [], commands: [], xMin: 0, xMax: 0, yMin: 0, yMax: 0 };
					segments[segmentIndex].commands.push(1);
					const moveX = record.moveX / resolution;
					const moveY = -record.moveY / resolution;
					var dx = moveX - x;
					var dy = moveY - y;
					x = moveX;
					y = moveY;
					segments[segmentIndex].data.push(x, y);
				}
			}

			if (segmentIndex > -1) {
				if (segments[segmentIndex].xMin > x) {
					segments[segmentIndex].xMin = x;
				}
				if (segments[segmentIndex].yMin > y) {
					segments[segmentIndex].yMin = y;
				}
				if (segments[segmentIndex].xMax < x) {
					segments[segmentIndex].xMax = x;
				}
				if (segments[segmentIndex].yMax < y) {
					segments[segmentIndex].yMax = y;
				}
			}
		}

		if (!isFont3) {
			segments.sort(function (a, b) {
				return (b.xMax - b.xMin) * (b.yMax - b.yMin) - (a.xMax - a.xMin) * (a.yMax - a.yMin);
			});
		}

		rawData[code] = segments;
	}

	let whiteSpaceWidth = 0;
	i = 0;
	let minx = 99999999;
	let maxx = -99999999;
	let miny = 99999999;
	let maxy = -99999999;
	while ((code = codes[i++]) !== undefined) {
		const glyphPath: GraphicsPath = new GraphicsPath();
		const idx = glyphIndex[code];
		var records = glyphs[idx];
		segments = rawData[code];
		var numberOfContours = 1;
		var endPoint = 0;
		const endPtsOfContours = '';
		let flags = '';
		var x = 0;
		var y = 0;
		let xMin = 0;
		let xMax = -1024;
		let yMin = 0;
		let yMax = -1024;

		var myFlags = '';
		var myEndpts = '';
		var endPoint = 0;
		var segmentIndex = -1;

		let data = [];
		let commands = [];

		for (j = 0; j < segments.length; j++) {
			data = data.concat(segments[j].data);
			commands = commands.concat(segments[j].commands);
		}

		x = 0;
		y = 0;
		let nx = 0;
		let ny = 0;
		let dataIndex = 0;
		var endPoint = 0;
		var numberOfContours = 1;
		var myEndpts = '';
		for (j = 0; j < commands.length; j++) {
			const command = commands[j];
			if (command === 1) {
				if (endPoint) {
					++numberOfContours;
					myEndpts += toString16(endPoint - 1);
				}
				nx = data[dataIndex++];
				ny = data[dataIndex++];
				var dx = nx - x;
				var dy = ny - y;
				myFlags += '\x01';
				if (minx > nx) {
					minx = nx;
				}
				if (maxx < nx) {
					maxx = nx;
				}
				if (miny > ny) {
					miny = ny;
				}
				if (maxy < ny) {
					maxy = ny;
				}
				glyphPath.moveTo(nx, -1 * ny + offsetY);
				x = nx;
				y = ny;
			} else if (command === 2) {
				nx = data[dataIndex++];
				ny = data[dataIndex++];
				var dx = nx - x;
				var dy = ny - y;
				myFlags += '\x01';
				x = nx;
				y = ny;
				if (minx > nx) {
					minx = nx;
				}
				if (maxx < nx) {
					maxx = nx;
				}
				if (miny > ny) {
					miny = ny;
				}
				if (maxy < ny) {
					maxy = ny;
				}
				glyphPath.lineTo(nx, -1 * ny + offsetY);
			} else if (command === 3) {
				nx = data[dataIndex++];
				ny = data[dataIndex++];
				var cx = nx - x;
				var cy = ny - y;
				myFlags += '\x00';
				x = nx;
				y = ny;
				endPoint++;

				var cx = nx;
				var cy = ny;
				nx = data[dataIndex++];
				ny = data[dataIndex++];
				var dx = nx - x;
				var dy = ny - y;
				myFlags += '\x01';
				x = nx;
				y = ny;
				if (minx > nx) {
					minx = nx;
				}
				if (maxx < nx) {
					maxx = nx;
				}
				if (miny > ny) {
					miny = ny;
				}
				if (maxy < ny) {
					maxy = ny;
				}
				glyphPath.curveTo(cx, -1 * cy + offsetY, nx, -1 * ny + offsetY);
			}
			endPoint++;
			if (endPoint > maxPoints) {
				maxPoints = endPoint;
			}
			if (xMin > x) {
				xMin = x;
			}
			if (yMin > y) {
				yMin = y;
			}
			if (xMax < x) {
				xMax = x;
			}
			if (yMax < y) {
				yMax = y;
			}
		}
		flags = myFlags;

		if (!j) {
			xMin = xMax = yMin = yMax = 0;
			flags += '\x31';
		}
		/*
		var entry =
			toString16(numberOfContours) +
			toString16(xMin) +
			toString16(yMin) +
			toString16(xMax) +
			toString16(yMax) +
			endPtsOfContours +
			'\x00\x00' + // instructionLength
			flags +
			xCoordinates +
			yCoordinates
		;
		if (entry.length & 1) {
			entry += '\x00';
		}
		*/
		//glyf += entry;
		//loca += toString16(offset / 2);
		//offset += entry.length;
		xMins.push(xMin);
		xMaxs.push(xMax);
		yMins.push(yMin);
		yMaxs.push(yMax);
		if (numberOfContours > maxContours) {
			maxContours = numberOfContours;
		}
		if (endPoint > maxPoints) {
			maxPoints = endPoint;
		}
		let glyphAdvance: number = 0;
		if (generateAdvancement) {
			tag.advance.push((xMax - xMin) * resolution * 1.3);
			glyphAdvance = xMax - xMin;
		} else {
			glyphAdvance = tag.advance[idx] / resolution;
			if (glyphAdvance < 0) glyphAdvance = Math.abs(glyphAdvance);
		}
		if (code == 32) {
			//console.log("32 = ", code, (xMax - xMin));
			//console.log("32 = ", tag.advance[i-1]);
			whiteSpaceWidth = tag.advance[idx] / resolution;
			if (whiteSpaceWidth < 0) whiteSpaceWidth = Math.abs(whiteSpaceWidth);
		}

		tessFontTableAJS.setChar(code.toString(), glyphAdvance, null, null, false, idx, glyphPath);

		/*	var vertexBuffer=GraphicsFactoryFills.pathToAttributesBuffer(glyphPath, true);
		if(vertexBuffer){
			//console.log("created glyph for ", String.fromCharCode(code))
		}
		else{
			//console.log("failed to create glyph for ", String.fromCharCode(code))
		}*/
	}
	//console.log("min-max x:", minx, maxx, "min-max y:", miny, maxy);
	//console.log("FontTag.advanced = ", tag.advance.toString());
	//loca += toString16(offset / 2);
	//tables['glyf'] = glyf;

	if (!isFont3) {
		const minYmin = Math.min.apply(null, yMins);
		if (minYmin < 0) {
			descent = descent || minYmin;
		}
	}

	/*
	tables['OS/2'] =
		'\x00\x01' + // version
		'\x00\x00' + // xAvgCharWidth
		toString16(font.bold ? 700 : 400) + // usWeightClass
		'\x00\x05' + // usWidthClass
		'\x00\x00' + // fstype
		'\x00\x00' + // ySubscriptXSize
		'\x00\x00' + // ySubscriptYSize
		'\x00\x00' + // ySubscriptXOffset
		'\x00\x00' + // ySubscriptYOffset
		'\x00\x00' + // ySuperScriptXSize
		'\x00\x00' + // ySuperScriptYSize
		'\x00\x00' + // ySuperScriptXOffset
		'\x00\x00' + // ySuperScriptYOffset
		'\x00\x00' + // yStrikeoutSize
		'\x00\x00' + // yStrikeoutPosition
		'\x00\x00' + // sFamilyClass
		'\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00' + // panose
		'\x00\x00\x00\x00' + // ulUnicodeRange1
		'\x00\x00\x00\x00' + // ulUnicodeRange2
		'\x00\x00\x00\x00' + // ulUnicodeRange3
		'\x00\x00\x00\x00' + // ulUnicodeRange4
		'ALF ' + // achVendID
		toString16((font.italic ? 0x01 : 0) | (font.bold ? 0x20 : 0)) + // fsSelection
		toString16(codes[0]) + // usFirstCharIndex
		toString16(codes[codes.length - 1]) + // usLastCharIndex
		toString16(ascent) + // sTypoAscender
		toString16(descent) + // sTypoDescender
		toString16(leading) + // sTypoLineGap
		toString16(ascent) + // usWinAscent
		toString16(-descent) + // usWinDescent
		'\x00\x00\x00\x00' + // ulCodePageRange1
		'\x00\x00\x00\x00' // ulCodePageRange2
	;

	tables['head'] =
		'\x00\x01\x00\x00' + // version
		'\x00\x01\x00\x00' + // fontRevision
		'\x00\x00\x00\x00' + // checkSumAdjustement
		'\x5f\x0f\x3c\xf5' + // magicNumber
		'\x00\x0b' + // flags
		'\x04\x00' + // unitsPerEm
		'\x00\x00\x00\x00' + toString32(Date.now()) + // created
		'\x00\x00\x00\x00' + toString32(Date.now()) + // modified
		toString16(min.apply(null, xMins)) + // xMin
		toString16(min.apply(null, yMins)) + // yMin
		toString16(max.apply(null, xMaxs)) + // xMax
		toString16(max.apply(null, yMaxs)) + // yMax
		toString16((font.italic ? 2 : 0) | (font.bold ? 1 : 0)) + // macStyle
		'\x00\x08' + // lowestRecPPEM
		'\x00\x02' + // fontDirectionHint
		'\x00\x00' + // indexToLocFormat
		'\x00\x00' // glyphDataFormat
	;

	var advance = tag.advance;
	tables['hhea'] =
		'\x00\x01\x00\x00' + // version
		toString16(ascent) + // ascender
		toString16(descent) + // descender
		toString16(leading) + // lineGap
		toString16(advance ? max.apply(null, advance) : 1024) + // advanceWidthMax
		'\x00\x00' + // minLeftSidebearing
		'\x00\x00' + // minRightSidebearing
		'\x03\xb8' + // xMaxExtent
		'\x00\x01' + // caretSlopeRise
		'\x00\x00' + // caretSlopeRun
		'\x00\x00' + // caretOffset
		'\x00\x00' + // reserved
		'\x00\x00' + // reserved
		'\x00\x00' + // reserved
		'\x00\x00' + // reserved
		'\x00\x00' + // metricDataFormat
		toString16(glyphCount + 1) // numberOfHMetrics
	;

	var hmtx = '\x00\x00\x00\x00';
	for (var i = 0; i < glyphCount; ++i) {
		hmtx += toString16(advance ? (advance[i] / resolution) : 1024) + '\x00\x00';
	}
	tables['hmtx'] = hmtx;
	*/

	if (tag.kerning && tag.kerning.length) {
		const kerning = tag.kerning;
		const nPairs = kerning.length;
		var searchRange = maxPower2(nPairs) * 2;
		let kern =
			'\x00\x00' + // version
			'\x00\x01' + // nTables
			'\x00\x00' + // subtable version
			toString16(14 + nPairs * 6) + // length
			'\x00\x01' + // coverage
			toString16(nPairs) +
			toString16(searchRange) +
			toString16(logE(nPairs) / logE(2)) + // entrySelector
			toString16(2 * nPairs - searchRange); // rangeShift
		var i = 0;
		var record;
		while ((record = kerning[i++])) {
			kern +=
				toString16(glyphIndex[record.code1]) + // left
				toString16(glyphIndex[record.code2]) + // right
				toString16(record.adjustment); // value
		}
		//tables['kern'] = kern;
	}

	/*
		tables['loca'] = loca;

		tables['maxp'] =
			'\x00\x01\x00\x00' + // version
			toString16(glyphCount + 1) + // numGlyphs
			toString16(maxPoints) +
			toString16(maxContours) +
			'\x00\x00' + // maxCompositePoints
			'\x00\x00' + // maxCompositeContours
			'\x00\x01' + // maxZones
			'\x00\x00' + // maxTwilightPoints
			'\x00\x00' + // maxStorage
			'\x00\x00' + // maxFunctionDefs
			'\x00\x00' + // maxInstructionDefs
			'\x00\x00' + // maxStackElements
			'\x00\x00' + // maxSizeOfInstructions
			'\x00\x00' + // maxComponentElements
			'\x00\x00' // maxComponentDepth
		;

		var psName = fontName.replace(/ /g, '');
		var strings = [
			tag.copyright || 'Original licence', // 0. Copyright
			fontName, // 1. Font family
			'Unknown', // 2. Font subfamily
			uniqueName, // 3. Unique ID
			fontName, // 4. Full font name
			'1.0', // 5. Version
			psName, // 6. Postscript name
			'Unknown', // 7. Trademark
			'Unknown', // 8. Manufacturer
			'Unknown' // 9. Designer
		];
		var count = strings.length;
		var name =
			'\x00\x00' + // format
			toString16(count) + // count
			toString16((count * 12) + 6); // stringOffset
		var offset = 0;
		var i = 0;
		var str;
		while ((str = strings[i++])) {
			name +=
				'\x00\x01' + // platformID
				'\x00\x00' + // encodingID
				'\x00\x00' + // languageID
				toString16(i - 1) + // nameID
				toString16(str.length) +
				toString16(offset);
			offset += str.length;
		}
		tables['name'] = name + strings.join('');

		tables['post'] =
			'\x00\x03\x00\x00' + // version
			'\x00\x00\x00\x00' + // italicAngle
			'\x00\x00' + // underlinePosition
			'\x00\x00' + // underlineThickness
			'\x00\x00\x00\x00' + // isFixedPitch
			'\x00\x00\x00\x00' + // minMemType42
			'\x00\x00\x00\x00' + // maxMemType42
			'\x00\x00\x00\x00' + // minMemType1
			'\x00\x00\x00\x00' // maxMemType1
		;
		var names = Object.keys(tables);
		var numTables = names.length;
		var header =
			'\x00\x01\x00\x00' + // version
			toString16(numTables) +
			'\x00\x80' + // searchRange
			'\x00\x03' + // entrySelector
			'\x00\x20' // rangeShift
		;
		var dataString = '';
		var offset = (numTables * 16) + header.length;
		var i = 0;
		while ((name = names[i++])) {
			var table = tables[name];
			var length = table.length;
			header +=
				name +
				'\x00\x00\x00\x00' + // checkSum
				toString32(offset) +
				toString32(length)
			;
			while (length & 3) {
				table += '\x00';
				++length;
			}
			dataString += table;
			while (offset & 3) {
				++offset;
			}
			offset += length;
		}
		*/
	/*var otf = header + dataString;
	var unitPerEm = 1024;
	var metrics = {
		ascent: ascent / unitPerEm,
		descent: -descent / unitPerEm,
		leading: leading / unitPerEm
	};*/

	// TODO: use a buffer to generate font data
	/*var dataBuffer = new Uint8Array(otf.length);
	for (var i = 0; i < otf.length; i++) {
		dataBuffer[i] = otf.charCodeAt(i) & 0xff;
	}*/

	//font.codes = originalCode;
	//font.metrics = metrics;
	//font.data = dataBuffer;
	tessFontTableAJS.set_font_em_size(1024);

	// whitespace can't be a 0, not overide it
	if (whiteSpaceWidth) {
		tessFontTableAJS.set_whitespace_width(whiteSpaceWidth);
	}

	return font;
}
