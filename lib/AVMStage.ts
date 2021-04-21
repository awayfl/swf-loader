import {
	AssetEvent,
	LoaderEvent,
	AssetLibrary,
	URLRequest,
	URLLoaderEvent,
	RequestAnimationFrame,
	AudioManager,
	PerspectiveProjection,
	CoordinateSystem,
	ColorUtils,
	Loader,
	WaveAudioParser,
	EventDispatcher,
	Vector3D,
} from '@awayjs/core';
import {
	DisplayObjectContainer,
	MovieClip,
	FrameScriptManager,
	MouseManager,
	DefaultFontManager,
} from '@awayjs/scene';

import { Stage, BitmapImage2D, Image2DParser, TouchPoint } from '@awayjs/stage';
import { BasicPartition, ContainerNode, NodePool, PickGroup, RaycastPicker, View } from '@awayjs/view';
import { DefaultRenderer, RenderGroup } from '@awayjs/renderer';

import { MovieClipSoundsManager } from './factories/timelinesounds/MovieClipSoundsManager';
import { StageScaleMode } from './factories/as3webFlash/display/StageScaleMode';
import { StageAlign } from './factories/as3webFlash/display/StageAlign';
import { AVMVERSION } from './factories/base/AVMVersion';
import { AVMTestHandler } from './AVMTestHandler';
import { SWFParser } from './parsers/SWFParser';
import { IAVMHandler } from './IAVMHandler';
import { SWFFile } from './parsers/SWFFile';
import { IAVMStage } from './IAVMStage';
import { AVMEvent } from './AVMEvent';

export const enum StageDisplayState {
	FULL_SCREEN = 'fullScreen',
	FULL_SCREEN_INTERACTIVE = 'fullScreenInteractive',
	NORMAL = 'normal',
}

export class AVMStage extends EventDispatcher implements IAVMStage {

	private _root: DisplayObjectContainer;
	private _rootNode: ContainerNode;
	private _partition: BasicPartition;
	private _renderer: DefaultRenderer;
	private _pool: NodePool;
	private _view: View;
	private _pickGroup: PickGroup;
	private _mousePicker: RaycastPicker;
	private _mouseManager: MouseManager;
	private _swfFile: SWFFile;
	private _avmHandlers: StringMap<IAVMHandler>;
	public avmTestHandler: AVMTestHandler;
	protected _avmHandler: IAVMHandler;
	private _timer: RequestAnimationFrame;
	private _time: number;

	private _align: StageAlign;
	private _scaleMode: StageScaleMode;
	private _alignAllowUpdate: boolean;
	private _scaleModeAllowUpdate: boolean;
	private _stageWidth: number;
	private _stageHeight: number;

	private _frameRate: number;
	private _showFrameRate: boolean;
	private _showFrameRateIntervalID: number;

	private _fpsTextField: HTMLDivElement;
	private _currentFps: number;
	private _projection: PerspectiveProjection;
	private _rendererStage: Stage;
	private _displayState: StageDisplayState;

	private _x: any;
	private _y: any;
	private _w: any;
	private _h: any;

	private _isPaused: boolean;

	protected _gameConfig: IGameConfig = null;
	private _curFile: IResourceFile = null;

	public static runtimeStartTime: number = 0;

	protected static _instance: AVMStage = null;
	public static instance(): AVMStage {
		if (!AVMStage._instance)
			throw ('AVMStage._instance should exists but does not');
		return AVMStage._instance;
	}

	public static forceINT: boolean = false;

