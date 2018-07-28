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

import {Graphics, CapsStyle, JointStyle, BitmapFillStyle, GraphicsPath, GraphicsFillStyle, GradientFillStyle, GraphicsStrokeStyle, GradientType as GradientTypeAway} from "@awayjs/graphics"
import {MappingMode} from "@awayjs/renderer";

import {ColorUtils, Matrix as AwayMatrix} from "@awayjs/core"

import {MorphSprite} from "@awayjs/scene"
import {ImageTexture2D, MethodMaterial} from "@awayjs/materials"
import {PathCommand, GradientType, GradientSpreadMethod,
	GradientInterpolationMethod, ShapeData,	ShapeMatrix} from "./ShapeData";
import {assert,	Bounds,	clamp} from "../utilities";
import {DataBuffer} from "./dataBuffer";

import {ShapeFlags, ShapeRecord,
	ShapeTag, ShapeRecordFlags} from "../SWFTags"
var push = Array.prototype.push;

enum FillType {
	Solid = 0,
	LinearGradient = 0x10,
	RadialGradient = 0x12,
	FocalRadialGradient = 0x13,
	RepeatingBitmap = 0x40,
	ClippedBitmap = 0x41,
	NonsmoothedRepeatingBitmap = 0x42,
	NonsmoothedClippedBitmap = 0x43,
}

var gradients_map_swf_to_away:any;
gradients_map_swf_to_away={};
gradients_map_swf_to_away[GradientType.Linear]=GradientTypeAway.LINEAR;
gradients_map_swf_to_away[GradientType.Radial]=GradientTypeAway.RADIAL;
var capStyle_map_to_away:any;
capStyle_map_to_away={};
capStyle_map_to_away[0]=CapsStyle.ROUND;
capStyle_map_to_away[1]=CapsStyle.NONE;
capStyle_map_to_away[2]=CapsStyle.SQUARE;
/*
 * Applies the current segment1 to the paths of all styles specified in the last
 * style-change record.
 *
 * For fill0, we have to apply commands and their data in reverse order, to turn
 * left fills into right ones.
 *
 * If we have more than one style, we only recorded commands for the first one
 * and have to duplicate them for the other styles. The order is: fill1, line,
 * fill0. (That means we only ever recorded into fill0 if that's the only style.)
 */
/*

// 80pro: 	i simplified the code so that it doesnt use this function anymore.
//			now we directly create needed amount of segments and apply them to the pathes
function applySegmentToStyles(segment1: PathSegment, styles,
							  linePaths: SegmentedPath[], fillPaths: SegmentedPath[])
{
	if (!segment1) {
		return;
	}
	if(styles.fill0 && styles.fill1 && styles.fill0==styles.fill1){
		console.log("		same fill on both sides");
		return;//80pro: ignore segments with same fill on both sides
	}
	var path1: SegmentedPath;
	if (styles.fill0) {
		path1 = fillPaths[styles.fill0 - 1];
		// If fill0 is the only style, we have pushed the segment1 to its stack. In
		// that case, just mark it as reversed and move on.
		if (!(styles.fill1 || styles.line)) {
			segment1.isReversed = true;
			return;
		} else {
			path1.addSegment(segment1.toReversed());
		}
	}
	if (styles.line && styles.fill1) {
		path1 = linePaths[styles.line - 1];
		path1.addSegment(segment1.clone());
	}
}
*/

/*
 * Converts records from the space-optimized format they're stored in to a
 * format that's more amenable to fast rendering.
 *
 * See http://blogs.msdn.com/b/mswanson/archive/2006/02/27/539749.aspx and
 * http://wahlers.com.br/claus/blog/hacking-swf-1-shapes-in-flash/ for details.
 */
