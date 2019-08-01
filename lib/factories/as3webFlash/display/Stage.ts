
import {StageAlign} from "./StageAlign"
import {Sprite} from "./Sprite"
import {Event} from "../events/Event"
import {IEventMapper} from "../events/IEventMapper"
import {DisplayObjectContainer} from "./DisplayObjectContainer"
import {DisplayObject} from "./DisplayObject"
import {StageScaleMode} from "./StageScaleMode"
import {EventDispatcher, Transform, Point, Vector3D,Box, Rectangle} from "@awayjs/core";

import {AssetEvent, LoaderEvent, ParserEvent, AudioManager, URLRequest, RequestAnimationFrame, CoordinateSystem, PerspectiveProjection} from "@awayjs/core";
import {Graphics, GradientFillStyle, TextureAtlas} from "@awayjs/graphics";
import {HoverController, TextField, Billboard, MouseManager, SceneGraphPartition, Camera, LoaderContainer, MovieClip} from "@awayjs/scene";

import {MethodMaterial, MaterialBase}	from "@awayjs/materials";
import {DefaultRenderer} from  "@awayjs/renderer";
import {View, BasicPartition} from "@awayjs/view";
import {Stage as AwayStage, StageManager} from "@awayjs/stage";
import {MouseEvent as MouseEventAway, DisplayObject as AwayDisplayObject, Sprite as AwaySprite, Scene, DisplayObjectContainer as AwayDisplayObjectContainer} from "@awayjs/scene";

import {MouseEvent} from "../events/MouseEvent";
import { EventHandler } from '../../flash/events/IEventDispatcher';


/**
 * Dispatched by the Stage object when the state of the stageVideos property changes.
 * @eventType	flash.events.StageVideoAvailabilityEvent.STAGE_VIDEO_AVAILABILITY
 [Event(name="stageVideoAvailability", type="flash.events.StageVideoAvailabilityEvent")]

 * Dispatched by the Stage object when the stage orientation changes.
 * @eventType	flash.events.StageOrientationEvent.ORIENTATION_CHANGE
 [Event(name="orientationChange", type="flash.events.StageOrientationEvent")]

 * Dispatched by the Stage object when the stage orientation begins changing.
 * @eventType	flash.events.StageOrientationEvent.ORIENTATION_CHANGING
 [Event(name="orientationChanging", type="flash.events.StageOrientationEvent")]

 * Dispatched when the Stage object enters, or leaves, full-screen mode.
 * @eventType	flash.events.FullScreenEvent.FULL_SCREEN
 [Event(name="fullScreen", type="flash.events.FullScreenEvent")]

 * Dispatched when the scaleMode property of the Stage object is set to
 * StageScaleMode.NO_SCALE and the SWF file is resized.
 * @eventType	flash.events.Event.RESIZE
 [Event(name="resize", type="flash.events.Event")]

 * Dispatched by the Stage object when the pointer moves out of the
 * stage area.
 * @eventType	flash.events.Event.MOUSE_LEAVE
 [Event(name="mouseLeave", type="flash.events.Event")]

 * The Stage class represents the main drawing area.
 *
 *   <p class="- topic/p ">For SWF content running in the browser (in
 * Flash<sup class="+ topic/ph hi-d/sup ">®</sup> Player), the Stage represents the entire area where Flash
 * content is shown. For content running in AIR on desktop operating systems, each NativeWindow object has a corresponding
 * Stage object.</p><p class="- topic/p ">The Stage object is not globally accessible. You need to access it through the
 * <codeph class="+ topic/ph pr-d/codeph ">stage</codeph> property of a DisplayObject instance.</p><p class="- topic/p ">The Stage class has several ancestor classes — DisplayObjectContainer, InteractiveObject,
 * DisplayObject, and EventDispatcher — from which it inherits properties and methods.
 * Many of these properties and methods are either inapplicable to Stage objects,
 * or require security checks when called on a Stage object.  The properties and methods that
 * require security checks are documented as part of the Stage class.</p><p class="- topic/p ">In addition, the following inherited properties are inapplicable to Stage objects. If you
 * try to set them, an IllegalOperationError is thrown. These properties may always be read, but
 * since they cannot be set, they will always contain default values.</p><ul class="- topic/ul "><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">accessibilityProperties</codeph></li><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">alpha</codeph></li><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">blendMode</codeph></li><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">cacheAsBitmap</codeph></li><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">contextMenu</codeph></li><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">filters</codeph></li><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">focusRect</codeph></li><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">loaderInfo</codeph></li><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">mask</codeph></li><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">mouseEnabled</codeph></li><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">name</codeph></li><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">opaqueBackground</codeph></li><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">rotation</codeph></li><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">scale9Grid</codeph></li><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">scaleX</codeph></li><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">scaleY</codeph></li><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">scrollRect</codeph></li><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">tabEnabled</codeph></li><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">tabIndex</codeph></li><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">transform</codeph></li><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">visible</codeph></li><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">x</codeph></li><li class="- topic/li "><codeph class="+ topic/ph pr-d/codeph ">y</codeph></li></ul><p class="- topic/p ">Some events that you might expect to be a part of the Stage class,
 * such as <codeph class="+ topic/ph pr-d/codeph ">enterFrame</codeph>, <codeph class="+ topic/ph pr-d/codeph ">exitFrame</codeph>,
 * <codeph class="+ topic/ph pr-d/codeph ">frameConstructed</codeph>, and <codeph class="+ topic/ph pr-d/codeph ">render</codeph>,
 * cannot be Stage events because a reference to the Stage object
 * cannot be guaranteed to exist in every situation where these events
 * are used. Because these events cannot be dispatched by the Stage
 * object, they are instead dispatched by every DisplayObject instance,
 * which means that you can add an event listener to
 * any DisplayObject instance to listen for these events.
 * These events, which are part of the DisplayObject class,
 * are called broadcast events to differentiate them from events
 * that target a specific DisplayObject instance.
 * Two other broadcast events, <codeph class="+ topic/ph pr-d/codeph ">activate</codeph> and <codeph class="+ topic/ph pr-d/codeph ">deactivate</codeph>,
 * belong to DisplayObject's superclass, EventDispatcher.
 * The <codeph class="+ topic/ph pr-d/codeph ">activate</codeph> and <codeph class="+ topic/ph pr-d/codeph ">deactivate</codeph> events
 * behave similarly to the DisplayObject broadcast events, except
 * that these two events are dispatched not only by all DisplayObject
 * instances, but also by all EventDispatcher instances and instances
 * of other EventDispatcher subclasses.
 * For more information on broadcast events, see the DisplayObject class.</p>
 *
 *   EXAMPLE:
 *
 *   The following example uses the <codeph class="+ topic/ph pr-d/codeph ">StageExample</codeph> class to dispatch
 * events whenever the stage is activated or resized.  This is accomplished by performing the following steps:
 * <ol class="- topic/ol "><li class="- topic/li ">The class constructor first sets the Flash application to be fixed, regardless of the size of
 * the Flash Player window and then adds two event listeners with the
 * <codeph class="+ topic/ph pr-d/codeph ">activateHandler()</codeph> and <codeph class="+ topic/ph pr-d/codeph ">resizeHandler()</codeph> methods.</li><li class="- topic/li ">The <codeph class="+ topic/ph pr-d/codeph ">activateHandler()</codeph> method runs when the left mouse button is clicked.</li><li class="- topic/li ">The <codeph class="+ topic/ph pr-d/codeph ">resizeHandler()</codeph> method runs when the stage is resized.</li></ol><codeblock xml:space="preserve" class="+ topic/pre pr-d/codeblock ">
 * package {
	 * import flash.display.Sprite;
	 * import flash.display.StageAlign;
	 * import flash.display.StageScaleMode;
	 * import flash.events.Event;
	 * 
	 *   public class StageExample extends Sprite {
	 * 
	 *   public StageExample() {
	 * stage.scaleMode = StageScaleMode.NO_SCALE;
	 * stage.align = StageAlign.TOP_LEFT;
	 * stage.addEventListener(Event.ACTIVATE, activateHandler);
	 * stage.addEventListener(Event.RESIZE, resizeHandler);
	 * }
	 * 
	 *   private activateHandler(event:Event):void {
	 * trace("activateHandler: " + event);
	 * }
	 * 
	 *   private resizeHandler(event:Event):void {
	 * trace("resizeHandler: " + event);
	 * trace("stageWidth: " + stage.stageWidth + " stageHeight: " + stage.stageHeight);
	 * }
	 * }
	 * }
 * </codeblock>
 */




