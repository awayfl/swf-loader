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

import { ShapeTag } from '@awayjs/graphics';

import { SWFParser } from '../../SWFParser';
import { ShapeFlags } from '../../../factories/base/SWFTags';
import { SYMBOL_TYPE } from '../../ISymbol';
import { ISceneGraphFactory } from '@awayjs/scene';

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

export function defineShape(tag: ShapeTag, factory: ISceneGraphFactory): any {
	//console.log(fillPaths, linePaths);

	const isMorph = tag.flags & ShapeFlags.IsMorph;

	tag.factory = factory;
	(tag as any).type = isMorph ? SYMBOL_TYPE.MORPH : SYMBOL_TYPE.SHAPE;

	return tag;
}

// function writeLineStyle(style: ShapeStyle, shape: ShapeData): void {
// 	// No scaling == 0, normal == 1, vertical only == 2, horizontal only == 3.
// 	var scaleMode = style.noHscale ?
// 		(style.noVscale ? 0 : 2) :
// 		style.noVscale ? 3 : 1;
// 	// TODO: Figure out how to handle startCapsStyle
// 	var thickness = clamp(style.width, 0, 0xff * 20)|0;
// 	shape.lineStyle(thickness, style.color,
// 		style.pixelHinting, scaleMode, style.endCapsStyle,
// 		style.jointStyle, style.miterLimit);
// }

// function writeMorphLineStyle(style: ShapeStyle, shape: ShapeData): void {
// 	// TODO: Figure out how to handle startCapsStyle
// 	var thickness = clamp(style.width, 0, 0xff * 20)|0;
// 	shape.writeMorphLineStyle(thickness, style.color);
// }

// function writeGradient(command: PathCommand, style: ShapeStyle, shape: ShapeData): void {
// 	var gradientType = style.type === FillType.LinearGradient ?
// 		GradientType.Linear :
// 		GradientType.Radial;
// 	shape.beginGradient(command, style.colors, style.ratios,
// 		gradientType, style.transform, style.spreadMethod,
// 		style.interpolationMode, style.focalPoint / 2 | 0);
// }

// function writeMorphGradient(style: ShapeStyle, shape: ShapeData) {
// 	shape.writeMorphGradient(style.colors, style.ratios, style.transform);
// }

// function writeBitmap(command: PathCommand, style: ShapeStyle, shape: ShapeData): void {
// 	shape.beginBitmap(command, style.bitmapIndex, style.transform, style.repeat, style.smooth);
// }

// function writeMorphBitmap(style: ShapeStyle, shape: ShapeData) {
// 	shape.writeMorphBitmap(style.transform);
// }