function convertRecordsToShapeData(records: ShapeRecord[], fillPaths: SegmentedPath[],
								   linePaths: SegmentedPath[], dependencies: number[],
								   recordsMorph: ShapeRecord[], parser:any): any
{
	var isMorph = recordsMorph !== null;
	var styles = {fill0: 0, fill1: 0, line: 0};
	var segment1: PathSegment = null;
	var segment2: PathSegment = null;
	var segmentL: PathSegment = null;

	// Fill- and line styles can be added by style change records in the middle of
	// a shape records list. This also causes the previous paths to be treated as
	// a group, so the lines don't get moved on top of any following fills.
	// To support this, we just append all current fill and line paths to a list
	// when new styles are introduced.
	var allPaths: SegmentedPath[];
	// If no style is set for a segment1 of a path1, a 1px transparent line is used.
	var defaultPath: SegmentedPath;

	var numRecords = records.length;
	var x: number = 0;
	var y: number = 0;
	var morphX: number = 0;
	var morphY: number = 0;
	var path1: SegmentedPath;
	var path2: SegmentedPath;
	var pathL: SegmentedPath;
	//console.log("numRecords", numRecords);
	for (var i = 0, j = 0; i < numRecords; i++) {
		var record = records[i];
		//console.log("record", i, record.type);
		var morphRecord: ShapeRecord;
		if (isMorph) {
			morphRecord = recordsMorph[j++];
		}
		// type 0 is a StyleChange record
		if (record.type === 0) {

			if (record.flags & ShapeRecordFlags.HasNewStyles) {
				if (!allPaths) {
					allPaths = [];
				}
				push.apply(allPaths, fillPaths);
				fillPaths = createPathsList(record.fillStyles, false, isMorph, dependencies, parser);
				push.apply(allPaths, linePaths);
				linePaths = createPathsList(record.lineStyles, true, isMorph, dependencies, parser);
				if (defaultPath) {
					allPaths.push(defaultPath);
					defaultPath = null;
				}
				styles = {fill0: 0, fill1: 0, line: 0};
			}

			if (record.flags & ShapeRecordFlags.HasFillStyle0) {
				styles.fill0 = record.fillStyle0;
			}
			if (record.flags & ShapeRecordFlags.HasFillStyle1) {
				styles.fill1 = record.fillStyle1;
			}
			if (record.flags & ShapeRecordFlags.HasLineStyle) {
				styles.line = record.lineStyle;
			}
			// reset all segments and pathes to null, and than reset them based on new styles
			path1=path2=pathL=null;
			segment1=segment2=segmentL=null;
			if (styles.fill0) {
				path1 = fillPaths[styles.fill0 - 1];
			}
			if (styles.fill1) {
				path2 = fillPaths[styles.fill1 - 1];
			}
			if (styles.line) {
				pathL = linePaths[styles.line - 1];
			}
			
			

			if (record.flags & ShapeRecordFlags.Move) {
				x = record.moveX | 0;
				y = record.moveY | 0;				
				// When morphed, StyleChangeRecords/MoveTo might not have a
				// corresponding record in the start or end shape --
				// processing morphRecord below before converting type 1 records.
			}

			// if a segment1 has same fill on both sides, we want to ignore this segment1 for fills
			if(styles.fill1 && styles.fill0 && styles.fill0==styles.fill1){
				//console.log("IGNORED SEGMENT", styles);
				segment1=null;//80pro: ignore segments with same fill on both sides
				segment2=null;//80pro: ignore segments with same fill on both sides
				path1=null;//80pro: ignore segments with same fill on both sides
				path2=null;//80pro: ignore segments with same fill on both sides
			}
			
			if (path1) {
				segment1 = PathSegment.FromDefaults(isMorph);
				path1.addSegment(segment1);
			
				//console.log("new segment1");
				// Move or not, we want this path1 segment1 to start where the last one
				// left off. Even if the last one belonged to a different style.
				// "Huh," you say? Yup.
				if (!isMorph) {
					segment1.moveTo(x, y);
					//console.log("segment1.moveTo" ,x/20, y/20);
				} else {
					if (morphRecord.type === 0) {
						morphX = morphRecord.moveX | 0;
						morphY = morphRecord.moveY | 0;
					} else {
						morphX = x;
						morphY = y;
						// Not all moveTos are reflected in morph data.
						// In that case, decrease morph data index.
						j--;
					}
					segment1.morphMoveTo(x, y, morphX, morphY);
				}
				
			}
			if (path2) {

				segment2 = PathSegment.FromDefaults(isMorph);
				path2.addSegment(segment2);
			
				if (!isMorph) {
					segment2.moveTo(x, y);
					//console.log("segment1.moveTo" ,x/20, y/20);
				} else {
					if (morphRecord.type === 0) {
						morphX = morphRecord.moveX | 0;
						morphY = morphRecord.moveY | 0;
					} else {
						morphX = x;
						morphY = y;
						// Not all moveTos are reflected in morph data.
						// In that case, decrease morph data index.
						j--;
					}
					segment2.morphMoveTo(x, y, morphX, morphY);
				}
			}
			if (pathL) {

				segmentL = PathSegment.FromDefaults(isMorph);
				pathL.addSegment(segmentL);
			
				if (!isMorph) {
					segmentL.moveTo(x, y);
					//console.log("segment1.moveTo" ,x/20, y/20);
				} else {
					if (morphRecord.type === 0) {
						morphX = morphRecord.moveX | 0;
						morphY = morphRecord.moveY | 0;
					} else {
						morphX = x;
						morphY = y;
						// Not all moveTos are reflected in morph data.
						// In that case, decrease morph data index.
						j--;
					}
					segmentL.morphMoveTo(x, y, morphX, morphY);
				}
			}
			//segment1.isReversed=true;
			//segment2.isReversed=true;
			//if(styles.fill1 && styles.fill0 && styles.fill1 !== styles.fill0){
				//console.log("IGNORED SEGMENT");
			//}


		}
		// type 1 is a StraightEdge or CurvedEdge record
		else {
			//console.log("record.type !== 0");
			assert(record.type === 1);
			if (!segment1) {
				//console.log("no segment1")
				/*if (!defaultPath) {
					var style = {color: {red: 0, green: 0, blue: 0, alpha: 0}, width: 20};
					defaultPath = new SegmentedPath(null, processStyle(style, true, isMorph, dependencies), parser);
				}
				segment1 = PathSegment.FromDefaults(isMorph);
				defaultPath.addSegment(segment1);
				if (!isMorph) {
					segment1.moveTo(x, y);
					//console.log("segment1.moveTo" ,x/20, y/20);
				} else {
					segment1.morphMoveTo(x, y, morphX, morphY);
				}*/
			}
			if (!segment2) {
				//console.log("no segment2")
			}
			if (isMorph) {
				// An invalid SWF might contain a move in the EndEdges list where the
				// StartEdges list contains an edge. The Flash Player seems to skip it,
				// so we do, too.
				while (morphRecord && morphRecord.type === 0) {
					morphRecord = recordsMorph[j++];
				}
				// The EndEdges list might be shorter than the StartEdges list. Reuse
				// start edges as end edges in that case.
				if (!morphRecord) {
					morphRecord = record;
				}
			}

			if (record.flags & ShapeRecordFlags.IsStraight &&
				(!isMorph || (morphRecord.flags & ShapeRecordFlags.IsStraight))) {
				x += record.deltaX | 0;
				y += record.deltaY | 0;
				if (segment1 && !isMorph) {
					segment1.lineTo(x, y);
					//console.log("segment1.lineTo" ,x/20, y/20);
				} else if (segment1){
					morphX += morphRecord.deltaX | 0;
					morphY += morphRecord.deltaY | 0;
					segment1.morphLineTo(x, y, morphX, morphY);
				}
				if (segment2 && !isMorph) {
					segment2.lineTo(x, y);
					//console.log("segment1.lineTo" ,x/20, y/20);
				} else if (segment2){
					morphX += morphRecord.deltaX | 0;
					morphY += morphRecord.deltaY | 0;
					segment2.morphLineTo(x, y, morphX, morphY);
				}
				if (segmentL && !isMorph) {
					segmentL.lineTo(x, y);
					//console.log("segment1.lineTo" ,x/20, y/20);
				} else if (segmentL){
					morphX += morphRecord.deltaX | 0;
					morphY += morphRecord.deltaY | 0;
					segmentL.morphLineTo(x, y, morphX, morphY);
				}
			} else {
				var cx, cy;
				var deltaX, deltaY;
				if (!(record.flags & ShapeRecordFlags.IsStraight)) {
					cx = x + record.controlDeltaX | 0;
					cy = y + record.controlDeltaY | 0;
					x = cx + record.anchorDeltaX | 0;
					y = cy + record.anchorDeltaY | 0;
				} else {
					deltaX = record.deltaX | 0;
					deltaY = record.deltaY | 0;
					cx = x + (deltaX >> 1);
					cy = y + (deltaY >> 1);
					x += deltaX;
					y += deltaY;
				}
				if (segment1 && !isMorph) {
					segment1.curveTo(cx, cy, x, y);
					//console.log("segment1.curveTo",cx/20, cy/20, x/20, y/20);
				} else if(segment1) {
					if (!(morphRecord.flags & ShapeRecordFlags.IsStraight)) {
						var morphCX = morphX + morphRecord.controlDeltaX | 0;
						var morphCY = morphY + morphRecord.controlDeltaY | 0;
						morphX = morphCX + morphRecord.anchorDeltaX | 0;
						morphY = morphCY + morphRecord.anchorDeltaY | 0;
					} else {
						deltaX = morphRecord.deltaX | 0;
						deltaY = morphRecord.deltaY | 0;
						var morphCX = morphX + (deltaX >> 1);
						var morphCY = morphY + (deltaY >> 1);
						morphX += deltaX;
						morphY += deltaY;
					}
					segment1.morphCurveTo(cx, cy, x, y, morphCX, morphCY, morphX, morphY);
				}
				if (segment2 && !isMorph) {
					segment2.curveTo(cx, cy, x, y);
					//console.log("segment1.curveTo",cx/20, cy/20, x/20, y/20);
				} else if(segment2) {
					if (!(morphRecord.flags & ShapeRecordFlags.IsStraight)) {
						var morphCX = morphX + morphRecord.controlDeltaX | 0;
						var morphCY = morphY + morphRecord.controlDeltaY | 0;
						morphX = morphCX + morphRecord.anchorDeltaX | 0;
						morphY = morphCY + morphRecord.anchorDeltaY | 0;
					} else {
						deltaX = morphRecord.deltaX | 0;
						deltaY = morphRecord.deltaY | 0;
						var morphCX = morphX + (deltaX >> 1);
						var morphCY = morphY + (deltaY >> 1);
						morphX += deltaX;
						morphY += deltaY;
					}
					segment2.morphCurveTo(cx, cy, x, y, morphCX, morphCY, morphX, morphY);
				}
				if (segmentL && !isMorph) {
					segmentL.curveTo(cx, cy, x, y);
					//console.log("segment1.curveTo",cx/20, cy/20, x/20, y/20);
				} else if(segmentL) {
					if (!(morphRecord.flags & ShapeRecordFlags.IsStraight)) {
						var morphCX = morphX + morphRecord.controlDeltaX | 0;
						var morphCY = morphY + morphRecord.controlDeltaY | 0;
						morphX = morphCX + morphRecord.anchorDeltaX | 0;
						morphY = morphCY + morphRecord.anchorDeltaY | 0;
					} else {
						deltaX = morphRecord.deltaX | 0;
						deltaY = morphRecord.deltaY | 0;
						var morphCX = morphX + (deltaX >> 1);
						var morphCY = morphY + (deltaY >> 1);
						morphX += deltaX;
						morphY += deltaY;
					}
					segmentL.morphCurveTo(cx, cy, x, y, morphCX, morphCY, morphX, morphY);
				}
			}
		}
	}
//	applySegmentToStyles(segment1, styles, linePaths, fillPaths);

	// All current paths get appended to the allPaths list at the end. First fill,
	// then line paths.
	if (allPaths) {
		push.apply(allPaths, fillPaths);
	} else {
		allPaths = fillPaths;
	}
	push.apply(allPaths, linePaths);
	if (defaultPath) {
		allPaths.push(defaultPath);
	}
	var shapeAJS: GraphicsPath;
	if (isMorph) {
		var morphShapeAJS: GraphicsPath;
		//shape.morphCoordinates = new Int32Array(shape.coordinates.length);
		//shape.morphStyles = new DataBuffer(16);
		var morphSprite: MorphSprite;
		morphSprite = new MorphSprite();
		morphSprite.start=[];
		morphSprite.end=[];
		for (i = 0; i < allPaths.length; i++) {
			//allPaths[i].serialize(shape);
			shapeAJS = new GraphicsPath();
			morphShapeAJS = new GraphicsPath();
			allPaths[i].serializeAJS(shapeAJS, morphShapeAJS);
			morphSprite.start.push(shapeAJS);
			morphSprite.end.push(morphShapeAJS);
		}
		return morphSprite;
	}
	var graphics: Graphics = new Graphics();
	for (i = 0; i < allPaths.length; i++) {
		//console.log("allPaths", i, allPaths[i]);
		//allPaths[i].serialize(shape);
		shapeAJS = new GraphicsPath();
		allPaths[i].serializeAJS(shapeAJS, null);
		//console.log("shapeAJS", shapeAJS);
		graphics.add_queued_path(shapeAJS);
	}

	return graphics;

}