export class Stage extends Sprite{

	private static _colorMaterials:any={};
	private static _textureMaterials:any={};
	private static _useTextureAtlasForColors:boolean=true;
	private _scaleMode:StageScaleMode;
	private _align:StageAlign;
	private _mainSprite:Sprite;
	private _stage3Ds:AwayStage[];

	private _frameRate:number = 30;
	private _currentFps:number = 0;
	private _rendererStage:AwayStage;
	private _timer: RequestAnimationFrame;
	private _time: number = 0;
	private _projection: PerspectiveProjection;
	private _hoverControl: HoverController;
	private _stageWidth: number;
	private _stageHeight: number;
	private _fpsTextField:HTMLDivElement;

	private _events:any[];
	private _mouseX:number;
	private _mouseY:number;
	// no need to create new events on each frame. we can reuse them
	private _eventOnEnter: Event;
	private _eventFrameConstructed: Event;
	private _eventExitFrame: Event;
	private _eventRender: Event;
	private _scene: Scene;

	private SHOW_FRAME_RATE:boolean = false;

	constructor(startClass:any, width:number = 550, height:number = 400, backgroundColor:number = null, frameRate:number = 30, showFPS:boolean=false) {
		super();

		this.SHOW_FRAME_RATE=showFPS;
		
		this._stageWidth = width;
		this._stageHeight = height;

		this._eventOnEnter=new Event(Event.ENTER_FRAME);
		this._eventFrameConstructed=new Event(Event.FRAME_CONSTRUCTED);
		this._eventExitFrame=new Event(Event.EXIT_FRAME);
		this._eventRender=new Event(Event.RENDER);

		this._events=[this._eventOnEnter, this._eventExitFrame];

		this._scaleMode=StageScaleMode.NO_SCALE;
		this._align=StageAlign.TOP_LEFT;
		this._stage3Ds=[];
		//this._stage3Ds[this._stage3Ds.length]=new AwayStage(null, );
		AudioManager.setVolume(1);
		//todo: better implement this in graphics (this function provides the drawing api with materials for a color / alpha)
		Graphics.get_material_for_color=function(color:number, alpha:number=1):any{
			if(color==0){
				color=0x000001;
			}
			if(color==0xFF8100){
				alpha=1;
			}
			//color=0xFF8100;
			//alpha=0.5;
			var texObj:any={};

			if(Stage._useTextureAtlasForColors){
				texObj=TextureAtlas.getTextureForColor(color, alpha);
				if(Stage._colorMaterials[texObj.bitmap.id]){
					texObj.material=Stage._colorMaterials[texObj.bitmap.id];
					return texObj;
				}
				var newmat:MethodMaterial=new MethodMaterial(texObj.bitmap);
				newmat.alphaBlending=true;
				newmat.useColorTransform = true;
				newmat.bothSides = true;
				Stage._colorMaterials[texObj.bitmap.id]=newmat;
				texObj.material=newmat;
				return texObj;
			}

			var colorstr:string=color+"_"+Math.round(alpha*100).toString();
			if(Stage._colorMaterials[colorstr]){
				texObj.material=Stage._colorMaterials[colorstr];
				return texObj;
			}
			var newmat:MethodMaterial=new MethodMaterial(color, alpha);
			newmat.alphaBlending=true;
			newmat.useColorTransform = true;
			newmat.bothSides = true;
			texObj.material=newmat;
			Stage._colorMaterials[colorstr]=newmat;
			return texObj;
		};
		Graphics.get_material_for_gradient=function(gradient:GradientFillStyle):any{
			var texObj=TextureAtlas.getTextureForGradient(gradient);
			/*if(alpha==0){
			 alpha=1;
			 }*/
			/*if(color==0xffffff){
			 color=0xcccccc;
			 }*/
			var lookupstr:string=texObj.bitmap.id+gradient.type;
			if(Stage._textureMaterials[lookupstr]){
				texObj.material=Stage._textureMaterials[lookupstr];
				return texObj;
			}
			var newmat:MethodMaterial=new MethodMaterial(texObj.bitmap);
			newmat.useColorTransform = true;
			newmat.alphaBlending=true;
			newmat.bothSides = true;
			Stage._textureMaterials[lookupstr]=newmat;
			texObj.material=newmat;
			return texObj;
		};
		/*
		//todo
		this.eventMappingDummys[StageVideoAvailabilityEvent.STAGE_VIDEO_AVAILABILITY]="StageVideoAvailabilityEvent.STAGE_VIDEO_AVAILABILITY";
		this.eventMappingDummys[StageOrientationEvent.ORIENTATION_CHANGE]="StageOrientationEvent.ORIENTATION_CHANGE";
		this.eventMappingDummys[StageOrientationEvent.ORIENTATION_CHANGING]="StageOrientationEvent.ORIENTATION_CHANGING";
		this.eventMappingDummys[FullScreenEvent.FULL_SCREEN]="FullScreenEvent.FULL_SCREEN";
		*/

		// resize event listens on window
		this._resizeCallbackDelegate = (event:any) => this.resizeCallback(event);
		this.eventMapping[Event.RESIZE]=(<IEventMapper>{
			adaptedType:"",
			addListener:this.initResizeListener,
			removeListener:this.removeResizeListener,
			callback:this._resizeCallbackDelegate});

		// mouse leave event listens on window
		this._mouseLeaveCallbackDelegate = (event:any) => this.mouseLeaveCallback(event);
		this.eventMapping[Event.MOUSE_LEAVE]=(<IEventMapper>{
			adaptedType:"",
			addListener:this.initMouseLeaveListener,
			removeListener:this.removeMouseLeaveListener,
			callback:this._mouseLeaveCallbackDelegate});

		// set this as active stage.
		// this makes sure all DisplayObject.constructor can set a reference to stage,
		// befor constructors of Sprite or MovieClips are processed
		DisplayObject.activeStage=this;
		this._stage=this;

		// init awayengine
		this.initEninge();
		this._resizeCallbackDelegate(null);

		this.adaptee.partition = new SceneGraphPartition(this.adaptee, true);
		// create new Partition for the adaptee and make it child of the awayjs-scene
		//this._view.setPartition(this.adaptee, new SceneGraphPartition(this.adaptee));
		this._scene.root.addChild(this.adaptee);

		// helps with mouse-events:
		//this._view.mousePicker.onlyMouseEnabled=false;
		//this._view.renderer.stage.container.style.display="none";
		// create the entrance-class
		// this is the moment the converted as3-code is executed
		this._scene.renderer.view.backgroundColor = (isNaN(backgroundColor))? 0xFFFFFF : backgroundColor;
		this._frameRate = frameRate;

		// make sure we have a background, so any mousedowns on stage are registered even if no object is hit
		// it might make more sense to put this bg on the stage, but if i try to draw into the stage,
		// the shape is the only thing that shows up, the _mainSprite is than no longer rendered
		/*this._mainSprite.graphics.clear();
		this._mainSprite.graphics.beginFill(0xffff00, 0.5);
		this._mainSprite.graphics.drawRect(0,0,window.innerWidth, window.innerHeight);
		this._mainSprite.graphics.endFill();*/

		// prevent backspace and other default shortcutz for our document:
		/*document.onkeydown = function (event) {

			if (!event) { // This will happen in IE
				event = <any>window.event;
			}

			var keyCode = event.keyCode;

			if (keyCode == 8 &&
				((<any>(event.target || event.srcElement)).tagName != "TEXTAREA") &&
				((<any>(event.target || event.srcElement)).tagName != "INPUT")) {

				if (navigator.userAgent.toLowerCase().indexOf("msie") == -1) {
					event.stopPropagation();
				} else {
					alert("prevented");
					event.returnValue = false;
				}

				return false;
			}
			/*
			window.location.href += "#";

			var _hash = "";
			window.setTimeout(function () {
				window.location.href += "";
			}, 50);

			window.onhashchange = function () {
				if (window.location.hash !== _hash) {
					window.location.hash = _hash;
				}
			};
		}
			*/
		

		if( this.SHOW_FRAME_RATE ) {
			this._fpsTextField = <HTMLDivElement> document.createElement( 'div' ); // disable in RC
			this._fpsTextField.style.cssFloat   = 'none';
			this._fpsTextField.style.position   = 'fixed';
			this._fpsTextField.style.top        = '5px';
			this._fpsTextField.style.width      = '100px';
			this._fpsTextField.style.height     = '20px';
			this._fpsTextField.style.right       = '5px';
			this._fpsTextField.style.textAlign  = 'center';
			this._fpsTextField.style.color      = '#ff0000';
			this._fpsTextField.style.fontSize   = '16';
			this._fpsTextField.innerHTML        = "";
			document.body.appendChild( this._fpsTextField );
			setInterval(() => this.updateFPS(), 1000);
		}

		if(startClass){
			
			this._mainSprite = new startClass();
			this.addChild(this._mainSprite);
			this.initListeners();
			console.log("constructed Stage and create the entranceclass");
		}
		this._rendererStage.container.style.visibility="visible";
		// inits the resize listener

	}
	public init(startClass){
		
		this._mainSprite = new startClass();
		this.addChild(this._mainSprite);
		this.initListeners();
		this._resizeCallbackDelegate(null);
		this._rendererStage.container.style.visibility="visible";
	}

