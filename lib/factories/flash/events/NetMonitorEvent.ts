import { Event } from "./Event";

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
// Class: NetMonitorEvent
export class NetMonitorEvent extends Event {

  static classInitializer: any = null;

  static classSymbols: string [] = null;
  static instanceSymbols: string [] = null;

  netStream: NetStream;

  constructor(type: string, bubbles: boolean = false, cancelable: boolean = false,
              netStream: NetStream = null) {
    super(type, bubbles, cancelable);
    // TODO: coerce
    this.netStream = netStream;
  }

  // JS -> AS Bindings
  static NET_STREAM_CREATE: string = "netStreamCreate";
}