interface ShapeStyle {
	type: number;

	fillType?: number;
	width?: number;
	pixelHinting?: boolean;
	noHscale?: boolean;
	noVscale?: boolean;
	endCapsStyle?: number;
	jointStyle?: number;
	miterLimit?: number;

	color?: number;

	transform?: ShapeMatrix;
	colors?: number[];
	ratios?: number[];
	spreadMethod?: number;
	interpolationMode?: number;
	focalPoint?: number;
	bitmapId?: number;
	bitmapIndex?: number;
	repeat?: boolean;
	smooth?: boolean;

	morph: ShapeStyle
}

var IDENTITY_MATRIX: ShapeMatrix = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
function processStyle(style, isLineStyle: boolean, isMorph: boolean,
					  dependencies: number[]): ShapeStyle {
	var shapeStyle: ShapeStyle = style;
	if (isMorph) {
		shapeStyle.morph = processMorphStyle(style, isLineStyle, dependencies);
	}
	if (isLineStyle) {
		shapeStyle.miterLimit = (style.miterLimitFactor || 1.5) * 2;
		if (!style.color && style.hasFill) {
			var fillStyle = processStyle(style.fillStyle, false, false, dependencies);
			shapeStyle.type = fillStyle.type;
			shapeStyle.transform = fillStyle.transform;
			shapeStyle.colors = fillStyle.colors;
			shapeStyle.ratios = fillStyle.ratios;
			shapeStyle.focalPoint = fillStyle.focalPoint;
			shapeStyle.bitmapId = fillStyle.bitmapId;
			shapeStyle.bitmapIndex = fillStyle.bitmapIndex;
			shapeStyle.repeat = fillStyle.repeat;
			style.fillStyle = null;
			return shapeStyle;
		} else {
			shapeStyle.type = FillType.Solid;
			return shapeStyle;
		}
	}
	if (style.type === undefined || style.type === FillType.Solid) {
		return shapeStyle;
	}
	var scale;
	switch (style.type) {
		case FillType.LinearGradient:
		case FillType.RadialGradient:
		case FillType.FocalRadialGradient:
			var records = style.records;
			var colors = shapeStyle.colors = [];
			var ratios = shapeStyle.ratios = [];
			for (var i = 0; i < records.length; i++) {
				var record = records[i];
				if(ratios.length==0 || ratios[ratios.length-1]!=record.ratio){
					colors.push(record.color);
					ratios.push(record.ratio);
				}
			}
			scale = 819.2;
			break;
		case FillType.RepeatingBitmap:
		case FillType.ClippedBitmap:
		case FillType.NonsmoothedRepeatingBitmap:
		case FillType.NonsmoothedClippedBitmap:
			shapeStyle.smooth = style.type !== FillType.NonsmoothedRepeatingBitmap &&
				style.type !== FillType.NonsmoothedClippedBitmap;
			shapeStyle.repeat = style.type !== FillType.ClippedBitmap &&
				style.type !== FillType.NonsmoothedClippedBitmap;
			var index = dependencies.indexOf(style.bitmapId);
			if (index === -1) {
				index = dependencies.length;
				dependencies.push(style.bitmapId);
			}
			shapeStyle.bitmapIndex = index;
			scale = 0.05;
			break;
		default:
			console.log('shape parser encountered invalid fill style ' + style.type);
	}
	if (!style.matrix) {
		shapeStyle.transform = IDENTITY_MATRIX;
		return shapeStyle;
	}
	var matrix = style.matrix;
	shapeStyle.transform = {

		/*a: (matrix.a * scale),
		b: (matrix.b * scale),
		c: (matrix.c * scale),
		d: (matrix.d * scale),
		tx: matrix.tx/20,
		ty: matrix.ty/20*/
		a: (matrix.a ),
		b: (matrix.b ),
		c: (matrix.c ),
		d: (matrix.d ),
		tx: matrix.tx/20,
		ty: matrix.ty/20
	};
	// null data that's unused from here on out
	style.matrix = null;
	return shapeStyle;
}