	public get view(): View {
		return this._scene.renderer.view;
	}
	private updateFPS(): void {
		this._fpsTextField.innerText = this._currentFps.toFixed(2) + '/' + this._frameRate + " fps";
		this._currentFps = 0;
	}

	public set onlyMouseEnabled(value:boolean) {
		// todo2019: what is this supposed to do ?
		//this._scene.mousePicker.onlyMouseEnabled = value;
	}

	// ---------- event mapping functions Event.RESIZE

	private initResizeListener(type:string, callback:(event:any) => void):void
	{
		window.addEventListener("resize", callback);
	}
	private removeResizeListener(type:string, callback:(event:any) => void):void
	{
		window.removeEventListener("resize", callback);
	}

	private _resizeCallbackDelegate:(event:any) => void;
	private resizeCallback(event:any=null):void
	{
		// todo: correctly implement all StageScaleModes;

		var newWidth=window.innerWidth;
		var newHeight=window.innerHeight;
		var newX=0;
		var newY=0;

		switch(this.scaleMode){
			case StageScaleMode.NO_SCALE:
				this._projection.fieldOfView = Math.atan(window.innerHeight/1000/2)*360/Math.PI;
				break;
			case StageScaleMode.SHOW_ALL:
				newHeight = window.innerHeight;
				newWidth = (this._stageWidth / this._stageHeight) * newHeight;
				if (newWidth > window.innerWidth) {
					newWidth = window.innerWidth;
					newHeight = newWidth * (this._stageHeight / this._stageWidth);
				}
				newX=(window.innerWidth - newWidth) / 2;
				newY=(window.innerHeight - newHeight) / 2;
				this._projection.fieldOfView = Math.atan(this._stageHeight/1000/2)*360/Math.PI;
				break;

			case StageScaleMode.EXACT_FIT:
			case StageScaleMode.NO_BORDER:
			default:
				throw("Stage: only implemented StageScaleMode are NO_SCALE, SHOW_ALL");
				//break;
		}
		// todo: correctly implement all alignModes;
		switch(this.align){
			case StageAlign.TOP_LEFT:
				this._scene.renderer.view.y         = 0;
				this._scene.renderer.view.x         = 0;
				break;
			default:
				throw("Stage: only implemented StageAlign is TOP_LEFT");
				//break;
		}
		//console.log("test28");
		
		if(this._mainSprite){
			this._mainSprite.graphics.clear();
			this._mainSprite.graphics.beginFill(0xffffff,0);
			this._mainSprite.graphics.drawRect(0,0,newWidth, newHeight);
			this._mainSprite.graphics.endFill();
		}

		this.updateSize(newX, newY, newWidth, newHeight);
		//this._scene.view.preserveFocalLength = true;
		
		/*
		if(aspectRatio>=1){
			this._projection.fieldOfView = Math.atan(window.innerHeight/1000/2)*360/Math.PI;
		}
		else{
			this._projection.fieldOfView = Math.atan(window.innerWidth/1000/2)*360/Math.PI;
		}
		*/
		//this._projection.originX = (0.5 - 0.5*(window.innerHeight/newHeight)*(this._stageWidth/window.innerWidth));

		this.dispatchEvent(new Event(Event.RESIZE));
	}

	public show (){
		//this._view.renderer.stage.container.style.display="initial";
	}
	// ---------- event mapping functions Event.MOUSE_LEAVE

	private initMouseLeaveListener(type:string, callback:(event:any) => void):void
	{
		window.addEventListener("mouseleave", callback);
	}
	private removeMouseLeaveListener(type:string, callback:(event:any) => void):void
	{
		window.removeEventListener("mouseleave", callback);
	}

	private _mouseLeaveCallbackDelegate:(event:any) => void;
	private mouseLeaveCallback(event:any=null):void
	{
		this.dispatchEvent(new Event(Event.MOUSE_LEAVE));
	}


	//---------------------------stuff added to make it work:



