
import {InteractiveObject} from "../display/InteractiveObject";
import { Event } from "./Event";

/**
/// @eventType	flash.events.TouchEvent.TOUCH_BEGIN
[Event(name="touchBegin", type="flash.events.TouchEvent")]

/// @eventType	flash.events.TouchEvent.TOUCH_END
[Event(name="touchEnd", type="flash.events.TouchEvent")]

/// @eventType	flash.events.TouchEvent.TOUCH_MOVE
[Event(name="touchMove", type="flash.events.TouchEvent")]

/// @eventType	flash.events.TouchEvent.TOUCH_OUT
[Event(name="touchOut", type="flash.events.TouchEvent")]

/// @eventType	flash.events.TouchEvent.TOUCH_OVER
[Event(name="touchOver", type="flash.events.TouchEvent")]

/// @eventType	flash.events.TouchEvent.TOUCH_ROLL_OUT
[Event(name="touchRollOut", type="flash.events.TouchEvent")]

/// @eventType	flash.events.TouchEvent.TOUCH_ROLL_OVER
[Event(name="touchRollOver", type="flash.events.TouchEvent")]

/// @eventType	flash.events.TouchEvent.TOUCH_TAP
[Event(name="touchTap", type="flash.events.TouchEvent")]

 * The TouchEvent class lets you handle events on devices that detect user contact with
 * the device (such as a finger on a touch screen).
 * When a user interacts with a device such as a mobile phone or tablet with a touch screen, the user typically
 * touches the screen with his or her fingers or a pointing device. You can develop applications that respond to
 * basic touch events (such as a single finger tap) with the TouchEvent class. Create event listeners using the event types defined in this class.
 * For user interaction with multiple points of contact (such as several fingers moving across a touch screen at the same time) use
 * the related GestureEvent, PressAndTapGestureEvent, and TransformGestureEvent classes. And, use the properties and methods of these classes
 * to construct event handlers that respond to the user touching the device.
 * <p class="- topic/p ">Use the Multitouch class to determine the current environment's support for touch interaction, and to
 * manage the support of touch interaction if the current environment supports it.</p><p class="- topic/p "><b class="+ topic/ph hi-d/b ">Note:</b> When objects are nested on the display list, touch events target the deepest possible
 * nested object that is visible in the display list. This object is called the target node. To have a target node's
 * ancestor (an object containing the target node in the display list) receive notification of a touch event, use
 * <codeph class="+ topic/ph pr-d/codeph ">EventDispatcher.addEventListener()</codeph> on the ancestor node with the type parameter set to the specific
 * touch event you want to detect.</p>
 */
export class TouchEvent extends Event
{
	public static PROXIMITY_BEGIN : string;
	public static PROXIMITY_END : string;
	public static PROXIMITY_MOVE : string;
	public static PROXIMITY_OUT : string;
	public static PROXIMITY_OVER : string;
	public static PROXIMITY_ROLL_OUT : string;
	public static PROXIMITY_ROLL_OVER : string;

	/**
	 * Defines the value of the type property of a TOUCH_BEGIN touch event object.
	 *
	 *   The dispatched TouchEvent object has the following properties:PropertyValuealtKeytrue if the Alt key is active (Windows or Linux).bubblestruecancelablefalse; there is no default behavior to cancel.commandKeytrue on the Mac if the Command key is active; false if it is inactive. Always false on Windows.controlKeytrue if the Ctrl or Control key is active; false if it is inactive.ctrlKeytrue on Windows or Linux if the Ctrl key is active. true on Mac if either the Ctrl key or the Command key is active. Otherwise, false.currentTargetThe object that is actively processing the Event
	 * object with an event listener.eventPhaseThe current phase in the event flow.isRelatedObjectInaccessibletrue if the relatedObject property is set to null because of security sandbox rules.localXThe horizontal coordinate at which the event occurred relative to the containing sprite.localYThe vertical coordinate at which the event occurred relative to the containing sprite.pressureA value between 0.0 and 1.0 indicating force of the contact with the device. If the device does not support detecting the pressure, the value is 1.0.relatedObjectA reference to a display list object related to the event.shiftKeytrue if the Shift key is active; false if it is inactive.sizeXWidth of the contact area.sizeYHeight of the contact area.stageXThe horizontal coordinate at which the event occurred in global stage coordinates.stageYThe vertical coordinate at which the event occurred in global stage coordinates.targetThe InteractiveObject instance under the touching device.
	 * The target is not always the object in the display list
	 * that registered the event listener. Use the currentTarget
	 * property to access the object in the display list that is currently processing the event.touchPointIDA unique identification number (as an int) assigned to the touch point.
	 */
	public static TOUCH_BEGIN : string = "touchBegin";

