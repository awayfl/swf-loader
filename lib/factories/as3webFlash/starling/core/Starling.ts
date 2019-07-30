import {EventDispatcher} from "../../events/EventDispatcher";
import { Context3D } from "../../display3D/Context3D"
//import {Juggler} from "../animation/Juggler";
//import { Stage3D } from "../display3D/Stage3D"
import {Stage} from "../display/Stage";
import {DisplayObject} from "../display/DisplayObject";
//import {TouchProcessor} from "../events/TouchProcessor";
import { Rectangle } from "../../geom/Rectangle"
import { Sprite } from "../display/Sprite"
import { Event } from "../events/Event"
//import { Program3D } from "../display3D/Program3D"
import { ByteArray } from "../../utils/ByteArray"

/// Dispatched when the display list is about to be rendered.
/*[Event(name="render", type="starling.events.Event")]*/

/// Dispatched when a fatal error is encountered.
/*[Event(name="fatalError", tFype="starling.events.Event")]*/

/// Dispatched when the root class has been created.
/*[Event(name="rootCreated", type="starling.events.Event")]*/

/// Dispatched when a new render context is created.
/*[Event(name="context3DCreate", type="starling.events.Event")]*/

/**
 * The Starling class represents the core of the Starling framework.
 * <p>The Starling framework makes it possible to create 2D applications and games that make
 * use of the Stage3D architecture introduced in Flash Player 11. It implements a display tree
 * system that is very similar to that of conventional Flash, while leveraging modern GPUs
 * to speed up rendering.</p><p>The Starling class represents the link between the conventional Flash display tree and
 * the Starling display tree. To create a Starling-powered application, you have to create
 * an instance of the Starling class:</p><pre>var starling:Starling = new Starling(Game, stage);</pre><p>The first parameter has to be a Starling display object class, e.g. a subclass of
 * <codeph>starling.display.Sprite</codeph>. In the sample above, the class "Game" is the
 * application root. An instance of "Game" will be created as soon as Starling is initialized.
 * The second parameter is the conventional (Flash) stage object. Per default, Starling will
 * display its contents directly below the stage.</p><p>It is recommended to store the Starling instance as a member variable, to make sure
 * that the Garbage Collector does not destroy it. After creating the Starling object, you
 * have to start it up like this:</p><pre>starling.start();</pre><p>It will now render the contents of the "Game" class in the frame rate that is set up for
 * the application (as defined in the Flash stage).</p><b>Context3D Profiles</b><p>Stage3D supports different rendering profiles, and Starling works with all of them. The
 * last parameter of the Starling constructor allows you to choose which profile you want.
 * The following profiles are available:</p><ul><li>BASELINE_CONSTRAINED: provides the broadest hardware reach. If you develop for the
 * browser, this is the profile you should test with.</li><li>BASELINE: recommend for any mobile application, as it allows Starling to use a more
 * memory efficient texture type (RectangleTextures). It also supports more complex
 * AGAL code.</li><li>BASELINE_EXTENDED: adds support for textures up to 4096x4096 pixels. This is
 * especially useful on mobile devices with very high resolutions.</li></ul><p>The recommendation is to deploy your app with the profile "auto" (which makes Starling
 * pick the best available of those three), but test it in all available profiles.</p><b>Accessing the Starling object</b><p>From within your application, you can access the current Starling object anytime
 * through the static method <codeph>Starling.current</codeph>. It will return the active Starling
 * instance (most applications will only have one Starling object, anyway).</p><b>Viewport</b><p>The area the Starling content is rendered into is, per default, the complete size of the
 * stage. You can, however, use the "viewPort" property to change it. This can be  useful
 * when you want to render only into a part of the screen, or if the player size changes. For
 * the latter, you can listen to the RESIZE-event dispatched by the Starling
 * stage.</p><b>Native overlay</b><p>Sometimes you will want to display native Flash content on top of Starling. That's what the
 * <codeph>nativeOverlay</codeph> property is for. It returns a Flash Sprite lying directly
 * on top of the Starling content. You can add conventional Flash objects to that overlay.</p><p>Beware, though, that conventional Flash content on top of 3D content can lead to
 * performance penalties on some (mobile) platforms. For that reason, always remove all child
 * objects from the overlay when you don't need them any longer. Starling will remove the
 * overlay from the display list when it's empty.</p><b>Multitouch</b><p>Starling supports multitouch input on devices that provide it. During development,
 * where most of us are working with a conventional mouse and keyboard, Starling can simulate
 * multitouch events with the help of the "Shift" and "Ctrl" (Mac: "Cmd") keys. Activate
 * this feature by enabling the <codeph>simulateMultitouch</codeph> property.</p><b>Handling a lost render context</b><p>On some operating systems and under certain conditions (e.g. returning from system
 * sleep), Starling's stage3D render context may be lost. Starling can recover from a lost
 * context if the class property "handleLostContext" is set to "true". Keep in mind, however,
 * that this comes at the price of increased memory consumption; Starling will cache textures
 * in RAM to be able to restore them when the context is lost. (Except if you use the
 * 'AssetManager' for your textures. It is smart enough to recreate a texture directly
 * from its origin.)</p><p>In case you want to react to a context loss, Starling dispatches an event with
 * the type "Event.CONTEXT3D_CREATE" when the context is restored. You can recreate any
 * invalid resources in a corresponding event listener.</p><b>Sharing a 3D Context</b><p>Per default, Starling handles the Stage3D context itself. If you want to combine
 * Starling with another Stage3D engine, however, this may not be what you want. In this case,
 * you can make use of the <codeph>shareContext</codeph> property:</p><ol><li>Manually create and configure a context3D object that both frameworks can work with
 * (through <codeph>stage3D.requestContext3D</codeph> and
 * <codeph>context.configureBackBuffer</codeph>).</li><li>Initialize Starling with the stage3D instance that contains that configured context.
 * This will automatically enable <codeph>shareContext</codeph>.</li><li>Call <codeph>start()</codeph> on your Starling instance (as usual). This will make
 * Starling queue input events (keyboard/mouse/touch).</li><li>Create a game loop (e.g. using the native <codeph>ENTER_FRAME</codeph> event) and let it
 * call Starling's <codeph>nextFrame</codeph> as well as the equivalent method of the other
 * Stage3D engine. Surround those calls with <codeph>context.clear()</codeph> and
 * <codeph>context.present()</codeph>.</li></ol><p>The Starling wiki contains a <xref href="http://goo.gl/BsXzw">tutorial</xref> with more
 * information about this topic.</p>
 */
