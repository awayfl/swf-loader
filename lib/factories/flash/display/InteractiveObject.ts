import { release, somewhatImplemented } from "../../base/utilities/Debug";
import { Event } from "../events/Event";
import { Rectangle } from "../geom/Rectangle";
import { DisplayObject } from "./DisplayObject";
import { AccessibilityImplementation } from "../accessibility/AccessibilityImplementation";
import { ContextMenu } from "../ui/ContextMenu";

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
// Class: InteractiveObject
export class InteractiveObject extends DisplayObject {
  
  static classInitializer: any = null;

  constructor () {
    super();
    if (!this._fieldsInitialized) {
      this._initializeFields();
    }
  }

  protected _initializeFields() {
    super._initializeFields();
    this._tabEnabled = false;
    this._tabIndex = -1;
    this._focusRect = null;
    this._mouseEnabled = true;
    this._doubleClickEnabled = false;
    this._accessibilityImplementation = null;
    this._softKeyboardInputAreaOfInterest = null;
    this._needsSoftKeyboard = false;
    this._contextMenu = null;
  }
  
  _tabEnabled: boolean;
  _tabIndex: number /*int*/;
  _focusRect: any;
  _mouseEnabled: boolean;
  _doubleClickEnabled: boolean;
  _accessibilityImplementation: AccessibilityImplementation;
  _softKeyboardInputAreaOfInterest: Rectangle;
  _needsSoftKeyboard: boolean;
  _contextMenu: ContextMenu;

  get tabEnabled(): boolean {
    return this._tabEnabled;
  }

  set tabEnabled(enabled: boolean) {
    enabled = !!enabled;
    var old = this._tabEnabled;
    this._tabEnabled = enabled;
    if (old !== enabled) {
      this.dispatchEvent(Event.axClass.getInstance(Event.TAB_ENABLED_CHANGE, true));
    }
  }

  get tabIndex(): number /*int*/ {
    return this._tabIndex;
  }

  set tabIndex(index: number /*int*/) {
    index = index | 0;
    var old = this._tabIndex;
    this._tabIndex = index;
    if (old !== index) {
      this.dispatchEvent(Event.axClass.getInstance(Event.TAB_INDEX_CHANGE, true));
    }
  }

  get focusRect(): any {
    return this._focusRect;
  }

  /**
   * The given |focusRect| can be one of: |true|, |false| or |null|.
   */
  set focusRect(focusRect: any) {
    release || somewhatImplemented("public flash.display.InteractiveObject::set focusRect");
    this._focusRect = focusRect;
  }

  get mouseEnabled(): boolean {
    return this._mouseEnabled;
  }

  set mouseEnabled(enabled: boolean) {
    this._mouseEnabled = !!enabled;
  }

  get doubleClickEnabled(): boolean {
    return this._doubleClickEnabled;
  }

  set doubleClickEnabled(enabled: boolean) {
    this._doubleClickEnabled = !!enabled;
  }

  get accessibilityImplementation(): AccessibilityImplementation {
    return this._accessibilityImplementation;
  }

  set accessibilityImplementation(value: AccessibilityImplementation) {
    release || somewhatImplemented("public flash.display.InteractiveObject::set" +
                        " accessibilityImplementation");
    this._accessibilityImplementation = value;
  }

  get softKeyboardInputAreaOfInterest(): Rectangle {
    return this._softKeyboardInputAreaOfInterest;
  }

  set softKeyboardInputAreaOfInterest(value: Rectangle) {
    release || somewhatImplemented("public flash.display.InteractiveObject::set" +
                        " softKeyboardInputAreaOfInterest");
      this._softKeyboardInputAreaOfInterest = value;
  }

  get needsSoftKeyboard(): boolean {
    return this._needsSoftKeyboard;
  }

  set needsSoftKeyboard(value: boolean) {
    value = !!value;
    release || somewhatImplemented("public flash.display.InteractiveObject::set needsSoftKeyboard");
      this._needsSoftKeyboard = value;
  }

  get contextMenu(): ContextMenu {
    return this._contextMenu;
  }

  set contextMenu(cm: ContextMenu) {
    cm = cm;
    release || somewhatImplemented("public flash.display.InteractiveObject::set contextMenu");
    this._contextMenu = cm;
  }

  requestSoftKeyboard(): boolean {
    release || somewhatImplemented("public flash.display.InteractiveObject::requestSoftKeyboard");
    return false;
  }
}