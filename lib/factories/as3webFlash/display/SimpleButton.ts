import { InteractiveObject } from "./InteractiveObject";

import { DisplayObject } from "./DisplayObject";
import {SoundTransform} from "../media/SoundTransform";
import { MovieClip } from './MovieClip';
import { FrameScriptManager } from '@awayjs/scene';

/**
 * The SimpleButton class lets you control all instances of button symbols in a SWF
 * file.
 *
 *   <p class="- topic/p ">In Flash Professional, you can give a button an instance name in the
 * Property inspector. SimpleButton instance names are displayed in the Movie
 * Explorer and in the Insert Target Path dialog box in the Actions
 * panel. After you create an instance of a button in Flash Professional, you can
 * use the methods and properties of the SimpleButton class to manipulate buttons
 * with ActionScript.</p><p class="- topic/p ">In ActionScript 3.0, you use the <codeph class="+ topic/ph pr-d/codeph ">new SimpleButton()</codeph> constructor to create a
 * SimpleButton instance.</p><p class="- topic/p ">The SimpleButton class inherits from the InteractiveObject class.</p>
 *
 *   EXAMPLE:
 *
 *   The following example uses the SimpleButtonExample class, which in
 * turn uses the CustomSimpleButton class, and this class then instantiates four
 * ButtonDisplayState objects.  The result is a button that is created in the shape of
 * a square, whose background color changes based on the mouse state by overriding instance properties of
 * the SimpleButton class.  This is accomplished by performing the following steps:
 * <ol class="- topic/ol "><li class="- topic/li ">In the <codeph class="+ topic/ph pr-d/codeph ">SimpleButtonExample()</codeph> constructor, a new CustomSimpleButton object of type
 * SimpleButton, called <codeph class="+ topic/ph pr-d/codeph ">button</codeph>, is created, which calls the <codeph class="+ topic/ph pr-d/codeph ">CustomSimpleButton</codeph> constructor
 * method.  The <codeph class="+ topic/ph pr-d/codeph ">button</codeph> object is the added to the display list.  The button's color and size are
 * determined in the steps that follow.</li><li class="- topic/li ">In the CustomSimpleButton class, instance properties are declared that are later used
 * to control the size and background color of <codeph class="+ topic/ph pr-d/codeph ">button</codeph>, based on the state it is in (orange
 * in the normal state, dark yellow in the mouse over state, an light blue in the mouse down state).
 * In all of the <codeph class="+ topic/ph pr-d/codeph ">button</codeph>'s states, the size of the square is set to 80 pixels by using the
 * <codeph class="+ topic/ph pr-d/codeph ">size</codeph> property.</li><li class="- topic/li ">The constructor function for the CustomSimpleButton class sets the
 * <codeph class="+ topic/ph pr-d/codeph ">downState</codeph>, <codeph class="+ topic/ph pr-d/codeph ">overState</codeph>, <codeph class="+ topic/ph pr-d/codeph ">upState</codeph>,
 * <codeph class="+ topic/ph pr-d/codeph ">hitTestState</codeph>, and <codeph class="+ topic/ph pr-d/codeph ">useHandCursor</codeph> properties with
 * four instances of the ButtonDisplayState class.</li><li class="- topic/li ">In the ButtonDisplayState class, the constructor sets the value of the
 * square's size and background color and calls the <codeph class="+ topic/ph pr-d/codeph ">draw()</codeph> method.</li><li class="- topic/li ">The <codeph class="+ topic/ph pr-d/codeph ">draw()</codeph> method redraws the square with the size and background color set in
 * the constructor based on the button's state.</li></ol><codeblock xml:space="preserve" class="+ topic/pre pr-d/codeblock ">

 */
export class SimpleButton extends MovieClip
{
	/**
	 * Creates a new SimpleButton instance. Any or all of the display objects that represent
	 * the various button states can be set as parameters in the constructor.
	 * @param	upState	The initial value for the SimpleButton up state.
	 * @param	overState	The initial value for the SimpleButton over state.
	 * @param	downState	The initial value for the SimpleButton down state.
	 * @param	hitTestState	The initial value for the SimpleButton hitTest state.
	 */
	constructor (upState:DisplayObject=null, overState:DisplayObject=null, downState:DisplayObject=null, hitTestState:DisplayObject=null){
		super();
	}

	// for AVM1:
	public buttonMode:any;

	public initAdapter(): void {
		
		if ((<any>this).executeConstructor) {
			FrameScriptManager.queue_as3_constructor(<any>this.adaptee);
		}

	}
	public registerScriptObject(child: any): void {
	}

	public unregisterScriptObject(child: any): void {
	}


	/**
	 * Specifies a display object that is used as the visual
	 * object for the button "Down" state —the state that the button is in when the user
	 * selects the hitTestState object.
	 */
	public get downState () : DisplayObject{
		console.log("downState not implemented yet in flash/SimpleButton");
		return null;

	}
	public set downState (value:DisplayObject){
		console.log("downState not implemented yet in flash/SimpleButton");

	}

