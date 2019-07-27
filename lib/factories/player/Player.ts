import {SWFParser} from "../../parsers/SWFParser";
import {createSecurityDomain} from "./avmLoader"
import { Stage, Loader, LoaderContext, Event, ApplicationDomain, Sprite, DisplayObjectContainer } from "@as3web/flash";
class SWFFile{
    private _name:string;
    private _url:string;
    private _buffer:Uint8Array;
    private _parser:SWFParser;
    constructor(name:string, url:string, buffer:Uint8Array){
        this._name=name;
        this._url=url;
        this._buffer=buffer;
        this._parser=new SWFParser();

    }
}

class EntryClass extends Sprite{
    constructor(){
        super();
        
    }
}
export class Player{
    private _stage:Stage;
    private _loader:Loader;
    constructor(){
		this._onLoadCompleteDelegate = (event:Event) => this.onLoadComplete(event);

    }
    public playSWF(buffer){
        if(this._loader){
            throw("Only playing of 1 SWF file is supported at the moment");
        }
        this._loader=new Loader();
        var loaderContext:LoaderContext=new LoaderContext(false, new ApplicationDomain());
        this._loader.loaderInfo.addEventListener(Event.COMPLETE, this._onLoadCompleteDelegate);
        this._loader.loadData(buffer, loaderContext);

    }
	private _onLoadCompleteDelegate:(event:Event) => void;
    public onLoadComplete(buffer){
        window["hidePokiProgressBar"]();
        this._stage=new Stage(null, window.innerWidth, window.innerHeight, 0xff0000);
        this._stage.init(EntryClass);
        (<DisplayObjectContainer>this._stage.getChildAt(0)).addChild(this._loader);


        //  now the loader has Finished, check if bytedata was transfered
        createSecurityDomain(4)

        console.log("Loader has finished");
    }
}