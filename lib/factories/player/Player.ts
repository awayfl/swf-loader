import { SWFParser } from "../../parsers/SWFParser";
export { BaseVector } from "../avm2/natives/GenericVector";
import { createSecurityDomain, AVM2LoadLibrariesFlags } from "./avmLoader";
import { System } from "../avm2/natives/system";
import {
	Sprite,
	DisplayObjectContainer,
	FlashSceneGraphFactory,
	MovieClip
} from "@as3web/flash";
import { Loader } from "@as3web/flash";
import { Stage } from "@as3web/flash";
import { LoaderContext } from "@as3web/flash";
import { ApplicationDomain } from "@as3web/flash";
import { Event } from "@as3web/flash";
import { RequestAnimationFrame } from '@awayjs/core';
import { ABCFile } from '../avm2/abc/lazy/ABCFile';
import { AXSecurityDomain } from '../avm2/run/AXSecurityDomain';
import { constructClassFromSymbol } from '../link';
import { traceASClass } from '../avm2/nat/traceASClass';
class EntryClass extends Sprite {
	constructor() {
		super();
	}
}
console.log("System", System);

// Add the |axApply| and |axCall| methods on the function prototype so that we can treat
// Functions as AXCallables.
(<any>Function.prototype).axApply = Function.prototype.apply;
(<any>Function.prototype).axCall = Function.prototype.call;

export class Player {
	private _stage: Stage;
	private _loader: Loader;
	private _parser: SWFParser;
	private _timer: RequestAnimationFrame;
	private _frameRate:number = 30;
	private _currentFps:number = 0;
	private _time: number = 0;
	private _sec:AXSecurityDomain;
	constructor() {
		window["hidePokiProgressBar"]();

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
			this._sec=sec;
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
		this._stage = new Stage(null, window.innerWidth, window.innerHeight, 0xff0000);
		this._stage.addChild(this._loader);

		
		for (var i = 0; i < this._parser.abcBlocks.length; i++) {
			var abcBlock = this._parser.abcBlocks[i];
            var abc = new ABCFile({app:null, url:""}, abcBlock.data);
            if (abcBlock.flags) {
              // kDoAbcLazyInitializeFlag = 1 Indicates that the ABC block should not be executed
              // immediately.
              this._sec.application.loadABC(abc);
            } else {
              // TODO: probably delay execution until playhead reaches the frame.
              this._sec.application.loadAndExecuteABC(abc);
			}
		}


		// todo: 	to get the abc code executed from swf, we now need to get the root of the swf created as a MovieClip-AXClass
		//			this should call the AXSecurityDomain.createInitializer function for this class, 
		//			which should take care of creating the correct axInitializer function on the instance
		//			in shumway, the axInitializer is executed in the DisplayObjectContainer._constructChildren
		
		/*
        var data = {
			id: 0,
			className: this._parser.symbolClassesMap[0]
		};

		var root = constructClassFromSymbol(data, MovieClip);
		console.log("root", root);
		*/
		console.log("Loader has finished");
		this._timer = new RequestAnimationFrame(this.main_loop, this);
		this._timer.start();
	}
	/**
	 * Main loop
	 */
	private main_loop(dt: number)
	{
		var frameMarker:number = Math.floor(1000/this._frameRate);
		this._time += Math.min(dt, frameMarker);

		if (this._time >= frameMarker) {
			this._time -= frameMarker;
			this._stage.render();
		}
	}
}
