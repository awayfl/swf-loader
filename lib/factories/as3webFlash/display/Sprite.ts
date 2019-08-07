import {Sprite as AwaySprite} from "@awayjs/scene";
import {DisplayObjectContainer} from "./DisplayObjectContainer";
import {DisplayObject} from "./DisplayObject";
import {Rectangle} from "@awayjs/core";
import {Graphics} from "./Graphics";
import { constructClassFromSymbol } from '../../flash/constructClassFromSymbol';
import { ASObject } from '../../avm2/nat/ASObject';
import { AXSecurityDomain } from '../../avm2/run/AXSecurityDomain';
export class  Sprite extends DisplayObjectContainer
{

	private static _sprites:Array<Sprite> = new Array<Sprite>();

	public static getNewSprite(adaptee:AwaySprite):Sprite
	{
		if (Sprite._sprites.length) {
			var sprite:Sprite = Sprite._sprites.pop();
			sprite.adaptee = adaptee;
			return sprite;
		}

		return new Sprite(adaptee);
	}

	/**
	 * The Sprite class is a basic display list building block: a display list node that can display
	 * graphics and can also contain children.
	 *
	 *   <p class="- topic/p ">A Sprite object is similar to a movie clip, but does not have a timeline. Sprite is an
	 * appropriate base class for objects that do not require timelines. For example, Sprite would be a
	 * logical base class for user numbererface (UI) components that typically do not use the timeline.</p><p class="- topic/p ">The Sprite class is new in ActionScript 3.0. It provides an alternative to the functionality of
	 * the MovieClip class, which retains all the functionality of previous ActionScript releases to
	 * provide backward compatibility.</p>
	 *
	 * Creates a new Sprite instance. After you create the Sprite instance, call the
	 * DisplayObjectContainer.addChild() or DisplayObjectContainer.addChildAt()
	 * method to add the Sprite to a parent DisplayObjectContainer.
	 */
	constructor(adaptee:AwaySprite = null)
	{
		if(adaptee && adaptee.graphics.adapter==adaptee.graphics){
			adaptee.graphics.adapter=new AXSecurityDomain.instance.flash.display.Graphics(adaptee.graphics);
		}
		super(adaptee || AwaySprite.getNewSprite(new AXSecurityDomain.instance.flash.display.Graphics().adaptee));
	}

	//---------------------------stuff added to make it work:


	public clone():Sprite
	{

		if(!(<any>this)._symbol){
			throw("_symbol not defined when cloning movieclip")
		}
		//var clone: MovieClip = MovieClip.getNewMovieClip(AwayMovieClip.getNewMovieClip((<AwayMovieClip>this.adaptee).timeline));
		var clone=constructClassFromSymbol((<any>this)._symbol, (<any>this)._symbol.symbolClass);
		clone.axInitializer();
		this.adaptee.copyTo(clone.adaptee);
		clone.adaptee.graphics=this.graphics;
		return clone;
	}

	/**
	 * @inheritDoc
	 */
	public dispose():void
	{
		this.disposeValues();

		Sprite._sprites.push(this);
	}

	//---------------------------original as3 properties / methods:

	/**
	 * Specifies the button mode of this sprite. If true, this
	 * sprite behaves as a button, which means that it triggers the display
	 * of the hand cursor when the ponumberer passes over the sprite and can
	 * receive a click event if the enter or space keys are pressed
	 * when the sprite has focus. You can suppress the display of the hand cursor
	 * by setting the useHandCursor property to false,
	 * in which case the ponumberer is displayed.
	 *
	 *   Although it is better to use the SimpleButton class to create buttons,
	 * you can use the buttonMode property to give a sprite
	 * some button-like functionality. To include a sprite in the tab order,
	 * set the tabEnabled property (inherited from the
	 * numbereractiveObject class and false by default) to
	 * true. Additionally, consider whether you want
	 * the children of your sprite to be user input enabled. Most buttons
	 * do not enable user input numbereractivity for their child objects because
	 * it confuses the event flow. To disable user input numbereractivity for all child
	 * objects, you must set the mouseChildren property (inherited
	 * from the DisplayObjectContainer class) to false.If you use the buttonMode property with the MovieClip class (which is a
	 * subclass of the Sprite class), your button might have some added
	 * functionality. If you include frames labeled _up, _over, and _down,
	 * Flash Player provides automatic state changes (functionality
	 * similar to that provided in previous versions of ActionScript for movie
	 * clips used as buttons). These automatic state changes are
	 * not available for sprites, which have no timeline, and thus no frames
	 * to label.
	 */
	public get buttonMode () : boolean{
		//todo
		console.log("buttonMode not implemented yet in flash/Sprite");
		return false;
	}
	public set buttonMode (value:boolean) {
		//todo
		console.log("buttonMode not implemented yet in flash/Sprite");
	}

	/**
	 * Specifies the display object over which the sprite is being dragged, or on
	 * which the sprite was dropped.
	 */
	public get dropTarget () : DisplayObject{
		//todo
		console.log("dropTarget not implemented yet in flash/Sprite");
		return null;
		
	}

	/**
	 * Specifies the Graphics object that belongs to this sprite where vector
	 * drawing commands can occur.
	 */
	public get graphics () : Graphics
	{
		return <Graphics>(<AwaySprite>this._adaptee).graphics.adapter;
	}

