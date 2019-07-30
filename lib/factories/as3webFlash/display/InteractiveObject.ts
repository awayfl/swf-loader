
import {Rectangle, EventBase} from "@awayjs/core";
import {DisplayObject} from "./DisplayObject";
import {DisplayObject as AwayDisplayObject, MouseEvent as MouseEventAway} from "@awayjs/scene";
import {MouseEvent} from "../events/MouseEvent";
import {KeyboardEvent} from "../events/KeyboardEvent";

import {IEventMapper} from "../events/IEventMapper"
export class InteractiveObject extends DisplayObject{

	/** these should be able to get setup:
	 

	 // listen on key directly
	 
	 * Dispatched when the user releases a key.
	 * @eventType	flash.events.KeyboardEvent.KEY_UP
	 [Event(name="keyUp", type="flash.events.KeyboardEvent")]
	 
	 * Dispatched when the user presses a key.
	 * @eventType	flash.events.KeyboardEvent.KEY_DOWN
	 [Event(name="keyDown", type="flash.events.KeyboardEvent")]
	 
	 // listen on awayjs adapter and translate
	 
	 * Dispatched when a user releases the pointing device button over an
	 * InteractiveObject instance.
	 * @eventType	flash.events.MouseEvent.RIGHT_MOUSE_UP
	 [Event(name="rightMouseUp", type="flash.events.MouseEvent")]
	 
	 * Dispatched when a user presses the pointing device button over an InteractiveObject instance.
	 * @eventType	flash.events.MouseEvent.RIGHT_MOUSE_DOWN
	 [Event(name="rightMouseDown", type="flash.events.MouseEvent")]
	 
	 * Dispatched when a user presses and releases the right button of the user's
	 * pointing device over the same InteractiveObject.
	 * @eventType	flash.events.MouseEvent.RIGHT_CLICK
	 [Event(name="rightClick", type="flash.events.MouseEvent")]
	 
	 * Dispatched when a user releases the pointing device button over an
	 * InteractiveObject instance.
	 * @eventType	flash.events.MouseEvent.MIDDLE_MOUSE_UP
	 [Event(name="middleMouseUp", type="flash.events.MouseEvent")]
	 
	 * Dispatched when a user presses the middle pointing device button over an InteractiveObject instance.
	 * @eventType	flash.events.MouseEvent.MIDDLE_MOUSE_DOWN
	 [Event(name="middleMouseDown", type="flash.events.MouseEvent")]
	 
	 * Dispatched when a user presses and releases the middle button of the user's
	 * pointing device over the same InteractiveObject.
	 * @eventType	flash.events.MouseEvent.MIDDLE_CLICK
	 [Event(name="middleClick", type="flash.events.MouseEvent")]
	 
	 
	 * Dispatched when the user moves a pointing device over an InteractiveObject instance.
	 * @eventType	flash.events.MouseEvent.ROLL_OVER
	 [Event(name="rollOver", type="flash.events.MouseEvent")]
	 
	 * Dispatched when the user moves a pointing device away from an InteractiveObject
	 * instance.
	 * @eventType	flash.events.MouseEvent.ROLL_OUT
	 [Event(name="rollOut", type="flash.events.MouseEvent")]
	 
	 * Dispatched when a mouse wheel is spun over an InteractiveObject instance.
	 * @eventType	flash.events.MouseEvent.MOUSE_WHEEL
	 [Event(name="mouseWheel", type="flash.events.MouseEvent")]
	 
	 * Dispatched when a user releases the pointing device button over an
	 * InteractiveObject instance.
	 * @eventType	flash.events.MouseEvent.MOUSE_UP
	 [Event(name="mouseUp", type="flash.events.MouseEvent")]
	 
	 * Dispatched when the user moves a pointing device over an InteractiveObject instance.
	 * @eventType	flash.events.MouseEvent.MOUSE_OVER
	 [Event(name="mouseOver", type="flash.events.MouseEvent")]
	 
	 * Dispatched when the user moves a pointing device away from an InteractiveObject instance.
	 * @eventType	flash.events.MouseEvent.MOUSE_OUT
	 [Event(name="mouseOut", type="flash.events.MouseEvent")]
	 
	 * Dispatched when a user moves the pointing device while it is over an InteractiveObject.
	 * @eventType	flash.events.MouseEvent.MOUSE_MOVE
	 [Event(name="mouseMove", type="flash.events.MouseEvent")]
	 
	 * Dispatched when a user presses the pointing device button over an InteractiveObject instance.
	 * @eventType	flash.events.MouseEvent.MOUSE_DOWN
	 [Event(name="mouseDown", type="flash.events.MouseEvent")]
	 
	 * Dispatched when a user presses and releases the main button of a pointing device twice in
	 * rapid succession over the same InteractiveObject when that object's
	 * doubleClickEnabled flag is set to true.
	 * @eventType	flash.events.MouseEvent.DOUBLE_CLICK
	 [Event(name="doubleClick", type="flash.events.MouseEvent")]
	 
	 * Dispatched when a user presses and releases the main button of the user's
	 * pointing device over the same InteractiveObject.
	 * @eventType	flash.events.MouseEvent.CLICK
	 [Event(name="click", type="flash.events.MouseEvent")]

	 */
	 /**
	 * Dispatched immediately after the soft keyboard is lowered.
	 * @eventType	flash.events.SoftKeyboardEvent.SOFT_KEYBOARD_DEACTIVATE
	 [Event(name="softKeyboardDeactivate", type="flash.events.SoftKeyboardEvent")]

	 * Dispatched immediately after the soft keyboard is raised.
	 * @eventType	flash.events.SoftKeyboardEvent.SOFT_KEYBOARD_ACTIVATE
	 [Event(name="softKeyboardActivate", type="flash.events.SoftKeyboardEvent")]

	 * Dispatched immediately before the soft keyboard is raised.
	 * @eventType	flash.events.SoftKeyboardEvent.SOFT_KEYBOARD_ACTIVATING
	 [Event(name="softKeyboardActivating", type="flash.events.SoftKeyboardEvent")]

	 * Dispatched when a user enters one or more
	 * characters of text.
	 * @eventType	flash.events.TextEvent.TEXT_INPUT
	 [Event(name="textInput", type="flash.events.TextEvent")]
	 /// This event is dispatched to any client app that supports inline input with an IME
	 [Event(name="imeStartComposition", type="flash.events.IMEEvent")]

	 * Dispatched when a user gesture triggers the context menu associated with this interactive
	 * object in an AIR application.
	 * @eventType	flash.events.MouseEvent.CONTEXT_MENU
	 [Event(name="contextMenu", type="flash.events.MouseEvent")]

	 * Dispatched by the drag initiator InteractiveObject when the user releases the drag gesture.
	 * @eventType	flash.events.NativeDragEvent.NATIVE_DRAG_COMPLETE
	 [Event(name="nativeDragComplete", type="flash.events.NativeDragEvent")]

	 * Dispatched during a drag operation by the InteractiveObject that is
	 * specified as the drag initiator in the DragManager.doDrag() call.
	 * @eventType	flash.events.NativeDragEvent.NATIVE_DRAG_UPDATE
	 [Event(name="nativeDragUpdate", type="flash.events.NativeDragEvent")]

	 * Dispatched at the beginning of a drag operation by the InteractiveObject that is
	 * specified as the drag initiator in the DragManager.doDrag() call.
	 * @eventType	flash.events.NativeDragEvent.NATIVE_DRAG_START
	 [Event(name="nativeDragStart", type="flash.events.NativeDragEvent")]

	 * Dispatched by an InteractiveObject when a drag gesture leaves its boundary.
	 * @eventType	flash.events.NativeDragEvent.NATIVE_DRAG_EXIT
	 [Event(name="nativeDragExit", type="flash.events.NativeDragEvent")]

	 * Dispatched by the target InteractiveObject when a dragged object is
	 * dropped on it and the drop has been accepted with a call to
	 * DragManager.acceptDragDrop().
	 * @eventType	flash.events.NativeDragEvent.NATIVE_DRAG_DROP
	 [Event(name="nativeDragDrop", type="flash.events.NativeDragEvent")]

	 * Dispatched by an InteractiveObject continually while a drag gesture remains within its
	 * boundary.
	 * @eventType	flash.events.NativeDragEvent.NATIVE_DRAG_OVER
	 [Event(name="nativeDragOver", type="flash.events.NativeDragEvent")]

	 * Dispatched by an InteractiveObject when a drag gesture enters its boundary.
	 * @eventType	flash.events.NativeDragEvent.NATIVE_DRAG_ENTER

	 * Dispatched when the value of the object's tabIndex property changes.
	 * @eventType	flash.events.Event.TAB_INDEX_CHANGE
	 [Event(name="tabIndexChange", type="flash.events.Event")]

	 * Dispatched when the object's tabEnabled flag changes.
	 * @eventType	flash.events.Event.TAB_ENABLED_CHANGE
	 [Event(name="tabEnabledChange", type="flash.events.Event")]

	 * Dispatched when the value of the object's tabChildren flag changes.
	 * @eventType	flash.events.Event.TAB_CHILDREN_CHANGE
	 [Event(name="tabChildrenChange", type="flash.events.Event")]

	 * Dispatched when the user performs a swipe gesture at a point of contact with an InteractiveObject instance (such as touching three
	 * fingers to a screen and then moving them in parallel over a display object on a mobile phone or tablet with a touch screen).
	 * @eventType	flash.events.TransformGestureEvent.GESTURE_SWIPE
	 [Event(name="gestureSwipe", type="flash.events.TransformGestureEvent")]

	 * Dispatched when the user performs a zoom gesture at a point of contact with an InteractiveObject instance (such as touching two
	 * fingers to a screen and then quickly spreading the fingers apart over a display object on a mobile phone or tablet with a touch screen).
	 * @eventType	flash.events.TransformGestureEvent.GESTURE_ZOOM
	 [Event(name="gestureZoom", type="flash.events.TransformGestureEvent")]

	 * Dispatched when the user performs a rotation gesture at a point of contact with an InteractiveObject instance (such as touching two fingers
	 * and rotating them over a display object on a mobile phone or tablet with a touch screen).
	 * @eventType	flash.events.TransformGestureEvent.GESTURE_ROTATE
	 [Event(name="gestureRotate", type="flash.events.TransformGestureEvent")]

	 * Dispatched when the user creates a point of contact with an InteractiveObject instance, then taps
	 * on a touch-enabled device (such as placing several fingers over a display object to open a menu and then taps one finger to select a menu item
	 * on a mobile phone or tablet with a touch screen).
	 * @eventType	flash.events.PressAndTapGestureEvent.GESTURE_PRESS_AND_TAP
	 [Event(name="gesturePressAndTap", type="flash.events.PressAndTapGestureEvent")]

	 * Dispatched when the user moves a point of contact over the InteractiveObject instance
	 * on a touch-enabled device (such as moving a finger from left to right over a display object
	 * on a mobile phone or tablet with a touch screen).
	 * @eventType	flash.events.TransformGestureEvent.GESTURE_PAN
	 [Event(name="gesturePan", type="flash.events.TransformGestureEvent")]

	 * Dispatched when the user presses two points of contact over the same InteractiveObject instance
	 * on a touch-enabled device (such as presses and releases two fingers over a display object
	 * on a mobile phone or tablet with a touch screen).
	 * @eventType	flash.events.GestureEvent.GESTURE_TWO_FINGER_TAP
	 [Event(name="gestureTwoFingerTap", type="flash.events.GestureEvent")]

	 * Dispatched when the user lifts the point of contact over the same InteractiveObject instance on which the contact was initiated
	 * on a touch-enabled device (such as presses and releases a finger from a single point over a display object
	 * on a mobile phone or tablet with a touch screen).
	 * @eventType	flash.events.TouchEvent.TOUCH_TAP
	 [Event(name="touchTap", type="flash.events.TouchEvent")]

	 * Dispatched when the user moves the point of contact over an InteractiveObject instance on a touch-enabled device
	 * (such as drags a finger from a point outside a display object to a point over a display object on a mobile phone or tablet with a touch screen).
	 * @eventType	flash.events.TouchEvent.TOUCH_ROLL_OVER
	 [Event(name="touchRollOver", type="flash.events.TouchEvent")]

	 * Dispatched when the user moves the point of contact away from an InteractiveObject instance on a touch-enabled device
	 * (such as drags a finger from over a display object to a point outside the display object on a mobile phone or tablet with a touch screen).
	 * @eventType	flash.events.TouchEvent.TOUCH_ROLL_OUT
	 [Event(name="touchRollOut", type="flash.events.TouchEvent")]

	 * Dispatched when the user moves the point of contact over an InteractiveObject instance on a touch-enabled device
	 * (such as drags a finger from a point outside a display object to a point over a display object on a mobile phone or tablet with a touch screen).
	 * @eventType	flash.events.TouchEvent.TOUCH_OVER
	 [Event(name="touchOver", type="flash.events.TouchEvent")]

	 * Dispatched when the user moves the point of contact away from InteractiveObject instance on a touch-enabled device
	 * (such as drags a finger from one display object to another on a mobile phone or tablet with a touch screen).
	 * @eventType	flash.events.TouchEvent.TOUCH_OUT
	 [Event(name="touchOut", type="flash.events.TouchEvent")]

	 * Dispatched when the user moves the point of contact with a touch-enabled device (such as drags a finger across a mobile phone or tablet with a touch screen).
	 * @eventType	flash.events.TouchEvent.TOUCH_MOVE
	 [Event(name="touchMove", type="flash.events.TouchEvent")]

	 * Dispatched when the user removes contact with a touch-enabled device (such as lifts a finger off a mobile phone or tablet with a touch screen).
	 * @eventType	flash.events.TouchEvent.TOUCH_END
	 [Event(name="touchEnd", type="flash.events.TouchEvent")]

	 * Dispatched when the user first contacts a touch-enabled device (such as touches a finger to a mobile phone or tablet with a touch screen).
	 * @eventType	flash.events.TouchEvent.TOUCH_BEGIN
	 [Event(name="touchBegin", type="flash.events.TouchEvent")]

	 * Dispatched when the user attempts to change focus by using a pointer device.
	 * @eventType	flash.events.FocusEvent.MOUSE_FOCUS_CHANGE
	 [Event(name="mouseFocusChange", type="flash.events.FocusEvent")]

	 * Dispatched when the user attempts to change focus by using keyboard navigation.
	 * @eventType	flash.events.FocusEvent.KEY_FOCUS_CHANGE
	 *
	 * Dispatched after a display object loses focus.
	 * @eventType	flash.events.FocusEvent.FOCUS_OUT
	 [Event(name="focusOut", type="flash.events.FocusEvent")]

	 * Dispatched after a display object gains focus.
	 * @eventType	flash.events.FocusEvent.FOCUS_IN
	 [Event(name="focusIn", type="flash.events.FocusEvent")]

	 * Dispatched when the user activates the platform-specific accelerator key combination for a select all operation
	 * or selects 'Select All' from the text context menu.
	 * @eventType	flash.events.Event.SELECT_ALL
	 [Event(name="selectAll", type="flash.events.Event")]

	 * Dispatched when the user activates the platform-specific accelerator key combination for a paste operation
	 * or selects 'Paste' from the text context menu.
	 * @eventType	flash.events.Event.PASTE
	 [Event(name="paste", type="flash.events.Event")]

	 * Dispatched when the user activates the platform-specific accelerator key combination for a cut operation
	 * or selects 'Cut' from the text context menu.
	 * @eventType	flash.events.Event.CUT
	 [Event(name="cut", type="flash.events.Event")]

	 * Dispatched when the user activates the platform-specific accelerator key combination for a copy operation
	 * or selects 'Copy' from the text context menu.
	 * @eventType	flash.events.Event.COPY
	 [Event(name="copy", type="flash.events.Event")]

	 * Dispatched when the user selects 'Clear' (or 'Delete') from the text context menu.
	 * @eventType	flash.events.Event.CLEAR
	 [Event(name="clear", type="flash.events.Event")]
	 */

