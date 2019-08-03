import { SWFParser } from "../../parsers/SWFParser";
export { BaseVector } from "../avm2/natives/GenericVector";
import { createSecurityDomain, AVM2LoadLibrariesFlags } from "./avmLoader";
import { initSystem } from "../avm2/natives/system";

import { Sprite } from "../as3webFlash/display/Sprite";
import { MovieClip } from "../as3webFlash/display/MovieClip";
import { FlashSceneGraphFactory } from "../as3webFlash/factories/FlashSceneGraphFactory";
import { Loader } from "../as3webFlash/display/Loader";
import { Stage } from "../as3webFlash/display/Stage";
import { LoaderContext } from "../as3webFlash/system/LoaderContext";
import { ApplicationDomain } from "../as3webFlash/system/ApplicationDomain";
import { Event } from "../as3webFlash/events/Event";
import { RequestAnimationFrame } from '@awayjs/core';
import { ABCFile } from '../avm2/abc/lazy/ABCFile';
import { AXSecurityDomain } from '../avm2/run/AXSecurityDomain';
import { initLink } from '../flash/link';
import { constructClassFromSymbol } from '../flash/constructClassFromSymbol';
import { Multiname } from '../avm2/abc/lazy/Multiname';
import { NamespaceType } from '../avm2/abc/lazy/NamespaceType';
import { initlazy } from '../avm2/abc/lazy';
import { FrameScriptManager } from '@awayjs/scene';
import { initializeAXBasePrototype } from '../avm2/run/initializeAXBasePrototype';
import { ISecurityDomain } from '../ISecurityDomain';
class EntryClass extends Sprite {
	constructor() {
		super();
	}
}
initSystem();
initLink();
initializeAXBasePrototype();
initlazy();
// Add the |axApply| and |axCall| methods on the function prototype so that we can treat
// Functions as AXCallables.
(<any>Function.prototype).axApply = Function.prototype.apply;
(<any>Function.prototype).axCall = Function.prototype.call;

export class Player {
	private _stage: Stage;
	private _loader: Loader;
	private _parser: SWFParser;
	private _timer: RequestAnimationFrame;
	private _frameRate: number = 30;
	private _currentFps: number = 0;
	private _time: number = 0;
	private _sec: ISecurityDomain;
	private _events: any[];
	private _eventOnEnter: Event;
	private _eventFrameConstructed: Event;
	private _eventExitFrame: Event;
	private _eventRender: Event;
	private _renderStarted: boolean;
	constructor() {
		this._renderStarted=false;

		this._onLoadCompleteDelegate = (event: Event) => this.onLoadComplete(event);
	}
	public playSWF(buffer) {
		if (this._loader || this._parser) {
			throw "Only playing of 1 SWF file is supported at the moment";
		}
		createSecurityDomain(
			AVM2LoadLibrariesFlags.Builtin | AVM2LoadLibrariesFlags.Playerglobal
		).then((sec:ISecurityDomain) => {
			console.log("builtins are loaded fine, start parsing SWF");
			this._sec = sec;

			this._eventOnEnter = new this._sec.flash.events.Event(Event.ENTER_FRAME);
			this._eventFrameConstructed = new this._sec.flash.events.Event(Event.FRAME_CONSTRUCTED);
			this._eventExitFrame = new this._sec.flash.events.Event(Event.EXIT_FRAME);
			this._eventRender = new this._sec.flash.events.Event(Event.RENDER);
			this._events = [this._eventOnEnter, this._eventExitFrame];

			this._stage = new this._sec.flash.display.Stage(null, window.innerWidth, window.innerHeight, 0xffffff);
			this._parser = new SWFParser(new FlashSceneGraphFactory(sec));
			this._loader = new this._sec.flash.display.Loader(this._parser);
			var loaderContext: LoaderContext = new this._sec.flash.system.LoaderContext(false, new (<any>this._sec).flash.system.ApplicationDomain());
			this._loader.loaderInfo.addEventListener(Event.COMPLETE, this._onLoadCompleteDelegate);
			this._loader.loadData(buffer, loaderContext);

		});
	}
	private _onLoadCompleteDelegate: (event: Event) => void;
	public onLoadComplete(event) {
		
		this._stage.addChild(this._loader);

		/*
		This will be needed later to support multiple scenes
		it works to create a Scene Object atm, but our MovieClip is not yet setup to handle and support it

		var sceneData=(<any>this._parser).sceneAndFrameLabelData;
		if(sceneData && sceneData.scenes && sceneData.scenes.length>0){
			var scene=new (<any>this._sec).flash.display.Scene(sceneData.scenes[0].name,[], sceneData.scenes[0].offset, 1);
			scene.axInitializer();
		}
		*/

		// loading is finished, start the main_loop:
		this._timer = new RequestAnimationFrame(this.main_loop, this);
		this._timer.start();
	}
	/**
	 * Main loop
	 */
	private main_loop(dt: number) {
		var frameMarker: number = Math.floor(1000 / this._frameRate);
		this._time += Math.min(dt, frameMarker);

		if (this._time >= frameMarker || !this._renderStarted) {
			
			if(!this._renderStarted)
				window["hidePokiProgressBar"]();
			this._renderStarted=true;
			this._time -= frameMarker;

			// advance the stage
			this._stage.advanceFrame(this._events);

			/*var displayGraph={};
			this._stage.debugDisplayGraph(displayGraph);
			console.log("SceneGraph frame :", displayGraph);*/
			
			// execute queued scripts
			FrameScriptManager.execute_queue();
			
			// render
			this._stage.render();
		}
	}
}