function processMorphStyle(style, isLineStyle: boolean, dependencies: number[]): ShapeStyle {
	var morphStyle: ShapeStyle = Object.create(style);
	if (isLineStyle) {
		morphStyle.width = style.widthMorph;
		if (!style.color && style.hasFill) {
			var fillStyle = processMorphStyle(style.fillStyle, false, dependencies);
			morphStyle.transform = fillStyle.transform;
			morphStyle.colors = fillStyle.colors;
			morphStyle.ratios = fillStyle.ratios;
			return morphStyle;
		} else {
			morphStyle.color = style.colorMorph;
			return morphStyle;
		}
	}
	if (style.type === undefined) {
		return morphStyle;
	}
	if (style.type === FillType.Solid) {
		morphStyle.color = style.colorMorph;
		return morphStyle;
	}
	var scale;
	switch (style.type) {
		case FillType.LinearGradient:
		case FillType.RadialGradient:
		case FillType.FocalRadialGradient:
			var records = style.records;
			var colors = morphStyle.colors = [];
			var ratios = morphStyle.ratios = [];
			for (var i = 0; i < records.length; i++) {
				var record = records[i];
				colors.push(record.colorMorph);
				ratios.push(record.ratioMorph);
			}
			scale = 819.2;
			break;
		case FillType.RepeatingBitmap:
		case FillType.ClippedBitmap:
		case FillType.NonsmoothedRepeatingBitmap:
		case FillType.NonsmoothedClippedBitmap:
			scale = 0.05;
			break;
		default:
			console.log('shape parser encountered invalid fill style');
	}
	if (!style.matrix) {
		morphStyle.transform = IDENTITY_MATRIX;
		return morphStyle;
	}
	var matrix = style.matrixMorph;
	morphStyle.transform = {
		/*
		a: (matrix.a * scale),
		b: (matrix.b * scale),
		c: (matrix.c * scale),
		d: (matrix.d * scale),
		tx: matrix.tx/20,
		ty: matrix.ty/20*/
		a: (matrix.a ),
		b: (matrix.b ),
		c: (matrix.c ),
		d: (matrix.d ),
		tx: matrix.tx/20,
		ty: matrix.ty/20
	};
	return morphStyle;
}

/*
 * Paths are stored in 2-dimensional arrays. Each of the inner arrays contains
 * all the paths for a certain fill or line style.
 */
function createPathsList(styles: any[], isLineStyle: boolean, isMorph: boolean,
						 dependencies: number[], parser:any): SegmentedPath[]
{
	var paths: SegmentedPath[] = [];
	for (var i = 0; i < styles.length; i++) {
		var style = processStyle(styles[i], isLineStyle, isMorph, dependencies);
		if (!isLineStyle) {
			paths[i] = new SegmentedPath(style, null, parser);
		} else {
			paths[i] = new SegmentedPath(null, style, parser);
		}
	}
	return paths;
}

export function defineShape(tag: ShapeTag, parser:any):any {
	var dependencies = [];
	var fillPaths = createPathsList(tag.fillStyles, false, !!tag.recordsMorph, dependencies, parser);
	var linePaths = createPathsList(tag.lineStyles, true, !!tag.recordsMorph, dependencies, parser);
	//console.log(fillPaths, linePaths);

	var shape = convertRecordsToShapeData(tag.records, fillPaths, linePaths, dependencies, tag.recordsMorph || null, parser);

	return {
		type: tag.flags & ShapeFlags.IsMorph ? 'morphshape' : 'shape',
		id: tag.id,
		fillBounds: tag.fillBounds,
		lineBounds: tag.lineBounds,
		morphFillBounds: tag.fillBoundsMorph || null,
		morphLineBounds: tag.lineBoundsMorph || null,
		shape: shape,//.toPlainObject(),
		//shape_swf: shape.toPlainObject(),
		//transferables: shape.buffers,
		require: dependencies.length ? dependencies : null
	};
}

