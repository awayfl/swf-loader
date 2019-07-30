export {Sprite as Shape} from "./Sprite";
/*
import { DisplayObject } from "./DisplayObject";
import { Graphics } from "./Graphics";
import { Sprite } from "./Sprite";
*/
/**
 * This class is used to create lightweight shapes using the ActionScript drawing application program interface (API).
 * The Shape class includes a <codeph class="+ topic/ph pr-d/codeph ">graphics</codeph> property, which lets you access methods from the Graphics class.
 *
 *   <p class="- topic/p ">The Sprite class also includes a <codeph class="+ topic/ph pr-d/codeph ">graphics</codeph>property, and it includes other features not available to the
 * Shape class. For example, a Sprite object is a display object container, whereas a Shape object is not (and cannot contain
 * child display objects). For this reason, Shape objects consume less memory than Sprite objects that contain the
 * same graphics. However, a Sprite object supports user input events, while a Shape object does not.</p>
 */
	/*
export class Shape extends DisplayObject
{
*/
	/**
	 * Creates a new Shape object.
	 */
	/*
	constructor (){
		super(null)//todo;
	}
	*/
	/**
	 * Specifies the Graphics object belonging to this Shape object, where vector
	 * drawing commands can occur.
	 */
/*
	public get graphics () : Graphics{
		console.log("graphics not implemented yet in flash/Shape");
		return null;
	}
}
*/