	 /**

	* The InteractiveObject class is the abstract base class for all display objects with which the user can
	 * interact, using the mouse, keyboard, or other user input device.
	 *
	 *   <p class="- topic/p ">You cannot instantiate the InteractiveObject class directly. A call to the <codeph class="+ topic/ph pr-d/codeph ">new
	 * InteractiveObject()</codeph> constructor throws an <codeph class="+ topic/ph pr-d/codeph ">ArgumentError</codeph> exception.</p><p class="- topic/p ">The InteractiveObject class itself does not include any APIs for rendering content onscreen.
	 * To create a custom subclass of the InteractiveObject class,
	 * extend one of the subclasses that do have APIs for rendering content onscreen,
	 * such as the Sprite, SimpleButton, TextField, or MovieClip classes.</p>
	 *
	 *   EXAMPLE:
	 *
	 *   The following example uses the <codeph class="+ topic/ph pr-d/codeph ">InteractiveObjectExample</codeph> class, which in
	 * turn uses the <codeph class="+ topic/ph pr-d/codeph ">ChildSprite</codeph> class to draw a rectangle and then manipulate that rectangle
	 * based on various mouse events.  This task is accomplished by performing the following steps:
	 * <ol class="- topic/ol "><li class="- topic/li ">In the <codeph class="+ topic/ph pr-d/codeph ">InteractiveObjectExample</codeph> constructor, a new ChildSprite object of type Sprite
	 * called <codeph class="+ topic/ph pr-d/codeph ">child</codeph> is created, which calls the ChildSprite constructor method to draw the shape
	 * and add mouse events for the shape (as explained in the following steps).  The <codeph class="+ topic/ph pr-d/codeph ">child</codeph>
	 * object is added to the top of the display list at coordinates <i class="+ topic/ph hi-d/i ">x = 0, y = 0</i>.  </li><li class="- topic/li ">In the <codeph class="+ topic/ph pr-d/codeph ">ChildSprite</codeph> class, declare the <codeph class="+ topic/ph pr-d/codeph ">size</codeph> and
	 * <codeph class="+ topic/ph pr-d/codeph ">overSize</codeph> properties that are used later in the <codeph class="+ topic/ph pr-d/codeph ">draw()</codeph> method and
	 * MouseEvent methods.</li><li class="- topic/li ">Declare properties that set the background color to orange, the mouse-over color to
	 * dark yellow, and the mouse-down color to light blue.</li><li class="- topic/li ">In the <codeph class="+ topic/ph pr-d/codeph ">ChildSprite</codeph> constructor, an orange square is drawn by using methods from
	 * the Graphics class and the <codeph class="+ topic/ph pr-d/codeph ">draw()</codeph> method.</li><li class="- topic/li ">The constructor adds four MouseEvent event listener methods:
	 *
	 *   <ul class="- topic/ul "><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">mouseOverHandler</codeph>: redraws a larger 60 x 60 pixel square with a dark-yellow color
	 * at the original coordinates.</li><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">mouseOutHandler</codeph>: returns the square to its original size and color.</li><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">mouseDownHandler</codeph>: redraws a larger 60 x 60 pixel square with a light-blue color
	 * at the original coordinates.</li><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">mouseUpHandler</codeph>: same as <codeph class="+ topic/ph pr-d/codeph ">mouseOverHandler</codeph>.</li></ul></li></ol><codeblock xml:space="preserve" class="+ topic/pre pr-d/codeblock ">
	 *
	 * Calling the new InteractiveObject() constructor
	 * throws an ArgumentError exception.
	 * You can, however, call constructors for the following subclasses of InteractiveObject:
	 *
	 *   new SimpleButton()new TextField()new Loader()new Sprite()new MovieClip()
	 */
	constructor(adaptee:AwayDisplayObject = null){
		super(adaptee);


		 // these events can not be mapped from awayjs: //todo (?)
		 this.eventMappingDummys[MouseEvent.RIGHT_MOUSE_UP]="InteractiveObject:MouseEvent.RIGHT_MOUSE_UP";
		 this.eventMappingDummys[MouseEvent.RIGHT_MOUSE_DOWN]="InteractiveObject:MouseEvent.RIGHT_MOUSE_DOWN";
		 this.eventMappingDummys[MouseEvent.RIGHT_MOUSE_DOWN]="InteractiveObject:MouseEvent.RIGHT_MOUSE_DOWN";
		 this.eventMappingDummys[MouseEvent.RIGHT_CLICK]="InteractiveObject:MouseEvent.RIGHT_CLICK";
		 this.eventMappingDummys[MouseEvent.MIDDLE_MOUSE_UP]="InteractiveObject:MouseEvent.MIDDLE_MOUSE_UP";
		 this.eventMappingDummys[MouseEvent.MIDDLE_MOUSE_DOWN]="InteractiveObject:MouseEvent.MIDDLE_MOUSE_DOWN";
		 this.eventMappingDummys[MouseEvent.MIDDLE_CLICK]="InteractiveObject:MouseEvent.MIDDLE_CLICK";


		 /*
		 //todo
		 this.eventMappingDummys[SoftKeyboardEvent.SOFT_KEYBOARD_DEACTIVATE]="SoftKeyboardEvent.SOFT_KEYBOARD_DEACTIVATE";
		 this.eventMappingDummys[SoftKeyboardEvent.SOFT_KEYBOARD_ACTIVATE]="SoftKeyboardEvent.SOFT_KEYBOARD_ACTIVATE";
		 this.eventMappingDummys[SoftKeyboardEvent.SOFT_KEYBOARD_ACTIVATING]="SoftKeyboardEvent.SOFT_KEYBOARD_ACTIVATING";
		 this.eventMappingDummys[TextEvent.TEXT_INPUT]="TextEvent.TEXT_INPUT";
		 this.eventMappingDummys[MouseEvent.CONTEXT_MENU]="MouseEvent.CONTEXT_MENU";
		 this.eventMappingDummys[NativeDragEvent.NATIVE_DRAG_COMPLETE]="NativeDragEvent.NATIVE_DRAG_COMPLETE";
		 this.eventMappingDummys[NativeDragEvent.NATIVE_DRAG_UPDATE]="NativeDragEvent.NATIVE_DRAG_UPDATE";
		 this.eventMappingDummys[NativeDragEvent.NATIVE_DRAG_START]="NativeDragEvent.NATIVE_DRAG_START";
		 this.eventMappingDummys[NativeDragEvent.NATIVE_DRAG_EXIT]="NativeDragEvent.NATIVE_DRAG_EXIT";
		 this.eventMappingDummys[NativeDragEvent.NATIVE_DRAG_DROP]="NativeDragEvent.NATIVE_DRAG_DROP";
		 this.eventMappingDummys[NativeDragEvent.NATIVE_DRAG_OVER]="NativeDragEvent.NATIVE_DRAG_OVER";
		 this.eventMappingDummys[NativeDragEvent.NATIVE_DRAG_ENTER]="NativeDragEvent.NATIVE_DRAG_ENTER";
		 this.eventMappingDummys[Event.TAB_INDEX_CHANGE]="Event.TAB_INDEX_CHANGE";
		 this.eventMappingDummys[Event.TAB_ENABLED_CHANGE]="Event.TAB_ENABLED_CHANGE";
		 this.eventMappingDummys[Event.TAB_CHILDREN_CHANGE]="Event.TAB_CHILDREN_CHANGE";
		 this.eventMappingDummys[TransformGestureEvent.GESTURE_SWIPE]="TransformGestureEvent.GESTURE_SWIPE";
		 this.eventMappingDummys[TransformGestureEvent.GESTURE_ROTATE]="TransformGestureEvent.GESTURE_ROTATE";
		 this.eventMappingDummys[TransformGestureEvent.GESTURE_PRESS_AND_TAP]="TransformGestureEvent.GESTURE_PRESS_AND_TAP";
		 this.eventMappingDummys[GestureEvent.GESTURE_PAN]="GestureEvent.GESTURE_PAN";
		 this.eventMappingDummys[GestureEvent.GESTURE_TWO_FINGER_TAP]="GestureEvent.GESTURE_TWO_FINGER_TAP";
		 this.eventMappingDummys[TouchEvent.TOUCH_TAP]="TouchEvent.TOUCH_TAP";
		 this.eventMappingDummys[TouchEvent.TOUCH_ROLL_OVER]="TouchEvent.TOUCH_ROLL_OVER";
		 this.eventMappingDummys[TouchEvent.TOUCH_ROLL_OUT]="TouchEvent.TOUCH_ROLL_OUT";
		 this.eventMappingDummys[TouchEvent.TOUCH_OVER]="TouchEvent.TOUCH_OVER";
		 this.eventMappingDummys[TouchEvent.TOUCH_OUT]="TouchEvent.TOUCH_OUT";
		 this.eventMappingDummys[TouchEvent.TOUCH_MOVE]="TouchEvent.TOUCH_MOVE";
		 this.eventMappingDummys[TouchEvent.TOUCH_END]="TouchEvent.TOUCH_END";
		 this.eventMappingDummys[TouchEvent.TOUCH_BEGIN]="TouchEvent.TOUCH_BEGIN";
		 this.eventMappingDummys[FocusEvent.MOUSE_FOCUS_CHANGE]="FocusEvent.MOUSE_FOCUS_CHANGE";
		 this.eventMappingDummys[FocusEvent.KEY_FOCUS_CHANGE]="FocusEvent.KEY_FOCUS_CHANGE";
		 this.eventMappingDummys[FocusEvent.FOCUS_OUT]="FocusEvent.FOCUS_OUT";
		 this.eventMappingDummys[FocusEvent.FOCUS_IN]="FocusEvent.FOCUS_IN";
		 this.eventMappingDummys[Event.SELECT_ALL]="Event.SELECT_ALL";
		 this.eventMappingDummys[Event.PASTE]="Event.PASTE";
		 this.eventMappingDummys[Event.CUT]="Event.CUT";
		 this.eventMappingDummys[Event.COPY]="Event.COPY";
		 this.eventMappingDummys[Event.CLEAR]="Event.CLEAR";
		  */



		 
		 // KeyboardEvent events adapt to js-events. they listen on document.onKeyUp / onKeyDown:

		 this._keyUpCallbackDelegate = (event:any) => this.keyUpCallback(event);
		 this.eventMapping[KeyboardEvent.KEY_UP]=(<IEventMapper>{
			 adaptedType:"",
			 addListener:this.initKeyUpListener,
			 removeListener:this.removeKeyUpListener,
			 callback:this._keyUpCallbackDelegate});

		 this._keyDownCallbackDelegate = (event:any) => this.keyDownCallback(event);
		 this.eventMapping[KeyboardEvent.KEY_DOWN]=(<IEventMapper>{
			 adaptedType:"",
			 addListener:this.initKeyDownListener,
			 removeListener:this.removeKeyDownListener,
			 callback:this._keyDownCallbackDelegate});

		 // MouseEvent events adapt to awayjs-MouseEvents. they listen on adapter:
		 // these mapping share the same callback, thats why we need the setup the eventMappingInvert to

		 this._mouseCallbackDelegate = (event:MouseEventAway) => this.mouseCallback(event);

		 this.eventMappingInvert[MouseEventAway.MOUSE_WHEEL]=MouseEvent.MOUSE_WHEEL;
		 this.eventMapping[MouseEvent.MOUSE_WHEEL]= (<IEventMapper>{
			 adaptedType:MouseEventAway.MOUSE_WHEEL,
			 addListener:this.initMouseListener,
			 removeListener:this.removeMouseListener,
			 callback:this._mouseCallbackDelegate});

		 this.eventMappingInvert[MouseEventAway.MOUSE_UP]=MouseEvent.MOUSE_UP;
		 this.eventMapping[MouseEvent.MOUSE_UP]=(<IEventMapper>{
			 adaptedType:MouseEventAway.MOUSE_UP,
			 addListener:this.initMouseListener,
			 removeListener:this.removeMouseListener,
			 callback:this._mouseCallbackDelegate});

		 this.eventMappingInvert[MouseEventAway.MOUSE_OVER]=MouseEvent.MOUSE_OVER;
		 this.eventMapping[MouseEvent.MOUSE_OVER]=(<IEventMapper>{
			 adaptedType:MouseEventAway.MOUSE_OVER,
			 addListener:this.initMouseListener,
			 removeListener:this.removeMouseListener,
			 callback:this._mouseCallbackDelegate});

		 this.eventMappingInvert[MouseEventAway.MOUSE_OUT]=MouseEvent.MOUSE_OUT;
		 this.eventMapping[MouseEvent.MOUSE_OUT]=(<IEventMapper>{
			 adaptedType:MouseEventAway.MOUSE_OUT,
			 addListener:this.initMouseListener,
			 removeListener:this.removeMouseListener,
			 callback:this._mouseCallbackDelegate});

		 this.eventMappingInvert[MouseEventAway.MOUSE_MOVE]=MouseEvent.MOUSE_MOVE;
		 this.eventMapping[MouseEvent.MOUSE_MOVE]=(<IEventMapper>{
			 adaptedType:MouseEventAway.MOUSE_MOVE,
			 addListener:this.initMouseListener,
			 removeListener:this.removeMouseListener,
			 callback:this._mouseCallbackDelegate});

		 this.eventMappingInvert[MouseEventAway.MOUSE_DOWN]=MouseEvent.MOUSE_DOWN;
		 this.eventMapping[MouseEvent.MOUSE_DOWN]=(<IEventMapper>{
			 adaptedType:MouseEventAway.MOUSE_DOWN,
			 addListener:this.initMouseListener,
			 removeListener:this.removeMouseListener,
			 callback:this._mouseCallbackDelegate});

		 this.eventMappingInvert[MouseEventAway.DOUBLE_CLICK]=MouseEvent.DOUBLE_CLICK;
		 this.eventMapping[MouseEvent.DOUBLE_CLICK]=(<IEventMapper>{
			 adaptedType:MouseEventAway.DOUBLE_CLICK,
			 addListener:this.initMouseListener,
			 removeListener:this.removeMouseListener,
			 callback:this._mouseCallbackDelegate});

		 this.eventMappingInvert[MouseEventAway.CLICK]=MouseEvent.CLICK;
		this.eventMapping[MouseEvent.CLICK]=(<IEventMapper>{
			adaptedType:MouseEventAway.CLICK,
			addListener:this.initMouseListener,
			removeListener:this.removeMouseListener,
			callback:this._mouseCallbackDelegate});
			
			this.eventMappingInvert[MouseEventAway.MOUSE_OUT]=MouseEvent.ROLL_OUT;
			this.eventMapping[MouseEvent.ROLL_OUT]=(<IEventMapper>{
				adaptedType:MouseEventAway.MOUSE_OUT,
				addListener:this.initMouseListener,
				removeListener:this.removeMouseListener,
				callback:this._mouseCallbackDelegate});
				
			this.eventMappingInvert[MouseEventAway.MOUSE_OVER]=MouseEvent.ROLL_OVER;
			this.eventMapping[MouseEvent.ROLL_OVER]=(<IEventMapper>{
				adaptedType:MouseEventAway.MOUSE_OVER,
				addListener:this.initMouseListener,
				removeListener:this.removeMouseListener,
				callback:this._mouseCallbackDelegate});
	}