	/**
	 * Defines the value of the type property of a TOUCH_END touch event object.
	 *
	 *   The dispatched TouchEvent object has the following properties:PropertyValuealtKeytrue if the Alt key is active (Windows or Linux).bubblestruecancelablefalse; there is no default behavior to cancel.commandKeytrue on the Mac if the Command key is active; false if it is inactive. Always false on Windows.controlKeytrue if the Ctrl or Control key is active; false if it is inactive.ctrlKeytrue on Windows or Linux if the Ctrl key is active. true on Mac if either the Ctrl key or the Command key is active. Otherwise, false.currentTargetThe object that is actively processing the Event
	 * object with an event listener.eventPhaseThe current phase in the event flow.isRelatedObjectInaccessibletrue if the relatedObject property is set to null because of security sandbox rules.localXThe horizontal coordinate at which the event occurred relative to the containing sprite.localYThe vertical coordinate at which the event occurred relative to the containing sprite.pressureA value between 0.0 and 1.0 indicating force of the contact with the device. If the device does not support detecting the pressure, the value is 1.0.relatedObjectA reference to a display list object related to the event.shiftKeytrue if the Shift key is active; false if it is inactive.sizeXWidth of the contact area.sizeYHeight of the contact area.stageXThe horizontal coordinate at which the event occurred in global stage coordinates.stageYThe vertical coordinate at which the event occurred in global stage coordinates.targetThe InteractiveObject instance under the touching device.
	 * The target is not always the object in the display list
	 * that registered the event listener. Use the currentTarget
	 * property to access the object in the display list that is currently processing the event.touchPointIDA unique identification number (as an int) assigned to the touch point.
	 */
	public static TOUCH_END : string = "touchEnd";

	/**
	 * Defines the value of the type property of a TOUCH_MOVE touch event object.
	 *
	 *   The dispatched TouchEvent object has the following properties:PropertyValuealtKeytrue if the Alt key is active (Windows or Linux).bubblestruecancelablefalse; there is no default behavior to cancel.commandKeytrue on the Mac if the Command key is active; false if it is inactive. Always false on Windows.controlKeytrue if the Ctrl or Control key is active; false if it is inactive.ctrlKeytrue on Windows or Linux if the Ctrl key is active. true on Mac if either the Ctrl key or the Command key is active. Otherwise, false.currentTargetThe object that is actively processing the Event
	 * object with an event listener.eventPhaseThe current phase in the event flow.isRelatedObjectInaccessibletrue if the relatedObject property is set to null because of security sandbox rules.localXThe horizontal coordinate at which the event occurred relative to the containing sprite.localYThe vertical coordinate at which the event occurred relative to the containing sprite.pressureA value between 0.0 and 1.0 indicating force of the contact with the device. If the device does not support detecting the pressure, the value is 1.0.relatedObjectA reference to a display list object related to the event.shiftKeytrue if the Shift key is active; false if it is inactive.sizeXWidth of the contact area.sizeYHeight of the contact area.stageXThe horizontal coordinate at which the event occurred in global stage coordinates.stageYThe vertical coordinate at which the event occurred in global stage coordinates.targetThe InteractiveObject instance under the touching device.
	 * The target is not always the object in the display list
	 * that registered the event listener. Use the currentTarget
	 * property to access the object in the display list that is currently processing the event.touchPointIDA unique identification number (as an int) assigned to the touch point.
	 */
	public static TOUCH_MOVE : string = "touchMove";