	/**
	 * Designates another sprite to serve as the hit area for a sprite. If the hitArea
	 * property does not exist or the value is null or undefined, the
	 * sprite itself is used as the hit area. The value of the hitArea property can
	 * be a reference to a Sprite object.
	 *
	 *   You can change the hitArea property at any time; the modified sprite immediately
	 * uses the new hit area behavior. The sprite designated as the hit area does not need to be
	 * visible; its graphical shape, although not visible, is still detected as the hit area.Note: You must set to false the mouseEnabled
	 * property of the sprite designated as the hit area. Otherwise, your sprite button might
	 * not work because the sprite designated as the hit area receives the user input events instead
	 * of your sprite button.
	 */
	public get hitArea () : Sprite{
		//todo
		console.log("hitArea not implemented yet in flash/Sprite");
		return null;
	}
	public set hitArea (value:Sprite){
		//todo
		console.log("hitArea not implemented yet in flash/Sprite");
	}

	/**
	 * Controls sound within this sprite.
	 *
	 *   Note: This property does not affect HTML content in an HTMLControl object (in Adobe AIR).
	 */
	public get soundTransform () :any{
		// todo: any = SoundTransform
		console.log("soundTransform not implemented yet in flash/Sprite");
		return null;
	}
	public set soundTransform (sndTransform:any){
		//todo
		console.log("soundTransform not implemented yet in flash/Sprite");
	}

	/**
	 * A boolean value that indicates whether the ponumbering hand (hand cursor) appears when the ponumberer rolls
	 * over a sprite in which the buttonMode property is set to true.
	 * The default value of the useHandCursor property is true.
	 * If useHandCursor is set to true, the ponumbering hand used for buttons
	 * appears when the ponumberer rolls over a button sprite. If useHandCursor is
	 * false, the arrow ponumberer is used instead.
	 *
	 *   You can change the useHandCursor property at any time; the modified sprite
	 * immediately takes on the new cursor appearance. Note: In Flex or Flash Builder, if your sprite has child sprites, you might want to
	 * set the mouseChildren property to false. For example, if you want a hand
	 * cursor to appear over a Flex <mx:Label> control, set the useHandCursor and
	 * buttonMode properties to true, and the mouseChildren property
	 * to false.
	 */
	public get useHandCursor () : boolean{
		//todo
		console.log("useHandCursor not implemented yet in flash/Sprite");
		return false;
	}
	public set useHandCursor (value:boolean){
		//todo
		console.log("useHandCursor not implemented yet in flash/Sprite");
	}

	/**
	 * Lets the user drag the specified sprite. The sprite remains draggable until explicitly
	 * stopped through a call to the Sprite.stopDrag() method, or until
	 * another sprite is made draggable. Only one sprite is draggable at a time.
	 * Three-dimensional display objects follow the ponumberer and
	 * Sprite.startDrag() moves the object within
	 * the three-dimensional plane defined by the display object. Or, if the display object is a two-dimensional object
	 * and the child of a three-dimensional object, the two-dimensional object
	 * moves within the three dimensional plane defined by the three-dimensional parent object.
	 * @param	lockCenter	Specifies whether the draggable sprite is locked to the center of
	 *   the ponumberer position (true), or locked to the ponumber where the user first clicked the
	 *   sprite (false).
	 * @param	bounds	Value relative to the coordinates of the Sprite's parent that specify a constranumber
	 *   rectangle for the Sprite.
	 */
	public startDrag (lockCenter:boolean=false, bounds:Rectangle=null) {
		//todo
		console.log("startDrag not implemented yet in flash/Sprite");
	}

	/**
	 * Lets the user drag the specified sprite on a touch-enabled device. The sprite remains draggable until explicitly
	 * stopped through a call to the Sprite.stopTouchDrag() method, or until
	 * another sprite is made draggable. Only one sprite is draggable at a time.
	 * Three-dimensional display objects follow the ponumberer and
	 * Sprite.startTouchDrag() moves the object within
	 * the three-dimensional plane defined by the display object. Or, if the display object is a two-dimensional object
	 * and the child of a three-dimensional object, the two-dimensional object
	 * moves within the three dimensional plane defined by the three-dimensional parent object.
	 * @param	touchPonumberID	An numbereger to assign to the touch ponumber.
	 * @param	lockCenter	Specifies whether the draggable sprite is locked to the center of
	 *   the ponumberer position (true), or locked to the ponumber where the user first clicked the
	 *   sprite (false).
	 * @param	bounds	Value relative to the coordinates of the Sprite's parent that specify a constranumber
	 *   rectangle for the Sprite.
	 */
	public startTouchDrag (touchPonumberID:number, lockCenter:boolean=false, bounds:Rectangle=null) {
		//todo
		console.log("startTouchDrag not implemented yet in flash/Sprite");
	}

	/**
	 * Ends the startDrag() method. A sprite that was made draggable with the
	 * startDrag() method remains draggable until a
	 * stopDrag() method is added, or until another
	 * sprite becomes draggable. Only one sprite is draggable at a time.
	 */
	public stopDrag () {
		//todo
		console.log("startTouchDrag not implemented yet in flash/Sprite");
	}

	/**
	 * Ends the startTouchDrag() method, for use with touch-enabled devices. A sprite that was made draggable with the
	 * startTouchDrag() method remains draggable until a
	 * stopTouchDrag() method is added, or until another
	 * sprite becomes draggable. Only one sprite is draggable at a time.
	 * @param	touchPonumberID	The numbereger assigned to the touch ponumber in the startTouchDrag method.
	 */
	public stopTouchDrag (touchPonumberID:number) {
		//todo
		console.log("startTouchDrag not implemented yet in flash/Sprite");
	}

}