	/**
	 * A Boolean value that specifies whether a button is enabled. When a
	 * button is disabled (the enabled property is set to false),
	 * the button is visible but cannot be clicked. The default value is
	 * true. This property is useful if you want to
	 * disable part of your navigation; for example, you might want to disable a
	 * button in the currently displayed page so that it can't be clicked and
	 * the page cannot be reloaded.
	 *
	 *   Note: To prevent mouseClicks on a button, set both the enabled
	 * and mouseEnabled properties to false.
	 */
	public get enabled () : boolean{
		console.log("enabled not implemented yet in flash/SimpleButton");
		return false;

	}
	public set enabled (value:boolean){
		console.log("enabled not implemented yet in flash/SimpleButton");

	}

	/**
	 * Specifies a display object that is used as the hit testing object for the button. For a basic button, set the
	 * hitTestState property to the same display object as the overState
	 * property. If you do not set the hitTestState property, the SimpleButton
	 * is inactive — it does not respond to user input events.
	 */
	public get hitTestState () : DisplayObject{
		console.log("hitTestState not implemented yet in flash/SimpleButton");
		return null;

	}
	public set hitTestState (value:DisplayObject){
		console.log("hitTestState not implemented yet in flash/SimpleButton");

	}

	/**
	 * Specifies a display object that is used as the visual
	 * object for the button over state — the state that the button is in when
	 * the pointer is positioned over the button.
	 */
	public get overState () : DisplayObject{
		console.log("overState not implemented yet in flash/SimpleButton");
		return null;

	}
	public set overState (value:DisplayObject){
		console.log("overState not implemented yet in flash/SimpleButton");

	}

	/**
	 * The SoundTransform object assigned to this button. A SoundTransform object
	 * includes properties for setting volume, panning, left speaker assignment, and right
	 * speaker assignment. This SoundTransform object applies to all states of the button.
	 * This SoundTransform object affects only embedded sounds.
	 * @internal	Should information from AS2 setTransform be here? e.g. percentage values indicating
	 *   how much of the left input to play in the left speaker or right speaker; it is generally
	 *   best to use 22-KHZ 6-bit mono sounds?
	 */
	public get soundTransform () : SoundTransform{
		console.log("soundTransform not implemented yet in flash/SimpleButton");
		return null;

	}
	public set soundTransform (sndTransform:SoundTransform){
		console.log("soundTransform not implemented yet in flash/SimpleButton");

	}

	/**
	 * Indicates whether other display objects that are SimpleButton or MovieClip objects can receive
	 * user input release events. The trackAsMenu property lets you create menus. You
	 * can set the trackAsMenu property on any SimpleButton or MovieClip object.
	 * If the trackAsMenu property does not exist, the default behavior is
	 * false.
	 *
	 *   You can change the trackAsMenu property at any time; the
	 * modified button immediately takes on the new behavior.
	 */
	public get trackAsMenu () : boolean{
		console.log("trackAsMenu not implemented yet in flash/SimpleButton");
		return false;

	}
	public set trackAsMenu (value:boolean){
		console.log("trackAsMenu not implemented yet in flash/SimpleButton");

	}

	/**
	 * Specifies a display object that is used as the visual
	 * object for the button up state — the state that the button is in when
	 * the pointer is not positioned over the button.
	 */
	public get upState () : DisplayObject{
		console.log("upState not implemented yet in flash/SimpleButton");
		return null;

	}
	public set upState (value:DisplayObject){
		console.log("upState not implemented yet in flash/SimpleButton");

	}

	/**
	 * A Boolean value that, when set to true, indicates whether
	 * the hand cursor is shown when the pointer rolls over a button.
	 * If this property is set to false, the arrow pointer cursor is displayed
	 * instead. The default is true.
	 *
	 *   You can change the useHandCursor property at any time;
	 * the modified button immediately uses the new cursor behavior.
	 * @maelexample	Create two buttons on the Stage with the instance names <code>myBtn1_btn</code> and <code>myBtn2_btn</code>. Enter the following ActionScript in Frame 1 of the Timeline:
	 *   <listing>
	 *   myBtn1_btn.useHandCursor = false;
	 *   myBtn1_btn.onRelease = buttonClick;
	 *   myBtn2_btn.onRelease = buttonClick;
	 *   function buttonClick() {
		 *   trace(this._name);
		 *   }
	 *   </listing><p class="- topic/p ">When the mouse is over and clicks <code>myBtn1_btn</code>, there is no pointing hand. However, you see the pointing hand when the button is over and clicks <code>myBtn2_btn</code>.</p>
	 */
	public get useHandCursor () : boolean{
		console.log("useHandCursor not implemented yet in flash/SimpleButton");
		return false;
	}
	public set useHandCursor (value:boolean){
		console.log("useHandCursor not implemented yet in flash/SimpleButton");
	}


}