	private initEninge(){

		//create the view
		this._scene = new Scene((new BasicPartition(new AwayDisplayObjectContainer())));
		this._rendererStage = this._scene.view.stage;
		this._rendererStage.container.style.visibility="hidden";
		this._rendererStage.antiAlias=0;
		this._scene.renderer.renderableSorter = null;//new RenderableSort2D();

		this._projection = new PerspectiveProjection();
		this._projection.coordinateSystem = CoordinateSystem.RIGHT_HANDED;
		this._projection.originX = -1;
		this._projection.originY = 1;
		var camera:Camera = new Camera();
		camera.projection = this._projection;

		this._scene.camera = camera;
		this._projection.fieldOfView = Math.atan(window.innerHeight/1000/2)*360/Math.PI;
		//this._projection.fieldOfView = Math.atan(this._stageHeight/1000/2)*360/Math.PI;



	}
	public updateSize(x:number, y:number, w:number, h:number){
		//this._stageWidth=w;
		//this._stageHeight=h;
		this._scene.view.x         = x;
		this._scene.view.y         = y;

		this._rendererStage.x     = x;
		this._rendererStage.y    = y;
	//	this._rendererStage.container.style.zIndex="-100";
		this._rendererStage.width     = w;
		this._rendererStage.height    = h;
		this._scene.view.width     = w;
		this._scene.view.height    = h;
		if(this._fpsTextField)
			this._fpsTextField.style.left  =  window.innerWidth * 0.5 - 100 + 'px';
	};

	/**
	 * Initialise the listeners
	 */
	private initListeners()
	{
		console.log("init listeners");
		window.addEventListener("resize", this._resizeCallbackDelegate);

		this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
		this._timer.start();

		this._resizeCallbackDelegate(null);
	}
	private _debugtimer:number=0;
	/**
	 * Render loop
	 */
	private onEnterFrame(dt: number)
	{
		var frameMarker:number = Math.floor(1000/this._frameRate);
		this._time += Math.min(dt, frameMarker);

		if (this._time >= frameMarker) {
			this._time -= frameMarker;

			this._rendererStage.clear();

			//this.dispatchEventRecursive(this._eventOnEnter);
			this.advanceFrame(this._events);
			//this.dispatchEventRecursive(this._eventFrameConstructed);
			// todo: move Framescriptexecution and rest from frame-update logic from Movieclip.update to here
			//this.dispatchEventRecursive(this._eventExitFrame);
			//this.dispatchEventRecursive(this._eventRender);


			this._scene.render();
			this._currentFps++;

			this._debugtimer++;

			if(this._debugtimer%150==0){

				var displayGraph={};
				this.debugDisplayGraph(displayGraph);
				console.log("SceneGraph frame :", this._debugtimer, displayGraph);

			}
			
			
		}
	}
	public render()
	{
		this._rendererStage.clear();
		this.advanceFrame(this._events);
		this._scene.render();
	}

	public get rendererStage():AwayStage
	{
		return this._rendererStage;
	}


	//---------------------------original as3 properties / methods:

	public get mouseX () : number{
		//console.log("mouseX not implemented yet in flash/DisplayObject");
		return this._scene.mouseX;
	}

	/**
	 * Indicates the y coordinate of the mouse or user input device position, in pixels.
	 *
	 *   Note: For a DisplayObject that has been rotated, the returned y coordinate will reflect the
	 * non-rotated any.
	 */
	public get mouseY () : number{
		//console.log("mouseY not implemented yet in flash/DisplayObject");
		return this._scene.mouseY;
	}

	public set accessibilityImplementation (value:any){
		//todo: any is AccessibilityImplementation
		console.log("textSnapshot not implemented yet in flash/Stage");
	}


	/**
	 * A value from the StageAlign class that specifies the alignment of the stage in
	 * Flash Player or the browser. The following are valid values:
	 *
	 *   ValueVertical AlignmentHorizontalStageAlign.TOPTopCenterStageAlign.BOTTOMBottomCenterStageAlign.LEFTCenterLeftStageAlign.RIGHTCenterRightStageAlign.TOP_LEFTTopLeftStageAlign.TOP_RIGHTTopRightStageAlign.BOTTOM_LEFTBottomLeftStageAlign.BOTTOM_RIGHTBottomRightThe align property is only available to an object that is in the same security sandbox
	 * as the Stage owner (the main SWF file).
	 * To avoid this, the Stage owner can grant permission to the domain of the
	 * calling object by calling the Security.allowDomain() method or the Security.alowInsecureDomain() method.
	 * For more information, see the "Security" chapter in the ActionScript 3.0 Developer's Guide.
	 */
	public get align():StageAlign
	{
		return this._align;
	}
	public set align(value:StageAlign)
	{
		value=this._align;
	}

	/**
	 * Specifies whether this stage allows the use of the full screen mode
	 * @langversion	3.0
	 * @playerversion	Flash 10.2
	 * @oldexample	The following example traces the value of this read-only property:
	 *   <pre xml:space="preserve" class="- topic/pre ">
	 *   trace(Stage.allowsFullsreen);
	 *   </pre>
	 */
	public get allowsFullScreen () : boolean{
		//todo
		console.log("allowsFullScreen not implemented yet in flash/Stage");
		return false;
	}

	public get allowsFullScreenInteractive () : boolean{
		//todo
		console.log("allowsFullScreenInteractive not implemented yet in flash/Stage");
		return false;
	}


	public get browserZoomFactor () : number{
		//todo
		console.log("browserZoomFactor not implemented yet in flash/Stage");
		return 0;
	}


	public get color():number{
		return this._scene.renderer.view.backgroundColor;
	}
	public set color(color:number){
		this._scene.renderer.view.backgroundColor = color;
	}


	/**
	 * Controls Flash runtime color correction for displays.
	 * Color correction works only if the main monitor is assigned a valid ICC color profile, which specifies
	 * the device's particular color attributes.
	 * By default, the Flash runtime tries to match the color correction of its host (usually a browser).
	 *
	 *   Use the Stage.colorCorrectionSupport property
	 * to determine if color correction is available on the current system and the default state.
	 * .    If color correction is available, all colors on the stage are assumed to be in
	 * the sRGB color space, which is the most standard color space. Source profiles of input devices are not considered during color correction.
	 * No input color correction is applied; only the stage output is mapped to the main
	 * monitor's ICC color profile.In general, the benefits of activating color management include predictable and consistent color, better conversion,
	 * accurate proofing and more efficient cross-media output. Be aware, though, that color management does not provide
	 * perfect conversions due to devices having a different gamut from each other or original images.
	 * Nor does color management eliminate the need for custom or edited profiles.
	 * Color profiles are dependent on browsers, operating systems (OS), OS extensions, output devices, and application support.Applying color correction degrades the Flash runtime performance.
	 * A Flash runtime's color correction is document style color correction because
	 * all SWF movies are considered documents with implicit sRGB profiles.
	 * Use the Stage.colorCorrectionSupport property to tell the Flash runtime
	 * to correct colors when displaying the SWF file (document) to the display color space.
	 * Flash runtimes only compensates for differences between monitors, not for differences between input devices (camera/scanner/etc.).
	 * The three possible values are strings with corresponding constants in the flash.display.ColorCorrection class:"default": Use the same color correction as the host system."on": Always perform color correction."off": Never perform color correction.
	 */
	public get colorCorrection () : string{
		//todo
		console.log("colorCorrection not implemented yet in flash/Stage");
		return "";
	}
	public set colorCorrection (value:string){
		//todo
		console.log("colorCorrection not implemented yet in flash/Stage");
	}

	/**
	 * Specifies whether the Flash runtime is running on an operating system that supports
	 * color correction and whether the color profile of the main (primary)
	 * monitor can be read and understood by the Flash runtime. This property also returns the default state
	 * of color correction on the host system (usually the browser).
	 * Currently the return values can be:
	 * The three possible values are strings with corresponding constants in the flash.display.ColorCorrectionSupport class:"unsupported": Color correction is not available."defaultOn": Always performs color correction."defaultOff": Never performs color correction.

	 */
	public get colorCorrectionSupport () : string{
		//todo
		console.log("colorCorrectionSupport not implemented yet in flash/Stage");
		return "";
	}

