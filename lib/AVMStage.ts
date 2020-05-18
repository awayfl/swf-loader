
import { AssetEvent, LoaderEvent, AssetLibrary, URLRequest, URLLoaderEvent, RequestAnimationFrame, AudioManager, PerspectiveProjection, CoordinateSystem, ColorUtils } from "@awayjs/core"
import { SWFParser } from "./parsers/SWFParser"
import { IAVMHandler } from "./IAVMHandler";
import { SWFFile } from "./parsers/SWFFile";
import { StageAlign } from "./factories/as3webFlash/display/StageAlign";
import { StageScaleMode } from "./factories/as3webFlash/display/StageScaleMode";
import { Scene, Camera, DisplayObjectContainer, SceneGraphPartition, MovieClip, FrameScriptManager } from "@awayjs/scene";
import { BasicPartition } from "@awayjs/view";
import { Stage } from "@awayjs/stage";
import { IAVMStage } from "./IAVMStage";
import { AVMVERSION } from './factories/base/AVMVersion';
import { AVMEvent } from './AVMEvent';
import { MovieClipSoundsManager } from './factories/timelinesounds/MovieClipSoundsManager';



export class AVMStage extends DisplayObjectContainer implements IAVMStage {

	private _swfFile: SWFFile;
	private _avmHandlers: StringMap<IAVMHandler>;
	protected _avmHandler: IAVMHandler;
	private _timer: RequestAnimationFrame;
	private _time: number;

	private _align: StageAlign;
	private _scaleMode: StageScaleMode;
	private _stageWidth: number;
	private _stageHeight: number;
	private _frameRate: number;
	private _showFrameRate: boolean;
	private _showFrameRateIntervalID: number;

	private _fpsTextField: HTMLDivElement;
	private _currentFps: number;
	private _projection: PerspectiveProjection;
	private _scene: Scene;
	private _rendererStage: Stage;
	
	private _x: any;
	private _y: any;
	private _w: any;
	private _h: any;

	private _isPaused: boolean;

	protected _gameConfig: IGameConfig = null;
	private _curFile: IResourceFile = null;

	private static _instance: AVMStage = null;
	public static instance():AVMStage
	{
		if(!AVMStage._instance)
			throw("AVMStage._instance should exists but does not")
		return AVMStage._instance;
	}

	constructor(gameConfig:IGameConfig) {

		super();

		if(AVMStage._instance)
			throw("Only one AVMStage is allowed to be constructed");

		AVMStage._instance = this;

		this._time = 0;
		this._currentFps = 0;

		this._avmHandlers = {};

		this._stageWidth = 550;
		this._stageHeight = 400;
		this._scaleMode = StageScaleMode.SHOW_ALL;
		this._align = StageAlign.TOP_LEFT;
		this._frameRate = 30;
		this._showFrameRate = false;
		this._showFrameRateIntervalID = -1;

		this._x=gameConfig.x?gameConfig.x:0;
		this._y=gameConfig.y?gameConfig.y:0;
		this._w=gameConfig.w?gameConfig.w:"100%";
		this._h=gameConfig.h?gameConfig.h:"100%";

		this._isPaused=false;

		this._gameConfig=gameConfig;
		// init awayengine
		this.initAwayEninge();
		this._scene.renderer.view.backgroundColor = 0xffffff;
		//this._stage3Ds[this._stage3Ds.length]=new AwayStage(null, );
		AudioManager.setVolume(1);

		// resize event listens on window
		this._resizeCallbackDelegate = (event: any) => this.resizeCallback(event);
		window.addEventListener("resize", this._resizeCallbackDelegate);

		this._onLoaderStartDelegate = (event: LoaderEvent) => this.onLoaderStart(event);
		this._onLoaderCompleteDelegate = (event: LoaderEvent) => this.onLoaderComplete(event);
		this._onAssetCompleteDelegate = (event: AssetEvent) => this._onAssetComplete(event);
		this._onLoadErrorDelegate = (event: URLLoaderEvent) => this._onLoadError(event);

	}

	public registerAVMStageHandler(value: IAVMHandler) {
		this._avmHandlers[value.avmVersion] = value;
	}

