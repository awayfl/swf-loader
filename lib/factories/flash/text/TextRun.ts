import { TextFormat } from "./TextFormat";
import { ASObject } from "../../avm2/nat/ASObject";

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
// Class: TextRun
export class TextRun extends ASObject {

  static classInitializer: any = null;

  constructor(beginIndex: number /*int*/, endIndex: number /*int*/,
              textFormat: TextFormat) {
    super();
    this._beginIndex = beginIndex | 0;
    this._endIndex = endIndex | 0;
    this._textFormat = textFormat;
  }

  _beginIndex: number /*int*/;
  _endIndex: number /*int*/;
  _textFormat: TextFormat;

  get beginIndex(): number {
    return this._beginIndex;
  }

  set beginIndex(value: number) {
    this._beginIndex = value | 0;
  }

  get endIndex(): number {
    return this._endIndex;
  }

  set endIndex(value: number) {
    this._endIndex = value | 0;
  }

  get textFormat(): TextFormat {
    return this._textFormat;
  }

  set textFormat(value: TextFormat) {
    this._textFormat = value;
  }

  clone(): TextRun {
    return new TextRun(this.beginIndex, this.endIndex,
                                            this.textFormat.clone());
  }

  containsIndex(index: number): boolean {
    return index >= this._beginIndex && index < this._endIndex;
  }

  intersects(beginIndex: number, endIndex: number): boolean {
    return Math.max(this._beginIndex, beginIndex) < Math.min(this._endIndex, endIndex);
  }
}