	public get contentsScaleFactor () : number{
		//todo
		console.log("contentsScaleFactor not implemented yet in flash/Stage");
		return 0;
	}

	public get displayContextInfo () : string{
		//todo
		console.log("displayContextInfo not implemented yet in flash/Stage");
		return "";
	}

	/**
	 * A value from the StageDisplayState class that specifies which display state to use. The following
	 * are valid values:
	 *
	 *   StageDisplayState.FULL_SCREEN Sets AIR application or Flash runtime to expand the
	 * stage over the user's entire screen, with keyboard input disabled.StageDisplayState.FULL_SCREEN_INTERACTIVE Sets the AIR application to expand the
	 * stage over the user's entire screen, with keyboard input allowed.
	 * (Not available for content running in Flash Player.)StageDisplayState.NORMAL Sets the Flash runtime back to the standard stage display mode.The scaling behavior of the movie in full-screen mode is determined by the scaleMode
	 * setting (set using the Stage.scaleMode property or the SWF file's embed
	 * tag settings in the HTML file). If the scaleMode property is set to noScale
	 * while the application transitions to full-screen mode, the Stage width and height
	 * properties are updated, and the Stage dispatches a resize event. If any other scale mode is set,
	 * the stage and its contents are scaled to fill the new screen dimensions. The Stage object retains its original
	 * width and height values and does not dispatch a resize event.The following restrictions apply to SWF files that play within an HTML page (not those using the stand-alone
	 * Flash Player or not running in the AIR runtime):To enable full-screen mode, add the allowFullScreen parameter to the object
	 * and embed tags in the HTML page that includes the SWF file, with allowFullScreen set
	 * to "true", as shown in the following example:
	 *
	 *   <codeblock>
	 * <param name="allowFullScreen" value="true" />
	 * ...
	 * <embed src="example.swf" allowFullScreen="true" ... >
	 * </codeblock>
	 * An HTML page may also use a script to generate SWF-embedding tags. You need to alter the script
	 * so that it inserts the proper allowFullScreen settings. HTML pages generated by Flash Professional and
	 * Flash Builder use the AC_FL_RunContent() to embed references to SWF files, and you
	 * need to add the allowFullScreen parameter settings, as in the following:
	 * <codeblock>
	 * AC_FL_RunContent( ... "allowFullScreen", "true", ... )
	 * </codeblock>
	 * Full-screen mode is initiated in response to a mouse click or key press by the user; the movie cannot change
	 * Stage.displayState without user input. Flash runtimes restrict keyboard input  in full-screen mode.
	 * Acceptable keys include keyboard shortcuts that terminate full-screen mode and non-printing keys such as arrows, space, Shift,
	 * and Tab keys. Keyboard shortcuts that terminate full-screen mode are: Escape (Windows, Linux, and Mac), Control+W (Windows),
	 * Command+W (Mac), and Alt+F4.
	 * A Flash runtime dialog box appears over the movie when users enter full-screen mode to inform the users they are in
	 * full-screen mode and that they can press the Escape key to end full-screen mode.Starting with Flash Player 9.0.115.0, full-screen works the same in windowless mode as it does in window mode.
	 * If you set the Window Mode (wmode in the HTML) to Opaque Windowless (opaque)
	 * or Transparent Windowless (transparent), full-screen can be initiated,
	 * but the full-screen window will always be opaque.These restrictions are not present for SWF content running in the
	 * stand-alone Flash Player or in AIR. AIR supports an interactive full-screen mode which allows keyboard input.For AIR content running in full-screen mode, the system screen saver
	 * and power saving options are disabled while video content is playing and until either the video stops
	 * or full-screen mode is exited.On Linux, setting displayState to StageDisplayState.FULL_SCREEN or
	 * StageDisplayState.FULL_SCREEN_INTERACTIVE is an asynchronous operation.
	 * @throws	SecurityError Calling the displayState property of a Stage object throws an exception for
	 *   any caller that is not in the same security sandbox as the Stage owner (the main SWF file).
	 *   To avoid this, the Stage owner can grant permission to the domain of the caller by calling
	 *   the Security.allowDomain() method or the Security.allowInsecureDomain() method.
	 *   For more information, see the "Security" chapter in the ActionScript 3.0 Developer's Guide.
	 *   Trying to set the displayState property while the settings dialog is displayed, without a user response, or
	 *   if the param or embed HTML tag's allowFullScreen attribute is not set to
	 *   true throws a security error.
	 */
	public get displayState () : string{
		//todo
		console.log("displayState not implemented yet in flash/Stage");
		return "";
	}
	public set displayState (value:string) {
		//todo
		console.log("displayState not implemented yet in flash/Stage");
	}


	/**
	 * The interactive object with keyboard focus; or null if focus is not set
	 * or if the focused object belongs to a security sandbox to which the calling object does not
	 * have access.
	 * @throws	Error Throws an error if focus cannot be set to the target.
	 */
	public get focus () : any{
		//todo: any is InteractiveObject
		//console.log("focus not implemented yet in flash/Stage");
		return null;
	}
	public set focus (newFocus:any){
		//todo: any is InteractiveObject
		//console.log("focus not implemented yet in flash/Stage");
	}


	/**
	 * Gets and sets the frame rate of the stage. The frame rate is defined as frames per second.
	 * By default the rate is set to the frame rate of the first SWF file loaded. Valid range for the frame rate
	 * is from 0.01 to 1000 frames per second.
	 *
	 *   Note: An application might not be able to follow
	 * high frame rate settings, either because the target platform is not fast enough or the player is
	 * synchronized to the vertical blank timing of the display device (usually 60 Hz on LCD devices).
	 * In some cases, a target platform might also choose to lower the maximum frame rate if it
	 * anticipates high CPU usage.For content running in Adobe AIR, setting the frameRate property of one Stage
	 * object changes the frame rate for all Stage objects (used by different NativeWindow objects).
	 * @throws	SecurityError Calling the frameRate property of a Stage object throws an exception for
	 *   any caller that is not in the same security sandbox as the Stage owner (the main SWF file).
	 *   To avoid this, the Stage owner can grant permission to the domain of the caller by calling
	 *   the Security.allowDomain() method or the Security.allowInsecureDomain() method.
	 *   For more information, see the "Security" chapter in the ActionScript 3.0 Developer's Guide.
	 */
	public get frameRate () : number{
		return this._frameRate;
	}

	public set frameRate (value:number) {
		this._frameRate=value;
	}

	/**
	 * Returns the height of the monitor that will be used when going to full screen size, if that state
	 * is entered immediately. If the user has multiple monitors, the monitor that's used is the
	 * monitor that most of the stage is on at the time.
	 *
	 *   Note: If the user has the opportunity to move the browser from one
	 * monitor to another between retrieving the value and going to full screen
	 * size, the value could be incorrect. If you retrieve the value in an event handler that
	 * sets Stage.displayState to StageDisplayState.FULL_SCREEN, the value will be
	 * correct.This is the pixel height of the monitor and is the same as the
	 * stage height would be if Stage.align is set to StageAlign.TOP_LEFT
	 * and Stage.scaleMode is set to StageScaleMode.NO_SCALE.
	 */
	public get fullScreenHeight () : number{
		//todo
		console.log("fullScreenHeight not implemented yet in flash/Stage");
		return 0;
	}