	constructor(gameConfig: IGameConfig) {

		super();

		//if (AVMStage._instance)
		//	throw ('Only one AVMStage is allowed to be constructed');

		AVMStage._instance = this;

		Loader.enableParsers([WaveAudioParser, SWFParser, Image2DParser]);

		this._time = 0;
		this._currentFps = 0;

		this._avmHandlers = {};

		this._stageWidth = 550;
		this._stageHeight = 400;
		this._scaleMode = StageScaleMode.SHOW_ALL;
		this._align = StageAlign.TOP_LEFT;
		this._scaleModeAllowUpdate = true;
		this._alignAllowUpdate = true;
		if (gameConfig.stageScaleMode) {
			this._scaleMode = gameConfig.stageScaleMode;
			this._scaleModeAllowUpdate = false;
		}
		if (gameConfig.stageAlign) {
			this._align = gameConfig.stageAlign;
			this._alignAllowUpdate = false;
		}
		if (gameConfig.forceINT) {
			AVMStage.forceINT = gameConfig.forceINT;
		}
		this._frameRate = 30;
		this._showFrameRate = false;
		this._showFrameRateIntervalID = -1;

		this._x = gameConfig.x ? gameConfig.x : 0;
		this._y = gameConfig.y ? gameConfig.y : 0;
		this._w = gameConfig.w ? gameConfig.w : '100%';
		this._h = gameConfig.h ? gameConfig.h : '100%';

		this._isPaused = false;

		this._gameConfig = gameConfig;

		// init awayengine
		this.initAwayEninge();
		this._renderer.view.backgroundColor = 0xffffff;
		//this._stage3Ds[this._stage3Ds.length]=new AwayStage(null, );
		AudioManager.setVolume(1);

		// resize event listens on window
		this._resizeCallbackDelegate = (event: any) => this.resizeCallback(event);
		window.addEventListener('resize', this._resizeCallbackDelegate);

		this._onLoaderStartDelegate = (event: LoaderEvent) => this.onLoaderStart(event);
		this._onLoaderCompleteDelegate = (event: LoaderEvent) => this.onLoaderComplete(event);
		this._onAssetCompleteDelegate = (event: AssetEvent) => this._onAssetComplete(event);
		this._onLoadErrorDelegate = (event: URLLoaderEvent) => this._onLoadError(event);

		if (this._gameConfig.testConfig) {
			this.avmTestHandler = new AVMTestHandler(this._gameConfig.testConfig, this);
		}

		document.addEventListener('fullscreenchange', this.onFullscreenChanged.bind(this));
	}

	public get root(): DisplayObjectContainer {
		return this._root;
	}

	public get rootNode(): ContainerNode {
		return this._rootNode;
	}

	public get pool(): NodePool {
		return this._pool;
	}

	public get view(): View {
		return this._view;
	}

	public get pickGroup(): PickGroup {
		return this._pickGroup;
	}

	public get mousePicker(): RaycastPicker {
		return this._mousePicker;
	}

	public get mouseManager(): MouseManager {
		return this._mouseManager;
	}

	public get config(): IGameConfig {
		return this._gameConfig;
	}

	public registerAVMStageHandler(value: IAVMHandler) {
		this._avmHandlers[value.avmVersion] = value;
	}

	public set displayState(v: StageDisplayState) {
		if (!document.fullscreenEnabled) {
			this._displayState = StageDisplayState.NORMAL;
			return;
		}

		switch (v) {
			case StageDisplayState.FULL_SCREEN_INTERACTIVE:
			case StageDisplayState.FULL_SCREEN:
				if (Element.prototype.requestFullscreen) {
					document.body.requestFullscreen().then(() => {
						this._displayState = v;
					});
				}
				break;
			default:
				this._displayState = v;
				if (document.fullscreenElement) {
					document.exitFullscreen();
				}
		}
	}

	public get displayState() {
		return this._displayState;
	}

	private onFullscreenChanged(e) {
		if (!document.fullscreenElement) {
			this._displayState = StageDisplayState.NORMAL;
		}
	}

	private initAwayEninge() {

		//create the partition
		this._root = new DisplayObjectContainer();
		this._rootNode = NodePool.getRootNode(this._root, BasicPartition);
		this._partition = this._rootNode.partition;
		this._pool = this._partition.rootNode.pool;

		this._view = new View();
		this._view.projection.transform.moveTo(0, 0, -1000);
		this._pickGroup = PickGroup.getInstance(this._view);
		this._mousePicker = this._pickGroup.getRaycastPicker(this._partition);
		this._mousePicker.shapeFlag = true;
		this._mouseManager = MouseManager.getInstance(this._view.stage);

		this._renderer = RenderGroup.getInstance(this._view, DefaultRenderer).getRenderer(this._partition);
		this._rendererStage = this._view.stage;
		this._rendererStage.container.style.visibility = 'hidden';
		this._rendererStage.antiAlias = 0;
		this._renderer.renderableSorter = null;//new RenderableSort2D();

		this._projection = <PerspectiveProjection> this._view.projection;
		this._projection.coordinateSystem = CoordinateSystem.RIGHT_HANDED;
		this._projection.originX = -1;
		this._projection.originY = 1;
		this._projection.fieldOfView = Math.atan(window.innerHeight / 1000 / 2) * 360 / Math.PI;
	}

