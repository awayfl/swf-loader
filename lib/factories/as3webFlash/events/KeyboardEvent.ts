import { Event } from "./Event";

/**
/// @eventType	flash.events.KeyboardEvent.KEY_DOWN
[Event(name="keyDown", type="flash.events.KeyboardEvent")]

/// @eventType	flash.events.KeyboardEvent.KEY_UP
[Event(name="keyUp", type="flash.events.KeyboardEvent")]

 * A KeyboardEvent object id dispatched in response to user input through a keyboard.
 * There are two types of keyboard events: <codeph class="+ topic/ph pr-d/codeph ">KeyboardEvent.KEY_DOWN</codeph> and
 * <codeph class="+ topic/ph pr-d/codeph ">KeyboardEvent.KEY_UP</codeph><p class="- topic/p ">Because mappings between keys and specific characters vary by device
 * and operating system, use the TextEvent event type for processing character input.</p><p class="- topic/p ">To listen globally for key events, listen on the Stage for the capture and target
 * or bubble phase.</p>
 */
export class KeyboardEvent extends Event
{
	/**
	 * Creates an Event object that contains specific information about keyboard events.
	 * Event objects are passed as parameters to event listeners.
	 * @param	type	The type of the event. Possible values are:
	 *   KeyboardEvent.KEY_DOWN and KeyboardEvent.KEY_UP
	 * @param	bubbles	Determines whether the Event object participates in the bubbling stage of the event flow.
	 * @param	cancelable	Determines whether the Event object can be canceled.
	 * @param	charCodeValue	The character code value of the key pressed or released. The character code values returned are English keyboard values. For example, if you press Shift+3, the Keyboard.charCode() property returns # on a Japanese keyboard, just as it does on an English keyboard.
	 * @param	keyCodeValue	The key code value of the key pressed or released.
	 * @param	keyLocationValue	The location of the key on the keyboard.
	 * @param	ctrlKeyValue	On Windows, indicates whether the Ctrl key is activated. On Mac, indicates whether either the Ctrl key or the Command key is activated.
	 * @param	altKeyValue	Indicates whether the Alt key modifier is activated (Windows only).
	 * @param	shiftKeyValue	Indicates whether the Shift key modifier is activated.
	 * @param	controlKeyValue	Indicates whether the Control key is activated on Mac, and whether the Control or Ctrl keys are activated on WIndows and Linux.
	 * @param	commandKeyValue	Indicates whether the Command key is activated (Mac only).
	 */
	constructor (type:string, bubbles:boolean=true, cancelable:boolean=false, charCodeValue:number=0, keyCodeValue:number=0, keyLocationValue:number=0, ctrlKeyValue:boolean=false, altKeyValue:boolean=false, shiftKeyValue:boolean=false){
		super(type, bubbles, cancelable);
	}

	/**
	 * The KeyboardEvent.KEY_DOWN constant defines the value of the type property of a keyDown event object.
	 *
	 *   This event has the following properties:PropertyValuebubblestruecancelabletrue in AIR, false in Flash Player;
	 * in AIR, canceling this event prevents the character from being entered into a text field.charCodeThe character code value of the key pressed or released.commandKeytrue on Mac if the Command key is active. Otherwise, falsecontrolKeytrue on Windows and Linux if the Ctrl key is active. true on Mac if either the Control key is active. Otherwise, falsectrlKeytrue on Windows and Linux if the Ctrl key is active. true on Mac if either the Ctrl key or the Command key is active. Otherwise, false.currentTargetThe object that is actively processing the Event
	 * object with an event listener.keyCodeThe key code value of the key pressed or released.keyLocationThe location of the key on the keyboard.shiftKeytrue if the Shift key is active; false if it is inactive.targetThe InteractiveObject instance with focus.
	 * The target is not always the object in the display list
	 * that registered the event listener. Use the currentTarget
	 * property to access the object in the display list that is currently processing the event.
	 */
	public static KEY_DOWN : string = "keyDown";

