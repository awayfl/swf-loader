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
import {avm1BroadcastEvent, hasAwayJSAdaptee, IAVM1SymbolBase, wrapAVM1NativeClass} from "./AVM1Utils";
import {AVM1Context} from "../context";
import {AVM1NativeFunction, AVM1PropertyFlags} from "../runtime";
import {AVM1ArrayNative} from "../natives";
import {AVM1Object} from "../runtime/AVM1Object";
import { AVM1PropertyDescriptor } from "../runtime/AVM1PropertyDescriptor";

function _updateAllSymbolEvents(symbolInstance: IAVM1SymbolBase) {
	if (!hasAwayJSAdaptee(symbolInstance)) {
		return;
	}
	symbolInstance.updateAllEvents();
}

export class AVM1Broadcaster extends AVM1Object {
	public static createAVM1Class(context: AVM1Context): AVM1Object {
		return wrapAVM1NativeClass(context, true, AVM1Broadcaster, ['initialize'], []);
	}

	public static initialize(context: AVM1Context, obj: AVM1Object): void {
		var desc = new AVM1PropertyDescriptor(AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_ENUM,
			new AVM1ArrayNative(context, []));
		obj.alSetOwnProperty('_listeners', desc);
		desc = new AVM1PropertyDescriptor(AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_ENUM,
			new AVM1NativeFunction(context, function broadcastMessage(eventName: string, ...args): void {
				var listenersField = this.alGet('_listeners');
				if (!(listenersField instanceof AVM1ArrayNative)) {
					return;
				}
				avm1BroadcastEvent(context, this, eventName, args);
			}));
		obj.alSetOwnProperty('broadcastMessage', desc);
		desc = new AVM1PropertyDescriptor(AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_ENUM,
			new AVM1NativeFunction(context, function addListener(listener: any): boolean {
				var listenersField = this.alGet('_listeners');
				if (!(listenersField instanceof AVM1ArrayNative)) {
					return false;
				}
				var listeners: any[] = (<AVM1ArrayNative>listenersField).value;
				listeners.push(listener);
				_updateAllSymbolEvents(<any>this);
				return true;
			}));
		obj.alSetOwnProperty('addListener', desc);
		desc = new AVM1PropertyDescriptor(AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_ENUM,
			new AVM1NativeFunction(context, function removeListener(listener: any): boolean {
				var listenersField = this.alGet('_listeners');
				if (!(listenersField instanceof AVM1ArrayNative)) {
					return false;
				}
				var listeners: any[] = (<AVM1ArrayNative>listenersField).value;
				var i = listeners.indexOf(listener);
				if (i < 0) {
					return false;
				}
				listeners.splice(i, 1);
				_updateAllSymbolEvents(<any>this);
				return true;
			}));
		obj.alSetOwnProperty('removeListener', desc);
	}
}
