import {WaveAudioParser, Rectangle, WaveAudio, URLLoaderDataFormat, IAsset, ParserBase, ResourceDependency, ByteArray, ColorUtils} from "@awayjs/core";

import {Image2DParser, BitmapImage2D} from "@awayjs/stage";

import {MorphSprite, DefaultFontManager, Sprite, ISceneGraphFactory, DefaultSceneGraphFactory, MovieClip, Timeline, TesselatedFontTable, TextFormat, TextFormatAlign, SceneImage2D} from "@awayjs/scene";

import {Graphics} from "@awayjs/graphics";

import {MethodMaterial, ImageTexture2D} from "@awayjs/materials";

import {
	assert,
	Bounds,
	IDataDecoder,
	ABCBlock,
	ActionBlock,
	InitActionBlock,
	SymbolExport,
	UnparsedTag,
	utf8encode,
	DictionaryEntry,
	EagerlyParsedDictionaryEntry,
	memCopy} from "@awayjs/graphics";

import {Stream} from "../utils/stream";
import {Inflate, LzmaDecoder} from "@awayjs/graphics";

import {
	parseHeader,
	parseRgb,
	parseSoundStreamHeadTag,
    parseDefineSceneTag,
    parseSoundInfo,
	tagHandlers} from "../utils/parser/SWFLowLevel";

import {defineSound, SoundStream} from "../utils/parser/sound";
import {defineShape} from "../utils/parser/shape";
import {defineFont} from "../utils/parser/font";
import {defineText} from "../utils/parser/text";
import {defineButton} from "../utils/parser/button";
import {defineBitmap} from "../utils/parser/bitmap";
import {defineImage} from "../utils/parser/image";
import {defineLabel} from "../utils/parser/label";
import {SWFFrame} from "./SWFFrame";
import {SWFFile} from "./SWFFile";

import {
    SoundInfoFlags,
	SwfTagCode,
	DefinitionTags,
	ImageDefinitionTags,
	FontDefinitionTags,
	ControlTags,
	PlaceObjectTag,
	PlaceObjectFlags,
	TextFlags,
	getSwfTagCodeName} from "../utils/SWFTags";
import {__extends} from "tslib";
import { ABCFile } from '../factories/avm2/abc/lazy/ABCFile';
import { FlashSceneGraphFactory } from '../factories/as3webFlash/factories/FlashSceneGraphFactory';
import { CompressionMethod } from "./CompressionMethod";
var noTimelineDebug=true;
var noExportsDebug=true;
var noSceneGraphDebug=true;



/**
 * SWFParser provides a parser for the SWF data type.
 * Based on Shumway
 */
export class SWFParser extends ParserBase
{


	private pendingUpdateDelays: number;
	// Might be lower than frames.length if eagerly parsed assets pending resolution are blocking
	// us from reporting the given frame as loaded.

	public abcBlocks: ABCBlock[];
	public dictionary: DictionaryEntry[];
	private fonts: {name: string; style: string; id: number}[];
	private swfData: Uint8Array;
	private env: any;

	public symbolClassesMap: string[];
	public symbolClassesList: {id: number; className: string}[];
	private eagerlyParsedSymbolsMap: EagerlyParsedDictionaryEntry[];
	private eagerlyParsedSymbolsList: EagerlyParsedDictionaryEntry[];

	private _uncompressedLength: number;
	private _uncompressedLoadedLength: number;
	private _dataView: DataView;
	private _dataStream: Stream;
	private _decompressor: IDataDecoder;
	private _jpegTables: any;
	private _endTagEncountered: boolean;
	private _loadStarted: number;
	private _lastScanPosition: number;

	private _currentFrameLabels: string[];
	private _currentSoundStreamHead: SoundStream;
	private _currentSoundStreamBlock: Uint8Array;
	private _currentControlTags: UnparsedTag[];
	private _currentActionBlocks: ActionBlock[];
	private _currentInitActionBlocks: InitActionBlock[];
	private _currentExports: SymbolExport[];


	private _factory:ISceneGraphFactory;

	//set to "true" to have some console.logs in the Console
	private _parsed_header:boolean = false;
	private _body:ByteArray;




	private _debug:boolean = false;
	private _startedParsing:boolean = false;

	private _swfFile:SWFFile;
	public get swfFile():SWFFile{
		return this._swfFile;
	}

	public soundExports:any={};

	/**
	 * Creates a new AWD3Parserutils object.
	 * @param uri The url or id of the data or file to be parsed.
	 * @param extra The holder for extra contextual data that the parser might need.
	 */
	constructor(factory:ISceneGraphFactory = null)
	{
		super(URLLoaderDataFormat.ARRAY_BUFFER);

		this._swfFile=new SWFFile();

		this._factory = factory || new DefaultSceneGraphFactory();



	}


	/**
	 * Indicates whether or not a given file extension is supported by the parser.
	 * @param extension The file extension of a potential file to be parsed.
	 * @return Whether or not the given file type is supported.
	 */
	public static supportsType(extension:string):boolean
	{
		extension = extension.toLowerCase();
		console.log("SWFParser supportsType extension: ", extension, "result: ", extension == "swf");
		return extension == "swf";
	}

	/**
	 * Tests whether a data block can be parsed by the parser.
	 * @param data The data block to potentially be parsed.
	 * @return Whether or not the given data is supported.
	 */
	public static supportsData(data:any):boolean
	{
		var magic = (data[0] << 16) | (data[1] << 8) | data[2];

		console.log("SWFParser supportsData data: ", data);
		// check if header is 
		if ((magic & 0xffff) === 0x5753) {
			console.log("SWFParser supportsData result: ", true);
			return true;
		}
		console.log("SWFParser supportsData result: ", false);
		return false;
	}

	/**
	 * @inheritDoc
	 */
	public _iResolveDependency(resourceDependency:ResourceDependency):void
	{
		//console.log("_iResolveDependency", resourceDependency);
		// this will be called when Dependency has finished loading.
		// the ressource dependecniy has a id that point to the awd_block waiting for it.
		//console.log("SWFParser resolve dependencies";

		if (resourceDependency.assets.length == 1) {
			var awaitedObject=this.eagerlyParsedSymbolsMap[resourceDependency.id];
			if (awaitedObject) {
				switch(awaitedObject.type) {
					case "image":
						//console.log("finished image parsing", resourceDependency);
						var myBitmap:BitmapImage2D=(<BitmapImage2D>resourceDependency.assets[0]);
						//myBitmap.width=awaitedObject.definition.width;
						//myBitmap.height=awaitedObject.definition.height;
						this._awaySymbols[resourceDependency.id]=myBitmap;
						break;
					case "font":
						//console.log("finished font parsing", resourceDependency);
						break;
					case "sound":
						//console.log("finished sound parsing", resourceDependency);
						var waveAudio:WaveAudio=(<WaveAudio>resourceDependency.assets[0]);
						//myBitmap.width=awaitedObject.definition.width;
						//myBitmap.height=awaitedObject.definition.height;
						this._awaySymbols[resourceDependency.id]=waveAudio;
						break;
					default:
						console.log("finished unknown parsing", resourceDependency);
						break;
				}
			}
			else
				console.log("no eagerlyParsedSymbolsMap for id", resourceDependency.id);

		}
		else{
			throw("SWFParser: error when resolving dependency");
		}

		this.externalDependenciesCount--;
		if(this.externalDependenciesCount==0){
			this.parseSymbolsToAwayJS();
		}

	}

	/**
	 * @inheritDoc
	 */
	public _iResolveDependencyFailure(resourceDependency:ResourceDependency):void
	{
		//not used - if a dependcy fails, the awaiting Texture or CubeTexture will never be finalized, and the default-bitmaps will be used.
		// this means, that if one Bitmap of a CubeTexture fails, the CubeTexture will have the DefaultTexture applied for all six Bitmaps.
		//console.log("_iResolveDependencyFailure", resourceDependency);
		this.externalDependenciesCount--;
		if(this.externalDependenciesCount==0){
			this.parseSymbolsToAwayJS();
		}

	}

	/**
	 * Resolve a dependency name
	 *
	 * @param resourceDependency The dependency to be resolved.
	 */
	public _iResolveDependencyName(resourceDependency:ResourceDependency, asset:IAsset):string
	{
		var oldName:string = asset.name;

		var newName:string = asset.name;

		asset.name = oldName;

		return newName;
	}

	private externalDependenciesCount:number=0;
	/**
	 * @inheritDoc
	 */
	public _pProceedParsing():boolean
	{
		//console.log("SWFParser - _pProceedParsing");
		if (!this._startedParsing) {

			this._startedParsing = true;
			// get the bytedata

			var byteData:ByteArray = this._pGetByteData();
			var int8Array:Uint8Array=new Uint8Array(byteData.arraybytes);


			// preparse all data. after this step we can deal with tag-objects rather than bytedata

			this.initSWFLoading(int8Array, int8Array.length);

			// now we have a list of symbols that we want to convert to awayjs-symbols

			this._awaySymbols={};
			this._mapMatsForBitmaps={};


			if(this.abcBlocks.length && (<any>this._factory).executeABCBytes){
				(<any>this._factory).executeABCBytes(this.abcBlocks);
			}

			// this.eagerlyParsedSymbolsList can contain image/font data,
			// that must be resolved externally before we can start creating assets for symbols
			this.externalDependenciesCount=0;
			if(this.eagerlyParsedSymbolsList.length>0){
				//console.log("this.eagerlyParsedSymbolsList", this.eagerlyParsedSymbolsList);
				//console.log("this.eagerlyParsedSymbolsMap", this.eagerlyParsedSymbolsMap);
				for (var i = 0; i < this.eagerlyParsedSymbolsList.length; i++) {
					var eagerlySymbol:any = this.eagerlyParsedSymbolsList[i];
					if (eagerlySymbol) {
						switch(eagerlySymbol.type) {
							case "image":
								//console.log("init image parsing", eagerlySymbol);
								this._pAddDependency(eagerlySymbol.id.toString(), null, new Image2DParser(this._factory, eagerlySymbol.definition.alphaData), new Blob([eagerlySymbol.definition.data],{type: eagerlySymbol.definition.mimeType}), false, true);
								this.externalDependenciesCount++;
								break;
							case "sound":
								//console.log("init sound parsing", eagerlySymbol);
								this._pAddDependency(eagerlySymbol.id.toString(), null, new WaveAudioParser(), new Blob([eagerlySymbol.definition.packaged.data],{type: eagerlySymbol.definition.packaged.mimeType}), false, true);
								this.externalDependenciesCount++;
								break;
							case "font":
								//console.log("encountered eagerly parsed font: ", eagerlySymbol);
								break;
							default:
								console.log("encountered eagerly parsed unknown type: ", eagerlySymbol);
								break;
						}

					}

				}

			}
			if(this.externalDependenciesCount>0){
				this._pPauseAndRetrieveDependencies();
			}
			else{
				this.parseSymbolsToAwayJS();
			}

		}
		if(this.externalDependenciesCount>0){
			return  ParserBase.MORE_TO_PARSE;

		}
		return  ParserBase.PARSING_DONE;
	}

	private _awaySymbols:any;



	public getMaterial(bitmapIndex:number):MethodMaterial
	{
		var material:MethodMaterial = this._mapMatsForBitmaps[bitmapIndex];
		if(!material){
			material=new MethodMaterial();
			var myImage=this._awaySymbols[bitmapIndex];
			if(!myImage || (!myImage.isAsset(BitmapImage2D) && !myImage.isAsset(SceneImage2D))){
				console.log("error: can not find image for bitmapfill", myImage)
			}
			material.ambientMethod.texture=new ImageTexture2D(myImage);
			
			material.alphaBlending=true;
			material.useColorTransform = true;
			material.bothSides = true;
			this._mapMatsForBitmaps[bitmapIndex]=material;
		}

		return material;
	}