	// ---------- event mapping functions for KeyboardEvent.KEY_UP:


	private initKeyUpListener(type:string, callback:(event:any) => void):void
	{
		document.addEventListener("keyup", callback);
		document.addEventListener("keypress", callback);
	}
	private removeKeyUpListener(type:string, callback:(event:any) => void):void
	{
		document.removeEventListener("keyup", callback);
	}
	private _keyUpCallbackDelegate:(event:any) => void;
	private keyUpCallback(event:any=null):boolean
	{
		if (window.event) {
			window.event.returnValue = false;
		}
		event.preventDefault ? event.preventDefault() : (event.returnValue = false);
		var newkeyBoardEvent:KeyboardEvent=new KeyboardEvent(KeyboardEvent.KEY_UP);
		newkeyBoardEvent.keyCode = event.keyCode;
		newkeyBoardEvent.charCode = event.charCode;
		newkeyBoardEvent.shiftKey = event.shiftKey;
		newkeyBoardEvent.ctrlKey = event.ctrlKey;
		newkeyBoardEvent.altKey = event.altKey;
		this.dispatchEvent(newkeyBoardEvent);
		return false;
	}

	// ---------- event mapping functions for KeyboardEvent.KEY_DOWN:

	private initKeyDownListener(type:string, callback:(event:any) => void):void
	{
		document.addEventListener("keydown", callback);
		document.addEventListener("keypress", callback);
	}
	private removeKeyDownListener(type:string, callback:(event:any) => void):void
	{
		document.removeEventListener("keydown", callback);
		document.removeEventListener("keypress", callback);
	}
	private _keyDownCallbackDelegate:(event:any) => void;
	private keyDownCallback(event:any=null):boolean
	{
		if (window.event) {
			window.event.returnValue = false;
		}
		event.preventDefault ? event.preventDefault() : (event.returnValue = false);
		var newkeyBoardEvent:KeyboardEvent=new KeyboardEvent(KeyboardEvent.KEY_DOWN);
		newkeyBoardEvent.keyCode = event.keyCode;
		newkeyBoardEvent.charCode = event.charCode;
		newkeyBoardEvent.shiftKey = event.shiftKey;
		newkeyBoardEvent.ctrlKey = event.ctrlKey;
		newkeyBoardEvent.altKey = event.altKey;

		this.dispatchEvent(newkeyBoardEvent);
		return false;
	}

