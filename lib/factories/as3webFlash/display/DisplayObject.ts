import {Transform, Point, Box, ColorTransform, Vector3D, Rectangle, AbstractMethodError} from "@awayjs/core";
import {EventDispatcher} from "../events/EventDispatcher";
import {Event} from "../events/Event";
import {DisplayObject as AwayDisplayObject, IDisplayObjectAdapter} from "@awayjs/scene";
import {LoaderInfo} from "./LoaderInfo";
import {DisplayObjectContainer} from "./DisplayObjectContainer";
import {Stage} from "./Stage";
import { PickGroup, BasicPartition } from '@awayjs/view';
import { SceneGraphPartition } from '@awayjs/scene';
import { constructClassFromSymbol } from '../../flash/constructClassFromSymbol';
import { AXClass } from '../../avm2/run/AXClass';

export class DisplayObject extends EventDispatcher implements IDisplayObjectAdapter
{
	static axClass: typeof DisplayObject & AXClass;

	//for AVM1:
	public _parent:any;
	public _depth:number;


	protected _loaderInfo:LoaderInfo;
	public _blockedByScript:boolean;
    public _ctBlockedByScript:boolean;
    //public protoTypeChanged:boolean;
    protected _visibilityByScript:boolean;

	public applySymbol(){

	}
	protected _adaptee:AwayDisplayObject;
	/**
	 *
	 *
	 * these events are handled from DisplayObjectContainer.
	 * nothing really to much needs to be cnnected to awayjs.
	 *
	 * [broadcast event] Dispatched when the playhead is entering a new
	 * frame.
	 * @eventType	flash.events.Event.ENTER_FRAME
	 [Event(name="enterFrame", type="flash.events.Event")]

	 * [broadcast event] Dispatched after the constructors of frame displayobjects have run but before frame scripts have run.
	 * @eventType	flash.events.Event.FRAME_CONSTRUCTED
	 [Event(name="frameConstructed", type="flash.events.Event")]

	 * [broadcast event] Dispatched when the playhead is exiting the current frame.
	 * @eventType	flash.events.Event.EXIT_FRAME
	 [Event(name="exitFrame", type="flash.events.Event")]

	 * [broadcast event] Dispatched when the display list is about to be updated and rendered.
	 * @eventType	flash.events.Event.RENDER
	 [Event(name="render", type="flash.events.Event")]
	 
	 * Dispatched when a displayobject is about to be removed from the display list,
	 * either directly or through the removal of a sub tree in which the displayobject is contained.
	 * @eventType	flash.events.Event.REMOVED_FROM_STAGE
	 [Event(name="removedFromStage", type="flash.events.Event")]

	 * Dispatched when a displayobject is about to be removed from the display list.
	 * @eventType	flash.events.Event.REMOVED
	 [Event(name="removed", type="flash.events.Event")]

	 * Dispatched when a displayobject is added to the on stage display list,
	 * either directly or through the addition of a sub tree in which the displayobject is contained.
	 * @eventType	flash.events.Event.ADDED_TO_STAGE
	 [Event(name="addedToStage", type="flash.events.Event")]

	 * Dispatched when a displayobject is added to the display list.
	 * @eventType	flash.events.Event.ADDED
	 [Event(name="added", type="flash.events.Event")]

	 * The DisplayObject class is the base class for all anys that can be placed on
	 * the display list. The display list manages all anys displayed in the Flash runtimes.
	 * Use the DisplayObjectContainer class to arrange the displayobjects in the display list.
	 * DisplayObjectContainer anys can have child displayobjects, while other displayobjects, such as
	 * Shape and TextField anys, are "leaf" nodes that have only parents and siblings, no children.
	 *
	 *   <p class="- topic/p ">The DisplayObject class supports basic ality like the <i class="+ topic/ph hi-d/i ">x</i> and <i class="+ topic/ph hi-d/i ">y</i> position of
	 * an any, as well as more advanced properties of the any such as its transformation matrix.
	 * </p><p class="- topic/p ">DisplayObject is an abstract base class; therefore, you cannot call DisplayObject directly. Invoking
	 * <codeph class="+ topic/ph pr-d/codeph ">new DisplayObject()</codeph> console.logs an <codeph class="+ topic/ph pr-d/codeph ">ArgumentError</codeph> exception. </p><p class="- topic/p ">All displayobjects inherit from the DisplayObject class.</p><p class="- topic/p ">The DisplayObject class itself does not include any APIs for rendering content onscreen.
	 * For that reason, if you want create a custom subclass of the DisplayObject class, you will want
	 * to extend one of its subclasses that do have APIs for rendering content onscreen,
	 * such as the Shape, Sprite, Bitmap, SimpleButton, TextField, or MovieClip class.</p><p class="- topic/p ">The DisplayObject class contains several broadcast events. Normally, the target
	 * of any particular event is a specific DisplayObject instance. For example,
	 * the target of an <codeph class="+ topic/ph pr-d/codeph ">added</codeph> event is the specific DisplayObject instance
	 * that was added to the display list. Having a single target restricts the placement of
	 * event listeners to that target and in some cases the target's ancestors on the display list.
	 * With broadcast events, however, the target is not a specific DisplayObject instance,
	 * but rather all DisplayObject instances, including those that are not on the display list.
	 * This means that you can add a listener to any DisplayObject instance to listen for broadcast events.
	 * In addition to the broadcast events listed in the DisplayObject class's Events table,
	 * the DisplayObject class also inherits two broadcast events from the EventDispatcher
	 * class: <codeph class="+ topic/ph pr-d/codeph ">activate</codeph> and <codeph class="+ topic/ph pr-d/codeph ">deactivate</codeph>.</p><p class="- topic/p ">Some properties previously used in the ActionScript 1.0 and 2.0 MovieClip, TextField, and Button
	 * classes (such as <codeph class="+ topic/ph pr-d/codeph ">_alpha</codeph>, <codeph class="+ topic/ph pr-d/codeph ">_height</codeph>, <codeph class="+ topic/ph pr-d/codeph ">_name</codeph>, <codeph class="+ topic/ph pr-d/codeph ">_width</codeph>,
	 * <codeph class="+ topic/ph pr-d/codeph ">_x</codeph>, <codeph class="+ topic/ph pr-d/codeph ">_y</codeph>, and others) have equivalents in the ActionScript 3.0
	 * DisplayObject class that are renamed so that they no longer begin with the underscore (_) character.</p><p class="- topic/p ">For more information, see the "Display Programming" chapter of the <i class="+ topic/ph hi-d/i ">ActionScript 3.0 Developer's Guide</i>.</p>

	 */

	constructor(adaptee:AwayDisplayObject = null)
	{
		super();

		this._blockedByScript=false;
		this._ctBlockedByScript=false;
		this._visibilityByScript=false;
		
		this.adaptee = adaptee || new AwayDisplayObject();

		// needed, because `this.stage` must already be available when constructor of extending classes are executed
		this._stage=this.activeStage;

		// no eventMapping needed for the DisplayObject-events.
		// they can all be dispatched without listening on other objects
		// still need to create a dummy mapping with empty message, in order to have them registered
		// (we want unknown events to fail when they try to register in addEventListener
		this.eventMappingExtern[Event.ENTER_FRAME]="";
		this.eventMappingExtern[Event.FRAME_CONSTRUCTED]="";
		this.eventMappingExtern[Event.EXIT_FRAME]="";
		this.eventMappingExtern[Event.RENDER]="";
		//this.eventMappingExtern[Event.REMOVED_FROM_STAGE]="";
		this.eventMappingExtern[Event.REMOVED]="";
		//this.eventMappingExtern[Event.ADDED_TO_STAGE]="";
		this.eventMappingExtern[Event.ADDED]="";
	}