	/**
	 * Defines the value of the type property of a TOUCH_OUT touch event object.
	 *
	 *   The dispatched TouchEvent object has the following properties:PropertyValuealtKeytrue if the Alt key is active (Windows or Linux).bubblestruecancelablefalse; there is no default behavior to cancel.commandKeytrue on the Mac if the Command key is active; false if it is inactive. Always false on Windows.controlKeytrue if the Ctrl or Control key is active; false if it is inactive.ctrlKeytrue on Windows or Linux if the Ctrl key is active. true on Mac if either the Ctrl key or the Command key is active. Otherwise, false.currentTargetThe object that is actively processing the Event
	 * object with an event listener.eventPhaseThe current phase in the event flow.isRelatedObjectInaccessibletrue if the relatedObject property is set to null because of security sandbox rules.localXThe horizontal coordinate at which the event occurred relative to the containing sprite.localYThe vertical coordinate at which the event occurred relative to the containing sprite.pressureA value between 0.0 and 1.0 indicating force of the contact with the device. If the device does not support detecting the pressure, the value is 1.0.relatedObjectA reference to a display list object related to the event.shiftKeytrue if the Shift key is active; false if it is inactive.sizeXWidth of the contact area.sizeYHeight of the contact area.stageXThe horizontal coordinate at which the event occurred in global stage coordinates.stageYThe vertical coordinate at which the event occurred in global stage coordinates.targetThe InteractiveObject instance under the touching device.
	 * The target is not always the object in the display list
	 * that registered the event listener. Use the currentTarget
	 * property to access the object in the display list that is currently processing the event.touchPointIDA unique identification number (as an int) assigned to the touch point.
	 */
	public static TOUCH_OUT : string = "touchOut";

	/**
	 * Defines the value of the type property of a TOUCH_OVER touch event object.
	 *
	 *   The dispatched TouchEvent object has the following properties:PropertyValuealtKeytrue if the Alt key is active (Windows or Linux).bubblestruecancelablefalse; there is no default behavior to cancel.commandKeytrue on the Mac if the Command key is active; false if it is inactive. Always false on Windows.controlKeytrue if the Ctrl or Control key is active; false if it is inactive.ctrlKeytrue on Windows or Linux if the Ctrl key is active. true on Mac if either the Ctrl key or the Command key is active. Otherwise, false.currentTargetThe object that is actively processing the Event
	 * object with an event listener.eventPhaseThe current phase in the event flow.isRelatedObjectInaccessibletrue if the relatedObject property is set to null because of security sandbox rules.localXThe horizontal coordinate at which the event occurred relative to the containing sprite.localYThe vertical coordinate at which the event occurred relative to the containing sprite.pressureA value between 0.0 and 1.0 indicating force of the contact with the device. If the device does not support detecting the pressure, the value is 1.0.relatedObjectA reference to a display list object related to the event.shiftKeytrue if the Shift key is active; false if it is inactive.sizeXWidth of the contact area.sizeYHeight of the contact area.stageXThe horizontal coordinate at which the event occurred in global stage coordinates.stageYThe vertical coordinate at which the event occurred in global stage coordinates.targetThe InteractiveObject instance under the touching device.
	 * The target is not always the object in the display list
	 * that registered the event listener. Use the currentTarget
	 * property to access the object in the display list that is currently processing the event.touchPointIDA unique identification number (as an int) assigned to the touch point.
	 */
	public static TOUCH_OVER : string = "touchOver";

