
import { EventDispatcher } from "../as3webFlash/events/EventDispatcher";
import { DisplayObject } from "../as3webFlash/display/DisplayObject";
import { DisplayObjectContainer } from "../as3webFlash/display/DisplayObjectContainer";
import { InteractiveObject } from "../as3webFlash/display/InteractiveObject";
import { Stage } from "../as3webFlash/display/Stage";
import { Loader } from "../as3webFlash/display/Loader";
import { LoaderInfo } from "../as3webFlash/display/LoaderInfo";
import { MovieClip } from "../as3webFlash/display/MovieClip";
import { Sprite } from "../as3webFlash/display/Sprite";
import { Shape } from "../as3webFlash/display/Shape";
import { Bitmap } from "../as3webFlash/display/Bitmap";
import { BitmapData } from "../as3webFlash/display/BitmapData";
import { SimpleButton } from "../as3webFlash/display/SimpleButton";

import { Scene } from "./display/Scene";

/*
import { URLRequest } from "./net/URLRequest";
import { Graphics } from "./display/Graphics";
import { ApplicationDomain } from "./system/ApplicationDomain";
import { SharedObject } from "./net/SharedObject";
import { URLVariables } from "./net/URLVariables";
import { Capabilities } from "./system/Capabilities";
import { SecurityDomain } from "./system/SecurityDomain";
import { Symbol } from "./symbol";
import { Timer } from "./utils/Timer";
import { XMLDocument, XMLNode } from "../avm2/natives/xml-document";
import { ByteArray, ObjectEncoding } from "../avm2/natives/byteArray";
import { AccessibilityProperties } from "./accessibility/AccessibilityProperties";
import { Accessibility } from "./accessibility/Accessibility";
import { LoaderContext } from "./system/LoaderContext";
import { JPEGLoaderContext } from "./system/JPEGLoaderContext";
import { System } from "../avm2/natives/system";
import { AVM1Movie } from "./display/AVM1Movie";
import { MorphShape } from "./display/MorphShape";
import { NativeMenu } from "./display/NativeMenu";
import { NativeMenuItem } from "./display/NativeMenuItem";
import { FrameLabel } from "./display/FrameLabel";
import { GradientType } from "./display/GradientType";
import { SpreadMethod } from "./display/SpreadMethod";
import { InterpolationMethod } from "./display/InterpolationMethod";
import { LineScaleMode } from "./display/LineScaleMode";
import { CapsStyle } from "./display/CapsStyle";
import { JointStyle } from "./display/JointStyle";
import { BevelFilter } from "./filters/BevelFilter";
import { BitmapFilter } from "./filters/BitmapFilter";
import { BlurFilter } from "./filters/BlurFilter";
import { ColorMatrixFilter } from "./filters/ColorMatrixFilter";
import { ConvolutionFilter } from "./filters/ConvolutionFilter";
import { DisplacementMapFilter } from "./filters/DisplacementMapFilter";
import { DropShadowFilter } from "./filters/DropShadowFilter";
import { GlowFilter } from "./filters/GlowFilter";
import { GradientBevelFilter } from "./filters/GradientBevelFilter";
import { GradientGlowFilter } from "./filters/GradientGlowFilter";
import { Point } from "./geom/Point";
import { Rectangle } from "./geom/Rectangle";
import { Matrix } from "./geom/Matrix";
import { Matrix3D } from "./geom/Matrix3D";
import { Vector3D } from "./geom/Vector3D";
import { Transform } from "./geom/Transform";
import { ColorTransform } from "./geom/ColorTransform";
import { PerspectiveProjection } from "./geom/PerspectiveProjection";
import { Event } from "./events/Event";
import { ErrorEvent } from "./events/ErrorEvent";
import { IOErrorEvent } from "./events/IOErrorEvent";
import { KeyboardEvent } from "./events/KeyboardEvent";
import { MouseEvent } from "./events/MouseEvent";
import { TextEvent } from "./events/TextEvent";
import { TimerEvent } from "./events/TimerEvent";
import { ProgressEvent } from "./events/ProgressEvent";
import { HTTPStatusEvent } from "./events/HTTPStatusEvent";
import { UncaughtErrorEvents } from "./events/UncaughtErrorEvents";
import { ExternalInterface } from "./external/ExternalInterface";
import { ContextMenu } from "./ui/ContextMenu";
import { ContextMenuItem } from "./ui/ContextMenuItem";
import { ContextMenuBuiltInItems } from "./ui/ContextMenuBuiltInItems";
import { ContextMenuClipboardItems } from "./ui/ContextMenuClipboardItems";
import { Keyboard } from "./ui/Keyboard";
import { Mouse } from "./ui/Mouse";
import { MouseCursorData } from "./ui/MouseCursorData";
import { GameInput } from "./ui/GameInput";
import { GameInputControl } from "./ui/GameInputControl";
import { GameInputControlType } from "./ui/GameInputControlType";
import { GameInputDevice } from "./ui/GameInputDevice";
import { GameInputFinger } from "./ui/GameInputFinger";
import { GameInputHand } from "./ui/GameInputHand";
import { Font } from "./text/Font";
import { TextField } from "./text/TextField";
import { StaticText } from "./text/StaticText";
import { StyleSheet } from "./text/StyleSheet";
import { TextFormat } from "./text/TextFormat";
import { TextRun } from "./text/TextRun";
import { TextSnapshot } from "./text/TextSnapshot";
import { TextLineMetrics } from "./text/TextLineMetrics";
import { Sound } from "./media/Sound";
import { SoundChannel } from "./media/SoundChannel";
import { SoundMixer } from "./media/SoundMixer";
import { SoundTransform } from "./media/SoundTransform";
import { StageVideo } from "./media/StageVideo";
import { Video } from "./media/Video";
import { TouchEvent } from "./events/TouchEvent";
import { MultitouchInputMode } from "./ui/MultitouchInputMode";
import { Multitouch } from "./ui/Multitouch";
import { GameInputEvent } from "./events/GameInputEvent";
import { AsyncErrorEvent } from "./events/AsyncErrorEvent";
import { NetStatusEvent } from "./events/NetStatusEvent";
import { StatusEvent } from "./events/StatusEvent";
import { GestureEvent } from "./events/GestureEvent";
import { ID3Info } from "./media/ID3Info";
import { Microphone } from "./media/Microphone";
import { Camera } from "./media/Camera";
import { FileFilter } from "./net/FileFilter";
import { FileReference } from "./net/FileReference";
import { NetConnection } from "./net/NetConnection";
import { NetStream } from "./net/NetStream";
import { NetStreamInfo } from "./net/NetStreamInfo";
import { Responder } from "./net/Responder";
import { URLRequestHeader } from "./net/URLRequestHeader";
import { URLStream } from "./net/URLStream";
import { FileReferenceList } from "./net/FileReferenceList";
import { URLLoader } from "./net/URLLoader";
import { LocalConnection } from "./net/LocalConnection";
import { Socket } from "./net/Socket";
import { Security } from "./system/Security";
*/
import { fscommand } from "./system/FSCommand";
import { release, assert } from "../base/utilities/Debug";
import { ASClass } from '../avm2/nat/ASClass';
import { registerNativeClass, registerNativeFunction } from '../avm2/nat/initializeBuiltins';
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