	/**
	 * Sets the Flash runtime to scale a specific region of the stage to full-screen mode.
	 * If available, the Flash runtime scales in hardware, which uses the graphics and video card on a user's computer,
	 * and generally displays content more quickly than software scaling.
	 *
	 *   When this property is set to a valid rectangle and the displayState property is set to full-screen mode,
	 * the Flash runtime scales the specified area. The actual Stage size in pixels within ActionScript does not change.
	 * The Flash runtime enforces a minimum limit for the size of the rectangle to accommodate the standard "Press Esc to exit full-screen mode" message.
	 * This limit is usually around 260 by 30 pixels but can vary on platform and Flash runtime version.This property can only be set when the Flash runtime is not in full-screen mode.
	 * To use this property correctly, set this property first, then set the displayState property to full-screen mode, as shown in the code examples.To enable scaling, set the fullScreenSourceRect property to a rectangle object:
	 * <codeblock>
	 *
	 *   // valid, will enable hardware scaling
	 * stage.fullScreenSourceRect = new Rectangle(0,0,320,240);
	 *
	 *   </codeblock>
	 * To disable scaling, set the fullScreenSourceRect=null in ActionScript 3.0, and undefined in ActionScript 2.0.
	 * <codeblock>
	 *
	 *   stage.fullScreenSourceRect = null;
	 *
	 *   </codeblock>
	 * The end user also can select within Flash Player Display Settings to turn off hardware scaling, which is enabled by default.
	 * For more information, see www.adobe.com/go/display_settings.
	 */
	public get fullScreenSourceRect () : Rectangle{
		//todo
		console.log("fullScreenSourceRect not implemented yet in flash/Stage");
		return null;
	}
	public set fullScreenSourceRect (Rectangle){
		//todo
		console.log("fullScreenSourceRect not implemented yet in flash/Stage");
	}

	/**
	 * Returns the width of the monitor that will be used when going to full screen size, if that state
	 * is entered immediately. If the user has multiple monitors, the monitor that's used is the
	 * monitor that most of the stage is on at the time.
	 *
	 *   Note: If the user has the opportunity to move the browser from one
	 * monitor to another between retrieving the value and going to full screen
	 * size, the value could be incorrect. If you retrieve the value in an event handler that
	 * sets Stage.displayState to StageDisplayState.FULL_SCREEN, the value will be
	 * correct.This is the pixel width of the monitor and is the same as the stage width would be if
	 * Stage.align is set to StageAlign.TOP_LEFT and
	 * Stage.scaleMode is set to StageScaleMode.NO_SCALE.
	 */
	public get fullScreenWidth () : number{
		//todo
		console.log("fullScreenWidth not implemented yet in flash/Stage");
		return 0;
	}




	public get mouseLock () : boolean{
		//todo
		console.log("mouseLock not implemented yet in flash/Stage");
		return false;
	}
	public set mouseLock (value:boolean){
		//todo
		console.log("mouseLock not implemented yet in flash/Stage");
	}




	/**
	 * A value from the StageQuality class that specifies which rendering quality is used.
	 * The following are valid values:
	 *
	 *   StageQuality.LOW—Low rendering quality. Graphics are not
	 * anti-aliased, and bitmaps are not smoothed, but runtimes still use mip-mapping.StageQuality.MEDIUM—Medium rendering quality. Graphics are
	 * anti-aliased using a 2 x 2 pixel grid, bitmap smoothing is dependent on the Bitmap.smoothing setting.
	 * Runtimes use mip-mapping. This setting is suitable for movies that do not contain text.StageQuality.HIGH—High rendering quality. Graphics are anti-aliased
	 * using a 4 x 4 pixel grid, and bitmap smoothing is dependent on the Bitmap.smoothing setting.
	 * Runtimes use mip-mapping. This is the default rendering quality setting that Flash Player uses.StageQuality.BEST—Very high rendering quality. Graphics are
	 * anti-aliased using a 4 x 4 pixel grid. If Bitmap.smoothing is true the runtime uses a high quality
	 * downscale algorithm that produces fewer artifacts (however, using StageQuality.BEST with Bitmap.smoothing set to true
	 * slows performance significantly and is not a recommended setting).Higher quality settings produce better rendering of scaled bitmaps. However, higher
	 * quality settings are computationally more expensive. In particular, when rendering scaled video,
	 * using higher quality settings can reduce the frame rate.
	 * In the desktop profile of Adobe AIR, quality can be set
	 * to StageQuality.BEST or StageQuality.HIGH (and the default value
	 * is StageQuality.HIGH). Attempting to set it to another value has no effect
	 * (and the property remains unchanged). In the moble profile of AIR, all four quality settings
	 * are available. The default value on mobile devices is StageQuality.MEDIUM.For content running in Adobe AIR, setting the quality property of one Stage
	 * object changes the rendering quality for all Stage objects (used by different NativeWindow objects).
	 * Note: The operating system draws the device fonts,
	 * which are therefore unaffected by the quality property.
	 * @throws	SecurityError Calling the quality property of a Stage object throws an exception for
	 *   any caller that is not in the same security sandbox as the Stage owner (the main SWF file).
	 *   To avoid this, the Stage owner can grant permission to the domain of the caller by calling
	 *   the Security.allowDomain() method or the Security.allowInsecureDomain() method.
	 *   For more information, see the "Security" chapter in the ActionScript 3.0 Developer's Guide.
	 */
	public get quality () : string{
		//todo
		//console.log("quality not implemented yet in flash/Stage");
		return "";

	}
	public set quality (value:string){
		//todo
		//console.log("quality not implemented yet in flash/Stage");
	}


	/**
	 * A value from the StageScaleMode class that specifies which scale mode to use.
	 * The following are valid values:
	 *
	 *   StageScaleMode.EXACT_FIT—The entire application is visible
	 * in the specified area without trying to preserve the original aspect ratio. Distortion can occur, and the application may appear stretched or compressed.
	 * StageScaleMode.SHOW_ALL—The entire application is visible
	 * in the specified area without distortion while maintaining the original aspect ratio of the application.
	 * Borders can appear on two sides of the application.
	 * StageScaleMode.NO_BORDER—The entire application fills the specified area,
	 * without distortion but possibly with some cropping, while maintaining the original aspect ratio
	 * of the application.
	 * StageScaleMode.NO_SCALE—The entire application is fixed, so that
	 * it remains unchanged even as the size of the player window changes. Cropping might
	 * occur if the player window is smaller than the content.
	 * @throws	SecurityError Calling the scaleMode property of a Stage object throws an exception for
	 *   any caller that is not in the same security sandbox as the Stage owner (the main SWF file).
	 *   To avoid this, the Stage owner can grant permission to the domain of the caller by calling
	 *   the Security.allowDomain() method or the Security.allowInsecureDomain() method.
	 *   For more information, see the "Security" chapter in the ActionScript 3.0 Developer's Guide.
	 */
	public get scaleMode():StageScaleMode
	{
		return this._scaleMode;
	}
	public set scaleMode(value:StageScaleMode)
	{
		this._scaleMode=value;
		this._resizeCallbackDelegate(null);
	}

