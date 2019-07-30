import {Event} from "./Event";
import {InteractiveObject} from "../display/InteractiveObject";
export class FocusEvent extends Event{

	public static FOCUS_IN="focusIn";
	public static FOCUS_OUT="focusOut";
	public static KEY_FOCUS_CHANGE="keyFocusChange";
	public static MOUSE_FOCUS_CHANGE="mouseFocusChange";
	/**
	 * If true, the relatedObject property is set to null for
	 * reasons related to security sandboxes.  If the nominal value of relatedObject is a reference to a
	 * DisplayObject in another sandbox, relatedObject is set to
	 * null unless there is permission in both directions across this sandbox boundary.  Permission is
	 * established by calling Security.allowDomain() from a SWF file, or by providing
	 * a policy file from the server of an image file, and setting the LoaderContext.checkPolicyFile
	 * property when loading the image.
	 * @langversion	3.0
	 * @playerversion	Flash 10
	 * @playerversion	Lite 4
	 */
	public get isRelatedObjectInaccessible () : boolean{
		console.log("isRelatedObjectInaccessible not implemented yet in flash/FocusEvent");
		return false;
	}
	public set isRelatedObjectInaccessible (value:boolean){
		console.log("isRelatedObjectInaccessible not implemented yet in flash/FocusEvent");
	}

	/**
	 * The key code value of the key pressed to trigger a keyFocusChange event.
	 */
	public get keyCode () : number{
		console.log("keyCode not implemented yet in flash/FocusEvent");
		return 0;
	}
	public set keyCode (value:number){
		console.log("keyCode not implemented yet in flash/FocusEvent");
	}

	/**
	 * A reference to the complementary InteractiveObject instance that is affected by the
	 * change in focus. For example, when a focusOut event occurs, the
	 * relatedObject represents the InteractiveObject instance that has gained focus.
	 * The value of this property can be null in two circumstances: if there no related object,
	 * or there is a related object, but it is in a security sandbox to which you don't have access.
	 * Use the isRelatedObjectInaccessible() property to determine which of these reasons applies.
	 */
	public get relatedObject () : InteractiveObject{
		console.log("relatedObject not implemented yet in flash/FocusEvent");
		return null;
	}
	public set relatedObject (value:InteractiveObject){
		console.log("relatedObject not implemented yet in flash/FocusEvent");
	}

	/**
	 * Indicates whether the Shift key modifier is activated, in which case the value is
	 * true. Otherwise, the value is false. This property is
	 * used only if the FocusEvent is of type keyFocusChange.
	 */
	public get shiftKey () : boolean{
		console.log("shiftKey not implemented yet in flash/FocusEvent");
		return false;
	}
	public set shiftKey (value:boolean){
		console.log("shiftKey not implemented yet in flash/FocusEvent");
	}
	public clone():Event{
		console.log("clone not implemented yet in flash/IOErrorEvent");
		return null;
	}
	public toString():string{
		console.log("toString not implemented yet in flash/FocusEvent");
		return "";
	}
}