	/**
	 * The KeyboardEvent.KEY_UP constant defines the value of the type property of a keyUp event object.
	 * This event has the following properties:PropertyValuebubblestruecancelablefalse; there is no default behavior to cancel.charCodeContains the character code value of the key pressed or released.commandKeytrue on Mac if the Command key is active. Otherwise, falsecontrolKeytrue on Windows and Linux if the Ctrl key is active. true on Mac if either the Control key is active. Otherwise, falsectrlKeytrue on Windows if the Ctrl key is active. true on Mac if either the Ctrl key or the Command key is active. Otherwise, false.currentTargetThe object that is actively processing the Event
	 * object with an event listener.keyCodeThe key code value of the key pressed or released.keyLocationThe location of the key on the keyboard.shiftKeytrue if the Shift key is active; false if it is inactive.targetThe InteractiveObject instance with focus.
	 * The target is not always the object in the display list
	 * that registered the event listener. Use the currentTarget
	 * property to access the object in the display list that is currently processing the event.
	 */
	public static KEY_UP : string = "keyUp";

	/**
	 * Indicates whether the Alt key is active (true) or inactive (false) on Windows;
	 * indicates whether the Option key is active on Mac OS.
	 */
	private _altKey:boolean;
	public get altKey () : boolean{
		return this._altKey;
	}
	public set altKey (value:boolean){
		this._altKey=value;
	}

	/**
	 * Contains the character code value of the key pressed or released.
	 * The character code values are English keyboard values. For example,
	 * if you press Shift+3, charCode is # on a Japanese keyboard,
	 * just as it is on an English keyboard.
	 * Note: When an input method editor (IME) is running,
	 * charCode does not report accurate character codes.
	 */
	private _charCode:number;
	public get charCode () : number{
		return this._charCode;
	}
	public set charCode (value:number){
		this._charCode=value;
	}

	/**
	 * On Windows and Linux, indicates whether the Ctrl key is active (true) or inactive (false);
	 * On Mac OS, indicates whether either the Ctrl key or the Command key is active.
	 */
	private _ctrlKey:boolean;
	public get ctrlKey () : boolean{
		return this._ctrlKey;
	}
	public set ctrlKey (value:boolean){
		this._ctrlKey=value;
	}

	/**
	 * The key code value of the key pressed or released.
	 * Note: When an input method editor (IME) is running,
	 * keyCode does not report accurate key codes.
	 */
	private _keyCode:number;
	public get keyCode () : number{
		return this._keyCode;
	}
	public set keyCode (value:number){
		this._keyCode=value;
	}

	/**
	 * Indicates the location of the key on the keyboard. This is useful for differentiating keys
	 * that appear more than once on a keyboard. For example, you can differentiate between the
	 * left and right Shift keys by the value of this property: KeyLocation.LEFT
	 * for the left and KeyLocation.RIGHT for the right. Another example is
	 * differentiating between number keys pressed on the standard keyboard
	 * (KeyLocation.STANDARD) versus the numeric keypad (KeyLocation.NUM_PAD).
	 */
	public get keyLocation () : number{
		console.log("keyLocation not implemented yet in flash/KeyboardEvent");
		return 0;
	}
	public set keyLocation (value:number){
		console.log("keyLocation not implemented yet in flash/KeyboardEvent");
	}

	/**
	 * Indicates whether the Shift key modifier is active (true) or inactive
	 * (false).
	 */
	private _shiftKey:boolean;
	public get shiftKey () : boolean{
		return this._shiftKey;
	}
	public set shiftKey (value:boolean){
		this._shiftKey=value;
	}

	/**
	 * Creates a copy of the KeyboardEvent object and sets the value of each property to match that of the original.
	 * @return	A new KeyboardEvent object with property values that match those of the original.
	 */
	public clone () : Event{
		console.log("clone not implemented yet in flash/KeyboardEvent");
		return null;
	}

	/**
	 * Returns a string that contains all the properties of the KeyboardEvent object. The string
	 * is in the following format:
	 * [KeyboardEvent type=value bubbles=value cancelable=value ... shiftKey=value]
	 * @return	A string that contains all the properties of the KeyboardEvent object.
	 */
	public toString () : string{
		console.log("toString not implemented yet in flash/KeyboardEvent");
		return "";
	}

	/**
	 * Indicates that the display should be rendered after processing of this event completes, if the display
	 * list has been modified
	 */
	public updateAfterEvent () {
		console.log("updateAfterEvent not implemented yet in flash/KeyboardEvent");
	}
}