class PathSegment {

	private static _counter = 0;
	public id;
	private startPoint: string;
	private endPoint: string;
	public isValidFill: boolean=true;

	constructor(public commands: DataBuffer, public data: DataBuffer, public morphData: DataBuffer,
				public prev: PathSegment, public next: PathSegment, public isReversed: boolean)
	{
		this.id = PathSegment._counter++;
	}

	static FromDefaults(isMorph: boolean) {
		var commands = new DataBuffer();
		var data = new DataBuffer();
		commands.endian = data.endian = 'auto';
		var morphData: any = null;
		if (isMorph) {
			morphData = new DataBuffer();
			morphData.endian = 'auto';
		}
		return new PathSegment(commands, data, morphData, null, null, false);
	}

	moveTo(x: number, y: number) {
		this.commands.writeUnsignedByte(PathCommand.MoveTo);
		this.data.write2Ints(x, y);
	}

	morphMoveTo(x: number, y: number, mx: number, my: number) {
		this.moveTo(x, y);
		this.morphData.write2Ints(mx, my);
	}

	lineTo(x: number, y: number) {
		this.commands.writeUnsignedByte(PathCommand.LineTo);
		this.data.write2Ints(x, y);
	}

	morphLineTo(x: number, y: number, mx: number, my: number) {
		this.lineTo(x, y);
		this.morphData.write2Ints(mx, my);
	}

	curveTo(cpx: number, cpy: number, x: number, y: number) {
		this.commands.writeUnsignedByte(PathCommand.CurveTo);
		this.data.write4Ints(cpx, cpy, x, y);
	}

	morphCurveTo(cpx: number, cpy: number, x: number, y: number,
				 mcpx: number, mcpy: number, mx: number, my: number)
	{
		this.curveTo(cpx, cpy, x, y);
		this.morphData.write4Ints(mcpx, mcpy, mx, my);
	}

	/**
	 * Returns a shallow copy of the segment1 with the "isReversed" flag set.
	 * Reversed segments play themselves back in reverse when they're merged into the final
	 * non-segmented path1.
	 * Note: Don't modify the original, or the reversed copy, after this operation!
	 */
	toReversed(): PathSegment {
		assert(!this.isReversed);
		return new PathSegment(this.commands, this.data, this.morphData, null, null, true);
	}

	clone(): PathSegment {
		return new PathSegment(this.commands, this.data, this.morphData, null, null, this.isReversed);
	}

	storeStartAndEnd() {
		var data = this.data.ints;
		var endPoint1 = data[0] + ',' + data[1];
		var endPoint2Offset = (this.data.length >> 2) - 2;
		var endPoint2 = data[endPoint2Offset] + ',' + data[endPoint2Offset + 1];
		if (!this.isReversed) {
			this.startPoint = endPoint1;
			this.endPoint = endPoint2;
		} else {
			this.startPoint = endPoint2;
			this.endPoint = endPoint1;
		}
	}

	connectsTo(other: PathSegment): boolean {
		//assert(other !== this);
		if(other===this)
			return false;
		assert(this.endPoint);
		assert(other.startPoint);
		return this.endPoint === other.startPoint;
	}

	startConnectsTo(other: PathSegment): boolean {
		if(other===this)
			return false;
	//	assert(other !== this);
		return this.startPoint === other.startPoint;
	}

	flipDirection() {
		var tempPoint = "";
		tempPoint = this.startPoint;
		this.startPoint = this.endPoint;
		this.endPoint = tempPoint;
		this.isReversed = !this.isReversed;
	}