	// ---------- event mapping functions for MouseEvents:

	private initMouseListener(type:string, callback:(event:MouseEventAway) => void):void
	{
		this.adaptee.addEventListener(type, callback);
	}
	private removeMouseListener(type:string, callback:(event:MouseEventAway) => void):void
	{
		this.adaptee.removeEventListener(type, callback);
	}
	private _mouseCallbackDelegate:(event:MouseEventAway) => void;
	private mouseCallback(event:MouseEventAway):void
	{
		var adaptedEvent:MouseEvent=new MouseEvent(this.eventMappingInvert[event.type]);
		adaptedEvent.fillFromAway(event);
		adaptedEvent.target=this;
		adaptedEvent.currentTarget=this;
		
		this.dispatchEvent(adaptedEvent);
	}

	//---------------------------stuff added to make it work:




	//---------------------------original as3 properties / methods:
	
	/**
	 * The current accessibility implementation (AccessibilityImplementation)
	 * for this InteractiveObject instance.
	 * @langversion	3.0
	 */
	public get accessibilityImplementation () : any {
		console.log("accessibilityImplementation not implemented yet in flash/InteractiveObject");
		//todo flash.accessibility.AccessibilityImplementation;
		return null;
	}
	public set accessibilityImplementation (value:any){
		//todo
		console.log("accessibilityImplementation not implemented yet in flash/InteractiveObject");

	}