	private initAwayEninge() {

		//create the view
		this._scene = new Scene(new BasicPartition(new DisplayObjectContainer()));
		this._rendererStage = this.scene.view.stage;
		this._rendererStage.container.style.visibility = "hidden";
		this._rendererStage.antiAlias = 0;
		this._scene.renderer.renderableSorter = null;//new RenderableSort2D();
		this._scene.forceMouseMove = true;
		this._scene.mousePicker.shapeFlag=true;

		this._projection = new PerspectiveProjection();
		this._projection.coordinateSystem = CoordinateSystem.RIGHT_HANDED;
		this._projection.originX = -1;
		this._projection.originY = 1;
		var camera: Camera = new Camera();
		camera.projection = this._projection;
		this._scene.camera = camera;
		this._projection.fieldOfView = Math.atan(window.innerHeight / 1000 / 2) * 360 / Math.PI;

		this.partition = new SceneGraphPartition(this, true);
		this._scene.root.addChild(this);

	}

	public playSWF(buffer:any, url:string) {
		
		this._gameConfig = {
			files:[{data:buffer, path:url, resourceType:ResourceType.GAME}]
		}
		this.addEventListener(LoaderEvent.LOADER_COMPLETE, (e) => this.play());
		this.loadNextResource();	
	}

	public loadNextResource(event: LoaderEvent = null) {
		this._curFile = this._gameConfig.files.shift();
		if (this._curFile) {
			let parser = new SWFParser();
			parser._iFileName = this._curFile.path;
			if (this._curFile.resourceType == ResourceType.GAME) {
				if (this._swfFile) {
					throw "Only playing of 1 SWF file is supported at the moment";
				}
				parser.onFactoryRequest = (swfFile) => {
					this._swfFile = swfFile;
					this.frameRate = this._swfFile.frameRate;

					// todo: these values should already been modded in the parser:
					this.color = ColorUtils.f32_RGBA_To_f32_ARGB(swfFile.backgroundColor);
					this.stageWidth = this._swfFile.bounds.width / 20;
					this.stageHeight = this._swfFile.bounds.height / 20;

					var avmName: AVMVERSION = this._swfFile.useAVM1 ? AVMVERSION.AVM1 : AVMVERSION.AVM2;

					this._avmHandler = this._avmHandlers[avmName];

					if (!this._avmHandler) {
						throw ("no avm-stage installed for " + avmName);
					}
					this._avmHandler.init(this, this._swfFile, (hasInit) => {
						parser.factory = this._avmHandler.factory;
						SWFParser.factory = this._avmHandler.factory;
						if (hasInit)
							this.dispatchEvent(new AVMEvent(AVMEvent.AVM_COMPLETE, avmName));
					});

				};
			}
			// Parser will not be provided with factory. DefaultSceneGraphFactory will be used
			AssetLibrary.addEventListener(LoaderEvent.LOADER_START, this._onLoaderStartDelegate);
			AssetLibrary.addEventListener(AssetEvent.ASSET_COMPLETE, this._onAssetCompleteDelegate);
			AssetLibrary.addEventListener(LoaderEvent.LOADER_COMPLETE, this._onLoaderCompleteDelegate);
			AssetLibrary.addEventListener(URLLoaderEvent.LOAD_ERROR, this._onLoadErrorDelegate);
			if (this._curFile.data) {
				AssetLibrary.loadData(this._curFile.data, null, this._curFile.path, parser);
			}
			else {
				AssetLibrary.load(new URLRequest(this._curFile.path), null, this._curFile.path, parser);
			}
		}
		else {
			if (!this._swfFile) {
				throw ("no valid SWFFile was loaded!");
			}
			if (event) {
				this.dispatchEvent(event);
			}
		}
	}
	public load() {
		this.loadNextResource();
	}
	private _onLoaderStartDelegate: (event: LoaderEvent) => void;
	public onLoaderStart(event: LoaderEvent) {
		this.dispatchEvent(event);
	}
	private _onAssetCompleteDelegate: (event: AssetEvent) => void;
	public _onAssetComplete(event: AssetEvent) {
		// atm we only addAssets to avmHandler that come from the game swf
		// preloaded files are fonts, and are handled by DefaultManager outside of SWF
		if (this._curFile.resourceType == ResourceType.GAME)
			this._avmHandler.addAsset(event.asset, true);
		this.dispatchEvent(event);
	}
	private _onLoaderCompleteDelegate: (event: LoaderEvent) => void;
	public onLoaderComplete(event: LoaderEvent) {
		AssetLibrary.removeEventListener(AssetEvent.ASSET_COMPLETE, this._onAssetCompleteDelegate);
		AssetLibrary.removeEventListener(LoaderEvent.LOADER_COMPLETE, this._onLoaderCompleteDelegate);
		AssetLibrary.removeEventListener(URLLoaderEvent.LOAD_ERROR, this._onLoadErrorDelegate);
		this.loadNextResource(event);
	}
	private _onLoadErrorDelegate: (event: URLLoaderEvent) => void;
	public _onLoadError(event: URLLoaderEvent) {
		AssetLibrary.removeEventListener(AssetEvent.ASSET_COMPLETE, this._onAssetCompleteDelegate);
		AssetLibrary.removeEventListener(LoaderEvent.LOADER_COMPLETE, this._onLoaderCompleteDelegate);
		AssetLibrary.removeEventListener(URLLoaderEvent.LOAD_ERROR, this._onLoadErrorDelegate);
		console.log("error loading swf");
		this.dispatchEvent(event);
	}