	private myTestSprite:Sprite;
	private _mapMatsForBitmaps:any;
	public parseSymbolsToAwayJS(){
		var parser = new DOMParser();
        var dictionary = this.dictionary;
        var assetsToFinalize:any={};
		for (var i = 0; i < dictionary.length; i++) {
			if ( dictionary[i]) {
				var s = performance.now();
				var symbol = this.getSymbol(dictionary[i].id);
				noSceneGraphDebug || console.log("symbol: ", dictionary[i].id, symbol.type, symbol);
				switch(symbol.type){
					case "morphshape":
						//console.warn("Warning: SWF contains shapetweening!!!");
                        symbol.shape.name=symbol.id;
						symbol.shape.name="AwayJS_morphshape_"+symbol.id.toString();
						symbol.shape.className=symbol.className;
                        this._awaySymbols[dictionary[i].id]=symbol.shape;
                        assetsToFinalize[dictionary[i].id]=symbol.shape;
						break;
					case "shape":
                        symbol.shape.name="AwayJS_shape_"+symbol.id.toString();
						symbol.shape.className=symbol.className;
						this._awaySymbols[dictionary[i].id]=symbol.shape;
                        assetsToFinalize[dictionary[i].id]=symbol.shape;
						break;
					case "font":
						//symbol.away._smybol=symbol;
						symbol.away.className=symbol.className;
						this._awaySymbols[dictionary[i].id]=symbol;
                        assetsToFinalize[symbol.name]=symbol.away;
						break;
					case "sprite":
						noTimelineDebug || console.log("start parsing timeline: ", symbol);
						var awayMc = this.framesToTimeline(symbol, symbol.frames, null, null);
						(<any>awayMc).className=symbol.className;
						if(awayMc.buttonMode){							
							this._buttonIds[symbol.id]=true;
						}
						else{
							this._mcIds[symbol.id]=true;
						}
                        awayMc.name="AwayJS_mc_"+symbol.id.toString();
						this._awaySymbols[dictionary[i].id] = awayMc;
                        assetsToFinalize[dictionary[i].id] = awayMc;
						break;
					case "text":
						var awayText = this._factory.createTextField(symbol);
						awayText._symbol=symbol;
						awayText.textFormat=new TextFormat();
						(<any>awayText).className=symbol.className;
						var flashFont=this._awaySymbols[symbol.tag.fontId];
						if(flashFont){
							awayText.textFormat.font=flashFont.away;
							awayText.textFormat.font_table=<TesselatedFontTable>flashFont.away.get_font_table(flashFont.fontStyleName, TesselatedFontTable.assetType);
						}
						awayText.textFormat.size = symbol.tag.fontHeight/20;
						//awayText.textFormat.color = (symbol.tag.flags & TextFlags.HasColor)?ColorUtils.f32_RGBA_To_f32_ARGB(symbol.tag.color):0xffffff;
						awayText.textColor = (symbol.tag.flags & TextFlags.HasColor)?ColorUtils.f32_RGBA_To_f32_ARGB(symbol.tag.color):0xffffff;
						awayText.textFormat.leftMargin = symbol.tag.leftMargin/20;
						awayText.textFormat.rightMargin = symbol.tag.rightMargin/20;
						awayText.textFormat.letterSpacing = symbol.tag.letterSpacing/20;
						awayText.textFormat.leading = symbol.tag.leading/20;
						awayText.textFormat.align = this.textFormatAlignMap[symbol.tag.align];

						awayText.textOffsetX = symbol.fillBounds.xMin/20;
						awayText.textOffsetY = symbol.fillBounds.yMin/20;
						awayText.width = ((symbol.fillBounds.xMax - symbol.fillBounds.xMin)/20);
						awayText.height = (symbol.fillBounds.yMax - symbol.fillBounds.yMin)/20;
						awayText.border = !!(symbol.tag.flags & TextFlags.Border);
						awayText.background = awayText.border;

						awayText.multiline=(symbol.tag.flags & TextFlags.Multiline)?true:false;
						awayText.wordWrap=(symbol.tag.flags & TextFlags.WordWrap)?true:false;
						awayText.selectable=symbol.tag.flags?!(symbol.tag.flags & TextFlags.NoSelect):false;

						if(symbol.tag.maxLength && symbol.tag.maxLength>0){
							awayText.maxChars=symbol.tag.maxLength;
						}
						if(symbol.tag.flags & TextFlags.ReadOnly){
							awayText.type="dynamic";
						}
						else{
							awayText.type="input";
						}

						if (symbol.tag.flags & TextFlags.Html) {
							awayText.html = true;
							if(symbol.tag.initialText && symbol.tag.initialText!="")
								awayText.htmlText=symbol.tag.initialText;								
						}
						else {
							awayText.html = false;
							if(symbol.tag.initialText && symbol.tag.initialText!="")
								awayText.text=symbol.tag.initialText;
						}
                        awayText.name="tf_"+symbol.id.toString();
                        assetsToFinalize[dictionary[i].id] = awayText;
						this._awaySymbols[dictionary[i].id] = awayText;
						break;
					case "sound":
						var awaySound:WaveAudio=(<WaveAudio>this._awaySymbols[dictionary[i].id]);
						if(awaySound){
							(<any>awaySound).className=this.symbolClassesMap[symbol.id]?this.symbolClassesMap[symbol.id]:null;
                            awaySound.name=symbol.id;
                            assetsToFinalize[dictionary[i].id]=awaySound;
                            //awaySound.play(0,false);
                        }
                        else{
                            console.warn("SWF-parser: no sound loaded for sound-id:", dictionary[i].id);

                        }
						break;
                    case "button":
						noTimelineDebug || console.log("start parsing button: ", symbol);
						var awayMc = this.framesToTimeline(symbol, null, symbol.states, symbol.buttonActions, this._buttonSounds[symbol.id]);
						//awayMc._symbol=symbol;
                        awayMc.name="AwayJS_button_"+symbol.id.toString();
						(<any>awayMc).className=symbol.className;
                        assetsToFinalize[dictionary[i].id]=awayMc;
						this._awaySymbols[dictionary[i].id] = awayMc;
						this._buttonIds[symbol.id]=true;
						/*
						var mySprite:SimpleButton=new SimpleButton();
						console.log("Button:", symbol);
						//var awayMc = this.framesToAwayTimeline(symbol.frames);
						//mySprite._symbol=symbol;
						this._pFinalizeAsset(mySprite, symbol.id);
						this._awaySymbols[dictionary[i].id] = mySprite;
						*/
						break;
					case "label":
						var awayText = this._factory.createTextField(symbol);
                        var font=null;
                        var invalid_font:boolean=false;
						(<any>awayText).className=symbol.className;
						for(var r=0; r<symbol.records.length;r++){
							var record:any=symbol.records[r];
							if(record.fontId){
								font=this._awaySymbols[record.fontId];
								if(font){

									//awayText.textFormat.font=font.away;
									record.font_table=<TesselatedFontTable>font.away.get_font_table(font.fontStyleName, TesselatedFontTable.assetType);
                                    if(!record.font_table){
                                        invalid_font=true;
                                        console.log("no font_table set");
                                    }
									//record.font_table=font.away.font_styles[0];
                                }
							}
						}
						awayText.staticMatrix=symbol.matrix;
						awayText.textOffsetX=symbol.fillBounds.xMin/20;
						awayText.textOffsetY=symbol.fillBounds.yMin/20;
						awayText.width=(symbol.fillBounds.xMax/20 - symbol.fillBounds.xMin/20)-1;
                        awayText.height=(symbol.fillBounds.yMax/20 - symbol.fillBounds.yMin/20)-1;
                        if(!invalid_font)
						    awayText.setLabelData(symbol);
                        awayText.name="AwayJS_label_"+symbol.id.toString();
                        assetsToFinalize[dictionary[i].id] = awayText;
						this._awaySymbols[dictionary[i].id] = awayText;
						awayText.selectable=symbol.tag.flags?!(symbol.tag.flags & TextFlags.NoSelect):false;
						break;
					case "image":
						var awayBitmap:BitmapImage2D=(<BitmapImage2D>this._awaySymbols[dictionary[i].id]);
						if(!awayBitmap && symbol.definition){
							awayBitmap=new BitmapImage2D(symbol.definition.width, symbol.definition.height, true, 0xff0000, false);
							if(symbol.definition.data.length!=(4*symbol.definition.width* symbol.definition.height)
							&& symbol.definition.data.length!=(3*symbol.definition.width* symbol.definition.height)){
								symbol.definition.data=new Uint8ClampedArray(4*symbol.definition.width* symbol.definition.height);
								//symbol.definition.data.fill
							}
                            awayBitmap.setPixels(new Rectangle(0,0,symbol.definition.width, symbol.definition.height), symbol.definition.data);
                        }
						if(awayBitmap){
                            this._awaySymbols[dictionary[i].id] = awayBitmap;
                            awayBitmap.name="awayBitmap_"+dictionary[i].id.toString();
                            assetsToFinalize[dictionary[i].id]=awayBitmap;
							(<any>awayBitmap).className=symbol.className;
                        }
						break;
					default:
						console.log("unknown symbol type:", symbol.type, symbol);
						break;


				}
			}
		}

		var rootSymbol:any = this.dictionary[0];
        if (!rootSymbol) {
            rootSymbol = {
                id: 0,
                className: this.symbolClassesMap[0]
            };
		}
		rootSymbol.isRoot=true;
		noTimelineDebug || console.log("start parsing root-timeline: ", rootSymbol);
		var awayMc:MovieClip=this.framesToTimeline(rootSymbol, this._swfFile.frames, null, null);

        for(var key in assetsToFinalize){     
			assetsToFinalize[key]["fileurl"]=this._iFileName;
            this._pFinalizeAsset(assetsToFinalize[key]);
        }
        this._pFinalizeAsset(awayMc, "scene");
        DefaultFontManager.applySharedFonts(this._iFileName);
		//console.log("root-timeline: ", awayMc);
		//console.log("AwayJS loaded SWF with "+ dictionary.length+" symbols", this._swfFile.sceneAndFrameLabelData);

	}
	// helper for handling buttons
	private _buttonIds:any={};
	private _mcIds:any={};

	public textFormatAlignMap:string[]=[TextFormatAlign.LEFT, TextFormatAlign.RIGHT, TextFormatAlign.CENTER, TextFormatAlign.JUSTIFY];