	/**
	 * Specifies the context menu associated with this object.
	 *
	 *   For content running in Flash Player, this property is a ContextMenu object. In the AIR runtime,
	 * the ContextMenu class extends the NativeMenu class, however Flash Player only supports the
	 * ContextMenu class, not the NativeMenu class.
	 * Note: TextField objects always include a clipboard menu in the context menu. The clipboard menu contains
	 * Cut, Copy, Paste, Clear, and Select All commands. You cannot remove these commands from the context menu for TextField objects.
	 * For TextField objects, selecting these commands (or their keyboard equivalents) does not generate clear,
	 * copy, cut, paste, or selectAll events.
	 */
	public get contextMenu () : any{
		console.log("contextMenu not implemented yet in flash/InteractiveObject");
		//todo flash.display.NativeMenu;
		return null;
	}
	public set contextMenu (cm:any){
		//todo
		console.log("contextMenu not implemented yet in flash/InteractiveObject");

	}

	/**
	 * Specifies whether the object receives doubleClick events. The default value
	 * is false, which means that by default an InteractiveObject instance does not receive
	 * doubleClick events. If the doubleClickEnabled property is set to
	 * true, the instance receives doubleClick events within its bounds.
	 * The mouseEnabled property of the InteractiveObject instance must also be
	 * set to true for the object to receive doubleClick events.
	 *
	 *   No event is dispatched by setting this property. You must use the
	 * addEventListener() method to add an event listener
	 * for the doubleClick event.
	 */
	public get doubleClickEnabled () : boolean{
		//todo
		console.log("doubleClickEnabled not implemented yet in flash/InteractiveObject");
		return false;
	}
	public set doubleClickEnabled (enabled:boolean){
		//todo
		console.log("doubleClickEnabled not implemented yet in flash/InteractiveObject");

	}

