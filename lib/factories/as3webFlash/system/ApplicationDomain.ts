import {ByteArray, AssetBase} from "@awayjs/core";
import {IDisplayObjectAdapter, Font} from "@awayjs/scene";
import {DisplayObject as AwayDisplayObject} from "@awayjs/scene";
import {MovieClip as AwayMovieClip} from "@awayjs/scene";
import {WaveAudio} from "@awayjs/core";
import {MovieClip} from "../display/MovieClip";
import {Sound} from "../media/Sound";
import { ASClass } from '../../avm2/nat/ASClass';

/**
 * The ApplicationDomain class is a container for discrete groups of class definitions.
 * Application domains are used to partition classes that are in the same security domain.
 * They allow multiple definitions of the same class to exist and allow children to reuse parent
 * definitions.
 *
 *   <p class="- topic/p ">Application domains are used when an external SWF file is loaded through the Loader class.
 * All ActionScript 3.0 definitions in the loaded SWF file are stored in the application
 * domain, which is specified by the <codeph class="+ topic/ph pr-d/codeph ">applicationDomain</codeph> property of the LoaderContext
 * object that you pass as a <codeph class="+ topic/ph pr-d/codeph ">context</codeph> parameter of the Loader object's <codeph class="+ topic/ph pr-d/codeph ">load()</codeph> or
 * <codeph class="+ topic/ph pr-d/codeph ">loadBytes()</codeph> method. The LoaderInfo object also contains an
 * <codeph class="+ topic/ph pr-d/codeph ">applicationDomain</codeph> property, which is read-only.</p><p class="- topic/p ">All code in a SWF file is defined to exist in an application domain. The current application
 * domain is where your main application runs. The system domain contains all application domains,
 * including the current domain, which means that it contains all Flash Player classes.</p><p class="- topic/p ">Every application domain, except the system domain, has an associated parent domain.
 * The parent domain of your main application's application domain is the system domain.
 * Loaded classes are defined only when their parent doesn't already define them.
 * You cannot override a loaded class definition with a newer definition.</p><p class="- topic/p ">For usage examples of application domains, see the <i class="+ topic/ph hi-d/i ">ActionScript 3.0 Developer's Guide</i>.</p><p class="- topic/p ">The <codeph class="+ topic/ph pr-d/codeph ">ApplicationDomain()</codeph> constructor function allows you to create an ApplicationDomain object.</p>
 *
 * @internal	Security considerations for application domains are discussed in the
 *   applicationDomain property entries of URLRequest and LoaderInfo.
 */
export class ApplicationDomain extends ASClass
{
	private static _systemDomain:ApplicationDomain;
	private static getSystemDomain():ApplicationDomain{
		if(ApplicationDomain._systemDomain==null)
			ApplicationDomain._systemDomain=new ApplicationDomain();
		return ApplicationDomain._systemDomain;
	}

	private static _currentDomain:ApplicationDomain;

	private _parentDomain:ApplicationDomain;
	private _definitions:Object;
	private _font_definitions:Object;
	private _audio_definitions:Object;
	/**
	 * Creates a new application domain.
	 * @param	parentDomain	If no parent domain is passed in, this application domain takes the system domain as its parent.
	 */
	constructor (parentDomain:ApplicationDomain=null){
		super();
		if(parentDomain==null && ApplicationDomain._currentDomain!=null){
			ApplicationDomain.currentDomain;
			parentDomain=ApplicationDomain.getSystemDomain();
		}

		this._parentDomain=parentDomain;
		this._definitions={};
		this._font_definitions={};
		this._audio_definitions={};
	}

	/**
	 * Gets the current application domain in which your code is executing.
	 * @internal	Question: Do you call System.currentDomain? or Loader.currentDomain or request.currentDomain?
	 */
	public static get currentDomain () : ApplicationDomain{
		if(ApplicationDomain._systemDomain==null)
			ApplicationDomain._systemDomain=new ApplicationDomain();
		if(ApplicationDomain._currentDomain==null)
			ApplicationDomain._currentDomain=new ApplicationDomain(ApplicationDomain._systemDomain);
		return ApplicationDomain._currentDomain;
	}

	/**
	 * Gets and sets the object on which domain-global memory operations
	 * will operate within this ApplicationDomain.
	 */
	public get domainMemory () : ByteArray{
		console.log("domainMemory not implemented yet in flash/ApplicationDomain");
		return null;
	}
	public set domainMemory (mem:ByteArray){
		console.log("domainMemory not implemented yet in flash/ApplicationDomain");
	}

	/**
	 * Gets the minimum memory object length required to be used as
	 * ApplicationDomain.domainMemory.
	 */
	public static get MIN_DOMAIN_MEMORY_LENGTH () : number{
		console.log("MIN_DOMAIN_MEMORY_LENGTH not implemented yet in flash/ApplicationDomain");
		return 0;
	}

	/**
	 * Gets the parent domain of this application domain.
	 */
	public get parentDomain () : ApplicationDomain{
		return this._parentDomain;
	}

	public addDefinition (name:string, asset:AssetBase) : void{
		this._definitions[name]=asset;
	}

	public addAudioDefinition (name:string, asset:WaveAudio) : void{
		this._audio_definitions[name]=asset;
	}
	public addFontDefinition (name:string, asset:Font) : void{
		this._font_definitions[name]=asset;
	}
	/**
	 * Gets a public definition from the specified application domain.
	 * The definition can be that of a class, a namespace, or a function.
	 * @param	name	The name of the definition.
	 * @return	The object associated with the definition.
	 * @internal	throws SecurityError The definition belongs to a domain to which
	 *   the calling code does not have access.
	 * @throws	ReferenceError No public definition exists with the
	 *   specified name.
	 */
	public getDefinition (name:string) : any{

		if(this._definitions[name]){
			var newAdapter:IDisplayObjectAdapter=this._definitions[name].adapter.clone();
			if(newAdapter.adaptee.isAsset(AwayMovieClip)){
				(<AwayMovieClip>newAdapter.adaptee).currentFrameIndex=0;
			}
			return newAdapter;
		}
		else if(this._font_definitions[name]){
			return this._font_definitions[name];
		}
		else if(this._audio_definitions[name]){
			var sound:Sound=new Sound();
			sound.adaptee=this._audio_definitions[name];
			//sound.adaptee.adapter=sound;
			return sound;
		}

		return null;
	}
	public getFontDefinition (name:string) : Font{
		return this._font_definitions[name];
	}
	public getAudioDefinition (name:string) : Sound{
		var sound:Sound=new Sound();
		sound.adaptee=this._audio_definitions[name];
		//sound.adaptee.adapter=sound;
		return sound;
	}

	public getQualifiedDefinitionNames () : string[]{
		var allDefinitionsnames:string[]=[];
		for (var key in this._definitions) {
			if (this._definitions.hasOwnProperty(key)) {
				allDefinitionsnames[allDefinitionsnames.length]=key;
			}
		}
		return allDefinitionsnames;
	}

	/**
	 * Checks to see if a public definition exists within the specified application domain.
	 * The definition can be that of a class, a namespace, or a function.
	 * @param	name	The name of the definition.
	 * @return	A value of true if the specified definition exists; otherwise, false.
	 */
	public hasDefinition (name:string) : boolean{
		return this._definitions.hasOwnProperty(name);
	}
	public hasFontDefinition (name:string) : boolean{
		return this._font_definitions.hasOwnProperty(name);
	}
	public hasAudioDefinition (name:string) : boolean{
		return this._audio_definitions.hasOwnProperty(name);
	}
}
