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
import { FrameScriptManager } from '@awayjs/scene';
class EntryClass extends Sprite {
	constructor() {
		super();
	}
}
initSystem();
initLink();

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
	private _sec: AXSecurityDomain;
	private _events: any[];
	private _eventOnEnter: Event;
	private _eventFrameConstructed: Event;
	private _eventExitFrame: Event;
	private _eventRender: Event;
	constructor() {
		window["hidePokiProgressBar"]();

		this._eventOnEnter = new Event(Event.ENTER_FRAME);
		this._eventFrameConstructed = new Event(Event.FRAME_CONSTRUCTED);
		this._eventExitFrame = new Event(Event.EXIT_FRAME);
		this._eventRender = new Event(Event.RENDER);

		this._events = [this._eventOnEnter, this._eventExitFrame];
		this._onLoadCompleteDelegate = (event: Event) => this.onLoadComplete(event);
	}
	public playSWF(buffer) {
		if (this._loader || this._parser) {
			throw "Only playing of 1 SWF file is supported at the moment";
		}
		// for now just try to load and init the builtin.abc and playerglobal.abcs
		createSecurityDomain(
			AVM2LoadLibrariesFlags.Builtin | AVM2LoadLibrariesFlags.Playerglobal
		).then((sec) => {
			this._sec = sec;
			console.log("builtins are loaded fine, start parsing SWF");
			this._parser = new SWFParser(new FlashSceneGraphFactory());
			this._loader = new Loader(this._parser);
			var loaderContext: LoaderContext = new LoaderContext(false, new ApplicationDomain());
			this._loader.loaderInfo.addEventListener(Event.COMPLETE, this._onLoadCompleteDelegate);
			this._loader.loadData(buffer, loaderContext);

		});
	}
	private _onLoadCompleteDelegate: (event: Event) => void;
	public onLoadComplete(buffer) {
		this._stage = new Stage(null, window.innerWidth, window.innerHeight, 0xffffff);


		// get the abc bytes from the parser and load / execute them on the ApplicationDomain:

		for (var i = 0; i < this._parser.abcBlocks.length; i++) {
			var abcBlock = this._parser.abcBlocks[i];
			var abc = new ABCFile({ app: this._sec.application, url: "" }, abcBlock.data);
			if (abcBlock.flags) {
				// kDoAbcLazyInitializeFlag = 1 Indicates that the ABC block should not be executed
				// immediately.
				this._sec.application.loadABC(abc);
			} else {
				// TODO: probably delay execution until playhead reaches the frame.
				this._sec.application.loadAndExecuteABC(abc);
			}
		}


		// process Symbols that are loaded from swf:

		var mappedSymbolsLoaded = this._parser.symbolClassesList.length;
		for (var i = 0; i < mappedSymbolsLoaded; i++) {
			var symbolMapping = this._parser.symbolClassesList[i];
			var symbolClass = this._sec.application.getClass(Multiname.FromFQNString(symbolMapping.className,
				NamespaceType.Public));
			//symbolClass.axInitializer();
			/*Object.defineProperty(symbolClass.tPrototype, "_symbol",
								  {get: loaderInfo.getSymbolResolver(symbolClass, symbolMapping.id),
									configurable: true});*/
		}
		//loaderInfo._mappedSymbolsLoaded = mappedSymbolsLoaded;


		// get the root-symbol from the parser:
		var rootSymbol = <any>this._parser.dictionary[0];
		if (!rootSymbol) {
			rootSymbol = {
				id: 0,
				className: this._parser.symbolClassesMap[0],
				//env: this
			};
		}

		// create the root for the root-symbol
		var root = constructClassFromSymbol(rootSymbol, <any>symbolClass);
		// manually call the axInitializer for now:
		root.axInitializer();

		//  right now creating the root creates a empty timeline
		//	axInitializer registers a framescript on the empty timeline

		// 	get the framescript that was registered:
		var script = root.adaptee.timeline._framescripts[1];

		// 	exchange the adaptee of the newly created root, with the one that has been created by our loader/SWFParser
		//	the adaptee that has been created by SWFparser / loader will have a valid timeline set
		root.adaptee = (<any>this._loader.getChildAt(0).adaptee);
		// 	register the framescript on the timeline that did come from SWFparser / loader
		root.adaptee.timeline.add_framescript(script, 0);

		// add the root to the stage:
		this._stage.addChild(root);

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

		if (this._time >= frameMarker) {
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