	serializeAJS(shape: GraphicsPath, morphShape: GraphicsPath, lastPosition: {x: number; y: number}) {
		//console.log("serializeAJS segment1");
		if (this.isReversed) {
			this._serializeReversedAJS(shape, morphShape, lastPosition);
			return;
		}
		var commands = this.commands.bytes;
		// Note: this *must* use `this.data.length`, because buffers will have padding.
		var dataLength = this.data.length >> 2;
		var morphData = this.morphData ? this.morphData.ints : null;
		var data = this.data.ints;
		assert(commands[0] === PathCommand.MoveTo);
		// If the segment1's first moveTo goes to the current coordinates, we have to skip it.
		var offset = 0;
		if (data[0] === lastPosition.x && data[1] === lastPosition.y) {
			offset++;
		}
		var commandsCount = this.commands.length;
		var dataPosition = offset * 2;
		for (var i = offset; i < commandsCount; i++) {
			switch (commands[i]){
				case PathCommand.MoveTo:
					//console.log("moveTo",data[dataPosition]/20, data[dataPosition+1]/20);
					shape.moveTo(data[dataPosition]/20, data[dataPosition+1]/20);
					if(morphShape){
						morphShape.moveTo(morphData[dataPosition]/20, morphData[dataPosition+1]/20);
					}
					break;
				case PathCommand.LineTo:
					//console.log("lineTo",data[dataPosition]/20, data[dataPosition+1]/20);
					shape.lineTo(data[dataPosition]/20, data[dataPosition+1]/20);
					if(morphShape){
						morphShape.lineTo(morphData[dataPosition]/20, morphData[dataPosition+1]/20);
					}
					break;
				case PathCommand.CurveTo:
					//console.log("curveTo",data[dataPosition]/20, data[dataPosition+1]/20,data[dataPosition+2]/20, data[dataPosition+3]/20);
					shape.curveTo(data[dataPosition]/20, data[dataPosition+1]/20,data[dataPosition+2]/20, data[dataPosition+3]/20 );
					if(morphShape){
						morphShape.curveTo(morphData[dataPosition]/20, morphData[dataPosition+1]/20,morphData[dataPosition+2]/20, morphData[dataPosition+3]/20 );
					}
					//shape.curveTo(data[dataPosition]/20, data[dataPosition+1]/20, data[dataPosition+2]/20, data[dataPosition+3]/20 );
					dataPosition+=2;
					break;

			}
			dataPosition+=2;
		}
		//assert(dataPosition === dataLength);
		lastPosition.x = data[dataLength - 2];
		lastPosition.y = data[dataLength - 1];
	}
	private _serializeReversedAJS(shape: GraphicsPath, morphShape: GraphicsPath, lastPosition: {x: number; y: number}) {
		//console.log("_serializeReversedAJS segment1");
		// For reversing the fill0 segments, we rely on the fact that each segment1
		// starts with a moveTo. We first write a new moveTo with the final drawing command's
		// target coordinates (if we don't skip it, see below). For each of the following
		// commands, we take the coordinates of the command originally *preceding*
		// it as the new target coordinates. The final coordinates we target will be
		// the ones from the original first moveTo.
		// Note: these *must* use `this.{data,commands}.length`, because buffers will have padding.
		var commandsCount = this.commands.length;
		var dataPosition = (this.data.length >> 2) - 2;
		var commands = this.commands.bytes;
		assert(commands[0] === PathCommand.MoveTo);
		var data = this.data.ints;
		var morphData = this.morphData ? this.morphData.ints : null;

		// Only write the first moveTo if it doesn't go to the current coordinates.
		if (data[dataPosition] !== lastPosition.x || data[dataPosition + 1] !== lastPosition.y) {
			shape.moveTo(data[dataPosition]/20, data[dataPosition+1]/20);
			if(morphShape){
				morphShape.moveTo(morphData[dataPosition]/20, morphData[dataPosition+1]/20);
			}
		}
		if (commandsCount === 1) {
			lastPosition.x = data[0];
			lastPosition.y = data[1];
			return;
		}
		for (var i = commandsCount; i-- > 1;) {
			dataPosition -= 2;
			var command: PathCommand = commands[i];
			switch (commands[i]){
				case PathCommand.MoveTo:
					//console.log("moveTo",data[dataPosition]/20, data[dataPosition+1]/20);
					shape.moveTo(data[dataPosition]/20, data[dataPosition+1]/20);
					if(morphShape){
						morphShape.moveTo(morphData[dataPosition]/20, morphData[dataPosition+1]/20);
					}
					break;
				case PathCommand.LineTo:
					//console.log("lineTo",data[dataPosition]/20, data[dataPosition+1]/20);
					shape.lineTo(data[dataPosition]/20, data[dataPosition+1]/20);
					if(morphShape){
						morphShape.lineTo(morphData[dataPosition]/20, morphData[dataPosition+1]/20);
					}
					break;
				case PathCommand.CurveTo:
					dataPosition -= 2;
					//console.log("curveTo",data[dataPosition+2]/20, data[dataPosition+3]/20,data[dataPosition]/20, data[dataPosition+1]/20);
					shape.curveTo(data[dataPosition+2]/20, data[dataPosition+3]/20,data[dataPosition]/20, data[dataPosition+1]/20 );
					if(morphShape){
						morphShape.curveTo(morphData[dataPosition+2]/20, morphData[dataPosition+3]/20,morphData[dataPosition]/20, morphData[dataPosition+1]/20 );
					}
					break;

			}
		}
		//assert(dataPosition === 0);
		lastPosition.x = data[0];
		lastPosition.y = data[1];
	}
}

class SegmentedPath {
	private _head: PathSegment;
	constructor(public fillStyle, public lineStyle, public parser) {
		this._head = null;
	}

	addSegment(segment1: PathSegment) {
		assert(segment1);
		assert(segment1.next === null);
		assert(segment1.prev === null);
		var currentHead = this._head;
		if (currentHead) {
			assert(segment1 !== currentHead);
			currentHead.next = segment1;
			segment1.prev = currentHead;
		}
		this._head = segment1;
	}

	// Does *not* reset the segment1's prev and next pointers!
	removeSegment(segment1: PathSegment) {
		if (segment1.prev) {
			segment1.prev.next = segment1.next;
		}
		if (segment1.next) {
			segment1.next.prev = segment1.prev;
		}
	}

	insertSegment(segment1: PathSegment, next: PathSegment) {
		var prev = next.prev;
		segment1.prev = prev;
		segment1.next = next;
		if (prev) {
			prev.next = segment1;
		}
		next.prev = segment1;
	}

	head(): PathSegment {
		return this._head;
	}


	rgbaToArgb(float32Color:number):number
	{
		var r:number = ( float32Color & 0xff000000 ) >>> 24;
		var g:number = ( float32Color & 0xff0000 ) >>> 16;
		var b:number = ( float32Color & 0xff00 ) >>> 8;
		var a:number = float32Color & 0xff;
		return (a << 24) | (r << 16) |
		(g << 8) | b;
	}

	getAlpha(float32Color:number):number
	{
		//var r:number = ( float32Color & 0xff000000 ) >>> 24;
		//var g:number = ( float32Color & 0xff0000 ) >>> 16;
		//var b:number = ( float32Color & 0xff00 ) >>> 8;
		var a:number = float32Color & 0xff;
		return a;
	}

	rgbToArgb(float32Color:number):number
	{
		var a:number = ( float32Color & 0xff000000 ) >>> 24;
		var b:number = ( float32Color & 0xff0000 ) >>> 16;
		var g:number = ( float32Color & 0xff00 ) >>> 8;
		var r:number = float32Color & 0xff;
		return (a << 24) | (r << 16) |
			(g << 8) | b;
	}