	/**
	 * Defines the value of the type property of a TOUCH_ROLL_OUT touch event object.
	 *
	 *   The dispatched TouchEvent object has the following properties:PropertyValuealtKeytrue if the Alt key is active (Windows or Linux).bubblestruecancelablefalse; there is no default behavior to cancel.commandKeytrue on the Mac if the Command key is active; false if it is inactive. Always false on Windows.controlKeytrue if the Ctrl or Control key is active; false if it is inactive.ctrlKeytrue on Windows or Linux if the Ctrl key is active. true on Mac if either the Ctrl key or the Command key is active. Otherwise, false.currentTargetThe object that is actively processing the Event
	 * object with an event listener.eventPhaseThe current phase in the event flow.isRelatedObjectInaccessibletrue if the relatedObject property is set to null because of security sandbox rules.localXThe horizontal coordinate at which the event occurred relative to the containing sprite.localYThe vertical coordinate at which the event occurred relative to the containing sprite.pressureA value between 0.0 and 1.0 indicating force of the contact with the device. If the device does not support detecting the pressure, the value is 1.0.relatedObjectA reference to a display list object related to the event.shiftKeytrue if the Shift key is active; false if it is inactive.sizeXWidth of the contact area.sizeYHeight of the contact area.stageXThe horizontal coordinate at which the event occurred in global stage coordinates.stageYThe vertical coordinate at which the event occurred in global stage coordinates.targetThe InteractiveObject instance under the touching device.
	 * The target is not always the object in the display list
	 * that registered the event listener. Use the currentTarget
	 * property to access the object in the display list that is currently processing the event.touchPointIDA unique identification number (as an int) assigned to the touch point.
	 */
	public static TOUCH_ROLL_OUT : string = "touchRollOut";

	/**
	 * Defines the value of the type property of a TOUCH_ROLL_OVER touch event object.
	 *
	 *   The dispatched TouchEvent object has the following properties:PropertyValuealtKeytrue if the Alt key is active (Windows or Linux).bubblestruecancelablefalse; there is no default behavior to cancel.commandKeytrue on the Mac if the Command key is active; false if it is inactive. Always false on Windows.controlKeytrue if the Ctrl or Control key is active; false if it is inactive.ctrlKeytrue on Windows or Linux if the Ctrl key is active. true on Mac if either the Ctrl key or the Command key is active. Otherwise, false.currentTargetThe object that is actively processing the Event
	 * object with an event listener.eventPhaseThe current phase in the event flow.isRelatedObjectInaccessibletrue if the relatedObject property is set to null because of security sandbox rules.localXThe horizontal coordinate at which the event occurred relative to the containing sprite.localYThe vertical coordinate at which the event occurred relative to the containing sprite.pressureA value between 0.0 and 1.0 indicating force of the contact with the device. If the device does not support detecting the pressure, the value is 1.0.relatedObjectA reference to a display list object related to the event.shiftKeytrue if the Shift key is active; false if it is inactive.sizeXWidth of the contact area.sizeYHeight of the contact area.stageXThe horizontal coordinate at which the event occurred in global stage coordinates.stageYThe vertical coordinate at which the event occurred in global stage coordinates.targetThe InteractiveObject instance under the touching device.
	 * The target is not always the object in the display list
	 * that registered the event listener. Use the currentTarget
	 * property to access the object in the display list that is currently processing the event.touchPointIDA unique identification number (as an int) assigned to the touch point.
	 */
	public static TOUCH_ROLL_OVER : string = "touchRollOver";

