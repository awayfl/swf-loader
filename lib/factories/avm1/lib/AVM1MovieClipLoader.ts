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
import {wrapAVM1NativeClass} from "./AVM1Utils";
import {AVM1MovieClip} from "./AVM1MovieClip";
import {AVM1Broadcaster} from "./AVM1Broadcaster";
import {notImplemented} from "../../base/utilities/Debug";
import { AVM1LoaderHelper } from './AVM1LoaderHelper';


export class AVM1MovieClipLoader extends AVM1Object {
	static createAVM1Class(context: AVM1Context): AVM1Object {
		return wrapAVM1NativeClass(context, true, AVM1MovieClipLoader,
			[],
			['loadClip', 'unloadClip', 'getProgress'],
			null, AVM1MovieClipLoader.prototype.avm1Constructor);
	}

	private _loaderHelper: AVM1LoaderHelper;
	private _target: AVM1MovieClip;

	public avm1Constructor() {
		AVM1Broadcaster.initialize(this.context, this);
	}

	public loadClip(url: string, target):Boolean {
		var loadLevel: boolean = typeof target === 'number';
		var level: number;
		var target_mc: AVM1MovieClip;
		if (loadLevel) {
			level = <number>target;
			if (level === 0) {
				notImplemented('MovieClipLoader.loadClip at _level0');
				return false;
			}
		} else {
			target_mc = this.context.resolveTarget(target);
			if (!target_mc) {
				return false; // target was not found -- doing nothing
			}
		}

		var loaderHelper = new AVM1LoaderHelper(this.context);
		this._loaderHelper = loaderHelper;
		this._target = null;

		var loaderInfo = loaderHelper.loaderInfo;

		//80pro todo
		/*
		loaderInfo.addEventListener(Event.OPEN, this.openHandler.bind(this));
		loaderInfo.addEventListener(ProgressEvent.PROGRESS, this.progressHandler.bind(this));
		loaderInfo.addEventListener(IOErrorEvent.IO_ERROR, this.ioErrorHandler.bind(this));
		loaderInfo.addEventListener(Event.COMPLETE, this.completeHandler.bind(this));
		loaderInfo.addEventListener(Event.INIT, this.initHandler.bind(this));

		loaderHelper.load(url, null).then(function () {
			var newChild = loaderHelper.content;
			this._target = getAVM1Object(newChild, this.context);

			if (loadLevel) {
				var avm1LevelHolder = this.context.levelsContainer;
				avm1LevelHolder._addRoot(level, newChild);
			} else {
				// TODO fix newChild name to match target_mc
				var parent = target_mc.adaptee.parent;
				var depth = target_mc.adaptee._depth;
				parent.removeChild(target_mc.adaptee);
				parent.addTimelineObjectAtDepth(newChild, depth);
			}
		}.bind(this));
		*/
		return true;
	}

	public unloadClip(target):Boolean {
		notImplemented('MovieClipLoader.unloadClip');
		/*
		if (!this._loaderHelper) {
			return false; // nothing was loaded by this loader
		}
		var loadLevel: boolean = typeof target === 'number';
		var level: number;
		var target_mc: AVM1MovieClip;
		var originalLoader = this._loaderHelper.loader;
		if (loadLevel) {
			level = <number>target;
			if (level === 0) {
				release || Debug.notImplemented('MovieClipLoader.unloadClip at _level0');
				return false;
			}
			var avm1LevelHolder = this.context.levelsContainer;
			if (avm1LevelHolder._getRootForLevel(level) !== originalLoader.content) {
				return false; // did not load this root
			}
			avm1LevelHolder._removeRoot(level);
		} else {
			target_mc = target ? this.context.resolveTarget(target) : undefined;
			if (!target_mc) {
				return false; // target was not found -- doing nothing
			}
			if (target_mc.adaptee !== originalLoader.content) {
				return false; // did not load this movie clip
			}
			target_mc.unloadMovie();
		}
		this._target = null;
		this._loaderHelper = null;
		// TODO: find out under which conditions unloading a clip can fail
		*/
		return true;
	}
	public getProgress(target): number {
		return this._loaderHelper.loaderInfo.bytesLoaded;
	}
	/*

		private _broadcastMessage(message: string, args: any[] = null) {
			avm1BroadcastEvent(this.context, this, message, args);
		}

		private openHandler(event: Event): void {
			this._broadcastMessage('onLoadStart', [this._target]);
		}

		private progressHandler(event: ProgressEvent):void {
			this._broadcastMessage('onLoadProgress', [this._target, event.bytesLoaded, event.bytesTotal]);
		}

		private ioErrorHandler(event: IOErrorEvent):void {
			this._broadcastMessage('onLoadError', [this._target, event.errorID, 501]);
		}

		private completeHandler(event: Event):void {
			this._broadcastMessage('onLoadComplete', [this._target]);
		}

		private initHandler(event: Event):void {
			var exitFrameCallback = function () {
				targetAwayObject.removeEventListener(Event.EXIT_FRAME, exitFrameCallback);
				this._broadcastMessage('onLoadInit', [this._target]);
			}.bind(this);
			// MovieClipLoader's init event is dispatched after all frame scripts of the AVM1 instance
			// have run for one additional iteration.
			var targetAwayObject = this._loaderHelper.content;
			targetAwayObject.addEventListener(Event.EXIT_FRAME, exitFrameCallback)
		}*/
}