	//---------------------------stuff added to make it work:


	protected _stage:Stage;


	public static _activeStage:Stage=null;

	public get activeStage():any
	{
		if(this.sec.flash.display.DisplayObject.axClass._activeStage==null){
			//console.log("ERROR: a Stage must have been created before any Sprite can be created!")
		}
		return this.sec.flash.display.DisplayObject.axClass._activeStage;
	}

	//		use to dispatch events on a object and all its childs
	//		overwritten in DisplayObjectContainer to work recursivly on children
	// 		used for:
	// 		- ENTER_FRAME
	// 		- FRAME_CONSTRUCTED
	// 		- EXIT_FRAME
	//		- RENDER
	//		- REMOVED_FROM_STAGE
	//		- ADDED_TO_STAGE
	
	public dispatchEventRecursive(event:Event) {	this.dispatchEvent(event);	}



	// --------------------- stuff needed because of implementing the existing IDisplayObjectAdapter

	public get adaptee():AwayDisplayObject
	{
		return this._adaptee;
	}

	public set adaptee(value:AwayDisplayObject)
	{
		if (this._adaptee == value)
			return;

		if (this._adaptee)
			this._adaptee.adapter = null;

		this._adaptee = value;

		if (this._adaptee) {
			if (!this._adaptee.partition)
				this._adaptee.partition = new SceneGraphPartition(this._adaptee);
			this._adaptee.adapter = this;
		}
		
	}

	public doInitEvents():void
	{

	}

	public isBlockedByScript():boolean
	{
		//console.log("isBlockedByScript not implemented yet in flash/DisplayObject");
		return this._blockedByScript;
	}

	public isVisibilityByScript():boolean
	{
		//console.log("isVisibilityByScript not implemented yet in flash/DisplayObject");
		return this._visibilityByScript;
	}
	public isColorTransformByScript():boolean
	{
		//console.log("isVisibilityByScript not implemented yet in flash/DisplayObject");
		return this._ctBlockedByScript;
	}

	public freeFromScript():void
	{
		//console.log("freeFromScript not implemented yet in flash/DisplayObject");
		this._blockedByScript=false;
		this._ctBlockedByScript=false;
		this._visibilityByScript=false;
	}

	public clone():DisplayObject
	{
		if(!(<any>this)._symbol){
			throw("_symbol not defined when cloning movieclip")
		}
		//var clone: MovieClip = MovieClip.getNewMovieClip(AwayMovieClip.getNewMovieClip((<AwayMovieClip>this.adaptee).timeline));
		var clone=constructClassFromSymbol((<any>this)._symbol, (<any>this)._symbol.symbolClass);
		clone.axInitializer();
		this.adaptee.copyTo(clone.adaptee);
		return clone;
	}

	public dispose():void
	{
		throw new AbstractMethodError();
	}
	
	/**
	 * @inheritDoc
	 */
	public disposeValues():void
	{
		this.adaptee = null;
	}

	//---------------------------original as3 properties / methods:


	/**
	 * The current accessibility options for this displayobject. If you modify the accessibilityProperties
	 * property or any of the fields within accessibilityProperties, you must call
	 * the Accessibility.updateProperties() method to make your changes take effect.
	 *
	 *   Note: For an any created in the Flash authoring environment, the value of accessibilityProperties
	 * is prepopulated with any information you entered in the Accessibility panel for
	 * that any.
	 */
	public get accessibilityProperties () : any{
		console.log("accessibilityProperties not implemented yet in flash/DisplayObject");
		//todo: flash.accessibility.AccessibilityProperties
		return null;
	}
	public set accessibilityProperties (value:any){
		console.log("accessibilityProperties not implemented yet in flash/DisplayObject");
	}

	/**
	 * Indicates the alpha transparency value of the any specified.
	 * Valid values are 0 (fully transparent) to 1 (fully opaque).
	 * The default value is 1. displayobjects with alpha
	 * set to 0 are active, even though they are invisible.
	 */
	public get alpha () : number {
		return this.adaptee.alpha;
	}
	public set alpha (value:number) {
		this._ctBlockedByScript=true;
		this.adaptee.alpha=value;
	}

