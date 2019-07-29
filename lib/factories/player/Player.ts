import {SWFParser} from "../../parsers/SWFParser";
export {BaseVector} from "../avm2/natives/GenericVector"
import {createSecurityDomain, AVM2LoadLibrariesFlags} from "./avmLoader";
import {System} from "../avm2/natives/system";
/*import {Sprite} from "../flash/display/Sprite";
import { Loader } from '../flash/display/Loader';
import { Stage } from '../flash/display/Stage';
import { LoaderContext } from '../flash/system/LoaderContext';
import { ApplicationDomain } from '../flash/system/ApplicationDomain';
import { Event} from "../flash/events/Event";*/
/*class EntryClass extends Sprite{
    constructor(){
        super();
        
    }
}*/
console.log("System", System);

// Add the |axApply| and |axCall| methods on the function prototype so that we can treat
// Functions as AXCallables.
(<any> Function.prototype).axApply = Function.prototype.apply;
(<any> Function.prototype).axCall = Function.prototype.call;

export class Player{
    //private _stage:Stage;
    //private _loader:Loader;
    constructor(){
        window["hidePokiProgressBar"]();

        // for now just try to load and init the builtin.abc and playerglobal.abcs
        createSecurityDomain(AVM2LoadLibrariesFlags.Builtin | AVM2LoadLibrariesFlags.Playerglobal).then(function(){
            console.log("builtins are loaded fine")
        });

		//this._onLoadCompleteDelegate = (event:Event) => this.onLoadComplete(event);

    }
    public playSWF(buffer){
       /* if(this._loader){
            throw("Only playing of 1 SWF file is supported at the moment");
        }
        this._loader=new Loader();
        var loaderContext:LoaderContext=new LoaderContext(false, new ApplicationDomain());
        this._loader.loaderInfo.addEventListener(Event.COMPLETE, this._onLoadCompleteDelegate);
        this._loader.loadData(buffer, loaderContext);*/

    }
	private _onLoadCompleteDelegate:(event:Event) => void;
    public onLoadComplete(buffer){
        //this._stage=new Stage();//null, window.innerWidth, window.innerHeight, 0xff0000);
        //this._stage.init(EntryClass);
        //(<DisplayObjectContainer>this._stage.getChildAt(0)).addChild(this._loader);


        //  now the loader has Finished, check if bytedata was transfered

        console.log("Loader has finished");
    }
}