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
import { DisplayObject as AwayDisplayObject } from "@awayjs/scene"
//import {BitmapImage2D as BitmapData} from "@awayjs/stage"
import {XMLDocumentAway} from "./customAway/xml/XMLDocumentAway"

import { EventDispatcher } from '../as3webFlash/events/EventDispatcher';
import { DisplayObject } from '../as3webFlash/display/DisplayObject';
import { DisplayObjectContainer } from '../as3webFlash/display/DisplayObjectContainer';
import { Stage } from '../as3webFlash/display/Stage';
import { Loader } from '../as3webFlash/display/Loader';
import { LoaderInfo } from '../as3webFlash/display/LoaderInfo';
import { MovieClip } from '../as3webFlash/display/MovieClip';
import { Graphics } from '../as3webFlash/display/Graphics';
import { Bitmap } from '../as3webFlash/display/Bitmap';
import { BitmapData } from '../as3webFlash/display/BitmapData';
import { SimpleButton } from '../as3webFlash/display/SimpleButton';
import { TextField } from '../as3webFlash/text/TextField';
import { ISecurityDomain } from './ISecurityDomain';
import { Point } from '../as3webFlash/geom/Point';
import { Event } from '../as3webFlash/events/Event';
import { KeyboardEvent } from '../as3webFlash/events/KeyboardEvent';
import { MouseEvent } from '../as3webFlash/events/MouseEvent';
import { ProgressEvent } from '../as3webFlash/events/ProgressEvent';
import { Rectangle } from '../as3webFlash/geom/Rectangle';
import { Matrix } from '../as3webFlash/geom/Matrix';
import { ColorTransform } from '../as3webFlash/geom/ColorTransform';
import { Transform } from '../as3webFlash/geom/Transform';
import { URLRequest } from '../as3webFlash/net/URLRequest';
import { URLLoader } from '../as3webFlash/net/URLLoader';
import { URLVariables } from '../as3webFlash/net/URLVariables';
import { SharedObject } from '../as3webFlash/net/SharedObject';
import { LoaderContext } from '../as3webFlash/system/LoaderContext';
import { ByteArray } from '../avm2/natives/byteArray';
import { Sound } from '../as3webFlash/media/Sound';
import { XMLNode } from '../avm2/natives/xml-document';
import { TextFormat } from '../flash/text/TextFormat';
import { AVMAwayStage } from './AVMAwayStage';
import { AXApplicationDomain } from '../avm2/run/AXApplicationDomain';
import { Sprite } from '../as3webFlash/display/Sprite';
import { ApplicationDomain } from '../as3webFlash/system/ApplicationDomain';

export class AVM1Movie extends AwayDisplayObject {
	_getLevelForRoot(root: AwayDisplayObject): number{return 0;};
	_getRootForLevel(level: number): AwayDisplayObject{return null;};
	_addRoot(level: number, root: AwayDisplayObject): void{};
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
			DisplayObjectContainer: typeof DisplayObjectContainer;
			AVM1Movie: typeof AVM1Movie;
			Stage: typeof Stage;
			Loader: typeof Loader;
			LoaderInfo: typeof LoaderInfo;
			MovieClip: typeof MovieClip;
			Graphics: typeof Graphics;
			Bitmap: typeof Bitmap;
			BitmapData: typeof BitmapData;
			SimpleButton: typeof SimpleButton;
			Sprite: typeof Sprite;
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
			ApplicationDomain: typeof ApplicationDomain
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
	application: AXApplicationDomain;
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