	/**
	 * Defines the value of the type property of a TOUCH_TAP touch event object.
	 *
	 *   The dispatched TouchEvent object has the following properties:PropertyValuealtKeytrue if the Alt key is active (Windows or Linux).bubblestruecancelablefalse; there is no default behavior to cancel.commandKeytrue on the Mac if the Command key is active; false if it is inactive. Always false on Windows.controlKeytrue if the Ctrl or Control key is active; false if it is inactive.ctrlKeytrue on Windows or Linux if the Ctrl key is active. true on Mac if either the Ctrl key or the Command key is active. Otherwise, false.currentTargetThe object that is actively processing the Event
	 * object with an event listener.eventPhaseThe current phase in the event flow.isRelatedObjectInaccessibletrue if the relatedObject property is set to null because of security sandbox rules.localXThe horizontal coordinate at which the event occurred relative to the containing sprite.localYThe vertical coordinate at which the event occurred relative to the containing sprite.pressureA value between 0.0 and 1.0 indicating force of the contact with the device. If the device does not support detecting the pressure, the value is 1.0.relatedObjectA reference to a display list object related to the event.shiftKeytrue if the Shift key is active; false if it is inactive.sizeXWidth of the contact area.sizeYHeight of the contact area.stageXThe horizontal coordinate at which the event occurred in global stage coordinates.stageYThe vertical coordinate at which the event occurred in global stage coordinates.targetThe InteractiveObject instance under the touching device.
	 * The target is not always the object in the display list
	 * that registered the event listener. Use the currentTarget
	 * property to access the object in the display list that is currently processing the event.touchPointIDA unique identification number (as an int) assigned to the touch point.
	 */
	public static TOUCH_TAP : string = "touchTap";

	/**
	 * Indicates whether the Alt key is active (true) or inactive (false).
	 * Supported for Windows and Linux operating systems only.
	 * @internal	Reserved in case Desktop Player wants to capture this key in a future implementation.
	 *   The Option key modifier on Macintosh system must be represented using this key modifier. So far, it seems
	 *   only the Windows version is hooked up.
	 */
	public get altKey () : boolean{return false;}
	public set altKey (value: boolean){}

	/**
	 * On Windows or Linux, indicates whether the Ctrl key is active (true) or inactive (false).
	 * On Macintosh, indicates whether either the Control key or the Command key is activated.
	 */
	public get ctrlKey () : boolean{return false;}
	public set ctrlKey (value: boolean){}

	/**
	 * Indicates whether the first point of contact is mapped to mouse events.
	 */
	public get isPrimaryTouchPoint () : boolean{return false;}
	public set isPrimaryTouchPoint (value: boolean){}

	/**
	 * If true, the relatedObject property is set to null for
	 * reasons related to security sandboxes.  If the nominal value of relatedObject is a reference to a
	 * DisplayObject in another sandbox, relatedObject is set to
	 * null unless there is permission in both directions across this sandbox boundary. Permission is
	 * established by calling Security.allowDomain() from a SWF file, or by providing
	 * a policy file from the server of an image file, and setting the LoaderContext.checkPolicyFile
	 * property when loading the image.
	 */
	public get isRelatedObjectInaccessible () : boolean{return false;}
	public set isRelatedObjectInaccessible (value: boolean){}

	/**
	 * The horizontal coordinate at which the event occurred relative to the containing sprite.
	 */
	public get localX () : number{ return 0;}
	public set localX (value:number){}

	/**
	 * The vertical coordinate at which the event occurred relative to the containing sprite.
	 */
	public get localY () : number{ return 0;}
	public set localY (value:number){}

	/**
	 * A value between 0.0 and 1.0 indicating force of the contact with the device.
	 * If the device does not support detecting the pressure, the value is 1.0.
	 */
	public get pressure () : number{ return 0;}
	public set pressure (value:number){}

	/**
	 * A reference to a display list object that is related to the event. For example, when a touchOut event occurs,
	 * relatedObject represents the display list object to which the pointing device now points.
	 * This property applies to the touchOut, touchOver, touchRollOut, and touchRollOver events.
	 * The value of this property can be null in two circumstances: if there is no related object,
	 * or there is a related object, but it is in a security sandbox to which you don't have access.
	 * Use the isRelatedObjectInaccessible() property to determine which of these reasons applies.
	 */
	public get relatedObject () : InteractiveObject{
		return null;
	}
	public set relatedObject (value:InteractiveObject){

	}

	/**
	 * Indicates whether the Shift key is active (true) or inactive
	 * (false).
	 */
	public get shiftKey () : boolean{return false;}
	public set shiftKey (value: boolean){}

	/**
	 * Width of the contact area.
	 * @langversion	3.0
	 */
	public get sizeX () : number{ return 0;}
	public set sizeX (value:number){}