export class Starling extends EventDispatcher
{
	/// The version of the Starling framework.
	public static VERSION : string = "1.7";

	/// All Starling instances. CAUTION: not a copy, but the actual object! Do not modify!
	public static get all () : Starling[]{
		console.log("all not implemented yet in starling/Starling");
		return [];

	}

	/// The antialiasing level. 0 - no antialasing, 16 - maximum antialiasing.
	public get antiAliasing () : number{
		console.log("antiAliasing not implemented yet in starling/Starling");
		return 0;

	}
	public set antiAliasing (value:number){
		console.log("antiAliasing not implemented yet in starling/Starling");

	}

	/**
	 * Returns the current height of the back buffer. In most cases, this value is in pixels;
	 * however, if the app is running on an HiDPI display with an activated
	 * 'supportHighResolutions' setting, you have to multiply with 'backBufferPixelsPerPoint'
	 * for the actual pixel count.
	 */
	public get backBufferHeight () : number{
		console.log("backBufferHeight not implemented yet in starling/Starling");
		return 0;

	}

	/**
	 * The number of pixel per point returned by the 'backBufferWidth/Height' properties.
	 * Except for desktop HiDPI displays with an activated 'supportHighResolutions' setting,
	 * this will always return '1'.
	 */
	public get backBufferPixelsPerPoint () : number{
		console.log("backBufferPixelsPerPoint not implemented yet in starling/Starling");
		return 0;

	}

	/**
	 * Returns the current width of the back buffer. In most cases, this value is in pixels;
	 * however, if the app is running on an HiDPI display with an activated
	 * 'supportHighResolutions' setting, you have to multiply with 'backBufferPixelsPerPoint'
	 * for the actual pixel count.
	 */
	public get backBufferWidth () : number{
		console.log("backBufferWidth not implemented yet in starling/Starling");
		return 0;

	}

	/**
	 * The ratio between viewPort width and stage width. Useful for choosing a different
	 * set of textures depending on the display resolution.
	 */
	public get contentScaleFactor () : number{
		console.log("contentScaleFactor not implemented yet in starling/Starling");
		return 0;

	}
	/**
	 * The ratio between viewPort width and stage width. Useful for choosing a different
	 * set of textures depending on the display resolution.
	 */
	public static get contentScaleFactor () : number{
		console.log("contentScaleFactor not implemented yet in starling/Starling");
		return 0;

	}