	/**
	 * Specifies whether to show or hide the default items in the Flash runtime
	 * context menu.
	 *
	 *   If the showDefaultContextMenu property is set to true (the
	 * default), all context menu items appear. If the showDefaultContextMenu property
	 * is set to false, only the Settings and About... menu items appear.
	 * @throws	SecurityError Calling the showDefaultContextMenu property of a Stage object throws an exception for
	 *   any caller that is not in the same security sandbox as the Stage owner (the main SWF file).
	 *   To avoid this, the Stage owner can grant permission to the domain of the caller by calling
	 *   the Security.allowDomain() method or the Security.allowInsecureDomain() method.
	 *   For more information, see the "Security" chapter in the ActionScript 3.0 Developer's Guide.
	 */
	public get showDefaultContextMenu () : boolean{
		//todo
		console.log("showDefaultContextMenu not implemented yet in flash/Stage");
		return false;


	}
	public set showDefaultContextMenu (value:boolean){
		//todo
		console.log("showDefaultContextMenu not implemented yet in flash/Stage");

	}

	/**
	 * The area of the stage that is currently covered by the software keyboard.
	 *
	 *   The area has a size of zero (0,0,0,0) when the soft keyboard is not visible.When the keyboard opens, the softKeyboardRect is set at the time the
	 * softKeyboardActivate event is dispatched. If the keyboard changes size while open,
	 * the runtime updates the softKeyboardRect property and dispatches an
	 * additional softKeyboardActivate event.Note: On Android, the area covered by the keyboard is estimated when
	 * the operating system does not provide the information necessary to determine the exact
	 * area. This problem occurs in fullscreen mode and also when the keyboard opens in response to
	 * an InteractiveObject receiving focus or invoking the requestSoftKeyboard() method.
	 */
	public get softKeyboardRect () : Rectangle{
		//todo
		console.log("softKeyboardRect not implemented yet in flash/Stage");
		return null;

	}

	public get stage3Ds () : AwayStage[]{
		// todo: any is stage3d
		console.log("stage3Ds not implemented yet in flash/Stage");
		return this._stage3Ds;
	}

	/**
	 * Specifies whether or not objects display a glowing border when they have focus.
	 * @throws	SecurityError Calling the stageFocusRect property of a Stage object throws an exception for
	 *   any caller that is not in the same security sandbox as the Stage owner (the main SWF file).
	 *   To avoid this, the Stage owner can grant permission to the domain of the caller by calling
	 *   the Security.allowDomain() method or the Security.allowInsecureDomain() method.
	 *   For more information, see the "Security" chapter in the ActionScript 3.0 Developer's Guide.
	 */
	public get stageFocusRect () : boolean{
		//todo
		console.log("stageFocusRect not implemented yet in flash/Stage");
		return false;

	}
	public set stageFocusRect (on:boolean){
		//todo
		console.log("stageFocusRect not implemented yet in flash/Stage");
	}

	/**
	 * The current height, in pixels, of the Stage.
	 *
	 *   If the value of the Stage.scaleMode property is set to StageScaleMode.NO_SCALE
	 * when the user resizes the window, the Stage content maintains its size while the
	 * stageHeight property changes to reflect the new height size of the screen area occupied by
	 * the SWF file. (In the other scale modes, the stageHeight property always reflects the original
	 * height of the SWF file.) You can add an event listener for the resize event and then use the
	 * stageHeight property of the Stage class to determine the actual pixel dimension of the resized
	 * Flash runtime window. The event listener allows you to control how
	 * the screen content adjusts when the user resizes the window.Air for TV devices have slightly different behavior than desktop devices
	 * when you set the stageHeight property.
	 * If the Stage.scaleMode
	 * property is set to StageScaleMode.NO_SCALE and you set the stageHeight
	 * property, the stage height does not change until the next
	 * frame of the SWF.Note: In an HTML page hosting the SWF file, both the object and embed tags' height attributes must be set to a percentage (such as 100%), not pixels. If the
	 * settings are generated by JavaScript code, the height parameter of the AC_FL_RunContent()
	 * method must be set to a percentage, too. This percentage is applied to the stageHeight
	 * value.
	 * @throws	SecurityError Calling the stageHeight property of a Stage object throws an exception for
	 *   any caller that is not in the same security sandbox as the Stage owner (the main SWF file).
	 *   To avoid this, the Stage owner can grant permission to the domain of the caller by calling
	 *   the Security.allowDomain() method or the Security.allowInsecureDomain() method.
	 *   For more information, see the "Security" chapter in the ActionScript 3.0 Developer's Guide.
	 */
	public get stageHeight () : number{
		return this._stageHeight;
	}
	public set stageHeight (value:number){
		this._stageHeight=value;
	}

	/**
	 * A list of StageVideo objects available for playing external videos.
	 *
	 *   You can use only a limited number of StageVideo objects at a time.
	 * When a SWF begins to run, the number of available StageVideo objects depends on the platform
	 * and on available hardware.
	 * To use a StageVideo object, assign a member of the stageVideos Vector object to a StageVideo variable.
	 * All StageVideo objects are displayed on the stage behind any display objects.
	 * The StageVideo objects are displayed on the stage in the order they appear in
	 * the stageVideos Vector object. For example, if the stageVideos Vector object contains
	 * three entries:The StageVideo object in the 0 index of the stageVideos Vector object is
	 * displayed behind all StageVideo objects.The StageVideo object at index 1 is displayed in front
	 * of the StageVideo object at index 0.The StageVideo object at index 2 is displayed in front
	 * of the StageVideo object at index 1.Use the StageVideo.depth property to change this ordering.Note: AIR for TV devices support only one StageVideo object.
	 */
	public get stageVideos () : any[]{
		//todo: any is StageVideo
		console.log("stageVideos not implemented yet in flash/Stage");
		return [];
	}

	/**
	 * Specifies the current width, in pixels, of the Stage.
	 *
	 *   If the value of the Stage.scaleMode property is set to StageScaleMode.NO_SCALE
	 * when the user resizes the window, the Stage content maintains its defined size while the stageWidth
	 * property changes to reflect the new width size of the screen area occupied by the SWF file. (In the other scale
	 * modes, the stageWidth property always reflects the original width of the SWF file.) You can add an event
	 * listener for the resize event and then use the stageWidth property of the Stage class to
	 * determine the actual pixel dimension of the resized Flash runtime window. The event listener allows you to control how
	 * the screen content adjusts when the user resizes the window.Air for TV devices have slightly different behavior than desktop devices
	 * when you set the stageWidth property.
	 * If the Stage.scaleMode
	 * property is set to StageScaleMode.NO_SCALE and you set the stageWidth
	 * property, the stage width does not change until the next
	 * frame of the SWF.Note: In an HTML page hosting the SWF file, both the object and embed tags' width attributes must be set to a percentage (such as 100%), not pixels. If the
	 * settings are generated by JavaScript code, the width parameter of the AC_FL_RunContent()
	 * method must be set to a percentage, too. This percentage is applied to the stageWidth
	 * value.
	 * @throws	SecurityError Calling the stageWidth property of a Stage object throws an exception for
	 *   any caller that is not in the same security sandbox as the Stage owner (the main SWF file).
	 *   To avoid this, the Stage owner can grant permission to the domain of the caller by calling
	 *   the Security.allowDomain() method or the Security.allowInsecureDomain() method.
	 *   For more information, see the "Security" chapter in the ActionScript 3.0 Developer's Guide.
	 */
	public get stageWidth () : number{
		return this._stageWidth;
	}
	public set stageWidth (value:number){
		this._stageWidth=value;
	}