	public framesToTimeline(symbol:any, swfFrames:SWFFrame[], states:any, buttonActions:any, buttonSound:any=null):MovieClip{
		if(!states && !swfFrames)
			throw("error when creating timeline - neither movieclip frames nor button-states present");
		
			
		var avm2scripts={};		
		var awayMc:MovieClip=this._factory.createMovieClip(null, symbol);
		if(awayMc.adapter != awayMc && (<any>awayMc.adapter).getScripts){
			avm2scripts = (<any>awayMc.adapter).getScripts();
		}		
		var awayTimeline:Timeline=awayMc.timeline;

		

		var isButton:boolean=false;
		var key:string;
		if(states && !swfFrames){
			isButton=true;
			swfFrames=[];
			for (key in states) {
				var newSWFFrame:SWFFrame=new SWFFrame();
				newSWFFrame.controlTags=states[key];
				newSWFFrame.buttonStateName=key;
                swfFrames[swfFrames.length]=newSWFFrame;
                //console.log("buttonSound ", buttonSound);
			}
		}
		
		var keyframe_durations:number[]=[];
		var frame_command_indices:number[]=[];
		var frame_recipe:number[]=[];
		var command_length_stream:number[]=[];
		var command_index_stream:number[]=[];
		var add_child_stream:number[]=[];
		var add_sounds_stream:number[]=[];
		var remove_child_stream:number[]=[];
		var update_child_stream:number[]=[];
		var update_child_props_indices_stream:number[]=[];
		var update_child_props_length_stream:number[]=[];
		var property_type_stream:number[]=[];
		var property_index_stream:number[]=[];
		var properties_stream_int:number[]=[];

		var properties_stream_f32_mtx_scale_rot:number[]=[];
		var properties_stream_f32_mtx_pos:number[]=[];
		var properties_stream_f32_mtx_all:number[]=[];
		var properties_stream_f32_ct:number[]=[];
		var properties_stream_strings:string[]=[];

		var virtualScenegraph:any={};
		var freeChilds:any={};
		var registeredGraphicsIDs:any={};
		var keyFrameCount=0;
		var framesLen:number=0;
		
		var cmds_removed:any[]=[];
		var cmds_add:any[]=[];
		var cmds_update:any[]=[];
		var cmds_startSounds:any[]=[];
		var cmds_stopSounds:any[]=[];
		var unparsedTags:any[]=[];
		var transformsAtDepth:any={};
		
		var instanceCNT:number=0;
        var child:any;
        var name:string;
        var freeChildsForID:any;
		var i:number;
		var framesLen:number=swfFrames.length;
		var command_recipe_flag:number=0;
		var audio_commands_cnt:number=0;
        //console.log("new mc ");
		for (i = 0; i < framesLen; i++) {
			noTimelineDebug || console.log("	process frame:", i+1, "/", framesLen);

			cmds_removed.length=0;
			cmds_add.length=0;
			cmds_update.length=0;
			cmds_startSounds.length=0;
			cmds_stopSounds.length=0;
			unparsedTags.length=0;
			if(swfFrames[i].initActionBlocks){
				awayTimeline.avm1InitActions[i]=swfFrames[i].initActionBlocks;
			}
			if(swfFrames[i].exports){
				awayTimeline.avm1Exports[i]=swfFrames[i].exports;
				for(key in swfFrames[i].exports) {
					//console.log("\n\nfound export\n\n", swfFrames[i].exports[key]);
					let asset = swfFrames[i].exports[key];
					let awayAsset=this._awaySymbols[asset.symbolId];
					if(!awayAsset){
						console.log("\n\nerror: no away-asset for export\n\n", swfFrames[i].exports[key]);

					}
					else{
						if(awayAsset.isAsset){
                            //  this is a awayjs asset. we just update its name. 
                            //  all awayjs-assets will get registered on AssetLibrary by name at very end of parseSymbolsToAwayJS function
                            awayAsset.name=asset.className.toLowerCase();
                        }
                        else if(awayAsset.away){
                            // this is a font. for now we do nothing (?)
                        }
					}
					noExportsDebug || console.log("			added export", swfFrames[i].exports[key], asset.className, asset.symbolId, awayAsset);
				}
			}
			// check if this is a empty frame
			var isEmpty:boolean=((!swfFrames[i].controlTags || swfFrames[i].controlTags.length==0) &&
								(!swfFrames[i].labelNames || swfFrames[i].labelNames.length==0) &&
								(!swfFrames[i].actionBlocks || swfFrames[i].actionBlocks.length==0) && !avm2scripts[i]);
			
			
				
			
            noTimelineDebug || console.log("	process frame:", i+1, "/", isEmpty, swfFrames[i]);
			if((keyframe_durations.length!=0) && isEmpty){
				// frame is empty and it is not the first frame
				// we just add to the duration of the last keyframe			
				if(isButton){
					command_recipe_flag=0;
					command_recipe_flag |= 0x01;
					frame_command_indices.push(command_index_stream.length);
					keyframe_durations[keyframe_durations.length]=1;
                    frame_recipe.push(command_recipe_flag);
                    for (var key in virtualScenegraph){
                        child=virtualScenegraph[key];
                        freeChildsForID = freeChilds[child.id];
                        if(!freeChildsForID){
                            freeChildsForID=freeChilds[child.id]={};
                        }
                        name=child.name;//+"#"+key;
                        if(!freeChildsForID[name]){
                            freeChildsForID[name]=[];
                        }
                        freeChildsForID[name].push(child.sessionID);

                    }
					virtualScenegraph={};
					keyFrameCount++;
					//transformsAtDepth[tag.depth.toString()]=null;
					noTimelineDebug || console.log("			remove all to  create empty button frame");
				}	
				else{
					noTimelineDebug || console.log("			extending last frames duration");
					keyframe_durations[keyframe_durations.length-1]+=1;
				}	
			}
			else{
				// frame is not empty, or it is the first frame, or both
				command_recipe_flag=0;
				frame_command_indices.push(command_index_stream.length);
				keyframe_durations[keyframe_durations.length]=1;
				if(!isEmpty && (swfFrames[i].labelNames && swfFrames[i].labelNames.length>0)){
					var fl_len:number=swfFrames[i].labelNames.length;
					var scriptsFN=[];
					for(var fl:number=0;fl<fl_len; fl++){
						var scriptLabels=swfFrames[i].labelNames[fl].split("_AWS_");
						for(var sl:number=1; sl<scriptLabels.length; sl++){
							var scriptID=scriptLabels[sl].replace("_", "");
							if(window["frameScripts_"+this._iFileName] && window["frameScripts_"+this._iFileName]["script_id_"+scriptID]){
								//console.log("found function", window["frameScripts_"+this._iFileName]["script_id_"+scriptID]);
								scriptsFN.push(window["frameScripts_"+this._iFileName]["script_id_"+scriptID]);
							}
						}
						swfFrames[i].labelNames[fl]=scriptLabels.length>0?scriptLabels[0]:"";
                        var labelName=swfFrames[i].labelNames[fl].toLowerCase();
                        if(!awayTimeline._labels[labelName])
						    awayTimeline._labels[labelName]=keyFrameCount;
					}
					if(scriptsFN.length>0){
						awayTimeline._framescripts[keyFrameCount]=scriptsFN;

					}
				}
				if(!isEmpty && swfFrames[i].actionBlocks && swfFrames[i].actionBlocks.length>0){
					awayTimeline._framescripts[keyFrameCount]=swfFrames[i].actionBlocks;
                }
				if(!isEmpty && avm2scripts[i]){
					awayTimeline._framescripts[keyFrameCount]=avm2scripts[i];
                }
                if(buttonSound && buttonSound[keyFrameCount] && buttonSound[keyFrameCount].id!=0){
                    awaySymbol = this._awaySymbols[buttonSound[keyFrameCount].id];
                    if(awaySymbol){
                        awayTimeline.audioPool[audio_commands_cnt]={cmd:SwfTagCode.CODE_START_SOUND, id:buttonSound[keyFrameCount].id, sound:awaySymbol, props:buttonSound[keyFrameCount].info};
                        cmds_startSounds.push(audio_commands_cnt++);
                    }
                }
				keyFrameCount++;
				if(!isEmpty && swfFrames[i].controlTags && swfFrames[i].controlTags.length>0){
					noTimelineDebug || console.log("			Start parsing controltags", swfFrames[i].controlTags.length);
                    var len:number=swfFrames[i].controlTags.length;

					for (var ct = 0; ct < len; ct++) {
						var unparsedTag=swfFrames[i].controlTags[ct];
						var tag= unparsedTag.tagCode === undefined ? unparsedTag : <any>this.getParsedTag(unparsedTag);

						//console.log("parsed tag", tag);
						switch (tag.code) {
							case SwfTagCode.CODE_START_SOUND:
								//console.log("CODE_START_SOUND", tag)
                                awaySymbol = this._awaySymbols[tag.soundId];
                                if(tag.soundInfo && (tag.soundInfo.flags & SoundInfoFlags.Stop)){
                                    awayTimeline.audioPool[audio_commands_cnt]={cmd:SwfTagCode.CODE_STOP_SOUND, id:tag.soundId, sound:this._awaySymbols[tag.soundId], props:tag.soundInfo};
                                    noTimelineDebug || console.log("stopsound", tag.soundId, tag.soundInfo, i+1);
                                }
                                else{
                                    awayTimeline.audioPool[audio_commands_cnt]={cmd:SwfTagCode.CODE_START_SOUND, id:tag.soundId, sound:this._awaySymbols[tag.soundId], props:tag.soundInfo};
                                    noTimelineDebug || console.log("startsound", tag.soundId, tag.soundInfo, awaySymbol, i+1);
                                }
								// todo: volume / pan / other properties
								cmds_startSounds.push(audio_commands_cnt++);
								break;
							case SwfTagCode.CODE_STOP_SOUND:
								//console.log("CODE_STOP_SOUND", tag)
								// todo
								//console.log("stopsound", tag.soundId, tag.soundInfo);
								awayTimeline.audioPool[audio_commands_cnt]={cmd:SwfTagCode.CODE_STOP_SOUND, id:tag.soundId, sound:this._awaySymbols[tag.soundId], props:tag.soundInfo};
								noTimelineDebug || console.log("stopsound", tag.soundId, tag.soundInfo, i+1);
								cmds_startSounds.push(audio_commands_cnt++);
								break;

							case SwfTagCode.CODE_REMOVE_OBJECT:
							case SwfTagCode.CODE_REMOVE_OBJECT2:
								child=virtualScenegraph[tag.depth];
								if(!child){
									console.log("Error in timeline. remove cant find the obejct to remove")
								}
								
								cmds_removed[cmds_removed.length]={depth:tag.depth|0};
								//awayTimeline.freePotentialChild(child.awayChild, child.sessionID);
								virtualScenegraph[tag.depth]=null;
                                transformsAtDepth[tag.depth.toString()]=null;
                                freeChildsForID = freeChilds[child.id];
                                if(!freeChildsForID){
                                    freeChildsForID=freeChilds[child.id]={};
                                }
                                name=child.name;//+"#"+tag.depth;
                                if(!freeChildsForID[name]){
                                    freeChildsForID[name]=[];
                                }
                                freeChildsForID[name].push(child.sessionID);

								delete virtualScenegraph[tag.depth];
								noTimelineDebug || console.log("				remove", "depth", tag.depth);

								break;
							case SwfTagCode.CODE_PLACE_OBJECT:
							case SwfTagCode.CODE_PLACE_OBJECT2:
							case SwfTagCode.CODE_PLACE_OBJECT3:
								var placeObjectTag = <PlaceObjectTag>tag;
								//console.log("CODE_PLACE_OBJECT", tag.depth | 0, placeObjectTag);
								child = virtualScenegraph[tag.depth];
								var hasCharacter = placeObjectTag.symbolId > -1;
								// Check for invalid flag constellations.
								if (placeObjectTag.flags & PlaceObjectFlags.Move) {
									// Invalid case 1: Move flag set but no child found at given depth.
									if (!child) {
										//  Ignore the current tag.
										break;
									}
								} 
								var awaySymbol: IAsset = null;
								var sessionID: number = -1;
								var swapGraphicsID: number = -1;
								var ratio: number = -1;

								// possible options:

								// hasCharacter && !child
								//		we need to put a child into the display list. might need to create sprite for graphics !

								// hasCharacter && child
								//		need to update a child with a new graphic
								//		if the existing child is not a graphic, we need to remove it and add a new sprite for it, so we can update the graphics there

								// !hasCharacter && child
								//		need to update a child

								// !hasCharacter && !child
								//		something is wrong ?

								if(hasCharacter) {
									//console.log("placeTag symbol id",placeObjectTag.symbolId )
									awaySymbol = this._awaySymbols[placeObjectTag.symbolId];
									var flashSymbol = this.dictionary[placeObjectTag.symbolId];
									//addedIds[addedIds.length]=placeObjectTag.symbolId;
									if(awaySymbol.isAsset(Graphics)){

										swapGraphicsID=placeObjectTag.symbolId;
										if(!awayTimeline.graphicsPool[placeObjectTag.symbolId]){
											awayTimeline.graphicsPool[placeObjectTag.symbolId]=awaySymbol;
										}
										
										// register a new instance for this object
										var graphicsSprite:Sprite=this._factory.createSprite(null, <Graphics> awaySymbol, flashSymbol);
										graphicsSprite.mouseEnabled = false;

										// if this a child is already existing, and it is a sprite, we will just use the swapGraphics command to exchange the graphics it holds
										if(child && child.awayChild.isAsset(Sprite)){
											sessionID=child.sessionID;
											// a child (sprite) already exists and the swapGraphicsId will be handled in the update command
										}
										else{
											if (placeObjectTag!=null && ((placeObjectTag.name && placeObjectTag.name!="") ||(this._buttonIds[placeObjectTag.symbolId])||(this._mcIds[placeObjectTag.symbolId]))) {

												if(!placeObjectTag.name || placeObjectTag.name=="")
													placeObjectTag.name="instance"+placeObjectTag.symbolId+"_"+instanceCNT++;
											}
											if(child){												
												cmds_removed[cmds_removed.length]={depth:tag.depth|0};
                                                //awayTimeline.freePotentialChild(child.awayChild, child.sessionID);
                                                freeChildsForID = freeChilds[child.id];
                                                if(!freeChildsForID){
                                                    freeChildsForID=freeChilds[child.id]={};
                                                }
                                                name=child.name;//+"#"+tag.depth;
                                                if(!freeChildsForID[name]){
                                                    freeChildsForID[name]=[];
                                                }
                                                freeChildsForID[name].push(child.sessionID);
                                                
												virtualScenegraph[tag.depth]=null;
												transformsAtDepth[tag.depth.toString()]=null;
												delete virtualScenegraph[tag.depth];
												noTimelineDebug || console.log("				remove because we want to add a shape at this depth", "depth", tag.depth);

											}
                                        
                                            // check if we can reuse a free instance for this symbol:
                                            if(freeChilds[placeObjectTag.symbolId]){
                                                name=placeObjectTag.name?placeObjectTag.name:"noname";
                                                // first we check if a instance is available that had the same instance-name
                                                if(freeChilds[placeObjectTag.symbolId][name]&& freeChilds[placeObjectTag.symbolId][name].length>0){
                                                    sessionID=freeChilds[placeObjectTag.symbolId][name].shift();
                                                } 
                                                else{
                                                    // if not, we try to grab any other                                                    
                                                    for(var key in freeChilds[placeObjectTag.symbolId]){
                                                        if(freeChilds[placeObjectTag.symbolId][key].length>0){
                                                            sessionID=freeChilds[placeObjectTag.symbolId][key].shift();
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                            if(sessionID==-1){
                                                sessionID = awayTimeline.registerPotentialChild(graphicsSprite);
                                            }
                                            
											if((<any>placeObjectTag).variableName || (placeObjectTag.events && placeObjectTag.events.length>0)){
												awayTimeline.potentialPrototypesInitEventsMap[sessionID+"#"+i]=placeObjectTag;
											}
											
											noTimelineDebug || console.log("				add shape", "session-id", sessionID, "depth", tag.depth, tag, awaySymbol);
											child=virtualScenegraph[tag.depth] = {
												sessionID: sessionID,
												id: placeObjectTag.symbolId,
												masks: [],
												isMask:false,
												clipDepth:0,
												depth:0,
												awayChild:graphicsSprite,
												name:placeObjectTag.name?placeObjectTag.name:"noname"
											}
											cmds_add[cmds_add.length] = {sessionID: sessionID, depth: tag.depth, id:placeObjectTag.symbolId, name:placeObjectTag.name};
											

										}
									}
									else{
                                        if(!placeObjectTag.name || placeObjectTag.name=="")
                                            placeObjectTag.name="instance"+placeObjectTag.symbolId+"_"+instanceCNT++;
										                                        
                                        // check if we can reuse a free instance for this symbol:
                                        if(freeChilds[placeObjectTag.symbolId]){
                                            name=placeObjectTag.name?placeObjectTag.name:"noname";
                                            // first we check if a instance is available that had the same instance-name
                                            if(freeChilds[placeObjectTag.symbolId][name]&& freeChilds[placeObjectTag.symbolId][name].length>0){
                                                sessionID=freeChilds[placeObjectTag.symbolId][name].shift();
                                            } 
                                            else{  
                                                // if not, we try to grab any other
                                                for(var key in freeChilds[placeObjectTag.symbolId]){
                                                    if(freeChilds[placeObjectTag.symbolId][key].length>0){
                                                        sessionID=freeChilds[placeObjectTag.symbolId][key].shift();
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                        if(sessionID==-1){
                                            sessionID = awayTimeline.registerPotentialChild(awaySymbol);
                                        }

										if((<any>placeObjectTag).variableName || (placeObjectTag.events && placeObjectTag.events.length>0)){
											awayTimeline.potentialPrototypesInitEventsMap[sessionID+"#"+i]=placeObjectTag;
										}
										
										noTimelineDebug || console.log("				add", "session-id", sessionID, "depth", tag.depth, tag, awaySymbol);
										child=virtualScenegraph[tag.depth] = {
											sessionID: sessionID,
											id: placeObjectTag.symbolId, 
											masks: [],
											isMask:false,
											clipDepth:0,
											depth:0,
											awayChild:awaySymbol,
											name:placeObjectTag.name?placeObjectTag.name:"noname"
										}
									
										cmds_add[cmds_add.length] = {sessionID: sessionID, depth: tag.depth, id:placeObjectTag.symbolId, name:placeObjectTag.name};
										

									}
								}

								if (placeObjectTag.flags & PlaceObjectFlags.HasRatio) {
									if(!awaySymbol)
										awaySymbol = this._awaySymbols[child.id];
									if(awaySymbol.isAsset(MorphSprite))
										ratio=placeObjectTag.ratio;
								}

								if (child) {
									cmds_update[cmds_update.length]={child:child, placeObjectTag:placeObjectTag, swapGraphicsID:swapGraphicsID, ratio:ratio, depth:tag.depth};
									noTimelineDebug || console.log("				update", "session-id", child.sessionID, "hasCharacter", hasCharacter, "depth", tag.depth, "swapGraphicsID", swapGraphicsID, tag,  awaySymbol);

								}
								else{
									throw("error in add command");
								}


								break;
							default:
								console.log("unknown timeline command tag", tag)
						}

						//console.log("parsed a tag: ", tag);
					}

					// create remove commands:
					var start_index = remove_child_stream.length;
					var command_cnt=cmds_removed.length;
					if(command_cnt){
						start_index = remove_child_stream.length;
						for (var cmd = 0; cmd < command_cnt; cmd++){
							remove_child_stream.push(cmds_removed[cmd].depth);
						}
						command_recipe_flag |= 0x02;
						command_length_stream.push(remove_child_stream.length-start_index);
						command_index_stream.push(start_index);
						noTimelineDebug || console.log("				removeCommands", cmds_removed);
						
					}
					

					// create add commands:
					var command_cnt=cmds_add.length;
					if(command_cnt){
						start_index = add_child_stream.length;
						for (var cmd = 0; cmd < command_cnt; cmd++){
							add_child_stream.push(cmds_add[cmd].sessionID);
							add_child_stream.push(cmds_add[cmd].depth);
						}
						command_recipe_flag |= 0x04;
						command_length_stream.push(command_cnt);
						command_index_stream.push(start_index/2);
						noTimelineDebug || console.log("				addCommands", cmds_add);
						
					}

					// create update commands:
					var command_cnt:number=cmds_update.length;

					// virtualScenegraph is already updated.
					// making sure all childs update their masking if needed:
					
					for (var key in virtualScenegraph) {
						virtualScenegraph[key].oldMasks =  virtualScenegraph[key].masks;
						virtualScenegraph[key].masks = [];
                        virtualScenegraph[key].maskingChanged=false;
					}
					// for newly added objects, we translate the clipDepth to isMask
					if (command_cnt) {
						for (var cmd:number = 0; cmd < command_cnt; cmd++) {
							placeObjectTag = cmds_update[cmd].placeObjectTag;
							child = cmds_update[cmd].child;
                            child.maskingChanged=true;
							if (placeObjectTag.flags & 64 /* HasClipDepth */) {
								virtualScenegraph[placeObjectTag.depth].isMask=true;
								virtualScenegraph[placeObjectTag.depth].clipDepth=placeObjectTag.clipDepth - 1;
								virtualScenegraph[placeObjectTag.depth].depth=placeObjectTag.depth;
							}
						}
					}
					// now we are sure all scenegraphobjects know if they are a mask.
					// we loop over all of them and apply the masking to the maskee
					for (var key in virtualScenegraph) {
						if(virtualScenegraph[key].isMask){
							var depth = virtualScenegraph[key].clipDepth;
							while (depth > virtualScenegraph[key].depth) {
								if (virtualScenegraph[depth])
									virtualScenegraph[depth].masks.push(virtualScenegraph[key].sessionID);
								depth--;
							}
						};
					}

					var m=0;
					var mLen=0;
					var childsWithMaskChanges=[];
					// check for what objects the masking has been changed in this frame
					for (var key in virtualScenegraph) {
						var myChild=virtualScenegraph[key];
						myChild.masks.sort();
                        myChild.oldMasks.sort();
						if(myChild.masks.length!=myChild.oldMasks.length){
							childsWithMaskChanges.push(myChild);
                            myChild.maskingChanged=true;
						}
						else{
							m=0;
							mLen=myChild.masks.length;
							for(m=0;m<mLen;m++){
								if(myChild.masks[m]!=myChild.oldMasks[m]){
									childsWithMaskChanges.push(myChild);
                                    myChild.maskingChanged=true;
									break;
								}
							}
						}
					}

					mLen=childsWithMaskChanges.length;
					for(m=0;m<mLen;m++){

						var hasCmd=false;
						if (command_cnt) {
							for (var cmd = 0; cmd < command_cnt; cmd++) {
								if(cmds_update[cmd].child==childsWithMaskChanges[m]){
									hasCmd=true;
								}
							}
						}
						if(!hasCmd){
							cmds_update[cmds_update.length] = { child: childsWithMaskChanges[m], placeObjectTag: null, swapGraphicsID: null, ratio: null, depth: null };
									
						}
					}

					command_cnt = cmds_update.length;
					if(command_cnt){

						// process updated props
						noTimelineDebug || console.log("				updateCommands", cmds_update);

						start_index = update_child_stream.length;
						var updateCnt=0;
						var updateCmd;
						for (var cmd = 0; cmd < command_cnt; cmd++) {
							updateCmd=cmds_update[cmd];
							placeObjectTag = updateCmd.placeObjectTag;
							child = updateCmd.child;

							var childStartIdx:number=property_type_stream.length;
							var num_updated_props=0;
							
							if((updateCmd.swapGraphicsID!=null && updateCmd.swapGraphicsID>=0)){

								num_updated_props++;
								property_type_stream.push(202);
								property_index_stream.push(properties_stream_int.length);
								properties_stream_int.push(updateCmd.swapGraphicsID);
							}


							if (placeObjectTag!=null && ((placeObjectTag.name && placeObjectTag.name!="") ||(this._buttonIds[placeObjectTag.symbolId])||(this._mcIds[placeObjectTag.symbolId]))) {
								num_updated_props++;
								if(this._buttonIds[placeObjectTag.symbolId]){
									property_type_stream.push(5);
								}
								else{
									property_type_stream.push(4);
								}
								property_index_stream.push(properties_stream_strings.length);
								properties_stream_strings.push(placeObjectTag.name);
                            }
                            
							if (placeObjectTag!=null && placeObjectTag.flags & PlaceObjectFlags.HasMatrix) {

								num_updated_props++;

								property_type_stream.push(1);//matrix type: 1=all, 11=no position, 12=no scale
								property_index_stream.push(properties_stream_f32_mtx_all.length / 6);

								// todo: we can save memory by checking if only scale or position was changed,
								// but it means we would need to check against the matrix of the current child, not against identy matrix

                                //  in swf there seem to a some transforms coming in with scale=0 when it should be scale=1
                                //  This is a flash-bug (?) todo with sharing graphics across multiple mc
                                //  i checked and if we set a object to scale=0 on purpose in Flash, we still get a scale>0 in swf,
                                //  so looks like we can fix this by making sure that scale=0 is converted to scale = 1
                                
                                if(placeObjectTag.matrix.a==0 && placeObjectTag.matrix.b==0 && placeObjectTag.matrix.c==0 && placeObjectTag.matrix.d!=0){
                                    placeObjectTag.matrix.a=1;
                                }
                                else if(placeObjectTag.matrix.d==0  && placeObjectTag.matrix.b==0 && placeObjectTag.matrix.c==0 && placeObjectTag.matrix.a!=0){
                                    placeObjectTag.matrix.d=1;
                                }

								properties_stream_f32_mtx_all[properties_stream_f32_mtx_all.length] = placeObjectTag.matrix.a;
								properties_stream_f32_mtx_all[properties_stream_f32_mtx_all.length] = placeObjectTag.matrix.b;
								properties_stream_f32_mtx_all[properties_stream_f32_mtx_all.length] = placeObjectTag.matrix.c;
								properties_stream_f32_mtx_all[properties_stream_f32_mtx_all.length] = placeObjectTag.matrix.d;
								properties_stream_f32_mtx_all[properties_stream_f32_mtx_all.length] = placeObjectTag.matrix.tx/20;
								properties_stream_f32_mtx_all[properties_stream_f32_mtx_all.length] = placeObjectTag.matrix.ty/20;
								transformsAtDepth[updateCmd.depth.toString()]=placeObjectTag.matrix;

							}
							else if(updateCmd.depth!=null) {
                                
								var exTransform=transformsAtDepth[updateCmd.depth.toString()];
								if(exTransform){
									num_updated_props++;

									property_type_stream.push(1);//matrix type: 1=all, 11=no position, 12=no scale
									property_index_stream.push(properties_stream_f32_mtx_all.length / 6);

									properties_stream_f32_mtx_all[properties_stream_f32_mtx_all.length] = exTransform.a;
									properties_stream_f32_mtx_all[properties_stream_f32_mtx_all.length] = exTransform.b;
									properties_stream_f32_mtx_all[properties_stream_f32_mtx_all.length] = exTransform.c;
									properties_stream_f32_mtx_all[properties_stream_f32_mtx_all.length] = exTransform.d;
									properties_stream_f32_mtx_all[properties_stream_f32_mtx_all.length] = exTransform.tx/20;
									properties_stream_f32_mtx_all[properties_stream_f32_mtx_all.length] = exTransform.ty/20;
								}
							}

							if (placeObjectTag!=null && placeObjectTag.flags & PlaceObjectFlags.HasColorTransform) {
								//console.log("PlaceObjectFlags.HasColorTransform", placeObjectTag.cxform);
								property_type_stream.push(2);
								property_index_stream.push(properties_stream_f32_ct.length / 8);
								num_updated_props++;
								properties_stream_f32_ct[properties_stream_f32_ct.length] = placeObjectTag.cxform.redMultiplier/255;
								properties_stream_f32_ct[properties_stream_f32_ct.length] = placeObjectTag.cxform.greenMultiplier/255;
								properties_stream_f32_ct[properties_stream_f32_ct.length] = placeObjectTag.cxform.blueMultiplier/255;
								properties_stream_f32_ct[properties_stream_f32_ct.length] = placeObjectTag.cxform.alphaMultiplier/255;
								properties_stream_f32_ct[properties_stream_f32_ct.length] = placeObjectTag.cxform.redOffset;
								properties_stream_f32_ct[properties_stream_f32_ct.length] = placeObjectTag.cxform.greenOffset;
								properties_stream_f32_ct[properties_stream_f32_ct.length] = placeObjectTag.cxform.blueOffset;
								properties_stream_f32_ct[properties_stream_f32_ct.length] = placeObjectTag.cxform.alphaOffset;
							}

							if (updateCmd.ratio!=null && updateCmd.ratio>=0) {
								num_updated_props++;
								property_type_stream.push(203);
								property_index_stream.push(properties_stream_int.length);
								properties_stream_int.push(updateCmd.ratio | 0);
								//console.log("PlaceObjectFlags.HasRatio", placeObjectTag, child);
							}

							if (child.maskingChanged){
								num_updated_props++;
								property_type_stream.push(3);
								property_index_stream.push(properties_stream_int.length);
								properties_stream_int.push(child.masks.length);
								for(let val of child.masks)
									properties_stream_int.push(val);
							}
							if (placeObjectTag!=null && placeObjectTag.flags & PlaceObjectFlags.HasClipDepth) {

								num_updated_props++;
								property_type_stream.push(200);
								property_index_stream.push(0);
				
							}

							if (placeObjectTag!=null && placeObjectTag.flags & PlaceObjectFlags.HasFilterList) {}

							if(num_updated_props>0){
								updateCnt++;
								update_child_stream.push(child.sessionID);
								update_child_props_indices_stream.push(childStartIdx);
								update_child_props_length_stream.push(num_updated_props);
							}
						}
						if(updateCnt>0){
							command_recipe_flag |= 0x08;
							command_length_stream.push(command_cnt);
							command_index_stream.push(start_index);
						}

					}
					var command_cnt=cmds_startSounds.length;
					if(command_cnt){
						command_recipe_flag |= 16;
						start_index = add_sounds_stream.length;
						//console.log("startsound", tag.soundId, tag.soundInfo, awaySymbol);
						for (var cmd = 0; cmd < command_cnt; cmd++){
							add_sounds_stream.push(cmds_startSounds[cmd]);
							//console.log("add", cmds_add[cmd].childID , cmds_add[cmd].depth);
						}
						command_length_stream.push(command_cnt);
						command_index_stream.push(start_index);
						noTimelineDebug || console.log("				cmds_startSounds", cmds_startSounds.length, cmds_startSounds);
					}

				}
				else{
					if(isButton){
						
					//	sessionID = awayTimeline.potentialPrototypes.length;
					//	awayTimeline.registerPotentialChild(this.myTestSprite);
					}
					//console.log("empty frame");
				}
				if(frame_recipe.length==0){
					command_recipe_flag |= 0x01;
				}
				frame_recipe.push(command_recipe_flag);
			}

		}

		var buttonFrameNames:string[]=["_up", "_over", "_down", "_hit"];
		if(framesLen==4){
			var isButtonFrames:number=0;
			for (i = 0; i < framesLen; i++) {
			
				if(swfFrames[i].labelNames && swfFrames[i].labelNames.length>0 && swfFrames[i].labelNames[0]==buttonFrameNames[i]){
					isButtonFrames++;
				}
			}
			if(isButtonFrames==4){
				isButton=true;
			}
		}


		awayTimeline.numKeyFrames=keyFrameCount;
		awayTimeline.keyframe_durations=new Uint32Array(keyframe_durations);
		awayTimeline.frame_command_indices=new Uint32Array(frame_command_indices);
		awayTimeline.frame_recipe=new Uint32Array(frame_recipe);
		awayTimeline.command_length_stream=new Uint32Array(command_length_stream);
		awayTimeline.command_index_stream=new Uint32Array(command_index_stream);
		awayTimeline.add_child_stream=new Uint32Array(add_child_stream);
		awayTimeline.add_sounds_stream=new Uint32Array(add_sounds_stream);
		awayTimeline.remove_child_stream=new Uint32Array(remove_child_stream);
		awayTimeline.update_child_stream=new Uint32Array(update_child_stream);
		awayTimeline.update_child_props_indices_stream=new Uint32Array(update_child_props_indices_stream);
		awayTimeline.update_child_props_length_stream=new Uint32Array(update_child_props_length_stream);
		awayTimeline.property_type_stream=new Uint32Array(property_type_stream);
		awayTimeline.property_index_stream=new Uint32Array(property_index_stream);
		awayTimeline.properties_stream_int=new Uint32Array(properties_stream_int);

		awayTimeline.properties_stream_f32_mtx_scale_rot=new Float32Array(properties_stream_f32_mtx_scale_rot);
		awayTimeline.properties_stream_f32_mtx_pos=new Float32Array(properties_stream_f32_mtx_pos);
		awayTimeline.properties_stream_f32_mtx_all=new Float32Array(properties_stream_f32_mtx_all);
		awayTimeline.properties_stream_f32_ct=new Float32Array(properties_stream_f32_ct);
		awayTimeline.properties_stream_strings=properties_stream_strings;

		awayTimeline.init();
		
		if(isButton){
			// this is a button - set ButtonActions and also get the hitArea from the last frame
			awayMc.buttonMode=true;
			awayTimeline.isButton=true;
			if(buttonActions){
				awayTimeline.avm1ButtonActions=buttonActions;
			}
			awayTimeline.extractHitArea(awayMc);
		} else {
			awayMc.mouseEnabled = false; //a movieclip that isn't a button automatically defaults to mouesEnabled = false
		}
		return awayMc;

	}
	public _pStartParsing(frameLimit:number):void
	{
		//console.log("SWFParser - _pStartParsing");
		//create a content object for Loaders
		this._pContent = this._factory.createDisplayObjectContainer();

		super._pStartParsing(frameLimit);


	}
	public dispose():void
	{
		
		this.swfData=null;
		this._dataStream=null;
	}


	private updateTimers(type:number):void
	{
		
	}


    private _buttonSounds:any={};
	//--SWF stuff : ---------------------------------------------------------------------------

	public initSWFLoading(initialBytes: Uint8Array, length: number) {
		// TODO: cleanly abort loading/parsing instead of just asserting here.
		assert(initialBytes[0] === 67 || initialBytes[0] === 70 || initialBytes[0] === 90,
			"Unsupported compression format: " + initialBytes[0]);
		assert(initialBytes[1] === 87);
		assert(initialBytes[2] === 83);
		assert(initialBytes.length >= 30, "At least the header must be complete here.");

		/*if (!release && SWF.traceLevel.value > 0) {
		  console.log('Create SWFFile');
		}*/



		this._swfFile.frames = [];
		this.abcBlocks = [];
		this.dictionary = [];
		this.fonts = [];

		this.symbolClassesMap = [];
		this.symbolClassesList = [];
		this.eagerlyParsedSymbolsMap = [];
		this.eagerlyParsedSymbolsList = [];
		this._jpegTables = null;

		this._currentFrameLabels=[];
		this._currentSoundStreamHead = null;
		this._currentSoundStreamBlock = null;
		this._currentControlTags = null;
		this._currentActionBlocks = null;
		this._currentInitActionBlocks = null;
		this._currentExports = null;
		this._endTagEncountered = false;

		this.readHeaderAndInitialize(initialBytes);
	}

	finishLoading() {
		if (this._swfFile.compression !== CompressionMethod.None) {
			this._decompressor.close();
			this._decompressor = null;
			this.scanLoadedData();
		}
	}

	getSymbol(id: number) {
		//console.log("getSymbol", id);
		if (this.eagerlyParsedSymbolsMap[id]) {
			return this.eagerlyParsedSymbolsMap[id];
		}
		var unparsed = this.dictionary[id];
		if (!unparsed) {
			return null;
		}
		var symbol;
		if (unparsed.tagCode === SwfTagCode.CODE_DEFINE_SPRITE) {
			// TODO: replace this whole silly `type` business with tagCode checking.
			symbol = this.parseSpriteTimeline(unparsed);
		} else {
			symbol = this.getParsedTag(unparsed);
		}
		symbol.className = this.symbolClassesMap[id] || null;
		symbol.env = this.env;
		return symbol;
	}

	getParsedTag(unparsed: UnparsedTag): any {
		////SWF.enterTimeline('Parse tag ' + getSwfTagCodeName(unparsed.tagCode));
		//console.log("getParsedTag", unparsed);
		this._dataStream.align();
		this._dataStream.pos = unparsed.byteOffset;
		var handler = tagHandlers[unparsed.tagCode];
		//  release || Debug.assert(handler, 'handler shall exists here');
		var tagEnd = Math.min(unparsed.byteOffset + unparsed.byteLength, this._dataStream.end);
		var tag = handler(this._dataStream, this._swfFile.swfVersion, unparsed.tagCode, tagEnd, this._jpegTables);
		tag.fileURL=this._iFileName;
		var finalPos = this._dataStream.pos;
		if (finalPos !== tagEnd) {
			this.emitTagSlopWarning(unparsed, tagEnd);
		}
		var symbol = defineSymbol(tag, this.dictionary, this);
		//SWF.leaveTimeline();
		return symbol;
	}

	private readHeaderAndInitialize(initialBytes: Uint8Array) {
		////SWF.enterTimeline('Initialize SWFFile');
		var isDeflateCompressed = initialBytes[0] === 67;
		var isLzmaCompressed = initialBytes[0] === 90;
		if (isDeflateCompressed) {
			this._swfFile.compression = CompressionMethod.Deflate;
		} else if (isLzmaCompressed) {
			this._swfFile.compression = CompressionMethod.LZMA;
		}
		this._swfFile.swfVersion = initialBytes[3];
		
		if(this._swfFile.swfVersion != 6){
			//console.log("WARNING: SWF VERSION IS NOT 6", this._swfFile.swfVersion)
		}
		this._loadStarted = Date.now();
		this._uncompressedLength = readSWFLength(initialBytes);
		this._swfFile.bytesLoaded = initialBytes.length;
		// In some malformed SWFs, the parsed length in the header doesn't exactly match the actual size of the file. For
		// uncompressed files it seems to be safer to make the buffer large enough from the beginning to fit the entire
		// file than having to resize it later or risking an exception when reading out of bounds.
		this.swfData = new Uint8Array(this._swfFile.compression === CompressionMethod.None ?
			this._swfFile.bytesTotal : this._uncompressedLength);
		this._dataStream = new Stream(this.swfData.buffer);
		this._dataStream.pos = 8;
		this._dataView = this._dataStream.view;
		if (isDeflateCompressed) {
			//console.log("readHeaderAndInitialize isDeflateCompressed");
			this.swfData.set(initialBytes.subarray(0, 8));
			this._uncompressedLoadedLength = 8;
			this._decompressor = Inflate.create(true);
			// Parts of the header are compressed. Get those out of the way before starting tag parsing.
			this._decompressor.onData = this.processFirstBatchOfDecompressedData.bind(this);
			this._decompressor.onError = function (error) {
				// TODO: Let the loader handle this error.
				throw new Error(error);
			}
			this._decompressor.push(initialBytes.subarray(8));
		} else if (isLzmaCompressed) {
			//console.log("readHeaderAndInitialize isLzmaCompressed");
			this.swfData.set(initialBytes.subarray(0, 8));
			this._uncompressedLoadedLength = 8;
			this._decompressor = new LzmaDecoder(true);
			this._decompressor.onData = this.processFirstBatchOfDecompressedData.bind(this);
			this._decompressor.onError = function (error) {
				// TODO: Let the loader handle this error.
				//console.log('Invalid LZMA stream: ' + error);
			};
			this._decompressor.push(initialBytes);
		} else {
			//console.log("readHeaderAndInitialize isUncompressed");
			this.swfData.set(initialBytes);
			this._uncompressedLoadedLength = initialBytes.length;
			this._decompressor = null;
			this.parseHeaderContents();
		}
		////SWF.leaveTimeline();
		this._lastScanPosition = this._dataStream.pos;
		this.scanLoadedData();
	}

	private parseHeaderContents() {
		var obj = parseHeader(this._dataStream);
		this._swfFile.bounds = this._swfFile.bounds = obj.bounds;
		this._swfFile.frameRate =this._swfFile.frameRate = obj.frameRate;
		this._swfFile.frameCount = this._swfFile.frameCount = obj.frameCount;
		//var str = String.fromCharCode.apply(null, data);
		//console.log(obj);
		//console.log("parseHeaderContents this._swfFile.bounds", this._swfFile.bounds);
		//console.log("parseHeaderContents this._swfFile.frameRate", this._swfFile.frameRate);
		//console.log("parseHeaderContents this._swfFile.frameCount", this._swfFile.frameCount);
	}

	private processFirstBatchOfDecompressedData(data: Uint8Array) {
		this.processDecompressedData(data);
		this.parseHeaderContents();
		this._decompressor.onData = this.processDecompressedData.bind(this);
	}

	private processDecompressedData(data: Uint8Array) {
		// Make sure we don't cause an exception here when trying to set out-of-bound data by clamping the number of bytes
		// to write to the remaining space in our buffer. If this is the case, we probably got a wrong file length from
		// the SWF header. The Flash Player ignores data that goes over that given length, so should we.
		
		var length = Math.min(data.length, this._uncompressedLength - this._uncompressedLoadedLength);
		memCopy(this.swfData, data, this._uncompressedLoadedLength, 0, length);
		this._uncompressedLoadedLength += length;
	}

	private scanLoadedData() {
		//SWF.enterTimeline('Scan loaded SWF file tags');
		this._dataStream.pos = this._lastScanPosition;
		this.scanTagsToOffset(this._uncompressedLoadedLength, true);
		this._lastScanPosition = this._dataStream.pos;
		//SWF.leaveTimeline();
	}

	private scanTagsToOffset(endOffset: number, rootTimelineMode: boolean) {
		// `parsePos` is always at the start of a tag at this point, because it only gets updated
		// when a tag has been fully parsed.
		var tempTag = new UnparsedTag(0, 0, 0);
		var pos: number;
		while ((pos = this._dataStream.pos) < endOffset - 1) {
			//console.log("scanTagsToOffset", tempTag);
			if (!this.parseNextTagHeader(tempTag)) {
				break;
			}
			if (tempTag.tagCode === SwfTagCode.CODE_END) {
				if (rootTimelineMode) {
					this._endTagEncountered = true;
				}
				return;
			}
			var tagEnd = tempTag.byteOffset + tempTag.byteLength;
			if (tagEnd > endOffset) {
				this._dataStream.pos = pos;
				return;
			}
			this.scanTag(tempTag, rootTimelineMode);
			if (this._dataStream.pos !== tagEnd) {
				this.emitTagSlopWarning(tempTag, tagEnd);
			}
		}
	}

	/**
	 * Parses tag header information at the current seek offset and stores it in the given object.
	 *
	 * Public so it can be used by tools to parse through entire SWFs.
	 */
	parseNextTagHeader(target: UnparsedTag): boolean {
		var position = this._dataStream.pos;
		var tagCodeAndLength = this._dataView.getUint16(position, true);
		position += 2;
		target.tagCode = tagCodeAndLength >> 6;
		var tagLength = tagCodeAndLength & 0x3f;
		var extendedLength = tagLength === 0x3f;
		if (extendedLength) {
			if (position + 4 > this._uncompressedLoadedLength) {
				return false;
			}
			tagLength = this._dataView.getUint32(position, true);
			position += 4;
		}
		this._dataStream.pos = position;
		target.byteOffset = position;
		target.byteLength = tagLength;
		return true;
	}

	private Utf8ArrayToStr(array) {
		var out, i, len, c;
		var char2, char3;
	
		out = "";
		len = array.length;
		i = 0;
		while(i < len) {
		c = array[i++];
		switch(c >> 4)
		{ 
		  case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
			// 0xxxxxxx
			out += String.fromCharCode(c);
			break;
		  case 12: case 13:
			// 110x xxxx   10xx xxxx
			char2 = array[i++];
			out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
			break;
		  case 14:
			// 1110 xxxx  10xx xxxx  10xx xxxx
			char2 = array[i++];
			char3 = array[i++];
			out += String.fromCharCode(((c & 0x0F) << 12) |
						   ((char2 & 0x3F) << 6) |
						   ((char3 & 0x3F) << 0));
			break;
		}
		}
	
		return out;
	}
	private scanTag(tag: UnparsedTag, rootTimelineMode: boolean): void {
		var stream: Stream = this._dataStream;
		var byteOffset = stream.pos;
		assert(byteOffset === tag.byteOffset);
		var tagCode = tag.tagCode;
		var tagLength = tag.byteLength;
		//console.info("Scanning tag " + getSwfTagCodeName(tagCode) + " (start: " + byteOffset +  ", end: " + (byteOffset + tagLength) + ")");


		if (tagCode === SwfTagCode.CODE_DEFINE_SPRITE) {
			// According to Chapter 13 of the SWF format spec, no nested definition tags are
			// allowed within DefineSprite. However, they're added to the symbol dictionary
			// anyway, and some tools produce them. Notably swfmill.
			// We essentially treat them as though they came before the current sprite. That
			// should be ok because it doesn't make sense for them to rely on their parent being
			// fully defined - so they don't have to come after it -, and any control tags within
			// the parent will just pick them up the moment they're defined, just as always.
			this.addLazySymbol(tagCode, byteOffset, tagLength);
			var spriteTagEnd = byteOffset + tagLength;
			stream.pos += 4; // Jump over symbol ID and frameCount.
			this.scanTagsToOffset(spriteTagEnd, false);
			if (this._dataStream.pos !== spriteTagEnd) {
				this.emitTagSlopWarning(tag, spriteTagEnd);
			}
			return;
		}
		if (ImageDefinitionTags[tagCode]) {
			// Images are decoded asynchronously, so we have to deal with them ahead of time to
			// ensure they're ready when used.
			var unparsed = this.addLazySymbol(tagCode, byteOffset, tagLength);
			this.decodeEmbeddedImage(unparsed);
			return;
		}
		if (tagCode === SwfTagCode.CODE_DEFINE_SOUND) {

			var unparsed = this.addLazySymbol(tagCode, byteOffset, tagLength);
			var definition = this.getParsedTag(unparsed);
			var symbol = new EagerlyParsedDictionaryEntry(definition.id, unparsed, 'sound', definition,
				this.env);
			/*if (!release && traceLevel.value > 0) {
			  var style = flagsToFontStyle(definition.bold, definition.italic);
			  console.info("Decoding embedded font " + definition.id + " with name '" + definition.name +
				  "' and style " + style, definition);
			}*/
			this.eagerlyParsedSymbolsMap[symbol.id] = symbol;
			this.eagerlyParsedSymbolsList.push(symbol);
			return;
		}
		if (FontDefinitionTags[tagCode]) {
			var unparsed = this.addLazySymbol(tagCode, byteOffset, tagLength);
			this.registerEmbeddedFont(unparsed);
			return;
		}
		if (DefinitionTags[tagCode]) {
			this.addLazySymbol(tagCode, byteOffset, tagLength);
			this.jumpToNextTag(tagLength);
			return;
		}

		if (!rootTimelineMode &&
			!(tagCode === SwfTagCode.CODE_SYMBOL_CLASS || tagCode === SwfTagCode.CODE_EXPORT_ASSETS)) {
			this.jumpToNextTag(tagLength);
			return;
		}

		if (ControlTags[tagCode]) {
			this.addControlTag(tagCode, byteOffset, tagLength);
			return;
		}

		//console.log("tagCode", tagCode);
		switch (tagCode) {
			case SwfTagCode.CODE_FILE_ATTRIBUTES:
				this.setFileAttributes(tagLength);
				break;
			case SwfTagCode.CODE_DEFINE_SCENE_AND_FRAME_LABEL_DATA:
				//console.log('CODE_DEFINE_SCENE_AND_FRAME_LABEL_DATA ');
				this.setSceneAndFrameLabelData(tagLength);
				break;
			case SwfTagCode.CODE_SET_BACKGROUND_COLOR:
				this._swfFile.backgroundColor=this._swfFile.backgroundColor = parseRgb(this._dataStream);
				break;
			case SwfTagCode.CODE_JPEG_TABLES:
				// Only use the first JpegTables tag, ignore any following.
				// TODO test it, swfdec is using the last one
				if (!this._jpegTables) {
					this._jpegTables = tagLength === 0 ?
						new Uint8Array(0) :
						this.swfData.subarray(stream.pos, stream.pos + tagLength - 2);
				}
				this.jumpToNextTag(tagLength);
				break;
			case SwfTagCode.CODE_DO_ABC:
			case SwfTagCode.CODE_DO_ABC_DEFINE:
				if (!this._swfFile.useAVM1) {
					var tagEnd = byteOffset + tagLength;
					var abcBlock = new ABCBlock();
					if (tagCode === SwfTagCode.CODE_DO_ABC) {
						abcBlock.flags = stream.readUi32();
						abcBlock.name = stream.readString(-1);
					}
					else {
						abcBlock.flags = 0;
						abcBlock.name = "";
					}
					abcBlock.data = this.swfData.subarray(stream.pos, tagEnd);
					//console.log(this.Utf8ArrayToStr(abcBlock.data));
					this.abcBlocks.push(abcBlock);
					stream.pos = tagEnd;
				} else {
					this.jumpToNextTag(tagLength);
				}
				break;
			case SwfTagCode.CODE_SYMBOL_CLASS:
				var tagEnd = byteOffset + tagLength;
				var symbolCount = stream.readUi16();
				// TODO: check if symbols can be reassociated after instances have been created.
				while (symbolCount--) {
					var symbolId = stream.readUi16();
					var symbolClassName = stream.readString(-1);
					/* if (!release && traceLevel.value > 0) {
					   console.log('Registering symbol class ' + symbolClassName + ' to symbol ' + symbolId);
					 }*/
					this.symbolClassesMap[symbolId] = symbolClassName;
					this.symbolClassesList.push({id: symbolId, className: symbolClassName});
				}
				// Make sure we move to end of tag even if the content is invalid.
				stream.pos = tagEnd;
				break;
			case SwfTagCode.CODE_DO_INIT_ACTION:
				if (this._swfFile.useAVM1) {
					var initActionBlocks = this._currentInitActionBlocks ||
						(this._currentInitActionBlocks = []);
					var spriteId = this._dataView.getUint16(stream.pos, true);
					var actionsData = this.swfData.subarray(byteOffset + 2, byteOffset + tagLength);
					initActionBlocks.push({spriteId: spriteId, actionsData: actionsData});
				}
				this.jumpToNextTag(tagLength);
				break;
			case SwfTagCode.CODE_DO_ACTION:
				if (this._swfFile.useAVM1) {
					var actionBlocks = this._currentActionBlocks || (this._currentActionBlocks = []);
					var actionsData = this.swfData.subarray(stream.pos, stream.pos + tagLength);
					actionBlocks.push({actionsData: actionsData, precedence: stream.pos});
				}
				this.jumpToNextTag(tagLength);
				break;
			case SwfTagCode.CODE_SOUND_STREAM_HEAD:
            case SwfTagCode.CODE_SOUND_STREAM_HEAD2:
                //console.warn("Timeline sound is set to streaming!");
				var soundStreamTag = parseSoundStreamHeadTag(this._dataStream, byteOffset + tagLength);
				this._currentSoundStreamHead = SoundStream.FromTag(soundStreamTag);
				break;
			case SwfTagCode.CODE_SOUND_STREAM_BLOCK:
                console.warn("Timeline sound is set to streaming!");
				this._currentSoundStreamBlock = this.swfData.subarray(stream.pos, stream.pos += tagLength);
				break;
			case SwfTagCode.CODE_FRAME_LABEL:
				var tagEnd = stream.pos + tagLength;
				this._currentFrameLabels[this._currentFrameLabels.length] = stream.readString(-1);
				// TODO: support SWF6+ anchors.
				stream.pos = tagEnd;
				break;
			case SwfTagCode.CODE_SHOW_FRAME:
				this.finishFrame();
				break;
			case SwfTagCode.CODE_END:
				return;
			case SwfTagCode.CODE_EXPORT_ASSETS:
				var tagEnd = stream.pos + tagLength;
				var exportsCount = stream.readUi16();
				var exports = this._currentExports || (this._currentExports = []);
				while (exportsCount--) {
					var symbolId = stream.readUi16();
					var className = stream.readString(-1);
					if (stream.pos > tagEnd) {
						stream.pos = tagEnd;
						break;
					}
					exports.push(new SymbolExport(symbolId, className));
				}
				stream.pos = tagEnd;
				break;
            case SwfTagCode.CODE_DEFINE_BUTTON_SOUND:
                var tagEnd = stream.pos + tagLength;
                var btn_id=stream.readUi16();

                this._buttonSounds[btn_id]={};
                for(var s=0; s<4; s++){
                    this._buttonSounds[btn_id][s]={};
                    this._buttonSounds[btn_id][s].id=stream.readUi16();
                    if(this._buttonSounds[btn_id][s].id!=0){
                        this._buttonSounds[btn_id][s].info=parseSoundInfo(stream);
                    }
                }
                stream.pos = tagEnd;
                
                break;
			case SwfTagCode.CODE_DEFINE_BUTTON_CXFORM:
			case SwfTagCode.CODE_DEFINE_FONT_INFO:
			case SwfTagCode.CODE_DEFINE_FONT_INFO2:
			case SwfTagCode.CODE_DEFINE_SCALING_GRID:
			case SwfTagCode.CODE_IMPORT_ASSETS:
			case SwfTagCode.CODE_IMPORT_ASSETS2:
				//console.log('Unsupported tag encountered ' + tagCode + ': ' + getSwfTagCodeName(tagCode));
				this.jumpToNextTag(tagLength);
				break;
			case SwfTagCode.CODE_METADATA:
				//console.log('tag encountered ' + tagCode + ': ' + getSwfTagCodeName(tagCode));
				this.parseMetaData(tagLength);
				break;
			// These tags should be supported at some point, but for now, we ignore them.
			case SwfTagCode.CODE_CSM_TEXT_SETTINGS:
			case SwfTagCode.CODE_DEFINE_FONT_ALIGN_ZONES:
			case SwfTagCode.CODE_SCRIPT_LIMITS:
			case SwfTagCode.CODE_SET_TAB_INDEX:
			// These tags are used by the player, but not relevant to us.
			case SwfTagCode.CODE_ENABLE_DEBUGGER:
			case SwfTagCode.CODE_ENABLE_DEBUGGER2:
			case SwfTagCode.CODE_DEBUG_ID:
			case SwfTagCode.CODE_DEFINE_FONT_NAME:
			case SwfTagCode.CODE_NAME_CHARACTER:
			case SwfTagCode.CODE_PRODUCT_INFO:
			case SwfTagCode.CODE_PROTECT:
			case SwfTagCode.CODE_PATHS_ARE_POSTSCRIPT:
			case SwfTagCode.CODE_TELEMETRY:
			// These are obsolete Generator-related tags.
			case SwfTagCode.CODE_GEN_TAG_OBJECTS:
			case SwfTagCode.CODE_GEN_COMMAND:
				//console.log('tag encountered ' + tagCode + ': ' + getSwfTagCodeName(tagCode));
				this.jumpToNextTag(tagLength);
				break;
			// These tags aren't used in the player.
			case SwfTagCode.CODE_CHARACTER_SET:
			case SwfTagCode.CODE_DEFINE_BEHAVIOUR:
			case SwfTagCode.CODE_DEFINE_COMMAND_OBJECT:
			case SwfTagCode.CODE_DEFINE_FUNCTION:
			case SwfTagCode.CODE_DEFINE_TEXT_FORMAT:
			case SwfTagCode.CODE_DEFINE_VIDEO:
			case SwfTagCode.CODE_EXTERNAL_FONT:
			case SwfTagCode.CODE_FREE_CHARACTER:
			case SwfTagCode.CODE_FREE_ALL:
			case SwfTagCode.CODE_GENERATE_FRAME:
			case SwfTagCode.CODE_STOP_SOUND:
			case SwfTagCode.CODE_SYNC_FRAME:
				//console.info("Ignored tag (these shouldn't occur) " + tagCode + ': ' + getSwfTagCodeName(tagCode));
				this.jumpToNextTag(tagLength);
				break;
			default:
				if (tagCode > 100) {
					console.log("Encountered undefined tag " + tagCode + ", probably used for AVM1 " +
						"obfuscation. See http://ijs.mtasa.com/files/swfdecrypt.cpp.");
				} else {
					console.log('Tag not handled by the parser: ' + tagCode + ': ' + getSwfTagCodeName(tagCode));
				}
				this.jumpToNextTag(tagLength);
		}
	}

	parseSpriteTimeline(spriteTag: DictionaryEntry) {
		//SWF.enterTimeline("parseSpriteTimeline");
		//console.log("parseSpriteTimeline", spriteTag);
		var data = this.swfData;
		var stream = this._dataStream;
		var dataView = this._dataView;
		var timeline: any = {
			id: spriteTag.id,
			type: 'sprite',
			frames: []
		};
		var spriteTagEnd = spriteTag.byteOffset + spriteTag.byteLength;
		var frames = timeline.frames;
		var labels: string[] = [];
		var controlTags: UnparsedTag[] = [];
		var soundStreamHead: SoundStream = null;
		var soundStreamBlock: Uint8Array = null;
		var actionBlocks: {actionsData: Uint8Array; precedence: number}[] = null;
		var initActionBlocks: {spriteId: number; actionsData: Uint8Array}[] = null;
		// Skip ID.
		stream.pos = spriteTag.byteOffset + 2;
		// TODO: check if numFrames or the real number of ShowFrame tags wins. (Probably the former.)
		timeline.frameCount = dataView.getUint16(stream.pos, true);
		stream.pos += 2;
		var spriteContentTag = new UnparsedTag(0, 0, 0);
		while (stream.pos < spriteTagEnd) {
			this.parseNextTagHeader(spriteContentTag);
			var tagLength = spriteContentTag.byteLength;
			var tagCode = spriteContentTag.tagCode;
			if (stream.pos + tagLength > spriteTagEnd) {
				console.log("DefineSprite child tags exceed DefineSprite tag length and are dropped");
				break;
			}

			if (ControlTags[tagCode]) {
				controlTags.push(new UnparsedTag(tagCode, stream.pos, tagLength));
				stream.pos += tagLength;
				continue;
			}

			switch (tagCode) {
				case SwfTagCode.CODE_DO_ACTION:
					if (this._swfFile.useAVM1) {
						if (!actionBlocks) {
							actionBlocks = [];
						}
						var actionsData = data.subarray(stream.pos, stream.pos + tagLength);
						actionBlocks.push({actionsData: actionsData, precedence: stream.pos});
					}
					break;
				case SwfTagCode.CODE_DO_INIT_ACTION:
					if (this._swfFile.useAVM1) {
						if (!initActionBlocks) {
							initActionBlocks = [];
						}
						var spriteId = dataView.getUint16(stream.pos, true);
						stream.pos += 2;
						var actionsData = data.subarray(stream.pos, stream.pos + tagLength);
						initActionBlocks.push({spriteId: spriteId, actionsData: actionsData});
					}
					break;
				case SwfTagCode.CODE_FRAME_LABEL:
					var tagEnd = stream.pos + tagLength;
					labels[labels.length] = stream.readString(-1);
					// TODO: support SWF6+ anchors.
					stream.pos = tagEnd;
					tagLength = 0;
					break;
				case SwfTagCode.CODE_SHOW_FRAME:
					frames.push(new SWFFrame(controlTags, labels.concat(), soundStreamHead, soundStreamBlock,
						actionBlocks, initActionBlocks, null));
					labels.length=0;
					controlTags = [];
					soundStreamHead = null;
					soundStreamBlock = null;
					actionBlocks = null;
					initActionBlocks = null;
					break;
				case SwfTagCode.CODE_END:
					stream.pos = spriteTagEnd;
					tagLength = 0;
					break;
				case SwfTagCode.CODE_SOUND_STREAM_HEAD:
					//stream.pos = spriteTagEnd;
					//tagLength = 0;
					break;
				case SwfTagCode.CODE_SOUND_STREAM_BLOCK:
                    console.warn("Timeline sound is set to streaming!");
                    break;
        
				default:
					//console.log("ignored timeline tag", tagCode);
					break;//console.log("ignored timeline tag", tagCode);
				// Ignore other tags.
			}
			stream.pos += tagLength;
			assert(stream.pos <= spriteTagEnd);
		}
		//awayMC.timeline.
		
		//SWF.leaveTimeline();
		return timeline;
	}

	private parseMetaData(currentTagLength: number) {
		//var string=this._dataStream.readString(currentTagLength);
		this._dataStream.pos += currentTagLength;
	}
	private jumpToNextTag(currentTagLength: number) {
		this._dataStream.pos += currentTagLength;
	}

	private emitTagSlopWarning(tag: UnparsedTag, tagEnd: number) {
		var consumedBytes = this._dataStream.pos - tag.byteOffset;
		//console.log('Scanning ' + getSwfTagCodeName(tag.tagCode) + ' at offset ' + tag.byteOffset +' consumed ' + consumedBytes + ' of ' + tag.byteLength + ' bytes. (' +(tag.byteLength - consumedBytes) + ' left)');
		this._dataStream.pos = tagEnd;
	}

	private finishFrame() {
		if (this.pendingUpdateDelays === 0) {
			this._swfFile.framesLoaded++;
		}
		this._swfFile.frames.push(new SWFFrame(this._currentControlTags,
			this._currentFrameLabels.concat(),
			this._currentSoundStreamHead,
			this._currentSoundStreamBlock,
			this._currentActionBlocks,
			this._currentInitActionBlocks,
			this._currentExports));
		this._currentFrameLabels.length=0;
		this._currentControlTags = null;
		this._currentSoundStreamHead = null;
		this._currentSoundStreamBlock = null;
		this._currentActionBlocks = null;
		this._currentInitActionBlocks = null;
		this._currentExports = null;
	}

	private setFileAttributes(tagLength: number) {
		// TODO: check what happens to attributes tags that aren't the first tag.
		if (this._swfFile.attributes) {
			this.jumpToNextTag(tagLength);
		}
		var bits = this.swfData[this._dataStream.pos];
		this._dataStream.pos += 4;
		this._swfFile.attributes = {
			network: bits & 0x1,
			relativeUrls: bits & 0x2,
			noCrossDomainCaching: bits & 0x4,
			doAbc: bits & 0x8,
			hasMetadata: bits & 0x10,
			useGpu: bits & 0x20,
			useDirectBlit : bits & 0x40
		};
		this._swfFile.useAVM1 = !this._swfFile.attributes.doAbc;
		//console.log("use AVM1: ", this._swfFile.useAVM1)
	}

	private setSceneAndFrameLabelData(tagLength: number) {
		if (this._swfFile.sceneAndFrameLabelData) {
			this.jumpToNextTag(tagLength);
			return;
		}
		this._swfFile.sceneAndFrameLabelData = this._swfFile.sceneAndFrameLabelData = parseDefineSceneTag(this._dataStream, SwfTagCode.CODE_DEFINE_SCENE_AND_FRAME_LABEL_DATA);
	}

	private addControlTag(tagCode: number, byteOffset: number, tagLength: number) {
		var controlTags = this._currentControlTags || (this._currentControlTags = []);
		controlTags.push(new UnparsedTag(tagCode, byteOffset, tagLength));
		this.jumpToNextTag(tagLength);

	}
	private addLazySymbol(tagCode: number, byteOffset: number, tagLength: number) {
		var id = this._dataView.getUint16(this._dataStream.pos, true);
		var symbol = new DictionaryEntry(id, tagCode, byteOffset, tagLength);
		this.dictionary[id] = symbol;
		/*if (!release && traceLevel.value > 0) {
		  console.info("Registering symbol " + id + " of type " + getSwfTagCodeName(tagCode));
		}*/
		return symbol;
	}

	private decodeEmbeddedFont(unparsed: UnparsedTag) {
		var definition = this.getParsedTag(unparsed);
		var symbol = new EagerlyParsedDictionaryEntry(definition.id, unparsed, 'font', definition,
			this.env);
		/*if (!release && traceLevel.value > 0) {
		  var style = flagsToFontStyle(definition.bold, definition.italic);
		  console.info("Decoding embedded font " + definition.id + " with name '" + definition.name +
			  "' and style " + style, definition);
		}*/
		this.eagerlyParsedSymbolsMap[symbol.id] = symbol;
		this.eagerlyParsedSymbolsList.push(symbol);

		var style = flagsToFontStyle(definition.bold, definition.italic);
		this.fonts.push({name: definition.name, id: definition.id, style: style});
	}

	private registerEmbeddedFont(unparsed: UnparsedTag) {
		/*  if (!inFirefox) {
			this.decodeEmbeddedFont(unparsed);
			return;
		  }*/
		var stream = this._dataStream;
		var id = this._dataView.getUint16(stream.pos, true);
		var style: string;
		var name: string;
		// DefineFont only specifies a symbol ID, no font name or style.
		if (unparsed.tagCode === SwfTagCode.CODE_DEFINE_FONT) {
			// Assigning some unique name to simplify font registration and look ups.
			name = '__autofont__' + unparsed.byteOffset;
			style = 'regular';
		} else {
			var flags = this.swfData[stream.pos + 2];
			style = flagsToFontStyle(!!(flags & 0x1), !!(flags & 0x2));
			var nameLength = this.swfData[stream.pos + 4];
			// Skip language code.
			stream.pos += 5;
			name = stream.readString(nameLength);
		}
		this.fonts.push({name: name, id: id, style: style});
		/*  if (!release && traceLevel.value > 0) {
			console.info("Registering embedded font " + id + " with name '" + name + "' and style " +
				style);
		  }*/
		stream.pos = unparsed.byteOffset + unparsed.byteLength;
	}

	private decodeEmbeddedImage(unparsed: UnparsedTag) {
		var definition = this.getParsedTag(unparsed);
		var symbol = new EagerlyParsedDictionaryEntry(definition.id, unparsed, 'image', definition,
			this.env);
		/*if (!release && traceLevel.value > 0) {
		   console.info("Decoding embedded image " + definition.id + " of type " +
			   getSwfTagCodeName(unparsed.tagCode) + " (start: " + unparsed.byteOffset +
			   ", end: " + (unparsed.byteOffset + unparsed.byteLength) + ")");
		 }*/
		this.eagerlyParsedSymbolsMap[symbol.id] = symbol;
		this.eagerlyParsedSymbolsList.push(symbol);
	}

}

function flagsToFontStyle(bold: boolean, italic: boolean) {
	if (bold && italic) {
		return 'boldItalic';
	}
	if (bold) {
		return 'bold';
	}
	if (italic) {
		return 'italic';
	}
	return 'regular';
}



function readSWFLength(bytes: Uint8Array) {
	// We read the length manually because creating a DataView just for that is silly.
	return (bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24) >>> 0;
}

function defineSymbol(swfTag, symbols, parser) {
	switch (swfTag.code) {
		case SwfTagCode.CODE_DEFINE_BITS:
		case SwfTagCode.CODE_DEFINE_BITS_JPEG2:
		case SwfTagCode.CODE_DEFINE_BITS_JPEG3:
		case SwfTagCode.CODE_DEFINE_BITS_JPEG4:
			return defineImage(swfTag);
		case SwfTagCode.CODE_DEFINE_BITS_LOSSLESS:
		case SwfTagCode.CODE_DEFINE_BITS_LOSSLESS2:
			return defineBitmap(swfTag);
		case SwfTagCode.CODE_DEFINE_BUTTON:
		case SwfTagCode.CODE_DEFINE_BUTTON2:
			return defineButton(swfTag, symbols);
		case SwfTagCode.CODE_DEFINE_EDIT_TEXT:
			return defineText(swfTag);
		case SwfTagCode.CODE_DEFINE_FONT:
		case SwfTagCode.CODE_DEFINE_FONT2:
		case SwfTagCode.CODE_DEFINE_FONT3:
		case SwfTagCode.CODE_DEFINE_FONT4:
			return defineFont(swfTag, (<SWFParser>parser)._iFileName);
		case SwfTagCode.CODE_DEFINE_MORPH_SHAPE:
		case SwfTagCode.CODE_DEFINE_MORPH_SHAPE2:
		case SwfTagCode.CODE_DEFINE_SHAPE:
		case SwfTagCode.CODE_DEFINE_SHAPE2:
		case SwfTagCode.CODE_DEFINE_SHAPE3:
		case SwfTagCode.CODE_DEFINE_SHAPE4:
			return defineShape(swfTag, parser);
		case SwfTagCode.CODE_DEFINE_SOUND:
			return defineSound(swfTag);
		case SwfTagCode.CODE_DEFINE_VIDEO_STREAM:
			return {
				type: 'video',
				id: swfTag.id,
				width: swfTag.width,
				height: swfTag.height,
				deblocking: swfTag.deblocking,
				smoothing: swfTag.smoothing,
				codec: swfTag.codecId
			};
		case SwfTagCode.CODE_DEFINE_SPRITE:
			// Sprites are fully defined at this point.
			return swfTag;
		case SwfTagCode.CODE_DEFINE_BINARY_DATA:
			return {
				type: 'binary',
				id: swfTag.id,
				data: swfTag.data
			};
		case SwfTagCode.CODE_DEFINE_TEXT:
		case SwfTagCode.CODE_DEFINE_TEXT2:
			return defineLabel(swfTag);
		default:
			//console.log("define default symbol", swfTag, symbols, parser);
			return swfTag;
	}
}