	/**
	 * A value from the BlendMode class that specifies which blend mode to use.
	 * A bitmap can be drawn internally in two ways. If you have a blend mode enabled or an
	 * external clipping mask, the bitmap is drawn by adding a bitmap-filled square shape to the vector
	 * render. If you attempt to set this property to an invalid value, Flash runtimes set the value
	 * to BlendMode.NORMAL.
	 *
	 *   The blendMode property affects each pixel of the displayobject.
	 * Each pixel is composed of three constituent
	 * colors (red, green, and blue), and each constituent color has a value between 0x00 and 0xFF.
	 * Flash Player or Adobe AIR compares each constituent color of one pixel in the movie clip with
	 * the corresponding color of the pixel in the background. For example, if blendMode
	 * is set to BlendMode.LIGHTEN, Flash Player or Adobe AIR compares the red value of the displayobject with
	 * the red value of the background, and uses the lighter of the two as the
	 * value for the red component of the displayed color.The following table describes the blendMode settings.
	 * The BlendMode class defines string values you can use.
	 * The illustrations in the table show blendMode values applied to a circular
	 * displayobject (2) superimposed on another displayobject (1).BlendMode ConstantIllustrationDescriptionBlendMode.NORMALThe displayobject appears in front of the background. Pixel values of the displayobject
	 * override those of the background. Where the displayobject is transparent, the background is
	 * visible.BlendMode.LAYERForces the creation of a transparency group for the displayobject. This means that the display
	 * any is pre-composed in a temporary buffer before it is processed further. This is done
	 * automatically if the displayobject is pre-cached using bitmap caching or if the displayobject is
	 * a displayobject container with at least one child any with a blendMode
	 * setting other than BlendMode.NORMAL. Not supported under GPU rendering.
	 * BlendMode.MULTIPLYMultiplies the values of the displayobject constituent colors by the colors of the background color,
	 * and then normalizes by dividing by 0xFF,
	 * resulting in darker colors. This setting is commonly used for shadows and depth effects.
	 *
	 *   For example, if a constituent color (such as red) of one pixel in the displayobject and the
	 * corresponding color of the pixel in the background both have the value 0x88, the multiplied
	 * result is 0x4840. Dividing by 0xFF yields a value of 0x48 for that constituent color,
	 * which is a darker shade than the color of the displayobject or the color of the background.BlendMode.SCREENMultiplies the complement (inverse) of the displayobject color by the complement of the background
	 * color, resulting in a bleaching effect. This setting is commonly used for highlights or to remove black
	 * areas of the displayobject.BlendMode.LIGHTENSelects the lighter of the constituent colors of the displayobject and the color of the background (the
	 * colors with the larger values). This setting is commonly used for superimposing type.
	 *
	 *   For example, if the displayobject has a pixel with an RGB value of 0xFFCC33, and the background
	 * pixel has an RGB value of 0xDDF800, the resulting RGB value for the displayed pixel is
	 * 0xFFF833 (because 0xFF > 0xDD, 0xCC < 0xF8, and 0x33 > 0x00 = 33). Not supported under GPU rendering.BlendMode.DARKENSelects the darker of the constituent colors of the displayobject and the colors of the
	 * background (the colors with the smaller values). This setting is commonly used for superimposing type.
	 *
	 *   For example, if the displayobject has a pixel with an RGB value of 0xFFCC33, and the background
	 * pixel has an RGB value of 0xDDF800, the resulting RGB value for the displayed pixel is
	 * 0xDDCC00 (because 0xFF > 0xDD, 0xCC < 0xF8, and 0x33 > 0x00 = 33). Not supported under GPU rendering.BlendMode.DIFFERENCECompares the constituent colors of the displayobject with the colors of its background, and subtracts
	 * the darker of the values of the two constituent colors from the lighter value. This setting is commonly
	 * used for more vibrant colors.
	 *
	 *   For example, if the displayobject has a pixel with an RGB value of 0xFFCC33, and the background
	 * pixel has an RGB value of 0xDDF800, the resulting RGB value for the displayed pixel is
	 * 0x222C33 (because 0xFF - 0xDD = 0x22, 0xF8 - 0xCC = 0x2C, and 0x33 - 0x00 = 0x33).BlendMode.ADDAdds the values of the constituent colors of the displayobject to the colors of its background, applying a
	 * ceiling of 0xFF. This setting is commonly used for animating a lightening dissolve between
	 * two anys.
	 *
	 *   For example, if the displayobject has a pixel with an RGB value of 0xAAA633, and the background
	 * pixel has an RGB value of 0xDD2200, the resulting RGB value for the displayed pixel is
	 * 0xFFC833 (because 0xAA + 0xDD > 0xFF, 0xA6 + 0x22 = 0xC8, and 0x33 + 0x00 = 0x33).BlendMode.SUBTRACTSubtracts the values of the constituent colors in the displayobject from the values of the
	 * background color, applying a floor of 0. This setting is commonly used for animating a
	 * darkening dissolve between two anys.
	 *
	 *   For example, if the displayobject has a pixel with an RGB value of 0xAA2233, and the background
	 * pixel has an RGB value of 0xDDA600, the resulting RGB value for the displayed pixel is
	 * 0x338400 (because 0xDD - 0xAA = 0x33, 0xA6 - 0x22 = 0x84, and 0x00 - 0x33 < 0x00).BlendMode.INVERTInverts the background.BlendMode.ALPHAApplies the alpha value of each pixel of the displayobject to the background.
	 * This requires the blendMode setting of the parent displayobject to be set to
	 * BlendMode.LAYER.
	 * For example, in the illustration, the parent displayobject, which is a white background,
	 * has blendMode = BlendMode.LAYER. Not supported under GPU rendering.BlendMode.ERASEErases the background based on the alpha value of the displayobject. This requires the
	 * blendMode of the parent displayobject to be set to
	 * BlendMode.LAYER. For example, in the
	 * illustration, the parent displayobject, which is a white background, has
	 * blendMode = BlendMode.LAYER. Not supported under GPU rendering.BlendMode.OVERLAYAdjusts the color of each pixel based on the darkness of the background.
	 * If the background is lighter than 50% gray, the displayobject and background colors are
	 * screened, which results in a lighter color. If the background is darker than 50% gray,
	 * the colors are multiplied, which results in a darker color.
	 * This setting is commonly used for shading effects. Not supported under GPU rendering.BlendMode.HARDLIGHTAdjusts the color of each pixel based on the darkness of the displayobject.
	 * If the displayobject is lighter than 50% gray, the displayobject and background colors are
	 * screened, which results in a lighter color. If the displayobject is darker than 50% gray,
	 * the colors are multiplied, which results in a darker color.
	 * This setting is commonly used for shading effects. Not supported under GPU rendering.BlendMode.SHADERN/AAdjusts the color using a custom shader routine. The shader that is used is specified
	 * as the Shader instance assigned to the blendShader property. Setting the
	 * blendShader property of a displayobject to a Shader instance
	 * automatically sets the displayobject's blendMode property to
	 * BlendMode.SHADER. If the blendMode property is set to
	 * BlendMode.SHADER without first setting the blendShader property,
	 * the blendMode property is set to BlendMode.NORMAL. Not supported under GPU rendering.
	 */
	public get blendMode () : string{
		console.log("blendMode not implemented yet in flash/DisplayObject");
		// todo: translate awayblendmode to as3blendmode
		return "";
	}
	public set blendMode (value:string) {
		console.log("blendMode not implemented yet in flash/DisplayObject");
		//this._adaptee.blendMode=value;
	}

	/**
	 * Sets a shader that is used for blending the foreground and background. When the
	 * blendMode property is set to BlendMode.SHADER, the specified
	 * Shader is used to create the blend mode output for the displayobject.
	 *
	 *   Setting the blendShader property of a displayobject to a Shader instance
	 * automatically sets the displayobject's blendMode property to
	 * BlendMode.SHADER. If the blendShader property is set (which sets the
	 * blendMode property to BlendMode.SHADER), then the value of the
	 * blendMode property is changed, the blend mode can be reset to use the blend
	 * shader simply by setting the blendMode property to BlendMode.SHADER.
	 * The blendShader property does not need to be set again except to change the
	 * shader that's used for the blend mode.The Shader assigned to the blendShader property must specify at least two
	 * image4 inputs. The inputs do not need to be specified in code using the
	 * associated ShaderInput anys' input properties. The background displayobject
	 * is automatically
	 * used as the first input (the input with index 0). The foreground displayobject
	 * is used as the second input (the input with index 1). A shader used as a blend
	 * shader can specify more than two inputs. In that case, any additional input must be specified
	 * by setting its ShaderInput instance's input property.When you assign a Shader instance to this property the shader is copied internally. The
	 * blend operation uses that internal copy, not a reference to the original shader. Any changes
	 * made to the shader, such as changing a parameter value, input, or bytecode, are not applied
	 * to the copied shader that's used for the blend mode.
	 * @langversion	3.0
	 * @playerversion	Flash 10
	 * @playerversion	AIR 1.5
	 * @console.logs	ArgumentError When the shader output type is not compatible with this operation
	 *   (the shader must specify a pixel4
	 *   output).
	 * @console.logs	ArgumentError When the shader specifies fewer than two image inputs or the first
	 *   two inputs are not image4 inputs.
	 * @console.logs	ArgumentError When the shader specifies an image input that isn't provided.
	 * @console.logs	ArgumentError When a Byte[] or Vector.<number> instance is used as
	 *   an input and the width
	 *   and height properties aren't specified for the
	 *   ShaderInput, or the specified values don't match the amount of
	 *   data in the input any. See the ShaderInput.input
	 *   property for more information.
	 */
	public set blendShader (value:any) {
		console.log("blendShader not implemented yet in flash/DisplayObject");
		//todo (if ever)
	}

