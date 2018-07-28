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

import {Matrix, Loader, LoaderContext, EventDispatcher, EventBase as Event, ColorTransform, ByteArray, Transform, URLLoader, URLRequest, URLVariables, Point, Rectangle, WaveAudio as Sound} from "@awayjs/core"
import {MouseEvent, SimpleButton, DisplayObject, Billboard as Bitmap, DisplayObjectContainer, MovieClip, TextField, TextFormat} from "@awayjs/scene"
import {Graphics} from "@awayjs/graphics"
import {BitmapImage2D as BitmapData} from "@awayjs/stage"
import {LoaderInfo} from "./customAway/LoaderInfo"
import {ProgressEvent} from "./customAway/events/ProgressEvent"
import {KeyboardEvent} from "./customAway/events/KeyboardEvent"
import {SharedObject} from "./customAway/SharedObject"
import {AVMAwayStage} from "./AVMAwayStage"
import {XMLNode} from "./customAway/xml/XMLNode"
import {XMLDocumentAway} from "./customAway/xml/XMLDocumentAway"

export class AVM1Movie extends DisplayObject {
	_getLevelForRoot(root: DisplayObject): number{return 0;};
	_getRootForLevel(level: number): DisplayObject{return null;};
	_addRoot(level: number, root: DisplayObject): void{};
	_removeRoot(level: number): void{};
}
export class ContextMenu{}
export class ContextMenuItem{}
export class fscommand{}
export class Security{}
export class Capabilities{}
export class ExternalInterface{}
export class Mouse{}
export class SoundChannel{}
export class SoundTransform{}
export class SoundMixer{}

//import flashPackage = Shumway.AVMX.AS.flash;
export interface ISecurityDomain {
	flash?: {
		display: {
			EventDispatcher: typeof EventDispatcher;
			DisplayObject: typeof DisplayObject;
			DisplayObjectContainer: DisplayObjectContainer;
			AVM1Movie: typeof AVM1Movie;
			Stage: typeof AVMAwayStage;
			Loader: typeof Loader;
			LoaderInfo: typeof LoaderInfo;
			MovieClip: typeof MovieClip;
			Graphics: typeof Graphics;
			Bitmap: typeof Bitmap;
			BitmapData: typeof BitmapData;
			SimpleButton: typeof SimpleButton;
		};
		events: {
			EventDispatcher: typeof EventDispatcher;
			Event: typeof Event;
			KeyboardEvent: typeof KeyboardEvent;
			MouseEvent: typeof MouseEvent;
			ProgressEvent: typeof ProgressEvent;
		};
		external: {
			ExternalInterface: typeof ExternalInterface;
		};
		filters: any;
		text: {
			TextField: typeof TextField;
			TextFormat: typeof TextFormat;
		};
		geom: {
			Point: typeof Point;
			Rectangle: typeof Rectangle;
			Matrix: typeof Matrix;
			ColorTransform: typeof ColorTransform;
			Transform: typeof Transform;
		}
		net: {
			URLRequest: typeof URLRequest;
			URLLoader: typeof URLLoader;
			URLVariables: typeof URLVariables;
			SharedObject: typeof SharedObject;
		}
		system: {
			Capabilities: typeof Capabilities;
			LoaderContext: typeof LoaderContext;
			Security: typeof Security;
			fscommand: typeof fscommand;
		}
		ui: {
			ContextMenu: typeof ContextMenu;
			ContextMenuItem: typeof ContextMenuItem;
			Mouse: typeof Mouse;
		}
		utils: {
			ByteArray: typeof ByteArray;
		}
		media: {
			Sound: typeof Sound;
			SoundChannel: typeof SoundChannel;
			SoundTransform: typeof SoundTransform;
			SoundMixer: typeof SoundMixer;
		}
		xml: {
			XMLDocument: typeof XMLDocumentAway;
			XMLNode: typeof XMLNode;
		}
	};
	player: any;//80pro Shumway.Player.Player;
}

export class SecurityDomain{
	public flash= {
		display: {
			EventDispatcher: EventDispatcher,
			DisplayObject: DisplayObject,
			DisplayObjectContainer: DisplayObjectContainer,
			AVM1Movie: AVM1Movie,
			Stage: AVMAwayStage,
			Loader: Loader,
			LoaderInfo: LoaderInfo,
			MovieClip: MovieClip,
			Graphics: Graphics,
			Bitmap: Bitmap,
			BitmapData: BitmapData,
			SimpleButton: SimpleButton
		},
		events: {
			EventDispatcher: EventDispatcher,
			Event: Event,
			KeyboardEvent: KeyboardEvent,
			MouseEvent: MouseEvent,
			ProgressEvent: ProgressEvent
		},
		external: {
			ExternalInterface: ExternalInterface
		},
		filters: {},
		text: {
			TextField: TextField,
			TextFormat: TextFormat
		},
		geom: {
			Point: Point,
			Rectangle: Rectangle,
			Matrix: Matrix,
			ColorTransform: ColorTransform,
			Transform: Transform
		},
		net: {
			URLRequest: URLRequest,
			URLLoader: URLLoader,
			URLVariables: URLVariables,
			SharedObject: SharedObject
		},
		system: {
			Capabilities: Capabilities,
			LoaderContext: LoaderContext,
			Security: Security,
			fscommand: fscommand
		},
		ui: {
			ContextMenu: ContextMenu,
			ContextMenuItem: ContextMenuItem,
			Mouse: Mouse
		},
		utils: {
			ByteArray: ByteArray
		},
		media: {
			Sound: Sound,
			SoundChannel: SoundChannel,
			SoundTransform: SoundTransform,
			SoundMixer: SoundMixer
		},
		xml: {
			XMLDocument: XMLDocumentAway,
			XMLNode: XMLNode
		}
	};
	public player= {};//80pro Shumway.Player.Player;
}
