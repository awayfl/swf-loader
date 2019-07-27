import { Graphics } from "./Graphics";
import { SymbolData } from "../symbol";
import { ISecurityDomain } from "../../avm2/nat";
import { Bounds } from "../../base/utilities";
import { ShapeSymbol } from "./Shape";
import { LoaderInfo } from "./LoaderInfo";
import { DisplayObject, DisplayObjectFlags } from "./DisplayObject";
import { assert, release } from "../../base/utilities/Debug";

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
// Class: MorphShape
export class MorphShape extends DisplayObject {
  static classSymbols: string [] = null; // [];
  static instanceSymbols: string [] = null; // [];

  static axClass: typeof MorphShape;

  static classInitializer: any = null;
  _symbol: MorphShapeSymbol;
  applySymbol() {
    this._initializeFields();
    release || assert(this._symbol);
    this._setStaticContentFromSymbol(this._symbol);
    // TODO: Check what do do if the computed bounds of the graphics object don't
    // match those given by the symbol.
    this._setFlags(DisplayObjectFlags.ContainsMorph);
  }

  constructor () {
    if (this._symbol && !this._fieldsInitialized) {
      this.applySymbol();
    }
    super();
    release || assert(!this._symbol);
  }

  _canHaveGraphics(): boolean {
    return true;
  }

  _getGraphics(): Graphics {
    return this._graphics;
  }

  get graphics(): Graphics {
    return this._ensureGraphics();
  }

  _containsPointDirectly(localX: number, localY: number,
                          globalX: number, globalY: number): boolean {
    var graphics = this._getGraphics();
    return graphics && graphics._containsPoint(localX, localY, true, this._ratio / 0xffff);
  }
}

export class MorphShapeSymbol extends ShapeSymbol {
  morphFillBounds: Bounds;
  morphLineBounds: Bounds;
  constructor(data: SymbolData, sec: ISecurityDomain) {
    super(data, MorphShape.axClass);
  }

  static FromData(data: any, loaderInfo: LoaderInfo): MorphShapeSymbol {
    var symbol = new MorphShapeSymbol(data, loaderInfo.sec);
    symbol._setBoundsFromData(data);
    symbol.graphics = Graphics.FromData(data, loaderInfo);
    symbol.processRequires(data.require, loaderInfo);
    symbol.morphFillBounds = data.morphFillBounds;
    symbol.morphLineBounds = data.morphLineBounds;
    return symbol;
  }
}