	serializeAJS(shape: GraphicsPath, morphShape: GraphicsPath) {
		//console.log("serializeAJS");
		var segment1 = this.head();
		if (!segment1) {
			// Path is empty.
			return;
		}

		while (segment1) {
			segment1.storeStartAndEnd();
			segment1 = segment1.prev;
		}

		var start = this.head();
		var end = start;

		var finalRoot: PathSegment = null;
		var finalHead: PathSegment = null;

		// Path segments for one style can appear in arbitrary order in the tag's list
		// of edge records.
		// Before we linearize them, we have to identify all pairs of segments where
		// one ends at a coordinate the other starts at.
		// The following loop does that, by creating ever-growing runs of matching
		// segments. If no more segments are found that match the current run (either
		// at the beginning, or at the end), the current run is complete, and a new
		// one is started. Rinse, repeat, until no solitary segments remain.
		var current = start.prev;
		while (start) {
			while (current) {

				// if this segment1 has the same startpoint as the start-startpoint it needs to be reversed.
				if (current.startConnectsTo(start)) {
					current.flipDirection();
				}

				// if this segment1 connects to another, we remove it and add it at the end.
				if (current.connectsTo(start)) {
					if (current.next !== start) {
						this.removeSegment(current);
						this.insertSegment(current, start);
					}
					start = current;
					current = start.prev;
					continue;
				}


				if(current.startConnectsTo(end)) {
					current.flipDirection();
				}
				if (end.connectsTo(current)) {
					this.removeSegment(current);
					end.next = current;
					current = current.prev;
					end.next.prev = end;
					end.next.next = null;
					end = end.next;
					continue;
				}
				current = current.prev;
			}
			// This run of segments is finished. Store and forget it (for this loop).
			current = start.prev;
			if (!finalRoot) {
				finalRoot = start;
				finalHead = end;
			} else {
				finalHead.next = start;
				start.prev = finalHead;
				finalHead = end;
				finalHead.next = null;
			}
			if (!current) {
				break;
			}
			start = end = current;
			current = start.prev;
		} 

		if (this.fillStyle) {
			var style = this.fillStyle;
			var morph = style.morph;
			switch (style.type) {
				case FillType.Solid:
					style.alpha=this.getAlpha(style.color)/255;
					style.color=this.rgbaToArgb(style.color);
					shape.style=new GraphicsFillStyle(style.color, style.alpha);

					var r=Math.random()*255;
					var g=Math.random()*255;
					var b=Math.random()*255;
				//	style.color=ColorUtils.ARGBtoFloat32(255, r, g, b);
				//	shape.style=new GraphicsStrokeStyle(style.color, 5, 1);

					if (morph) {
						morph.alpha=this.getAlpha(morph.color)/255;
						morph.color=this.rgbaToArgb(morph.color);
						morphShape.style=new GraphicsFillStyle(morph.color, morph.alpha);
					}


					break;
				case FillType.LinearGradient:
				case FillType.RadialGradient:
				case FillType.FocalRadialGradient:
					var gradientType = style.type === FillType.LinearGradient ?
						GradientType.Linear :
						GradientType.Radial;
					var alphas:number[]=[];
					for(var i:number=0; i<style.colors.length; i++) {
						alphas[i]=this.getAlpha(style.colors[i])/255;
						style.colors[i]=this.rgbaToArgb(style.colors[i]);
					}
					var awayMatrix:AwayMatrix=new AwayMatrix(style.transform.a, style.transform.b, style.transform.c, style.transform.d, style.transform.tx, style.transform.ty);
					shape.style=new GradientFillStyle(gradients_map_swf_to_away[gradientType], style.colors, alphas, style.ratios,  awayMatrix, style.spreadMethod, style.interpolationMode, style.focalPoint / 2 | 0);

					//console.log("style.spreadMethod, style.interpolationMode", style.spreadMethod, style.interpolationMode);
					if (morph) {
						var gradientType = morph.type === FillType.LinearGradient ?
							GradientType.Linear :
							GradientType.Radial;
						var alphas:number[]=[];
						for(var i:number=0; i<morph.colors.length; i++) {
							alphas[i]=this.getAlpha(morph.colors[i])/255;
							morph.colors[i]=this.rgbaToArgb(morph.colors[i]);
						}
						var awayMatrix:AwayMatrix=new AwayMatrix(morph.transform.a, morph.transform.b, morph.transform.c, morph.transform.d, morph.transform.tx, morph.transform.ty);
						morphShape.style=new GradientFillStyle(gradients_map_swf_to_away[gradientType], morph.colors, alphas, morph.ratios,  awayMatrix, morph.spreadMethod, morph.interpolationMode, morph.focalPoint / 2 | 0);

						//console.log("writeMorphGradient not handled yet");
						//writeMorphGradient(morph, shape);
					}
					break;
				case FillType.ClippedBitmap:
				case FillType.RepeatingBitmap:
				case FillType.NonsmoothedClippedBitmap:
				case FillType.NonsmoothedRepeatingBitmap:

					var material:MethodMaterial = this.parser.mapMatsForBitmaps[style.bitmapIndex];
					if(!material){
						material=new MethodMaterial();
						material.ambientMethod.texture=new ImageTexture2D(this.parser.awayBitmaps[style.bitmapIndex]);
						this.parser.mapMatsForBitmaps[style.bitmapIndex]=material;
					}

					//console.log("bitmapIndex", style.bitmapIndex, "transform", style.transform,  "repeat", style.repeat,  "smooth", style.smooth);
					var awayMatrix:AwayMatrix=new AwayMatrix(style.transform.a, style.transform.b, style.transform.c, style.transform.d, style.transform.tx, style.transform.ty);

					shape.style=new BitmapFillStyle(material, awayMatrix, style.repeat, style.smooth);
					//shape.beginBitmap(command, style.bitmapIndex, style.transform, style.repeat, style.smooth);
					if (morph) {
						console.log("writeMorphBitmap not handled yet");
						//writeMorphBitmap(morph, shape);
					}

					break;
				default:
					console.log('Invalid fill style type: ' + style.type);
			}
		} else {
			var style = this.lineStyle;
			var morph = style.morph;
			assert(style);
			switch (style.type) {
				case FillType.Solid:
					var scaleMode = style.noHscale ?
						(style.noVscale ? 0 : 2) :
						style.noVscale ? 3 : 1;
					// TODO: Figure out how to handle startCapsStyle
					var thickness = (clamp(style.width, 0, 0xff * 20)|0)/20;
					style.alpha=this.getAlpha(style.color)/255;
					style.color=this.rgbaToArgb(style.color);
					var scaleModeAWJ="NORMAL";
					//if(style.noVscale==null && style.noHscale==null){
					//	scaleModeAWJ="HAIRLINE";
					//}
					if(thickness==0.05){
						scaleModeAWJ="HAIRLINE";
					}
					if(style.startCapsStyle!=style.endCapsStyle){
						throw("different end vs start capstyöe");
					}
					style.startCapsStyle=0;
					style.jointStyle=0;
					//console.log("style.startCapsStyle", style.startCapsStyle, style.endCapsStyle, style );
					shape.style=new GraphicsStrokeStyle(style.color, style.alpha, thickness, style.jointStyle, capStyle_map_to_away[style.startCapsStyle], style.miterLimit, scaleModeAWJ);

					//console.log("scaleMode", scaleModeAWJ, style.noHscale, style.noVscale, scaleMode, thickness, style.jointStyle, style.startCapsStyle, style.endCapsStyle, style.miterLimit);
					if (morph) {
						var thickness = (clamp(morph.width, 0, 0xff * 20)|0)/20;
						morph.alpha=this.getAlpha(morph.color)/255;
						morph.color=this.rgbaToArgb(morph.color);
						morphShape.style=new GraphicsStrokeStyle(morph.color, morph.alpha, thickness, style.jointStyle, capStyle_map_to_away[style.startCapsStyle], style.miterLimit, scaleModeAWJ);
						//console.log("writeMorphLineStyle not handled yet");
						//writeMorphLineStyle(morph, shape);
					}
					break;
				case FillType.LinearGradient:
				case FillType.RadialGradient:
				case FillType.FocalRadialGradient:
					var scaleMode = style.noHscale ?
						(style.noVscale ? 0 : 2) :
						style.noVscale ? 3 : 1;
					// TODO: Figure out how to handle startCapsStyle
					//console.log("style.startCapsStyle", style.startCapsStyle, style.endCapsStyle, style );
					var thickness = (clamp(style.width, 0, 0xff * 20)|0)/20;
					style.alpha=this.getAlpha(style.color)/255;
					style.color=this.rgbaToArgb(style.color)
					shape.style=new GraphicsStrokeStyle(style.color, style.alpha, thickness, style.jointStyle, style.endCapsStyle, style.miterLimit);
					var gradientType = style.type === FillType.LinearGradient ?
						GradientType.Linear :
						GradientType.Radial;
					for(var i:number=0; i<style.colors.length; i++) {
						style.colors[i]=this.rgbaToArgb(style.colors[i]);
						alphas[i]=1;
					}
					for(var i:number=0; i<style.colors.length; i++) alphas[i]=1;
					shape.style=new GradientFillStyle(gradients_map_swf_to_away[gradientType], style.colors, alphas, style.ratios,  style.transform, style.spreadMethod,style.interpolationMode, style.focalPoint / 2 | 0);

					//console.log("scaleMode", style.noHscale, style.noVscale, scaleMode, thickness, style.jointStyle, style.endCapsStyle, style.miterLimit);
					if (morph) {
						//console.log("writeMorphLineStyle not handled yet");
						//console.log("writeMorphGradient not handled yet");
						//writeMorphLineStyle(morph, shape);
						//writeMorphGradient(morph, shape);
					}
					break;
				case FillType.ClippedBitmap:
				case FillType.RepeatingBitmap:
				case FillType.NonsmoothedClippedBitmap:
				case FillType.NonsmoothedRepeatingBitmap:
					var scaleMode = style.noHscale ?
						(style.noVscale ? 0 : 2) :
						style.noVscale ? 3 : 1;
					// TODO: Figure out how to handle startCapsStyle
					//console.log("style.startCapsStyle", style.startCapsStyle, style.endCapsStyle, style );
					var thickness = clamp(style.width, 0, 0xff * 20)|0;
					shape.style=new GraphicsStrokeStyle(style.color, 1, thickness, style.jointStyle, style.endCapsStyle, style.miterLimit);
					//console.log("scaleMode", scaleMode, thickness, style.jointStyle, style.endCapsStyle, style.miterLimit);



					//console.log("writeBitmap not handled yet");
					//writeBitmap(PathCommand.LineStyleBitmap, style, shape);
					if (morph) {
						//console.log("writeMorphLineStyle not handled yet");
						//console.log("writeMorphBitmap not handled yet");
						//writeMorphLineStyle(morph, shape);
						//writeMorphBitmap(morph, shape);
					}
					break;
				default:
				//console.error('Line style type not yet supported: ' + style.type);
			}
		
		}

		var lastPosition = {x: 0, y: 0};
		current = finalRoot;
		while (current) {
			if(current.isValidFill){
				current.serializeAJS(shape, morphShape, lastPosition);
			}
			current = current.next;
		}
		/*
		if (this.fillStyle) {
			shape.endFill();
		} else {
			shape.endLine();
		}*/
		return shape;
	}


}