	public play(offset: number = 0): void {
		// start the main_loop:
		this.resizeCallback(null);
		this._timer = new RequestAnimationFrame(this.main_loop, this);
		this._timer.start();

		let rootMC: MovieClip = <MovieClip>this.getChildAt(0);
		if (!rootMC) {
			console.warn("warning: AVMPlayer.play called, but no scene is loaded");
			return;
		}
		if (offset) {
			rootMC.currentFrameIndex = offset;
		}

		// manually move playhead to next frame, so we immediatly render something
		this.showNextFrame(0);
		this._rendererStage.container.style.visibility = "visible";
	}

	public updateFPS(): void {
		this._fpsTextField.style.visibility = (!this._currentFps || !this._frameRate) ? "hidden" : "visible";
		this._fpsTextField.innerText = this._currentFps.toFixed(2) + '/' + this._frameRate + " fps";
		this._currentFps = 0;
	}


	
	public setStageDimensions(x:any, y:any, w:any, h:any){
		this._x=x;
		this._y=y;
		this._w=w;
		this._h=h;
		this.resizeStageInternal();
	}

	private resizeStageInternal(){

		let x:number=(typeof this._x==="string")?parseFloat(this._x.replace("%", ""))/100*window.innerWidth:this._x;
		let y:number=(typeof this._y==="string")?parseFloat(this._y.replace("%", ""))/100*window.innerHeight:this._y;
		let w:number=(typeof this._w==="string")?parseFloat(this._w.replace("%", ""))/100*window.innerWidth:this._w;
		let h:number=(typeof this._h==="string")?parseFloat(this._h.replace("%", ""))/100*window.innerHeight:this._h;
		let newX = x;
		let newY = y;
		let newWidth = w;
		let newHeight = h;

		// todo: correctly implement all StageScaleModes;
		switch (this._scaleMode) {
			case StageScaleMode.NO_SCALE:
				this._projection.fieldOfView = Math.atan(h / 1000 / 2) * 360 / Math.PI;
				break;
			case StageScaleMode.SHOW_ALL:
				newHeight = h;
				newWidth = (this._stageWidth / this._stageHeight) * newHeight;
				if (newWidth > w) {
					newWidth = w;
					newHeight = newWidth * (this._stageHeight / this._stageWidth);
				}
				newX += (w - newWidth) / 2;
				newY += (h - newHeight) / 2;
				this._projection.fieldOfView = Math.atan(this._stageHeight / 1000 / 2) * 360 / Math.PI;
				break;

			case StageScaleMode.EXACT_FIT:
			case StageScaleMode.NO_BORDER:
				this._projection.fieldOfView = Math.atan(h / 1000 / 2) * 360 / Math.PI;
				break;
			default:
				console.log("Stage: only implemented StageScaleMode are NO_SCALE, SHOW_ALL");
				break;
		}
		// todo: correctly implement all alignModes;
		switch (this._align) {
			case StageAlign.TOP_LEFT:
				this._scene.view.x = newX;
				this._scene.view.y = newY;
				break;
			default:
				this._scene.view.x = newX;
				this._scene.view.y = newY;
				console.log("Stage: only implemented StageAlign is TOP_LEFT");
				break;
		}

		this._scene.view.x = newX;
		this._scene.view.y = newY;
		this._scene.view.width = newWidth;
		this._scene.view.height = newHeight;


		if (this._fpsTextField)
			this._fpsTextField.style.left = (window.innerWidth * 0.5 - 50 + 'px');

		if (this._avmHandler) {
			this._avmHandler.resizeStage();
		}
	}
	private _resizeCallbackDelegate: (event: any) => void;
	private resizeCallback(event: any = null): void {
		this.resizeStageInternal();
	}


	public pause(){
		AudioManager.setVolume(0);
		this._isPaused=true;
	}
	public unPause(){
		AudioManager.setVolume(1);
		this._isPaused=false;

	}
	public get isPaused():boolean{
		return this._isPaused;
	}
	public set isPaused(value:boolean){
		this._isPaused=value;
	}