	public playSWF(buffer: any, url: string) {

		this._gameConfig = {
			files: [{ data: buffer, path: url, resourceType: ResourceType.GAME }],
		};
		this.addEventListener(LoaderEvent.LOADER_COMPLETE, (e) => this.play());
		this.loadNextResource();
	}

	public snapshot(callback: Function) {

		const myBitmap: BitmapImage2D = new BitmapImage2D(this._stageWidth, this._stageHeight, true, 0xffffffff, false);

		this._renderer.queueSnapshot(myBitmap);
		this._renderer.view.target = myBitmap;
		this._renderer.render();
		this._renderer.view.target = null;
		myBitmap.invalidate();

		// flip vertical:

		const oldData = myBitmap.data;
		const myBitmap2: BitmapImage2D = new BitmapImage2D(
			this._stageWidth,
			this._stageHeight,
			true,
			0xff00ffff,
			false
		);
		let x = 0;
		let y = 0;
		let idx = 0;
		let color = 0;
		for (y = 0; y < this._stageHeight; y++) {
			for (x = 0; x < this._stageWidth; x++) {
				idx = ((this._stageHeight - 1 - y) * this._stageWidth + x) * 4;
				color = ColorUtils.ARGBtoFloat32(oldData[idx + 3], oldData[idx], oldData[idx + 1], oldData[idx + 2]);
				myBitmap2.setPixel32(x, y, color);
			}
		}

		myBitmap2.invalidate();
		const htmlCanvas: HTMLCanvasElement = document.createElement('canvas');
		htmlCanvas.width = myBitmap2.width;
		htmlCanvas.height = myBitmap2.height;
		/*htmlCanvas.style.position = "absolute";
		htmlCanvas.style.top = "0px";
		htmlCanvas.style.left = "0px";
		htmlCanvas.style.width = "100%";*/

		const context: CanvasRenderingContext2D = htmlCanvas.getContext('2d');
		const imageData: ImageData = context.getImageData(0, 0, myBitmap2.width, myBitmap2.height);
		imageData.data.set(myBitmap2.data);
		context.putImageData(imageData, 0, 0);

		if (callback)
			callback(htmlCanvas);
	}