	/**
	 * Specifies whether this object displays a focus rectangle. It can take one of three
	 * values: true, false, or null. Values of true
	 * and false work as expected, specifying whether or not the focus rectangle
	 * appears. A value of null indicates that this object obeys the
	 * stageFocusRect property of the Stage.
	 */
	public get focusRect () : any{
		//todo
		console.log("focusRect not implemented yet in flash/InteractiveObject");
		return null;
	}
	public set focusRect (focusRect:any){
		//todo
		console.log("focusRect not implemented yet in flash/InteractiveObject");

	}

	/**
	 * Specifies whether this object receives mouse, or other user input, messages. The default value is true,
	 * which means that by default any InteractiveObject instance that is on the display list
	 * receives mouse events or other user input events.
	 * If mouseEnabled is set to false, the instance does not receive any
	 * mouse events (or other user input events like keyboard events). Any children of this instance on the display list are not affected. To change
	 * the mouseEnabled behavior for all children of an object on the display list, use
	 * flash.display.DisplayObjectContainer.mouseChildren.
	 * No event is dispatched by setting this property. You must use the
	 * addEventListener() method to create interactive functionality.
	 */
	//private _mouseEnabled:boolean=true;

	public get mouseEnabled () : boolean{
		return this.adaptee.mouseEnabled;
	}
	public set mouseEnabled (enabled:boolean){
		this.adaptee.mouseEnabled=enabled;
	}