	protected main_loop(dt: number) {
		if(this._isPaused){
			return;
		}
		if (!this._avmHandler) {
			throw ("error - can not render when no avm-stage is available")
		}
		if (!this._scene || !this._scene.renderer) {
			this._timer.stop();
			return;
		}

		var frameMarker: number = Math.floor(1000 / this._frameRate);
		this._time += Math.min(dt, frameMarker);

		if (this._time >= frameMarker) {


			this._currentFps++;

			this.showNextFrame(this._time);
			this._time -= frameMarker;
		}
	}
	public requestRender() {
		if (!this._scene || !this._scene.renderer) {
			this._timer.stop();
			return;
		}
		FrameScriptManager.execute_as3_constructors();
		FrameScriptManager.execute_queue();
		this._scene.render(true);
	}
	protected showNextFrame(dt: number) {
		if(this._isPaused){
			MovieClipSoundsManager.enterFrame();
			MovieClipSoundsManager.exitFrame();
			return;
		}
		MovieClipSoundsManager.enterFrame();
		this._scene.fireMouseEvents();

		this._avmHandler.enterFrame(dt);

		// actionscript might have disposed everything
		// so lets check if that is the case and stop everything if its true
		if (!this._scene || !this._scene.renderer) {
			this._timer.stop();
			return;
		}

		this._scene.render(true);
		MovieClipSoundsManager.exitFrame();
	}

	public get align(): StageAlign {
		return this._align;
	}
	public set align(value: StageAlign) {
		this._align = value;
		this.resizeCallback();
	}

	public get accessibilityImplementation(): any {
		console.log("AVMStage: get accessibilityImplementation not implemented");
		return this._align;
	}
	public set accessibilityImplementation(value: any) {
		//todo: any is AccessibilityImplementation
		console.log("AVMStage:  accessibilityImplementation not implemented");
	}

	public get color(): number {
		return this._scene.renderer.view.backgroundColor;
	}
	public set color(value: number) {
		this._scene.renderer.view.backgroundColor = value;
	}
	public get frameRate(): number {
		return this._frameRate;
	}
	public set frameRate(value: number) {
		this._frameRate = value;
	}

	public get mouseX(): number {
		return this._scene.getLocalMouseX(this);
	}
	public get mouseY(): number {
		return this._scene.getLocalMouseY(this);
	}

	public get scaleMode(): StageScaleMode {
		return this._scaleMode;
	}
	public set scaleMode(value: StageScaleMode) {
		this._scaleMode = value;
		this.resizeCallback();
	}
	public get scene(): Scene {
		return this._scene
	}

	public get showFrameRate(): boolean {
		return this._showFrameRate;
	}
	public set showFrameRate(value: boolean) {
		if (value == this._showFrameRate)
			return;

		this._showFrameRate = value;
		if (value) {
			// todo: better make this a class that can show more info (like num of drawcalls etc)
			this._fpsTextField = <HTMLDivElement>document.createElement('div'); // disable in RC
			this._fpsTextField.style.cssFloat = 'none';
			this._fpsTextField.style.backgroundColor = '#000';
			this._fpsTextField.style.position = 'fixed';
			this._fpsTextField.style.top = '5px';
			this._fpsTextField.style.width = '100px';
			this._fpsTextField.style.height = '20px';
			this._fpsTextField.style.right = '5px';
			this._fpsTextField.style.textAlign = 'center';
			this._fpsTextField.style.color = '#ffffff';
			this._fpsTextField.style.fontSize = '16';
			this._fpsTextField.style.visibility = 'hidden';
			this._fpsTextField.innerHTML = "";
			document.body.appendChild(this._fpsTextField);
			this._showFrameRateIntervalID = setInterval(() => this.updateFPS(), 1000);
		}
		else {
			if (this._showFrameRateIntervalID) {
				clearInterval(this._showFrameRateIntervalID);
				this._showFrameRateIntervalID = -1;
				document.body.removeChild(this._fpsTextField);
				this._fpsTextField = null;
			}
		}
	}
	public get stageHeight(): number {
		return this._stageHeight;
	}
	public set stageHeight(value: number) {
		this._stageHeight = value;
		this.resizeCallback();
	}
	public get stageWidth(): number {
		return this._stageWidth;
	}
	public set stageWidth(value: number) {
		this._stageWidth = value;
		this.resizeCallback();
	}
}

// todo: move to own files:

const enum ResourceType{
	GAME="GAME",
	FONTS="FONTS",
}
export interface IResourceFile{
	resourceType?:ResourceType,
	data?:any,
	path:string
}
export interface IGameConfig{
	x?:any;
	y?:any;
	w?:any;
	h?:any;
	showFPS?:boolean;
	forceJIT?:boolean;
	files:IResourceFile[];
	[key:string]:any;
}
