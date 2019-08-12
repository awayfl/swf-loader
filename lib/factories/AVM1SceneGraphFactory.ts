import {BitmapImage2D, Image2D} from "@awayjs/stage";
import {Timeline, MovieClip, Sprite, DisplayObjectContainer, Billboard, ISceneGraphFactory, TextField, PrefabBase, DefaultSceneGraphFactory} from "@awayjs/scene";
import {MaterialBase} from "@awayjs/materials";
import {AVM1MovieClip} from "./avm1/lib/AVM1MovieClip";
import {AVM1Context} from "./avm1/context";
import {getAVM1Object} from "./avm1/lib/AVM1Utils";
import {AVM1TextField} from "./avm1/lib/AVM1TextField";
import {AVM1Button} from "./avm1/lib/AVM1Button";




export interface FrameScript {
	(any?): any;
	precedence?: number[];
	context?: MovieClip;
}

export class AVM1SceneGraphFactory extends DefaultSceneGraphFactory implements ISceneGraphFactory
{
	public static _instance:AVM1SceneGraphFactory;
	public static get instance():AVM1SceneGraphFactory{
		if(!AVM1SceneGraphFactory._instance){
			console.log("Error. A instance of AVM1SceneGraphFactory must be created manually before accessing the singleton AVM1SceneGraphFactory._instance")
			//AVM1SceneGraphFactory._instance=new AVM1SceneGraphFactory();
		}
		return AVM1SceneGraphFactory._instance;
	}
	public imageStore:Object = {};
	public avm1Context:AVM1Context;

	constructor(avm1Context:AVM1Context){
		super();
		this.avm1Context=avm1Context;
		AVM1SceneGraphFactory._instance=this;
	}

	public createSprite(prefab:PrefabBase = null):Sprite
	{
		return new Sprite();
	}

	public createDisplayObjectContainer():DisplayObjectContainer
	{
		return new DisplayObjectContainer();
	}

	public createMovieClip(timeline:Timeline = null, symbol:any=null):MovieClip
	{
		//var avm1MovieClip:AVM1MovieClip=<AVM1MovieClip>AVM1MovieClip.createAVM1Class(this.avm1Context)._ownProperties["prototype"].value;
		var awayMovieClip:MovieClip= new MovieClip(timeline || new Timeline());
		if(symbol.isButton){
			var avm1Button:AVM1Button=<AVM1Button>getAVM1Object(awayMovieClip, this.avm1Context);
			return awayMovieClip;

		}
		else{
			var avm1MovieClip:AVM1MovieClip=<AVM1MovieClip>getAVM1Object(awayMovieClip, this.avm1Context);

			return awayMovieClip;
		}
		/*
		for(let key in timeline.avm1InitActions){
			console.log("\n\nfound init actions\n\n", timeline.avm1InitActions[key]);
			//this._addAvm1InitActionBlocks(frameIndex, initActionBlocks);
		}
		for(let key in timeline.avm1Exports){
			console.log("\n\nfound export\n\n", timeline.avm1Exports[key]);
			for(let i:number=0; i<timeline.avm1Exports[key].length; i++){
				let asset=timeline.avm1Exports[key][i];
				//this.avm1Context.addAsset(asset.className, asset.symbolId, null);
			}
			//this._addAvm1InitActionBlocks(frameIndex, initActionBlocks);
		}
		*/
/*

			if(frames[i].initActionBlocks){
				awayTimeline.avm1InitActions[i]=frames[i].initActionBlocks;
			}
			if(frames[i].exports){
				awayTimeline.avm1Exports[i]=frames[i].exports;
			}
		if (frameInfo.exports) {
			var exports = frameInfo.exports;
			for (var i = 0; i < exports.length; i++) {
				var asset = exports[i];
				avm1Context.addAsset(asset.className, asset.symbolId, null);
			}
		}

		var initActionBlocks = frameInfo.initActionBlocks;
		if (initActionBlocks) {
			this._addAvm1InitActionBlocks(frameIndex, initActionBlocks);
		}*/


		//return awayMovieClip;
	}

	public createTextField():TextField
	{
		var awayTextfield:TextField= new TextField();
		awayTextfield.multiline=true;
		awayTextfield.wordWrap=true;
		var avm1textField:AVM1TextField=<AVM1TextField>getAVM1Object(awayTextfield, this.avm1Context);
		return awayTextfield;
	}

	public createBillboard(material:MaterialBase):Billboard
	{
		return null;//new Billboard();
	}

	public createImage2D(width:number, height:number, transparent:boolean = true, fillColor:number = null, powerOfTwo:boolean = true):Image2D
	{
		return new BitmapImage2D(width, height, transparent, fillColor, powerOfTwo);
	}
}