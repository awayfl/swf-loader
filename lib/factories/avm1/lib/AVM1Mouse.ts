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

import {alCallProperty} from "../runtime";
import {AVM1Context} from "../context";
import {wrapAVM1NativeClass} from "./AVM1Utils";
import {MouseEvent} from "@awayjs/scene";
import {MouseManager} from "@awayjs/view";
import {AVMAwayStage} from "../../AVMAwayStage";
import {AVM1Object} from "../runtime/AVM1Object";
import { AVM1Stage } from './AVM1Stage';
import { AVM1Globals } from './AVM1Globals';


export class AVM1Mouse extends AVM1Object {
	public static createAVM1Class(context: AVM1Context): AVM1Object {
		var wrapped = wrapAVM1NativeClass(context, false, AVM1Mouse, ['show', 'hide'], []);
		return wrapped;
	}

	public static bindStage(context: AVM1Context, cls: AVM1Object, stage: AVMAwayStage, htmlElement:HTMLElement): void {
		stage.addEventListener('mouseDown', function (e: MouseEvent) {
			alCallProperty(cls, 'broadcastMessage', ['onMouseDown']);
		});
		stage.addEventListener('mouseMove', function (e: MouseEvent) {
			alCallProperty(cls, 'broadcastMessage', ['onMouseMove']);
		});
		stage.addEventListener('mouseOut', function (e: MouseEvent) {
			alCallProperty(cls, 'broadcastMessage', ['onMouseMove']);
		});
		stage.addEventListener('mouseUp', function (e: MouseEvent) {
			alCallProperty(cls, 'broadcastMessage', ['onMouseUp']);
		});
	}

	public static hide() {
		MouseManager.getInstance((<AVM1Stage>AVM1Globals.instance.Stage)._awayAVMStage.view.renderer.pickGroup).showCursor=false;
	}

	public static show() {
		MouseManager.getInstance((<AVM1Stage>AVM1Globals.instance.Stage)._awayAVMStage.view.renderer.pickGroup).showCursor=true;
	}
}