	/**
	 * If set to true, Flash runtimes cache an internal bitmap representation of the
	 * displayobject. This caching can increase performance for displayobjects that contain complex
	 * vector content.
	 *
	 *   All vector data for a displayobject that has a cached bitmap is drawn to the bitmap
	 * instead of the main display. If cacheAsBitmapMatrix is null or unsupported,
	 * the bitmap is then copied to the main display as unstretched, unrotated pixels snapped to
	 * the nearest pixel boundaries. Pixels are mapped 1 to 1 with
	 * the parent any. If the bounds of the bitmap change, the bitmap is recreated instead
	 * of being stretched.If cacheAsBitmapMatrix is non-null and supported, the any is drawn to the off-screen bitmap
	 * using that matrix and the stretched and/or rotated results of that rendering are used
	 * to draw the any to the main display.No internal bitmap is created unless the cacheAsBitmap property is set to
	 * true.After you set the cacheAsBitmap property to true,
	 * the rendering does not change, however the displayobject performs pixel snapping
	 * automatically. The animation speed can be significantly faster depending
	 * on the complexity of the vector content.
	 * The cacheAsBitmap property is automatically set to true
	 * whenever you apply a filter to a displayobject (when its filter [] is not empty),
	 * and if a displayobject has a filter applied to it, cacheAsBitmap is reported as
	 * true for that displayobject, even if you set the property to false.
	 * If you clear all filters for a displayobject, the cacheAsBitmap setting changes to
	 * what it was last set to.A displayobject does not use a bitmap even if the cacheAsBitmap
	 * property is set to true and instead renders from vector data in the following cases:The bitmap is too large.
	 * In  AIR 1.5 and Flash Player 10, the maximum size for a bitmap image is 8,191 pixels in width or height,
	 * and the total number of pixels cannot exceed 16,777,215 pixels. (So, if a bitmap image is 8,191 pixels
	 * wide, it can only be 2,048 pixels high.) In Flash Player 9 and earlier, the limitation is
	 * is 2880 pixels in height and 2,880 pixels in width.The bitmap fails to allocate (out of memory error). The cacheAsBitmap property is best used with movie clips that have
	 * mostly static content and that do not scale and rotate frequently. With such movie
	 * clips, cacheAsBitmap can lead to performance increases when the
	 * movie clip is translated (when its x and y position is changed).
	 */
	public get cacheAsBitmap () : boolean{
		console.log("cacheAsBitmap not implemented yet in flash/DisplayObject");
		return false;
	}
	public set cacheAsBitmap (value:boolean) {
		console.log("cacheAsBitmap not implemented yet in flash/DisplayObject");
	}

	/**
	 * An indexed [] that contains each filter any currently associated with the displayobject.
	 * The flash.filters package contains several classes that define specific filters you can
	 * use.
	 *
	 *   Filters can be applied in Flash Professional at design time, or at run time by using
	 * ActionScript code. To apply a filter by using ActionScript, you must make a temporary copy of the
	 * entire filters [], modify the temporary [], then assign the value
	 * of the temporary [] back to the filters []. You cannot directly
	 * add a new filter any to the filters [].To add a filter by using ActionScript, perform the following steps (assume that the
	 * target displayobject is named myDisplayObject):Create a new filter any by using the constructor method of your chosen filter
	 * class.Assign the value of the myDisplayObject.filters [] to a temporary [], such
	 * as one named myFilters.Add the new filter any to the myFilters temporary [].Assign the value of the temporary [] to the myDisplayObject.filters [].If the filters [] is undefined, you do not need to use a temporary [].
	 * Instead, you can directly assign an [] literal that contains one or more filter anys that
	 * you create. The first example in the Examples section adds a drop shadow filter by using
	 * code that handles both defined and undefined filters []s.To modify an existing filter any,
	 * you must use the technique of modifying a copy of the filters []:Assign the value of the filters [] to a temporary [], such as one
	 * named myFilters.Modify the property by using the temporary [], myFilters. For example,
	 * to set the quality property of the first filter in the [], you could use the
	 * following code: myFilters[0].quality = 1;Assign the value of the temporary [] to the filters [].At load time, if a displayobject has an associated filter, it is marked to cache itself as a
	 * transparent bitmap. From this point forward, as long as the displayobject has a valid filter list,
	 * the player caches the displayobject as a bitmap. This source bitmap is used as a source
	 * image for the filter effects. Each displayobject usually has two bitmaps: one with the
	 * original unfiltered source displayobject and another for the final image after filtering.
	 * The final image is used when rendering. As long as the displayobject does not
	 * change, the final image does not need updating.The flash.filters package includes classes for filters. For example, to create a DropShadow
	 * filter, you would write:
	 * <codeblock>
	 *
	 *   import flash.filters.DropShadowFilter
	 * var myFilter:DropShadowFilter = new DropShadowFilter (distance, angle, color, alpha, blurX, blurY, quality, inner, knockout)
	 *
	 *   </codeblock>
	 * You can use the is operator to determine the type of filter assigned to
	 * each index position in the filter []. For example, the following code shows
	 * how to determine the position of the first filter in the filters [] that
	 * is a DropShadowFilter:
	 *
	 *   <codeblock>
	 *
	 *   import flash.text.TextField;
	 * import flash.filters.~~;
	 * var tf:TextField = new TextField();
	 * var filter1:DropShadowFilter = new DropShadowFilter();
	 * var filter2:GradientGlowFilter = new GradientGlowFilter();
	 * tf.filters = [filter1, filter2];
	 *
	 *   tf.text = "DropShadow index: " + filterPosition(tf, DropShadowFilter).tostring(); // 0
	 * addChild(tf)
	 *
	 *    filterPosition(DisplayObject:DisplayObject, filterClass:Class):int {
		 * for (var i:uint = 0; i < DisplayObject.filters.length; i++) {
		 * if (DisplayObject.filters[i] is filterClass) {
		 * return i;
		 * }
		 * }
		 * return -1;
		 * }
	 *
	 *   </codeblock>
	 * Note: Since you cannot directly add a new filter any to the
	 * DisplayObject.filters [], the following code has no
	 * effect on the target displayobject, named myDisplayObject:
	 * <codeblock>
	 *
	 *   myDisplayObject.filters.push(myDropShadow);
	 *
	 *   </codeblock>
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @console.logs	ArgumentError When filters includes a ShaderFilter and the shader
	 *   output type is not compatible with this operation
	 *   (the shader must specify a pixel4
	 *   output).
	 * @console.logs	ArgumentError When filters includes a ShaderFilter and the shader
	 *   doesn't specify any image input or the first
	 *   input is not an image4 input.
	 * @console.logs	ArgumentError When filters includes a ShaderFilter and the shader
	 *   specifies an image input that isn't provided.
	 * @console.logs	ArgumentError When filters includes a ShaderFilter, a
	 *   Byte[] or Vector.<number> instance as
	 *   a shader input, and the width
	 *   and height properties aren't specified for the
	 *   ShaderInput any, or the specified values don't match the amount of
	 *   data in the input data. See the ShaderInput.input
	 *   property for more information.
	 */
	public get filters () : any[]{
		//console.log("filters not implemented yet in flash/DisplayObject");
		return [];
	}
	public set filters (value:any[]) {
		//console.log("filters not implemented yet in flash/DisplayObject");
	}

	/**
	 * Indicates the height of the displayobject, in pixels. The height is calculated based on the bounds of the content of the displayobject.
	 * When you set the height property, the scaleY property is adjusted accordingly, as shown in the
	 * following code:
	 *
	 *   <codeblock>
	 *
	 *   var rect:Shape = new Shape();
	 * rect.graphics.beginFill(0xFF0000);
	 * rect.graphics.drawRect(0, 0, 100, 100);
	 * trace(rect.scaleY) // 1;
	 * rect.height = 200;
	 * trace(rect.scaleY) // 2;
	 * </codeblock>
	 * Except for TextField and Video anys, a displayobject with no content (such as an empty sprite) has a height
	 * of 0, even if you try to set height to a different value.
	 */
	public get height () : number{

		if(!this._adaptee.partition){
			console.warn("Trying to get Display.height on orphan child!");
			return 100;
		}
		var box:Box = PickGroup.getInstance(this._stage.view).getBoundsPicker(this.adaptee.partition).getBoxBounds(this.adaptee);
		return (box == null)? 0 : box.height;
	}
	public set height (value:number) {
		
		if (isNaN(value))
			return;
		
		if(!this._adaptee.partition){
			console.warn("Trying to set Display.height on orphan child!");
			return;
		}
		PickGroup.getInstance(this._stage.view).getBoundsPicker(this.adaptee.partition).height = value;
	
	}

