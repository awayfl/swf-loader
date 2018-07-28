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

import {AVM1Object} from "../runtime/AVM1Object";
import {AVM1Context} from "../context";
import {wrapAVM1NativeMembers} from "./AVM1Utils";
import {AVMAwayStage} from "../../AVMAwayStage";
import { Rectangle } from '@awayjs/core';

export class AVM1Stage extends AVM1Object {
	public static stage:AVMAwayStage;
	public static createAVM1Class(context: AVM1Context): AVM1Object {
		var wrapped = new AVM1Stage(context);
		wrapAVM1NativeMembers(context, wrapped, AVM1Stage.prototype,
			['align#', 'displayState#', 'fullScreenSourceRect#', 'height#',
				'scaleMode#', 'showMenu#', 'width#'],
			false);
		return wrapped;
	}

	public static bindStage(context: AVM1Context, cls: AVM1Object, stage: AVMAwayStage, htmlElement:HTMLElement): void  {
		(<AVM1Stage>cls)._awayAVMStage = stage;
		AVM1Stage.stage=stage;

	}

	_awayAVMStage:AVMAwayStage;

	public getAlign() { return this._awayAVMStage.align; }
	public setAlign(value) { this._awayAVMStage.align = value; }

	public getDisplayState() { return this._awayAVMStage.displayState; }
	public setDisplayState(value) { this._awayAVMStage.displayState = value; }

	public getFullScreenSourceRect():Rectangle { return this._awayAVMStage.fullScreenSourceRect; }
	public setFullScreenSourceRect(value:Rectangle) { this._awayAVMStage.fullScreenSourceRect = value; }

	public getHeight() { return this._awayAVMStage.stageHeight; }

	public getScaleMode() { return this._awayAVMStage.scaleMode; }
	public setScaleMode(value) { this._awayAVMStage.scaleMode = value; }

	public getShowMenu() { return this._awayAVMStage.showDefaultContextMenu; }
	public setShowMenu(value) { this._awayAVMStage.showDefaultContextMenu = value; }

	public getWidth() { return this._awayAVMStage.stageWidth; }
}