	/**
	 * Specifies whether a virtual keyboard (an on-screen, software keyboard) should display
	 * when this InteractiveObject instance receives focus.
	 *
	 *   By default, the value is false and focusing an InteractiveObject instance does
	 * not raise a soft keyboard. If the needsSoftKeyboard property is set to true,
	 * the runtime raises a soft keyboard when the InteractiveObject instance is ready to accept user input.
	 * An InteractiveObject instance is ready to accept user input after a programmatic call to set the Stage
	 * focus property or a user interaction, such as a "tap." If the client system has a
	 * hardware keyboard available or does not support virtual keyboards, then the soft keyboard is not raised.The InteractiveObject instance dispatches softKeyboardActivating,
	 * softKeyboardActivate, and softKeyboardDeactivate events
	 * when the soft keyboard raises and lowers.Note: This property is not supported in AIR applications on iOS.
	 */
	public get needsSoftKeyboard () : boolean{
		//todo
		console.log("needsSoftKeyboard not implemented yet in flash/InteractiveObject");
		return false;
	}
	public set needsSoftKeyboard (value:boolean){
		//todo
		console.log("needsSoftKeyboard not implemented yet in flash/InteractiveObject");

	}

	/**
	 * Defines the area that should remain on-screen when a soft keyboard is displayed.
	 *
	 *   If the needsSoftKeyboard property of this InteractiveObject is
	 * true, then the runtime adjusts the display as needed to keep the
	 * object in view while the user types. Ordinarily, the runtime uses the object
	 * bounds obtained from the DisplayObject.getBounds() method. You can
	 * specify a different area using this softKeyboardInputAreaOfInterest
	 * property.Specify the softKeyboardInputAreaOfInterest in stage coordinates.Note: On Android, the softKeyboardInputAreaOfInterest is not
	 * respected in landscape orientations.
	 */
	public get softKeyboardInputAreaOfInterest () : Rectangle{
		//todo
		console.log("softKeyboardInputAreaOfInterest not implemented yet in flash/InteractiveObject");
		return null;
	}
	public set softKeyboardInputAreaOfInterest (value:Rectangle){
		//todo
		console.log("softKeyboardInputAreaOfInterest not implemented yet in flash/InteractiveObject");

	}

