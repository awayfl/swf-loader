
import {EventDispatcher, IAsset} from "@awayjs/core"
export class EmbedManager extends EventDispatcher
{
	private static _singleton:EmbedManager;
	private static _embedsByID:any={};
	private static _embedsToLoad:any={};
	private static _hasLoaded:boolean=false;

	private processID:number=0;

	constructor(){
		super();
		this.processID=0;
	}

	public load():void{

		var assets:any=EmbedManager._embedAssets;
		for (var key in EmbedManager._embedAssets) {
			// skip loop if the property is from prototype
			if (!validation_messages.hasOwnProperty(key)) continue;

			var obj = validation_messages[key];
			for (var prop in obj) {
				// skip loop if the property is from prototype
				if(!obj.hasOwnProperty(prop)) continue;

				// your code
				alert(prop + " = " + obj[prop]);
			}
		}
	}
	public static getInstance():EmbedManager{
		if(EmbedManager._singleton==null){
			EmbedManager._singleton=new EmbedManager();
		}
		return EmbedManager._singleton;
	}

	public static add(res:any):void{
		if(EmbedManager._hasLoaded)
			throw("Error: EmbedManager.add() - Can not add embed-resource when EmbedManager is already loaded.");
		EmbedManager._embedAssets[res.id]=res;
	}

	public static get(id:string):IAsset{
		if(!EmbedManager._hasLoaded)
			throw("Error: EmbedManager.get() - Can not get embed-resource when EmbedManager is not loaded yet");
		return EmbedManager._embedAssets[id].asset;
	}

}