	/**
	 * Returns a LoaderInfo any containing information about loading the file
	 * to which this displayobject belongs. The loaderInfo property is defined only
	 * for the root displayobject of a SWF file or for a loaded Bitmap (not for a Bitmap that is drawn
	 * with ActionScript). To find the loaderInfo any associated with the SWF file that contains
	 * a displayobject named myDisplayObject, use myDisplayObject.root.loaderInfo.
	 *
	 *   A large SWF file can monitor its download by calling
	 * this.root.loaderInfo.addEventListener(Event.COMPLETE, func).
	 */
	public get loaderInfo () : LoaderInfo{
		//console.log("loaderInfo not implemented yet in flash/DisplayObject");
		//this._adaptee.loaderInfo
		return this._loaderInfo;
	}

	/**
	 * The calling displayobject is masked by the specified mask any.
	 * To ensure that masking works when the Stage is scaled, the mask displayobject
	 * must be in an active part of the display list. The mask any itself is not drawn.
	 * Set mask to null to remove the mask.
	 *
	 *   To be able to scale a mask any, it must be on the display list. To be able to drag a mask Sprite any
	 * (by calling its startDrag() method), it must be on the display list. To call the
	 * startDrag() method for a mask sprite based on a mouseDown event
	 * being dispatched by the sprite, set the sprite's buttonMode property to true.When displayobjects are cached by setting the cacheAsBitmap property to
	 * true an the cacheAsBitmapMatrix property to a Matrix any,
	 * both the mask and the displayobject being masked must be part of the same cached
	 * bitmap. Thus, if the displayobject is cached, then the mask must be a child of the displayobject.
	 * If an ancestor of the displayobject on the display list is cached, then the mask must be a child of
	 * that ancestor or one of its descendents. If more than one ancestor of the masked any is cached,
	 * then the mask must be a descendent of the cached container closest to the masked any in the display list.Note: A single mask any cannot be used to mask more than one calling displayobject.
	 * When the mask is assigned to a second displayobject, it is removed as the mask of the first
	 * any, and that any's mask property becomes null.
	 */
	public get mask () : DisplayObject{
		if(this.adaptee.masks==null){
			return null;
		}
		if(this.adaptee.masks.length==0){
			return null;
		}
		return (<DisplayObject>this.adaptee.masks[0].adapter);
	}
	public set mask (value:DisplayObject) {
		if(value==null){
			if(this.adaptee.masks!=null){
				this.adaptee.masks[0].maskMode=false;
			}
			this.adaptee.masks=null;
			return;
		}
		value.adaptee.maskMode=true;
		this.adaptee.masks=[value.adaptee];
	}

	public get metaData () : any{
		console.log("mask not implemented yet in flash/DisplayObject");
		return null;
	}
	public set metaData (data:any) {
		console.log("mask not implemented yet in flash/DisplayObject");
	}

	/**
	 * Indicates the x coordinate of the mouse or user input device position, in pixels.
	 *
	 *   Note: For a DisplayObject that has been rotated, the returned x coordinate will reflect the
	 * non-rotated any.
	 */
	public get mouseX () : number{
		//console.log("mouseX not implemented yet in flash/DisplayObject");
		//todo: theres probably a faster option than this
		return this.adaptee.transform.globalToLocal(new Point(this.stage.mouseX, 0)).x;
	}

	/**
	 * Indicates the y coordinate of the mouse or user input device position, in pixels.
	 *
	 *   Note: For a DisplayObject that has been rotated, the returned y coordinate will reflect the
	 * non-rotated any.
	 */
	public get mouseY () : number{
		//todo: theres probably a faster option than this
		return this.adaptee.transform.globalToLocal(new Point(0, this.stage.mouseY)).y;
	}

	/**
	 * Indicates the instance name of the DisplayObject. The any can be identified in
	 * the child list of its parent displayobject container by calling the
	 * getChildByName() method of the displayobject container.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 * @console.logs	IllegalOperationError If you are attempting to set this property on an any that was
	 *   placed on the timeline in the Flash authoring tool.
	 */
	public get name () : string{
		return this.adaptee.name;
	}
	public set name (value:string) {
		this.adaptee.name=value;
	}
	/**
	 * Specifies whether the displayobject is opaque with a certain background color.
	 * A transparent bitmap contains alpha
	 * channel data and is drawn transparently. An opaque bitmap has no alpha channel (and renders faster
	 * than a transparent bitmap). If the bitmap is opaque, you specify its own background color to use.
	 *
	 *   If set to a number value, the surface is opaque (not transparent) with the RGB background
	 * color that the number specifies. If set to null (the default value), the display
	 * any has a transparent background.The opaqueBackground property is intended mainly for use with the
	 * cacheAsBitmap property, for rendering optimization. For displayobjects in which the
	 * cacheAsBitmap property is set to true, setting opaqueBackground can
	 * improve rendering performance.The opaque background region is not matched when calling the hitTestPoint()
	 * method with the shapeFlag parameter set to true.The opaque background region does not respond to mouse events.
	 */
	public get opaqueBackground () : any{
		console.log("opaqueBackground not implemented yet in flash/DisplayObject");
		return null;
	}
	public set opaqueBackground (value:any) {
		console.log("opaqueBackground not implemented yet in flash/DisplayObject");
	}

	/**
	 * Indicates the DisplayObjectContainer any that contains this displayobject. Use the parent
	 * property to specify a relative path to displayobjects that are above the
	 * current displayobject in the display list hierarchy.
	 *
	 *   You can use parent to move up multiple levels in the display list as in the following:
	 * @console.logs	SecurityError The parent displayobject belongs to a security sandbox
	 *   to which you do not have access. You can avoid this situation by having
	 *   the parent movie call the Security.allowDomain() method.
	 */
	public get parent () : DisplayObjectContainer{
		if(this.adaptee.parent==null){
			return null;
		}
		return (<DisplayObjectContainer>this.adaptee.parent.adapter);
	}

	/**
	 * For a displayobject in a loaded SWF file, the root property is the
	 * top-most displayobject in the portion of the display list's tree structure represented by that SWF file.
	 * For a Bitmap any representing a loaded image file, the root property is the Bitmap any
	 * itself. For the instance of the main class of the first SWF file loaded, the root property is the
	 * displayobject itself. The root property of the Stage any is the Stage any itself. The root
	 * property is set to null for any displayobject that has not been added to the display list, unless
	 * it has been added to a displayobject container that is off the display list but that is a child of the
	 * top-most displayobject in a loaded SWF file.
	 *
	 *   For example, if you create a new Sprite any by calling the Sprite() constructor method,
	 * its root property is null until you add it to the display list (or to a display
	 * any container that is off the display list but that is a child of the top-most displayobject in a SWF file).For a loaded SWF file, even though the Loader any used to load the file may not be on the display list,
	 * the top-most displayobject in the SWF file has its root property set to itself.  The Loader any
	 * does not have its root property set until it is added as a child of a displayobject for which the
	 * root property is set.
	 */
	public get root () : DisplayObject{
		console.log("root not implemented yet in flash/DisplayObject");
		return null;
	}