	/// The render context of this instance.
	public get context () : Context3D{
		console.log("context not implemented yet in starling/Starling");
		return null;

	}
	/// The render context of this instance.
	public static get context () : Context3D{
		console.log("context not implemented yet in starling/Starling");
		return null;

	}
	//todo any is Objects.Dictionary

	/**
	 * A dictionary that can be used to save custom data related to the current context.
	 * If you need to share data that is bound to a specific stage3D instance
	 * (e.g. textures), use this dictionary instead of creating a static class variable.
	 * The Dictionary is actually bound to the stage3D instance, thus it survives a
	 * context loss.
	 */
	public get contextData () : any{
		//todo any is Objects.Dictionary
		console.log("contextData not implemented yet in starling/Starling");
		return null;

	}

	/**
	 * Indicates if the Context3D object is currently valid (i.e. it hasn't been lost or
	 * disposed).
	 */
	public get contextValid () : boolean{
		console.log("contextValid not implemented yet in starling/Starling");
		return false;

	}

	/// The currently active Starling instance.
	public static get current () : Starling{
		console.log("current not implemented yet in starling/Starling");
		return null;

	}

	/**
	 * Indicates if Stage3D render methods will report errors. Activate only when needed,
	 * as this has a negative impact on performance.
	 */
	public get enableErrorChecking () : boolean{
		console.log("enableErrorChecking not implemented yet in starling/Starling");
		return false;

	}
	public set enableErrorChecking (value:boolean){
		console.log("enableErrorChecking not implemented yet in starling/Starling");

	}

	/**
	 * Indicates if Starling should automatically recover from a lost device context.
	 * On some systems, an upcoming screensaver or entering sleep mode may
	 * invalidate the render context. This setting indicates if Starling should recover from
	 * such incidents.
	 * Beware: if used carelessly, this property may have a huge impact on memory
	 * consumption. That's because, by default, it will make Starling keep a copy of each
	 * texture in memory.However, this downside can be avoided by using the "AssetManager" to load textures.
	 * The AssetManager is smart enough to restore them directly from their sources. You can
	 * also do this by setting up "root.onRestore" on your manually loaded textures.A context loss can happen on almost every platform. It's very common on Windows
	 * and Android, but rare on OS X and iOS (e.g. it may occur when opening up the camera
	 * roll). It's recommended to always enable this property, while using the AssetManager
	 * for texture loading.
	 */
	public static get handleLostContext () : boolean{
		console.log("handleLostContext not implemented yet in starling/Starling");
		return false;

	}
	public static set handleLostContext (value:boolean){
		console.log("handleLostContext not implemented yet in starling/Starling");

	}

	/// Indicates if this Starling instance is started.
	public get isStarted () : boolean{
		console.log("isStarted not implemented yet in starling/Starling");
		return false;

	}

	/// The default juggler of this instance. Will be advanced once per frame.
	public get juggler () : any{
		console.log("juggler not implemented yet in starling/Starling");
		//todo any is Jugglerg.animation.Juggler
		return null;
	}
	/// The default juggler of this instance. Will be advanced once per frame.
	public static get juggler () : any{
		console.log("juggler not implemented yet in starling/Starling");
		//todo any is Jugglerg.animation.Juggler
		return null;
	}

	/// Indicates if multitouch input should be supported.
	public static get multitouchEnabled () : boolean{
		console.log("multitouchEnabled not implemented yet in starling/Starling");
		return false;

	}
	public static set multitouchEnabled (value:boolean){
		console.log("multitouchEnabled not implemented yet in starling/Starling");

	}

	/**
	 * A Flash Sprite placed directly on top of the Starling content. Use it to display native
	 * Flash components.
	 */
	public get nativeOverlay () : Sprite{
		console.log("nativeOverlay not implemented yet in starling/Starling");
		return null;

	}

	/// The Flash (2D) stage object Starling renders beneath.
	public get nativeStage () : Stage{
		console.log("nativeStage not implemented yet in starling/Starling");
		return null;

	}

	/**
	 * The Context3D profile used for rendering. Beware that if you are using a shared
	 * context in AIR 3.9 / Flash Player 11 or below, this is simply what you passed to
	 * the Starling constructor.
	 */
	public get profile () : string{
		console.log("profile not implemented yet in starling/Starling");
		return "";

	}

	/**
	 * The instance of the root class provided in the constructor. Available as soon as
	 * the event 'ROOT_CREATED' has been dispatched.
	 */
	public get root () : DisplayObject{
		console.log("root not implemented yet in starling/Starling");
		return null;

	}