	/**
	 * Specifies whether this object is in the tab order. If this object is in the tab order,
	 * the value is true; otherwise, the value is false. By default,
	 * the value is false, except for the following:
	 * For a SimpleButton object, the value is true.For a TextField object with type = "input", the value is true.For a Sprite object or MovieClip object with buttonMode = true, the value is true.
	 */
	public get tabEnabled () : boolean{
		//todo
		//console.log("tabEnabled not implemented yet in flash/InteractiveObject");
		return false;
	}
	public set tabEnabled (enabled:boolean){
		//todo
		//console.log("tabEnabled not implemented yet in flash/InteractiveObject");

	}

	/**
	 * Specifies the tab ordering of objects in a SWF file. The tabIndex
	 * property is -1 by default, meaning no tab index is set for the object.
	 *
	 *   If any currently displayed object in the SWF file contains a tabIndex property, automatic
	 * tab ordering is disabled, and the tab ordering is calculated from the tabIndex properties of
	 * objects in the SWF file. The custom tab ordering includes only objects that have tabIndex
	 * properties.The tabIndex property can be a non-negative integer. The objects are ordered according to
	 * their tabIndex properties, in ascending order. An object with a tabIndex
	 * value of 1 precedes an object with a tabIndex value of 2. Do not use the same tabIndex
	 *
	 *   value for multiple objects.The custom tab ordering that the tabIndex property defines is flat.
	 * This means that no attention is paid to the hierarchical relationships of objects in the SWF file.
	 * All objects in the SWF file with tabIndex properties are placed in the tab order, and the
	 * tab order is determined by the order of the tabIndex values. Note: To set the tab order for TLFTextField instances, cast the display object child
	 * of the TLFTextField as an InteractiveObject, then set the tabIndex property. For example:
	 *
	 *   InteractiveObject(tlfInstance.getChildAt(1)).tabIndex = 3;
	 *
	 *   To reverse the tab order from the default setting for three instances of a TLFTextField object
	 * (tlfInstance1, tlfInstance2 and tlfInstance3), use:
	 *
	 *   InteractiveObject(tlfInstance1.getChildAt(1)).tabIndex = 3;
	 * InteractiveObject(tlfInstance2.getChildAt(1)).tabIndex = 2;
	 * InteractiveObject(tlfInstance3.getChildAt(1)).tabIndex = 1;
	 */
	public get tabIndex () : number{
		//todo
		console.log("tabIndex not implemented yet in flash/InteractiveObject");
		return 0;
	}
	public set tabIndex (index:number){
		//todo
		console.log("tabIndex not implemented yet in flash/InteractiveObject");
	}


	/**
	 * Raises a virtual keyboard.
	 *
	 *   Calling this method focuses the InteractiveObject instance and raises the soft keyboard, if necessary.
	 * The needsSoftKeyboard must also be true. A keyboard is not raised
	 * if a hardware keyboard is available, or if the client system does not support virtual keyboards.Note: This method is not supported in AIR applications on iOS.
	 * @return	A value of true means that the soft keyboard request was granted; false means that the soft keyboard was not raised.
	 */
	public requestSoftKeyboard () : boolean{
		//todo
		console.log("requestSoftKeyboard not implemented yet in flash/InteractiveObject");
		return false;
	}

}