	/**
	 * Indicates the rotation of the DisplayObject instance, in degrees, from its original orientation. Values from 0 to 180 represent
	 * clockwise rotation; values from 0 to -180 represent counterclockwise rotation. Values outside this range are added to or
	 * subtracted from 360 to obtain a value within the range. For example, the statement my_video.rotation = 450 is the
	 * same as  my_video.rotation = 90.
	 */
	public get rotation () : number{
		return this.adaptee.rotationZ;
	}
	public set rotation (value:number) {
		this.adaptee.rotationZ=value;
	}

	/**
	 * Indicates the x-axis rotation of the DisplayObject instance, in degrees, from its original orientation relative to the 3D parent container. Values from 0 to 180 represent
	 * clockwise rotation; values from 0 to -180 represent counterclockwise rotation. Values outside this range are added to or
	 * subtracted from 360 to obtain a value within the range.
	 */
	public get rotationX () : number{
		return this.adaptee.rotationX;

	}
	public set rotationX (value:number) {
		this.adaptee.rotationX=value;
	}

	/**
	 * Indicates the y-axis rotation of the DisplayObject instance, in degrees, from its original orientation relative to the 3D parent container. Values from 0 to 180 represent
	 * clockwise rotation; values from 0 to -180 represent counterclockwise rotation. Values outside this range are added to or
	 * subtracted from 360 to obtain a value within the range.
	 * @langversion	3.0
	 * @playerversion	Flash 10
	 * @playerversion	AIR 1.5
	 * @playerversion	Lite 4
	 */
	public get rotationY () : number{
		return this.adaptee.rotationY;

	}
	public set rotationY (value:number) {
		this.adaptee.rotationY=value;

	}

	/**
	 * Indicates the z-axis rotation of the DisplayObject instance, in degrees, from its original orientation relative to the 3D parent container. Values from 0 to 180 represent
	 * clockwise rotation; values from 0 to -180 represent counterclockwise rotation. Values outside this range are added to or
	 * subtracted from 360 to obtain a value within the range.
	 */
	public get rotationZ () : number{
		return this.adaptee.rotationZ;

	}
	public set rotationZ (value:number) {
		this.adaptee.rotationZ=value;

	}

	/**
	 * The current scaling grid that is in effect. If set to null,
	 * the entire displayobject is scaled normally when any scale transformation is
	 * applied.
	 *
	 *   When you define the scale9Grid property, the displayobject is divided into a
	 * grid with nine regions based on the scale9Grid rectangle, which defines the
	 * center region of the grid. The eight other regions of the grid are the following areas: The upper-left corner outside of the rectangleThe area above the rectangle The upper-right corner outside of the rectangleThe area to the left of the rectangleThe area to the right of the rectangleThe lower-left corner outside of the rectangleThe area below the rectangleThe lower-right corner outside of the rectangleYou can think of the eight regions outside of the center (defined by the rectangle)
	 * as being like a picture frame that has special rules applied to it when scaled.When the scale9Grid property is set and a displayobject is scaled, all text and
	 * gradients are scaled normally; however, for other types of anys the following rules apply:Content in the center region is scaled normally. Content in the corners is not scaled. Content in the top and bottom regions is scaled horizontally only. Content in the
	 * left and right regions is scaled vertically only.All fills (including bitmaps, video, and gradients) are stretched to fit their shapes.If a displayobject is rotated, all subsequent scaling is normal (and the
	 * scale9Grid property is ignored).For example, consider the following displayobject and a rectangle that is applied as the display
	 * any's scale9Grid:The displayobject.The red rectangle shows the scale9Grid.When the displayobject is scaled or stretched, the anys within the rectangle scale
	 * normally, but the anys outside of the rectangle scale according to the
	 * scale9Grid rules:Scaled to 75%:Scaled to 50%:Scaled to 25%:Stretched horizontally 150%: A common use for setting scale9Grid is to set up a displayobject to be used
	 * as a component, in which edge regions retain the same width when the component is scaled.
	 * @maelexample	The following creates a movie clip that contains a 20-pixel line (which forms a border)
	 *   and a gradient fill. The movie clip scales based on the mouse position, and because of the
	 *   <code>scale9Grid</code> set for the movie clip, the thickness of the 20-pixel line does not
	 *   vary when the clip scales (although the gradient in the movie clip <em>does</em> scale):
	 *
	 *     <listing version="2.0">
	 *   import Rectangle;
	 *   import flash.geom.Matrix;
	 *
	 *     this.createEmptyMovieClip("my_mc", this.getNextHighestDepth());
	 *
	 *     var grid:Rectangle = new Rectangle(20, 20, 260, 260);
	 *   my_mc.scale9Grid = grid ;
	 *
	 *     my_mc._x = 50;
	 *   my_mc._y = 50;
	 *
	 *      onMouseMove()
	 *   {
		 *   my_mc._width  = _xmouse;
		 *   my_mc._height = _ymouse;
		 *   }
	 *
	 *     my_mc.lineStyle(20, 0xff3333, 100);
	 *   var gradient_matrix:Matrix = new Matrix();
	 *   gradient_matrix.createGradientBox(15, 15, Math.PI, 10, 10);
	 *   my_mc.beginGradientFill("radial", [0xffff00, 0x0000ff],
	 *   [100, 100], [0, 0xFF], gradient_matrix,
	 *   "reflect", "RGB", 0.9);
	 *   my_mc.moveTo(0, 0);
	 *   my_mc.lineTo(0, 300);
	 *   my_mc.lineTo(300, 300);
	 *   my_mc.lineTo(300, 0);
	 *   my_mc.lineTo(0, 0);
	 *   my_mc.endFill();
	 *   </listing>
	 * @console.logs	ArgumentError If you pass an invalid argument to the method.
	 */
	public get scale9Grid () : Rectangle{
		return this.adaptee.scale9Grid;
	}
	public set scale9Grid (innerRectangle:Rectangle) {

		this.adaptee.scale9Grid=innerRectangle;
	}

	/**
	 * Indicates the horizontal scale (percentage) of the any as applied from the registration point. The default
	 * registration point is (0,0). 1.0 equals 100% scale.
	 *
	 *   Scaling the local coordinate system changes the x and y property values, which are defined in
	 * whole pixels.
	 */
	public get scaleX () : number{
		return this.adaptee.scaleX;
	}
	public set scaleX (value:number) {
		this.adaptee.scaleX=value;
	}

	/**
	 * Indicates the vertical scale (percentage) of an any as applied from the registration point of the any. The
	 * default registration point is (0,0). 1.0 is 100% scale.
	 *
	 *   Scaling the local coordinate system changes the x and y property values, which are defined in
	 * whole pixels.
	 */
	public get scaleY () : number{
		return this.adaptee.scaleY;
	}
	public set scaleY (value:number) {
		this.adaptee.scaleY=value;
	}

	/**
	 * Indicates the depth scale (percentage) of an any as applied from the registration point of the any. The
	 * default registration point is (0,0). 1.0 is 100% scale.
	 *
	 *   Scaling the local coordinate system changes the x, y and z property values, which are defined in
	 * whole pixels.
	 */
	public get scaleZ () : number{
		return this.adaptee.scaleZ;
	}
	public set scaleZ (value:number) {
		this.adaptee.scaleZ=value;
	}

