import { release, somewhatImplemented } from "../../base/utilities/Debug";
import { ContextMenuClipboardItems } from "./ContextMenuClipboardItems";
import { ASArray } from "../../avm2/nat/ASArray";
import { URLRequest } from "../net/URLRequest";
import { ContextMenuBuiltInItems } from "./ContextMenuBuiltInItems";
import { NativeMenu } from "../display/NativeMenu";

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
// Class: ContextMenu
export class ContextMenu extends NativeMenu {
  
  static classInitializer: any = null;

  constructor () {
    super();
    this._builtInItems = new ContextMenuBuiltInItems();
    this._customItems = [];
  }
  
  static get isSupported(): boolean {
    somewhatImplemented('ContextMenu::isSupported');
    return false;
  }
  
  _builtInItems: ContextMenuBuiltInItems;
  _customItems: any [];
  _link: URLRequest;
  _clipboardMenu: boolean;
  _clipboardItems: ContextMenuClipboardItems;

  get builtInItems(): ContextMenuBuiltInItems {
    // TODO: Should clone here probably.
    release || somewhatImplemented("public flash.ui.ContextMenu::get builtInItems");
    return this._builtInItems;
  }
  set builtInItems(value: ContextMenuBuiltInItems) {
    // TODO: Should clone here probably.
    value = value;
    release || somewhatImplemented("public flash.ui.ContextMenu::set builtInItems");
    this._builtInItems = value;
  }
  get customItems(): ASArray {
    // TODO: Should clone here probably.
    release || somewhatImplemented("public flash.ui.ContextMenu::get customItems");
    return this.sec.createArrayUnsafe(this._customItems);
  }
  set customItems(value: ASArray) {
    // TODO: Should clone here probably.
    value = value;
    release || somewhatImplemented("public flash.ui.ContextMenu::set customItems");
    this._customItems = value.value;
  }
  get link(): URLRequest {
    release || somewhatImplemented("public flash.ui.ContextMenu::get link");
    return this._link;
  }
  set link(value: URLRequest) {
    value = value;
    release || somewhatImplemented("public flash.ui.ContextMenu::set link");
    this._link = value;
  }
  get clipboardMenu(): boolean {
    release || somewhatImplemented("public flash.ui.ContextMenu::get clipboardMenu");
    return this._clipboardMenu;
  }
  set clipboardMenu(value: boolean) {
    value = !!value;
    release || somewhatImplemented("public flash.ui.ContextMenu::set clipboardMenu");
    this._clipboardMenu = value;
  }
  get clipboardItems(): ContextMenuClipboardItems {
    release || somewhatImplemented("public flash.ui.ContextMenu::get clipboardItems");
    return this._clipboardItems;
  }
  set clipboardItems(value: ContextMenuClipboardItems) {
    value = value;
    release || somewhatImplemented("public flash.ui.ContextMenu::set clipboardItems");
    this._clipboardItems = value;
  }

  hideBuiltInItems(): void {
    var items = this.builtInItems;
    if (!items) {
      return;
    }
    items.save = false;
    items.zoom = false;
    items.quality = false;
    items.play = false;
    items.loop = false;
    items.rewind = false;
    items.forwardAndBack = false;
    items.print = false;
  }

  clone(): ContextMenu {
    var result: ContextMenu = new ContextMenu();
    result._builtInItems = this._builtInItems.clone();

    this.cloneLinkAndClipboardProperties(result);
    var customItems = this._customItems;
    for (var i = 0; i < customItems.length; i++) {
      result._customItems.push(customItems[i].clone());
    }
    return result;
  }

  cloneLinkAndClipboardProperties(c: ContextMenu): void {
    c = c;
    release || somewhatImplemented("public flash.ui.ContextMenu::cloneLinkAndClipboardProperties"); return;
  }
}