function M(name: string, asClass: ASClass) {
  registerNativeClass(name, asClass);
}
M("flash.events.EventDispatcher", EventDispatcher);
M("flash.display.DisplayObject", DisplayObject);
M("flash.display.InteractiveObject", InteractiveObject);
M("flash.display.DisplayObjectContainer", DisplayObjectContainer);
M("flash.display.Sprite", Sprite);
M("flash.display.MovieClip", MovieClip);
M("flash.display.Shape", Shape);
M("flash.display.Bitmap", Bitmap);
M("flash.display.BitmapData", BitmapData);
M("flash.display.Stage", Stage);
M("flash.display.Loader", Loader);
M("flash.display.LoaderInfo", LoaderInfo);
//M("flash.display.Graphics", Graphics);
M("flash.display.SimpleButton", SimpleButton);
M("flash.display.Scene", Scene);
/*M("flash.display.MorphShape", MorphShape);
M("flash.display.NativeMenu", NativeMenu);
M("flash.display.NativeMenuItem", NativeMenuItem);
M("flash.display.FrameLabel", FrameLabel);
M("flash.display.AVM1Movie", AVM1Movie);

M("flash.display.GradientType", GradientType);
M("flash.display.SpreadMethod", SpreadMethod);
M("flash.display.InterpolationMethod", InterpolationMethod);
M("flash.display.LineScaleMode", LineScaleMode);
M("flash.display.CapsStyle", CapsStyle);
M("flash.display.JointStyle", JointStyle);

M("flash.filters.BevelFilter", BevelFilter);
M("flash.filters.BitmapFilter", BitmapFilter);
M("flash.filters.BlurFilter", BlurFilter);
M("flash.filters.ColorMatrixFilter", ColorMatrixFilter);
M("flash.filters.ConvolutionFilter", ConvolutionFilter);
M("flash.filters.DisplacementMapFilter", DisplacementMapFilter);
M("flash.filters.DropShadowFilter", DropShadowFilter);
M("flash.filters.GlowFilter", GlowFilter);
M("flash.filters.GradientBevelFilter", GradientBevelFilter);
M("flash.filters.GradientGlowFilter", GradientGlowFilter);

M("flash.geom.Point", Point);
M("flash.geom.Rectangle", Rectangle);
M("flash.geom.Matrix", Matrix);
M("flash.geom.Matrix3D", Matrix3D);
M("flash.geom.Vector3D", Vector3D);
M("flash.geom.Transform", Transform);
M("flash.geom.ColorTransform", ColorTransform);
M("flash.geom.PerspectiveProjection", PerspectiveProjection);

M("flash.events.Event", Event);
M("flash.events.ErrorEvent", ErrorEvent);
M("flash.events.IOErrorEvent", IOErrorEvent);
M("flash.events.KeyboardEvent", KeyboardEvent);
M("flash.events.MouseEvent", MouseEvent);
M("flash.events.GestureEvent", GestureEvent);
M("flash.events.TextEvent", TextEvent);
M("flash.events.TimerEvent", TimerEvent);
M("flash.events.ProgressEvent", ProgressEvent);
M("flash.events.StatusEvent", StatusEvent);
M("flash.events.NetStatusEvent", NetStatusEvent);
M("flash.events.HTTPStatusEvent", HTTPStatusEvent);
M("flash.events.AsyncErrorEvent", AsyncErrorEvent);
M("flash.events.UncaughtErrorEvents", UncaughtErrorEvents);

M("flash.external.ExternalInterface", ExternalInterface);

M("flash.ui.ContextMenu", ContextMenu);
M("flash.ui.ContextMenuItem", ContextMenuItem);
M("flash.ui.ContextMenuBuiltInItems", ContextMenuBuiltInItems);
M("flash.ui.ContextMenuClipboardItems", ContextMenuClipboardItems);
M("flash.ui.Keyboard", Keyboard);
M("flash.ui.Mouse", Mouse);
M("flash.ui.MouseCursorData", MouseCursorData);

M("flash.ui.GameInput", GameInput);
M("flash.events.GameInputEvent", GameInputEvent);
M("flash.ui.GameInputControl", GameInputControl);
M("flash.ui.GameInputControlType", GameInputControlType);
M("flash.ui.GameInputDevice", GameInputDevice);
M("flash.ui.GameInputFinger", GameInputFinger);
M("flash.ui.GameInputHand", GameInputHand);
M("flash.ui.Multitouch", Multitouch);
M("flash.ui.MultitouchInputMode", MultitouchInputMode);
M("flash.events.TouchEvent", TouchEvent);

M("flash.text.Font", Font);
M("flash.text.TextField", TextField);
M("flash.text.StaticText", StaticText);
M("flash.text.StyleSheet", StyleSheet);
M("flash.text.TextFormat", TextFormat);
M("flash.text.TextRun", TextRun);
M("flash.text.TextSnapshot", TextSnapshot);
M("flash.text.TextLineMetrics", TextLineMetrics);

M("flash.media.Sound", Sound);
M("flash.media.SoundChannel", SoundChannel);
M("flash.media.SoundMixer", SoundMixer);
M("flash.media.SoundTransform", SoundTransform);
M("flash.media.Video", Video);
M("flash.media.StageVideo", StageVideo);
M("flash.media.ID3Info", ID3Info);
M("flash.media.Microphone", Microphone);
M("flash.media.Camera", Camera);

M("flash.net.FileFilter", FileFilter);
M("flash.net.FileReference", FileReference);
M("flash.net.FileReferenceList", FileReferenceList);
M("flash.net.NetConnection", NetConnection);
M("flash.net.NetStream", NetStream);
M("flash.net.NetStreamInfo", NetStreamInfo);
M("flash.net.Responder", Responder);
M("flash.net.URLRequest", URLRequest);
M("flash.net.URLRequestHeader", URLRequestHeader);
M("flash.net.URLStream", URLStream);
M("flash.net.URLLoader", URLLoader);
M("flash.net.SharedObject", SharedObject);
M("flash.net.ObjectEncoding", ObjectEncoding);
M("flash.net.LocalConnection", LocalConnection);
M("flash.net.Socket", Socket);
M("flash.net.URLVariables", URLVariables);

M("flash.system.Capabilities", Capabilities);
M("flash.system.Security", Security);
M("flash.system.System", System);
M("flash.system.SecurityDomain", SecurityDomain);
M("flash.system.ApplicationDomain", ApplicationDomain);
M("flash.system.JPEGLoaderContext", JPEGLoaderContext);
M("flash.system.LoaderContext", LoaderContext);

M("flash.accessibility.Accessibility", Accessibility);
M("flash.accessibility.AccessibilityProperties", AccessibilityProperties);

M("flash.utils.Timer", Timer);
M("flash.utils.ByteArray", ByteArray);

M("flash.xml.XMLNode", XMLNode);
M("flash.xml.XMLDocument", XMLDocument);*/

registerNativeFunction('flash.system.fscommand', fscommand);

export function initLink(){
  console.log("init link");
}