	/**
	 * The class that will be instantiated by Starling as the 'root' display object.
	 * Must be a subclass of 'starling.display.DisplayObject'.
	 * If you passed null as first parameter to the Starling constructor,
	 * you can use this property to set the root class at a later time. As soon as the class
	 * is instantiated, Starling will dispatch a ROOT_CREATED event.Beware: you cannot change the root class once the root object has been
	 * instantiated.
	 */
	public get rootClass () : any{
		console.log("rootClass not implemented yet in starling/Starling");
		return null;

	}
	public set rootClass (value:any){
		console.log("rootClass not implemented yet in starling/Starling");

	}

	/**
	 * Indicates if the Context3D render calls are managed externally to Starling,
	 * to allow other frameworks to share the Stage3D instance.
	 */
	public get shareContext () : boolean{
		console.log("shareContext not implemented yet in starling/Starling");
		return false;

	}
	public set shareContext (value:boolean){
		console.log("shareContext not implemented yet in starling/Starling");

	}

	/**
	 * Indicates if a small statistics box (with FPS, memory usage and draw count) is
	 * displayed.
	 * Beware that the memory usage should be taken with a grain of salt. The value is
	 * determined via System.totalMemory and does not take texture memory
	 * into account. It is recommended to use Adobe Scout for reliable and comprehensive
	 * memory analysis.
	 */
	public get showStats () : boolean{
		console.log("showStats not implemented yet in starling/Starling");
		return false;

	}
	public set showStats (value:boolean){
		console.log("showStats not implemented yet in starling/Starling");

	}

	/// Indicates if multitouch simulation with "Shift" and "Ctrl"/"Cmd"-keys is enabled.
	public get simulateMultitouch () : boolean{
		console.log("simulateMultitouch not implemented yet in starling/Starling");
		return false;

	}
	public set simulateMultitouch (value:boolean){
		console.log("simulateMultitouch not implemented yet in starling/Starling");

	}

	/// The Starling stage object, which is the root of the display tree that is rendered.
	public get stage () : Stage{
		console.log("stage not implemented yet in starling/Starling");
		return null;

	}

	/// The Flash Stage3D object Starling renders into.
	public get stage3D () : any{
		//todo:any is Stage3D
		console.log("stage3D not implemented yet in starling/Starling");
		return null;
	}

	/**
	 * Indicates that if the device supports HiDPI screens Starling will attempt to allocate
	 * a larger back buffer than indicated via the viewPort size. Note that this is used
	 * on Desktop only; mobile AIR apps still use the "requestedDisplayResolution" parameter
	 * the application descriptor XML.
	 */
	public get supportHighResolutions () : boolean{
		console.log("supportHighResolutions not implemented yet in starling/Starling");
		return false;

	}
	public set supportHighResolutions (value:boolean){
		console.log("supportHighResolutions not implemented yet in starling/Starling");

	}

	/**
	 * The TouchProcessor is passed all mouse and touch input and is responsible for
	 * dispatching TouchEvents to the Starling display tree. If you want to handle these
	 * types of input manually, pass your own custom subclass to this property.
	 */
	public get touchProcessor () : any{
		//todo: any is TouchProcessor
		console.log("touchProcessor not implemented yet in starling/Starling");
		return null;

	}
	public set touchProcessor (value:any){
		//todo: TouchProcessor
		console.log("touchProcessor not implemented yet in starling/Starling");

	}

	/// The viewport into which Starling contents will be rendered.
	public get viewPort () : Rectangle{
		console.log("viewPort not implemented yet in starling/Starling");
		return null;

	}
	public set viewPort (value:Rectangle){
		console.log("viewPort not implemented yet in starling/Starling");

	}

	/**
	 * Dispatches ENTER_FRAME events on the display list, advances the Juggler
	 * and processes touches.
	 */
	public advanceTime (passedTime:number) {
		console.log("advanceTime not implemented yet in starling/Starling");

	}

	/// Deletes the vertex- and fragment-programs of a certain name.
	public deleteProgram (name:string) {
		console.log("deleteProgram not implemented yet in starling/Starling");

	}

	/**
	 * Disposes all children of the stage and the render context; removes all registered
	 * event listeners.
	 */
	public dispose () {
		console.log("dispose not implemented yet in starling/Starling");

	}