	/**
	 * Height of the contact area.
	 */
	public get sizeY () : number{ return 0;}
	public set sizeY (value:number){}

	/**
	 * The horizontal coordinate at which the event occurred in global Stage coordinates.
	 * This property is calculated when the localX property is set.
	 */
	public get stageX () : number{ return 0;}

	/**
	 * The vertical coordinate at which the event occurred in global Stage coordinates.
	 * This property is calculated when the localY property is set.
	 */
	public get stageY () : number{ return 0;}

	/**
	 * A unique identification number (as an int) assigned to the touch point.
	 */
	public get touchPointID () : number{ return 0;}
	public set touchPointID (value:number){}

	/**
	 * Creates a copy of the TouchEvent object and sets the value of each property to match that of the original.
	 * @return	A new TouchEvent object with property values that match those of the original.
	 */
	public clone () : Event{
		return null;
	}

	/**
	 * Returns a string that contains all the properties of the TouchEvent object. The string is in the following format:
	 * [TouchEvent type=value bubbles=value cancelable=value ... ]
	 * @return	A string that contains all the properties of the TouchEvent object.
	 */
	public toString () : string{return "";}

	/**
	 * Creates an Event object that contains information about touch events.
	 * Event objects are passed as parameters to event listeners.
	 * @param	type	The type of the event. Possible values are: TouchEvent.TOUCH_BEGIN,
	 *   TouchEvent.TOUCH_END, TouchEvent.TOUCH_MOVE,
	 *   TouchEvent.TOUCH_OUT, TouchEvent.TOUCH_OVER,
	 *   TouchEvent.TOUCH_ROLL_OUT, TouchEvent.TOUCH_ROLL_OVER,
	 *   and TouchEvent.TOUCH_TAP.
	 * @param	bubbles	Determines whether the Event object participates in the bubbling phase of the event flow.
	 * @param	cancelable	Determines whether the Event object can be canceled.
	 * @param	touchPointID	A unique identification number (as an int) assigned to the touch point.
	 * @param	isPrimaryTouchPoint	Indicates whether the first point of contact is mapped to mouse events.
	 * @param	localX	The horizontal coordinate at which the event occurred relative to the containing sprite.
	 * @param	localY	The vertical coordinate at which the event occurred relative to the containing sprite.
	 * @param	sizeX	Width of the contact area.
	 * @param	sizeY	Height of the contact area.
	 * @param	pressure	A value between 0.0 and 1.0 indicating force of the contact with the device.
	 *   If the device does not support detecting the pressure, the value is 1.0.
	 * @param	relatedObject	The complementary InteractiveObject instance that is affected by the event. For example, when a touchOut event occurs,
	 *   relatedObject represents the display list object to which the pointing device now points.
	 * @param	ctrlKey	On Windows or Linux, indicates whether the Ctrl key is activated. On Mac, indicates whether either the Ctrl key or the Command key is activated.
	 * @param	altKey	Indicates whether the Alt key is activated (Windows or Linux only).
	 * @param	shiftKey	Indicates whether the Shift key is activated.
	 * @param	commandKey	(AIR only) Indicates whether the Command key is activated (Mac only). This parameter is for Adobe AIR only; do not set it for Flash Player content.
	 * @param	controlKey	(AIR only) Indicates whether the Control or Ctrl key is activated. This parameter is for Adobe AIR only; do not set it for Flash Player content.

	 */
	constructor (type:string, bubbles:boolean=true, cancelable:boolean=false, touchPointID:number=0, isPrimaryTouchPoint:boolean=false, localX:number=NaN, localY:number=NaN, sizeX:number=NaN, sizeY:number=NaN, pressure:number=NaN, relatedObject:InteractiveObject=null, ctrlKey:boolean=false, altKey:boolean=false, shiftKey:boolean=false){
		super(type, bubbles, cancelable);
	}

	/**
	 * Instructs Flash Player or Adobe AIR to render after processing of this event completes, if the display list has been modified.
	 */
	public updateAfterEvent () {
		
	}
}