	public loadNextResource(event: LoaderEvent = null) {
		this._curFile = this._gameConfig.files.shift();
		if (this._curFile) {
			const parser = new SWFParser();
			parser._iFileName = this._curFile.path;
			if (this._curFile.resourceType != ResourceType.GAME) {
				DefaultFontManager.deviceFontsLoading = true;
			} else {
				DefaultFontManager.deviceFontsLoading = false;
				if (this._swfFile) {
					throw 'Only playing of 1 SWF file is supported at the moment';
				}
				parser.onFactoryRequest = (swfFile) => {
					this._swfFile = swfFile;
					this.frameRate = this._swfFile.frameRate;

					// todo: these values should already been modded in the parser:
					this.color = ColorUtils.f32_RGBA_To_f32_ARGB(swfFile.backgroundColor);
					this.stageWidth = this._swfFile.bounds.width / 20;
					this.stageHeight = this._swfFile.bounds.height / 20;

					const avmName: AVMVERSION = this._swfFile.useAVM1 ? AVMVERSION.AVM1 : AVMVERSION.AVM2;

					this._avmHandler = this._avmHandlers[avmName];

					if (this.avmTestHandler && !this.avmTestHandler.config.settings.onlyTraces) {
						/*if(this._swfFile.useAVM1){
							// in FP when using the shell.swf, avm1 traces are 1 frame behind
							// so we mimmic that behavior here
							this.avmTestHandler.nextFrame();
						}*/
						this.avmTestHandler.setSWF(this._swfFile);
					}

					if (!this._avmHandler) {
						throw 'no avm-handler installed for ' + avmName;
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
			} else {
				AssetLibrary.load(new URLRequest(this._curFile.path), null, this._curFile.path, parser);
			}
		} else {
			if (!this._swfFile) {
				throw 'no valid SWFFile was loaded!';
			}
			if (event) {
				this.dispatchEvent(event);
			}
		}
	}

	public load() {
		this.loadNextResource(new LoaderEvent(LoaderEvent.LOADER_COMPLETE));
	}

	private _onLoaderStartDelegate: (event: LoaderEvent) => void;
	public onLoaderStart(event: LoaderEvent) {
		this.dispatchEvent(event);
	}

	private _onAssetCompleteDelegate: (event: AssetEvent) => void;
	public _onAssetComplete(event: AssetEvent) {
		// atm we only addAssets to avmHandler that come from the game swf
		// preloaded files are fonts, and are handled by DefaultManager outside of SWF
		if (this._curFile.resourceType == ResourceType.GAME) {
			if (AVMStage.runtimeStartTime == 0) {
				AVMStage.runtimeStartTime = Date.now();
			}
			this._avmHandler.addAsset(event.asset, true);
		}
		this.dispatchEvent(event);
	}

	private _onLoaderCompleteDelegate: (event: LoaderEvent) => void;
	public onLoaderComplete(event: LoaderEvent) {
		if (this._root)
			this._root.dispatchEvent(event);
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
		console.log('error loading swf');
		this.dispatchEvent(event);
	}

	public play(offset: number = 0): void {
		// start the main_loop:
		this.resizeCallback(null);
		this._timer = new RequestAnimationFrame(this.main_loop, this);
		this._timer.start();

		const rootMC: MovieClip = <MovieClip> this._root.getChildAt(0);
		if (!rootMC) {
			console.warn('warning: AVMPlayer.play called, but no scene is loaded');
			return;
		}
		if (offset) {
			rootMC.currentFrameIndex = offset;
		}

		// manually move playhead to next frame, so we immediatly render something
		this.showNextFrame(0);
		this._rendererStage.container.style.visibility = 'visible';
	}

	public updateFPS(): void {
		this._fpsTextField.style.visibility = (!this._currentFps || !this._frameRate) ? 'hidden' : 'visible';
		this._fpsTextField.innerText = this._currentFps.toFixed(2) + '/' + this._frameRate + ' fps';
		this._currentFps = 0;
	}

	public setStageDimensions(x: any, y: any, w: any, h: any) {
		this._x = x;
		this._y = y;
		this._w = w;
		this._h = h;
		this.resizeStageInternal();
	}

	private resizeStageInternal() {

		const x: number = typeof this._x === 'string'
			? (parseFloat(this._x.replace('%', '')) / 100) * window.innerWidth
			: this._x;

		const y: number = typeof this._y === 'string'
			? (parseFloat(this._y.replace('%', '')) / 100) * window.innerHeight
			: this._y;

		const w: number = typeof this._w === 'string'
			? (parseFloat(this._w.replace('%', '')) / 100) * window.innerWidth
			: this._w;

		const h: number = typeof this._h === 'string'
			? (parseFloat(this._h.replace('%', '')) / 100) * window.innerHeight
			: this._h;

		let newX = x;
		let newY = y;
		let newWidth = w;
		let newHeight = h;

		// todo: correctly implement all StageScaleModes;
		switch (this._scaleMode) {
			case StageScaleMode.NO_SCALE:
				this._projection.fieldOfView = Math.atan(h / 1000 / 2) * 360 / Math.PI;
				this._stageWidth = w;
				this._stageHeight = h;
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
				this._projection.fieldOfView = (Math.atan(this._stageHeight / 1000 / 2) * 360) / Math.PI;
				break;

			case StageScaleMode.EXACT_FIT:
			case StageScaleMode.NO_BORDER:
				this._projection.fieldOfView = (Math.atan(h / 1000 / 2) * 360) / Math.PI;
				break;
			default:
				console.log('Stage: only implemented StageScaleMode are NO_SCALE, SHOW_ALL');
				break;
		}
		// todo: correctly implement all alignModes;
		switch (this._align) {
			case StageAlign.TOP_LEFT:
				this._view.x = newX;
				this._view.y = newY;
				break;
			default:
				this._view.x = newX;
				this._view.y = newY;
				console.log('Stage: only implemented StageAlign is TOP_LEFT');
				break;
		}

		this._view.x = newX;
		this._view.y = newY;
		this._view.width = newWidth;
		this._view.height = newHeight;

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

	public pause() {
		AudioManager.setVolume(0);
		this._isPaused = true;
	}

	public unPause() {
		AudioManager.setVolume(1);
		this._isPaused = false;
	}

	public get isPaused(): boolean {
		return this._isPaused;
	}

	public set isPaused(value: boolean) {
		this._isPaused = value;
	}

	protected main_loop(dt: number) {
		if (this._isPaused) {
			return;
		}

		if (!this._avmHandler) {
			throw ('error - can not render when no avm-stage is available');
		}

		const frameMarker: number = Math.floor(1000 / this._frameRate);
		this._time += Math.min(dt, frameMarker);

		if (this._time >= frameMarker) {

			this._currentFps++;

			this.showNextFrame(this._time);
			this._time -= frameMarker;
		}
	}

	public requestRender() {

		FrameScriptManager.execute_queue();
		this._renderer.render();
	}

	protected showNextFrame(dt: number) {
		if (this._isPaused) {
			MovieClipSoundsManager.enterFrame();
			MovieClipSoundsManager.exitFrame();
			return;
		}

		MovieClipSoundsManager.enterFrame();

		if (this.avmTestHandler)
			this.avmTestHandler.dispatchEvents();

		this._mouseManager.fireMouseEvents(this._mousePicker);

		this._avmHandler.enterFrame(dt);

		if (this.avmTestHandler)
			this.avmTestHandler.nextFrame();

		this._renderer.render();

		MovieClipSoundsManager.exitFrame();
	}

	public get align(): StageAlign {
		return this._align;
	}

	public set align(value: StageAlign) {
		if (!this._alignAllowUpdate)
			return;

		this._align = value;

		this.resizeCallback();
	}

	public get accessibilityImplementation(): any {
		console.log('AVMStage: get accessibilityImplementation not implemented');
		return this._align;
	}

	public set accessibilityImplementation(value: any) {
		//todo: any is AccessibilityImplementation
		console.log('AVMStage:  accessibilityImplementation not implemented');
	}

	public get color(): number {
		return this._renderer.view.backgroundColor;
	}

	public set color(value: number) {
		this._renderer.view.backgroundColor = value;
	}

	public get frameRate(): number {
		return this._frameRate;
	}

	public set frameRate(value: number) {
		this._frameRate = value;
	}

	public getLocalMouseX(node: ContainerNode): number {
		return node
			.getInverseMatrix3D()
			.transformVector(
				this._renderer.view.unproject(
					this._view.stage.screenX, this._view.stage.screenY, 1000))
			.x;
	}

	public getLocalMouseY(node: ContainerNode): number {
		return node
			.getInverseMatrix3D()
			.transformVector(
				this._renderer.view.unproject(
					this._view.stage.screenX, this._view.stage.screenY, 1000))
			.y;
	}

	public getLocalTouchPoints(node: ContainerNode): Array<TouchPoint> {
		let localPosition: Vector3D;
		const localTouchPoints: Array<TouchPoint> = new Array<TouchPoint>();

		const len: number = this._view.stage.touchPoints.length;
		for (let i: number = 0; i < len; i++) {
			localPosition = node
				.getInverseMatrix3D()
				.transformVector(
					this._renderer.view.unproject(
						this._view.stage.touchPoints[i].x, this._view.stage.touchPoints[i].y, 1000));

			localTouchPoints.push(new TouchPoint(localPosition.x, localPosition.y, this._view.stage.touchPoints[i].id));
		}

		return localTouchPoints;
	}

	public get scaleMode(): StageScaleMode {
		return this._scaleMode;
	}

	public set scaleMode(value: StageScaleMode) {
		if (!this._scaleModeAllowUpdate)
			return;
		this._scaleMode = value;
		this.resizeCallback();
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
			this._fpsTextField.innerHTML = '';
			document.body.appendChild(this._fpsTextField);
			this._showFrameRateIntervalID = setInterval(() => this.updateFPS(), 1000);
		} else {
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

const enum ResourceType {
	GAME = 'GAME',
	FONTS = 'FONTS',
}
export interface IResourceFile {
	resourceType?: ResourceType;
	data?: any;
	path: string;
}
export interface IGameConfig {
	x?: any;
	y?: any;
	w?: any;
	h?: any;
	showFPS?: boolean;
	forceJIT?: boolean;
	files: IResourceFile[];
	externalInterfaceID?: string;
	[key: string]: any;
}