	/// Returns the vertex- and fragment-programs registered under a certain name.
	public getProgram (name:string) : any{
		//todo: any is Program3D
		console.log("getProgram not implemented yet in starling/Starling");
		return null;

	}

	/// Indicates if a set of vertex- and fragment-programs is registered under a certain name.
	public hasProgram (name:string) : boolean{
		console.log("hasProgram not implemented yet in starling/Starling");
		return false;

	}

	/// Make this Starling instance the current one.
	public makeCurrent () {
		console.log("makeCurrent not implemented yet in starling/Starling");

	}

	/**
	 * Calls advanceTime() (with the time that has passed since the last frame)
	 * and render().
	 */
	public nextFrame () {
		console.log("nextFrame not implemented yet in starling/Starling");

	}

	/**
	 * Registers a compiled shader-program under a certain name.
	 * If the name was already used, the previous program is overwritten.
	 */
	public registerProgram (name:string, vertexShader:ByteArray, fragmentShader:ByteArray) : any{
		//todo: any is Program3D
		console.log("registerProgram not implemented yet in starling/Starling");
		return null;

	}

	/**
	 * Compiles a shader-program and registers it under a certain name.
	 * If the name was already used, the previous program is overwritten.
	 */
	public registerProgramFromSource (name:string, vertexShader:string, fragmentShader:string) : any{
		//todo: any is Program3D
		console.log("registerProgramFromSource not implemented yet in starling/Starling");
		return null;
	}

	/**
	 * Renders the complete display list. Before rendering, the context is cleared; afterwards,
	 * it is presented (to avoid this, enable shareContext).
	 * This method also dispatches an Event.RENDER-event on the Starling
	 * instance. That's the last opportunity to make changes before the display list is
	 * rendered.
	 */
	public render () {
		console.log("render not implemented yet in starling/Starling");

	}

	/// Displays the statistics box at a certain position.
	public showStatsAt (hAlign:string="left", vAlign:string="top", scale:number=1) {
		console.log("showStatsAt not implemented yet in starling/Starling");

	}

	/**
	 * Creates a new Starling instance.
	 * @param	rootClass	A subclass of 'starling.display.DisplayObject'. It will be created
	 *   as soon as initialization is finished and will become the first child
	 *   of the Starling stage. Pass null if you don't want to
	 *   create a root object right away. (You can use the
	 *   rootClass property later to make that happen.)
	 * @param	stage	The Flash (2D) stage.
	 * @param	viewPort	A rectangle describing the area into which the content will be
	 *   rendered. Default: stage size
	 * @param	stage3D	The Stage3D object into which the content will be rendered. If it
	 *   already contains a context, sharedContext will be set
	 *   to true. Default: the first available Stage3D.
	 * @param	renderMode	The Context3D render mode that should be requested.
	 *   Use this parameter if you want to force "software" rendering.
	 * @param	profile	The Context3D profile that should be requested.
	 *   If you pass a profile String, this profile is enforced.Pass an Array of profiles to make Starling pick the first
	 *   one that works (starting with the first array element).Pass the String "auto" to make Starling pick the best available
	 *   profile automatically.
	 */
	constructor (rootClass:any, stage:Stage, viewPort:Rectangle=null, stage3D:any=null, renderMode:string="auto", profile:any="baselineConstrained"){
		//todo: any is Stage3D
		super();
	}

	/**
	 * As soon as Starling is started, it will queue input events (keyboard/mouse/touch);
	 * furthermore, the method nextFrame will be called once per Flash Player
	 * frame. (Except when shareContext is enabled: in that case, you have to
	 * call that method manually.)
	 */
	public start () {
		console.log("start not implemented yet in starling/Starling");

	}

	/**
	 * Stops all logic and input processing, effectively freezing the app in its current state.
	 * Per default, rendering will continue: that's because the classic display list
	 * is only updated when stage3D is. (If Starling stopped rendering, conventional Flash
	 * contents would freeze, as well.)
	 *
	 *   However, if you don't need classic Flash contents, you can stop rendering, too.
	 * On some mobile systems (e.g. iOS), you are even required to do so if you have
	 * activated background code execution.
	 */
	public stop (suspendRendering:boolean=false){
		console.log("stop not implemented yet in starling/Starling");

	}

	/**
	 * Stops Starling right away and displays an error message on the native overlay.
	 * This method will also cause Starling to dispatch a FATAL_ERROR event.
	 */
	public stopWithFatalError (message:string) {
		console.log("stopWithFatalError not implemented yet in starling/Starling");

	}
}