	/**
	 * The scroll rectangle bounds of the displayobject. The displayobject is cropped to the size
	 * defined by the rectangle, and it scrolls within the rectangle when you change the
	 * x and y properties of the scrollRect any.
	 *
	 *   The properties of the scrollRect Rectangle any use the displayobject's coordinate space
	 * and are scaled just like the overall displayobject. The corner bounds of the cropped window on the scrolling
	 * displayobject are the origin of the displayobject (0,0) and the point defined by the
	 * width and height of the rectangle. They are not centered around the origin, but
	 * use the origin to define the upper-left corner of the area. A scrolled displayobject always
	 * scrolls in whole pixel increments. You can scroll an any left and right by setting the x property of the
	 * scrollRect Rectangle any. You can scroll an any up and down by setting
	 * the y property of the scrollRect Rectangle any. If the displayobject
	 * is rotated 90° and you scroll it left and right, the displayobject actually scrolls up and down.
	 */
	public get scrollRect () : Rectangle{
		return this.adaptee.scrollRect;

	}
	public set scrollRect (value:Rectangle) {
		this.adaptee.scrollRect=value;
	}

	/**
	 * The Stage of the displayobject. A Flash runtime application has only one Stage any.
	 * For example, you can create and load multiple displayobjects into the display list, and the
	 * stage property of each displayobject refers to the same Stage any (even if the
	 * displayobject belongs to a loaded SWF file).
	 *
	 *   If a displayobject is not added to the display list, its stage property is set to
	 * null.
	 */
	public get stage () : Stage{
		return this._stage;

	}
	public set stage (value: Stage) {
		this._stage=value;

	}

	/**
	 * An any with properties pertaining to a displayobject's matrix, color transform, and pixel bounds.
	 * The specific properties — matrix, colorTransform, and three read-only properties
	 * (concatenatedMatrix, concatenatedColorTransform,
	 * and pixelBounds) — are described in the entry for the Transform class.
	 *
	 *   Each of the transform any's properties is itself an any. This concept is important because the only
	 * way to set new values for the matrix or colorTransform anys is to create a new any and copy that
	 * any into the transform.matrix or transform.colorTransform property.For example, to increase the tx value of a displayobject's matrix, you must make a
	 * copy of the entire matrix any, then copy the new any into the matrix property of the transform
	 * any:
	 * var myMatrix:Matrix = myDisplayObject.transform.matrix;
	 * myMatrix.tx += 10;
	 * myDisplayObject.transform.matrix = myMatrix;
	 * You cannot directly set the tx property. The following code has
	 * no effect on myDisplayObject:
	 * myDisplayObject.transform.matrix.tx += 10;
	 * You can also copy an entire transform any and assign it to another
	 * displayobject's transform property. For example, the following code
	 * copies the entire transform any from myOldDisplayObj to
	 * myNewDisplayObj:myNewDisplayObj.transform = myOldDisplayObj.transform;The resulting displayobject, myNewDisplayObj, now has the same values for its
	 * matrix, color transform, and pixel bounds as the old displayobject, myOldDisplayObj.Note that AIR for TV devices use hardware acceleration, if it is available, for color transforms.
	 */
	public get transform () : Transform{
		this._ctBlockedByScript=true;
		return this.adaptee.transform;

	}
	public set transform (value:Transform) {
		console.log("DisplayObject:setter for transform not yet implemented");
		//this._adaptee.transform=value;
	}

	/**
	 * Whether or not the displayobject is visible. displayobjects that are not visible
	 * are disabled. For example, if visible=false for an Interactiveany instance,
	 * it cannot be clicked.
	 */
	public get visible () : boolean{
		return this.adaptee.visible;

	}
	public set visible (value:boolean) {
		this._visibilityByScript=true;
		this.adaptee.visible=value;

	}

	/**
	 * Indicates the width of the displayobject, in pixels. The width is calculated based on the bounds of the content of the displayobject.
	 * When you set the width property, the scaleX property is adjusted accordingly, as shown in the
	 * following code:
	 *
	 *   <codeblock>
	 *
	 *   var rect:Shape = new Shape();
	 * rect.graphics.beginFill(0xFF0000);
	 * rect.graphics.drawRect(0, 0, 100, 100);
	 * trace(rect.scaleX) // 1;
	 * rect.width = 200;
	 * trace(rect.scaleX) // 2;
	 * </codeblock>
	 * Except for TextField and Video anys, a displayobject with no content (such as an empty sprite) has a width
	 * of 0, even if you try to set width to a different value.
	 */
	public get width () : number{
		

		//todo2019
		if(!this.adaptee.partition){
			console.warn("Trying to get Display.width on orphan child!");
			return 100;

		}

		var box:Box = PickGroup.getInstance(this._stage.view).getBoundsPicker(this.adaptee.partition).getBoxBounds(this.adaptee);
		
		return (box == null)? 0 : box.width;

	}
	public set width (value:number) {

		if(!this.adaptee.partition){
			console.warn("Trying to set Display.width on orphan child!");
			return;

		}

		//todo2019
		if (isNaN(value))
			return;
		
		PickGroup.getInstance(this._stage.view).getBoundsPicker(this.adaptee.partition).width = value;
	

	}

	/**
	 * Indicates the x coordinate of the DisplayObject instance relative to the local coordinates of
	 * the parent DisplayObjectContainer. If the any is inside a DisplayObjectContainer that has
	 * transformations, it is in the local coordinate system of the enclosing DisplayObjectContainer.
	 * Thus, for a DisplayObjectContainer rotated 90° counterclockwise, the DisplayObjectContainer's
	 * children inherit a coordinate system that is rotated 90° counterclockwise.
	 * The any's coordinates refer to the registration point position.
	 */
	public get x () : number{
		return this.adaptee.x;

	}
	public set x (value:number) {
		this.adaptee.x=value;

	}

	/**
	 * Indicates the y coordinate of the DisplayObject instance relative to the local coordinates of
	 * the parent DisplayObjectContainer. If the any is inside a DisplayObjectContainer that has
	 * transformations, it is in the local coordinate system of the enclosing DisplayObjectContainer.
	 * Thus, for a DisplayObjectContainer rotated 90° counterclockwise, the DisplayObjectContainer's
	 * children inherit a coordinate system that is rotated 90° counterclockwise.
	 * The any's coordinates refer to the registration point position.
	 */
	public get y () : number{
		return this.adaptee.y;
	}
	public set y (value:number) {
		this.adaptee.y=value;
	}

	/**
	 * Indicates the z coordinate position along the z-axis of the DisplayObject
	 * instance relative to the 3D parent container. The z property is used for
	 * 3D coordinates, not screen or pixel coordinates.
	 * When you set a z property for a displayobject to something other than the default
	 * value of 0, a corresponding Matrix3D any is automatically created. for adjusting a
	 * displayobject's position and orientation
	 * in three dimensions. When working with the z-axis,
	 * the existing behavior of x and y properties changes from screen or pixel coordinates to
	 * positions relative to the 3D parent container.For example, a child of the _root  at position x = 100, y = 100, z = 200
	 * is not drawn at pixel location (100,100). The child is drawn wherever the 3D projection
	 * calculation puts it. The calculation is: (x~~cameraFocalLength/cameraRelativeZPosition, y~~cameraFocalLength/cameraRelativeZPosition)
	 */
	public get z () : number{
		return this.adaptee.z;
	}
	public set z (value:number) {
		this.adaptee.z=value;
	}