	/**
	 * Determines whether the children of the object are tab enabled. Enables or disables tabbing for the
	 * children of the object. The default is true.
	 * Note: Do not use the tabChildren property with Flex.
	 * Instead, use the mx.core.UIComponent.hasFocusableChildren property.
	 * @throws	SecurityError Referencing the tabChildren property of a Stage object throws an exception for
	 *   any caller that is not in the same security sandbox as the Stage owner (the main SWF file).
	 *   To avoid this, the Stage owner can grant permission to the domain of the caller by calling
	 *   the Security.allowDomain() method or the Security.allowInsecureDomain() method.
	 *   For more information, see the "Security" chapter in the ActionScript 3.0 Developer's Guide.
	 */
	public get tabChildren () : boolean{
		//todo
		console.log("tabChildren not implemented yet in flash/Stage");
		return false;
	}

	/**
	 * Returns a TextSnapshot object for this DisplayObjectContainer instance.
	 * @throws	IllegalOperationError Referencing the textSnapshot property of a Stage object throws an
	 *   exception because the Stage class does not implement this property. To avoid this, call the
	 *   textSnapshot property of a display object container other than the Stage object.
	 */
	public get textSnapshot () : any{
		//todo
		console.log("textSnapshot not implemented yet in flash/Stage");
		//todo: any is flash.text.TextSnapshot
		return null;
	}

	/**
	 * Indicates whether GPU compositing is available and in use. The wmodeGPU value is trueonly
	 * when all three of the following conditions exist:
	 * GPU compositing has been requested.GPU compositing is available.GPU compositing is in use.Specifically, the wmodeGPU property indicates one of the following:GPU compositing has not been requested or is unavailable. In this case, the wmodeGPU property value is false.GPU compositing has been requested (if applicable and available), but the environment is operating in "fallback mode"
	 * (not optimal rendering) due to limitations of the content. In this case, the wmodeGPU property value is true.GPU compositing has been requested (if applicable and available), and the environment is operating in the best mode. In this case, the
	 * wmodeGPU property value is also true.In other words, the wmodeGPU property identifies the capability and state of the rendering environment. For runtimes
	 * that do not support GPU compositing, such as AIR 1.5.2, the value is always false, because (as stated above) the value is
	 * true only when GPU compositing has been requested, is available, and is in use.The wmodeGPU property is useful to determine, at runtime, whether or not GPU compositing is in use. The value of
	 * wmodeGPU indicates if your content is going to be scaled by hardware, or not, so you can present graphics at the correct size.
	 * You can also determine if you're rendering in a fast path or not, so that you can adjust your content complexity accordingly.For Flash Player in a browser, GPU compositing can be requested by the value of gpu for the wmode HTML
	 * parameter in the page hosting the SWF file. For other configurations, GPU compositing can be requested in the header of a SWF file
	 * (set using SWF authoring tools).However, the wmodeGPU property does not identify the current rendering performance. Even if GPU compositing is "in use" the rendering
	 * process might not be operating in the best mode. To adjust your content for optimal rendering, use a Flash runtime debugger version,
	 * and set the DisplayGPUBlendsetting in your mm.cfg file.Note: This property is always false when referenced
	 * from ActionScript that runs before the runtime performs its first rendering
	 * pass.  For example, if you examine wmodeGPU from a script in Frame 1 of
	 * Adobe Flash Professional, and your SWF file is the first SWF file loaded in a new
	 * instance of the runtime, then the wmodeGPU value is false.
	 * To get an accurate value, wait until at least one rendering pass
	 * has occurred. If you write an event listener for the
	 * exitFrame event of any DisplayObject, the wmodeGPU value at
	 * is the correct value.
	 */
	public get wmodeGPU () : boolean{
		//todo
		console.log("wmodeGPU not implemented yet in flash/Stage");
		return false;
	}

	//empty functions to prevent inherited actions

	public set accessibilityProperties (value:any){};//todo: any is AccessibilityImplementation
	public set alpha (value:number){};
	public set blendMode (value:string){};
	public set cacheAsBitmap (value:boolean){};
	public set contextMenu (value:any){};// todo: any is ContextMenu
	public set filters (value:Array<any>) {};
	public set focusRect (value:any) {};
	public set loaderInfo (value:any) {};
	public set mask (value:DisplayObject){};
	public set mouseChildren (value:boolean){};
	public get mouseChildren():boolean{return false;};
	public set mouseEnabled (value:boolean){};
	public get mouseEnabled():boolean{return false;};
	public set numChildren (value:number){};
	public get numChildren():number{return 0;};
	public set width (value:number){};
	public get width():number{return 0;};
	public set height (value:number){};
	public get height():number{return 0;};
	public set opaqueBackground (value:number){};
	public set name (value:string){};
	public set rotation (value:number){};
	public set rotationX (value:number){};
	public set rotationY (value:number){};
	public set rotationZ (value:number){};
	public set scale9Grid (value:Rectangle){};
	public set scaleX (value:number){};
	public set scaleY (value:number){};
	public set scaleZ (value:number){};
	public set scrollRect (value:Rectangle){};
	public set tabEnabled (value:boolean){};
	public set tabIndex (value:number){};
	public set transform (value:Transform){};
	public set visible (value:boolean){};
	public set x (value:number){};
	public set y (value:number){};
	public set z (value:number){};

	public set tabChildren (value:boolean){}
	

	// 80pro: todo: this was added because otherwise avm2 cant find these on Stage
	//	but it should find them anyway, because its inheriting from Sprite...
	//____________________________________
	public addChild (child:DisplayObject) : DisplayObject {return super.addChild(child);}
	public addChildAt (child:DisplayObject, index:number) : DisplayObject {return super.addChildAt(child, index);}
	public removeChildAt (index:number) : DisplayObject {return super.removeChildAt(index);}
	public swapChildrenAt (index:number,index2:number) : void {return super.swapChildrenAt(index, index2);}
	
	public setChildIndex (child:DisplayObject, index:number) : DisplayObject {return null;}
	public addEventListener(type: string, listener: any, useCapture: boolean = false,
		priority: number = 0, useWeakReference: boolean = false): void{
			super.addEventListener(type, listener, useCapture = false, priority, useWeakReference);
		}
	public hasEventListener(type: string): boolean {
		return super.hasEventListener(type);}
	public willTrigger(){return super.willTrigger();}
	public dispatchEvent(event: Event): void {
		return super.dispatchEvent(event);}
	//____________________________________
		

	/**
	 * Calling the invalidate() method signals Flash runtimes to alert display objects
	 * on the next opportunity it has to render the display list (for example, when the playhead
	 * advances to a new frame). After you call the invalidate() method, when the display
	 * list is next rendered, the Flash runtime sends a render event to each display object that has
	 * registered to listen for the render event. You must call the invalidate()
	 * method each time you want the Flash runtime to send render events.
	 *
	 *   The render event gives you an opportunity to make changes to the display list
	 * immediately before it is actually rendered. This lets you defer updates to the display list until the
	 * latest opportunity. This can increase performance by eliminating unnecessary screen updates.The render event is dispatched only to display objects that are in the same
	 * security domain as the code that calls the stage.invalidate() method,
	 * or to display objects from a security domain that has been granted permission via the
	 * Security.allowDomain() method.
	 */
	public invalidate (){
		//todo
		console.log("invalidate not implemented yet in flash/Stage");
	}

	/**
	 * Determines whether the Stage.focus property returns null for
	 * security reasons.
	 * In other words, isFocusInaccessible returns true if the
	 * object that has focus belongs to a security sandbox to which the SWF file does not have access.
	 * @return	true if the object that has focus belongs to a security sandbox to which
	 *   the SWF file does not have access.
	 */
	public isFocusInaccessible () : boolean{
		//todo
		console.log("isFocusInaccessible not implemented yet in flash/Stage");
		return false;
	}


}