function writeLineStyle(style: ShapeStyle, shape: ShapeData): void {
	// No scaling == 0, normal == 1, vertical only == 2, horizontal only == 3.
	var scaleMode = style.noHscale ?
		(style.noVscale ? 0 : 2) :
		style.noVscale ? 3 : 1;
	// TODO: Figure out how to handle startCapsStyle
	var thickness = clamp(style.width, 0, 0xff * 20)|0;
	shape.lineStyle(thickness, style.color,
		style.pixelHinting, scaleMode, style.endCapsStyle,
		style.jointStyle, style.miterLimit);
}

function writeMorphLineStyle(style: ShapeStyle, shape: ShapeData): void {
	// TODO: Figure out how to handle startCapsStyle
	var thickness = clamp(style.width, 0, 0xff * 20)|0;
	shape.writeMorphLineStyle(thickness, style.color);
}

function writeGradient(command: PathCommand, style: ShapeStyle, shape: ShapeData): void {
	var gradientType = style.type === FillType.LinearGradient ?
		GradientType.Linear :
		GradientType.Radial;
	shape.beginGradient(command, style.colors, style.ratios,
		gradientType, style.transform, style.spreadMethod,
		style.interpolationMode, style.focalPoint / 2 | 0);
}

function writeMorphGradient(style: ShapeStyle, shape: ShapeData) {
	shape.writeMorphGradient(style.colors, style.ratios, style.transform);
}

function writeBitmap(command: PathCommand, style: ShapeStyle, shape: ShapeData): void {
	shape.beginBitmap(command, style.bitmapIndex, style.transform, style.repeat, style.smooth);
}

function writeMorphBitmap(style: ShapeStyle, shape: ShapeData) {
	shape.writeMorphBitmap(style.transform);
}