	/**
	 * Returns a rectangle that defines the area of the displayobject relative to the coordinate system
	 * of the targetCoordinateSpace any.
	 * Consider the following code, which shows how the rectangle returned can vary depending on the
	 * targetCoordinateSpace parameter that you pass to the method:
	 *
	 *   <codeblock>
	 *
	 *   var container:Sprite = new Sprite();
	 * container.x = 100;
	 * container.y = 100;
	 * this.addChild(container);
	 * var contents:Shape = new Shape();
	 * contents.graphics.drawCircle(0,0,100);
	 * container.addChild(contents);
	 * trace(contents.getBounds(container));
	 * // (x=-100, y=-100, w=200, h=200)
	 * trace(contents.getBounds(this));
	 * // (x=0, y=0, w=200, h=200)
	 *
	 *   </codeblock>
	 * Note: Use the localToGlobal() and
	 * globalToLocal() methods to convert the displayobject's local coordinates
	 * to display coordinates, or display coordinates to local coordinates, respectively.The getBounds() method is similar to the getRect() method;
	 * however, the Rectangle returned by the getBounds() method includes any strokes
	 * on shapes, whereas the Rectangle returned by the getRect() method does not.
	 * For an example, see the description of the getRect() method.
	 * @param	targetCoordinateSpace	The displayobject that defines the coordinate system to use.
	 * @return	The rectangle that defines the area of the displayobject relative to
	 *   the targetCoordinateSpace any's coordinate system.
	 */
	public getBounds (targetCoordinateSpace:DisplayObject) : Rectangle{
		//console.log("DisplayObject:getBounds not yet implemented");

		var box:Box = PickGroup.getInstance(this._stage.view).getBoundsPicker(this.adaptee.partition).getBoxBounds(this.adaptee);
		return new Rectangle(box.x, box.y, box.width, box.height);

	}

	/**
	 * Returns a rectangle that defines the boundary of the displayobject,
	 * based on the coordinate system defined by the targetCoordinateSpace
	 * parameter, excluding any strokes on shapes. The values that the getRect() method
	 * returns are the same or smaller than those returned by the getBounds() method.
	 *
	 *   Note: Use localToGlobal() and globalToLocal() methods
	 * to convert the displayobject's local coordinates to Stage coordinates, or Stage coordinates to
	 * local coordinates, respectively.
	 * @param	targetCoordinateSpace	The displayobject that defines the coordinate system to use.
	 * @return	The rectangle that defines the area of the displayobject relative to
	 *   the targetCoordinateSpace any's coordinate system.
	 */
	public getRect (targetCoordinateSpace:DisplayObject) : Rectangle{
		console.log("DisplayObject:getRect not yet implemented");
		return new Rectangle();//this._adaptee.getBounds();

	}


	/**
	 * Converts the point any from the Stage (global) coordinates
	 * to the displayobject's (local) coordinates.
	 *
	 *   To use this method, first create an instance of the Point class. The
	 * x and y values that you assign represent global coordinates because they
	 * relate to the origin (0,0) of the main display area. Then pass the Point instance
	 * as the parameter to the globalToLocal() method. The method returns a new Point any with
	 * x and y values that relate to the origin of the displayobject
	 * instead of the origin of the Stage.
	 * @param	point	An any created with the Point class. The Point any
	 *   specifies the x and y coordinates as properties.
	 * @return	A Point any with coordinates relative to the displayobject.
	 */
	public globalToLocal (point:Point) : Point{
		return this.adaptee.transform.globalToLocal(point);

	}


	/**
	 * Converts a two-dimensional point from the Stage (global) coordinates to a
	 * three-dimensional displayobject's (local) coordinates.
	 *
	 *   To use this method, first create an instance of the Point class.
	 * The x and y values that you assign to the Point any represent global
	 * coordinates because they are relative to the origin (0,0) of the main display area.
	 * Then pass the Point any to the globalToLocal3D()
	 * method as the point parameter. The method returns three-dimensional
	 * coordinates as a Vector3D any containing x, y, and
	 * z values that are relative to the origin
	 * of the three-dimensional displayobject.
	 * @param	point	A two dimensional Point any representing global x and y coordinates.
	 * @return	A Vector3D any with coordinates relative to the three-dimensional
	 *   displayobject.
	 */
	public globalToLocal3D (point:Point) : Vector3D{
		console.log("DisplayObject:globalToLocal3D not yet implemented");
		return new Vector3D(); //todo: works with vector3D-input instead of pouibnt: this.adaptee.globalToLocal3D();

	}

	/**
	 * Evaluates the bounding box of the displayobject to see if it overlaps or intersects with the
	 * bounding box of the obj displayobject.
	 * @param	obj	The displayobject to test against.
	 * @return	true if the bounding boxes of the displayobjects intersect; false if not.
	 */
	public hitTestObject (obj:DisplayObject) : boolean{
		
		return PickGroup.getInstance(this._stage.view).getBoundsPicker(this.adaptee.partition).hitTestObject(PickGroup.getInstance(this._stage.view).getBoundsPicker(obj.adaptee.partition));


	}

	/**
	 * Evaluates the displayobject to see if it overlaps or intersects with the
	 * point specified by the x and y parameters.
	 * The x and y parameters specify a point in the
	 * coordinate space of the Stage, not the displayobject container that contains the
	 * displayobject (unless that displayobject container is the Stage).
	 * @param	x	The x coordinate to test against this any.
	 * @param	y	The y coordinate to test against this any.
	 * @param	shapeFlag	Whether to check against the actual pixels of the any (true)
	 *   or the bounding box (false).
	 * @return	true if the displayobject overlaps or intersects with the specified point;
	 *   false otherwise.
	 */
	public hitTestPoint (x:number, y:number, shapeFlag:boolean=false) : boolean{
		return PickGroup.getInstance(this._stage.view).getBoundsPicker(this.adaptee.partition).hitTestPoint(x, y, shapeFlag);
	}

	protected _getObjectsUnderPointInternal(point:Point, children:DisplayObject[])
	{
		//nothing to do here
	}

	/**
	 * Converts a three-dimensional point of the three-dimensional display
	 * any's (local) coordinates to a two-dimensional point in the Stage (global) coordinates.
	 *
	 *   For example, you can only use two-dimensional coordinates (x,y) to
	 * draw with the display.Graphics methods. To draw a three-dimensional
	 * any, you need to map the three-dimensional coordinates of a
	 * displayobject to two-dimensional coordinates. First, create an instance of
	 * the Vector3D class that holds the x-, y-, and z- coordinates of the three-dimensional
	 * displayobject. Then pass the Vector3D any to the local3DToGlobal()
	 * method as the point3d parameter. The method returns a two-dimensional Point
	 * any that can be used
	 * with the Graphics API to draw the three-dimensional any.
	 * @param	point3d	A Vector3D any containing either a three-dimensional point or
	 *   the coordinates of the three-dimensional displayobject.
	 * @return	A two-dimensional point representing a three-dimensional point
	 *   in two-dimensional space.
	 */
	public local3DToGlobal (point3d:Vector3D) : Point{
		console.log("DisplayObject:local3DToGlobal not yet implemented");
		return new Point();//this._adaptee.getBounds();

	}

	/**
	 * Converts the point any from the displayobject's (local) coordinates to the
	 * Stage (global) coordinates.
	 *
	 *   This method allows you to convert any given x and y coordinates from
	 * values that are relative to the origin (0,0) of a specific displayobject (local coordinates)
	 * to values that are relative to the origin of the Stage (global coordinates).To use this method, first create an instance of the Point class. The
	 * x and y values that you assign represent local coordinates because they
	 * relate to the origin of the displayobject.You then pass the Point instance that you created as the parameter to
	 * the localToGlobal() method. The method returns a new Point any with
	 * x and y values that relate to the origin of the Stage
	 * instead of the origin of the displayobject.
	 * @param	point	The name or identifier of a point created with the Point class, specifying the
	 *   x and y coordinates as properties.
	 * @return	A Point any with coordinates relative to the Stage.
	 */
	public localToGlobal (point:Point) : Point{
		return this.adaptee.transform.localToGlobal(point);
	}
}

