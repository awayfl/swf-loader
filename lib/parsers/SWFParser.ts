import { 
	WaveAudioParser, 
	Rectangle, 
	WaveAudio, 
	URLLoaderDataFormat, 
	IAsset, 
	ParserBase, 
	ResourceDependency, 
	ByteArray,  AssetBase 
} from "@awayjs/core";

import { Image2DParser, BitmapImage2D } from "@awayjs/stage";

import { 
	DefaultFontManager, 
	Sprite, 
	ISceneGraphFactory, 
	DefaultSceneGraphFactory, 
	MovieClip,
	TextFormatAlign, 
	SceneImage2D
} from "@awayjs/scene";

import { MethodMaterial, ImageTexture2D } from "@awayjs/materials";
import {
	assert,
	IDataDecoder,
	ABCBlock,
	EncryptedBlock,
	ActionBlock,
	InitActionBlock,
	SymbolExport,
	UnparsedTag,
	DictionaryEntry,
	EagerlyParsedDictionaryEntry,
	memCopy
} from "@awayjs/graphics";

import { Stream } from "../parsers/utils/stream";
import { Inflate, LzmaDecoder } from "@awayjs/graphics";

import {
	parseHeader,
	parseRgb,
	parseSoundStreamHeadTag,
	parseDefineSceneTag,
	parseSoundInfo,
	tagHandlers
} from "../parsers/utils/parser/SWFLowLevel";

import { defineSound, SoundStream } from "../parsers/utils/parser/sound";
import { defineShape } from "../parsers/utils/parser/shape";
import { defineFont } from "../parsers/utils/parser/font";
import { defineText } from "../parsers/utils/parser/text";
import { defineButton } from "../parsers/utils/parser/button";
import { defineBitmap } from "../parsers/utils/parser/bitmap";
import { defineImage } from "../parsers/utils/parser/image";
import { defineLabel } from "../parsers/utils/parser/label";
import { SWFFrame } from "./SWFFrame";
import { SWFFile } from "./SWFFile";

import {
	SwfTagCode,
	DefinitionTags,
	ImageDefinitionTags,
	FontDefinitionTags,
	ControlTags,
	getSwfTagCodeName
} from "../factories/base/SWFTags";

import { IBinarySymbol, IButtonSymbol, ISymbol, SYMBOL_TYPE,  } from "./ISymbol"
import { SymbolDecoder } from "./SymbolDecoder"

import { CompressionMethod } from "./CompressionMethod";
import { release } from '../factories/base/utilities/Debug';
import { Stat } from '../stat/Stat';

class GenericAsset<T> extends AssetBase {
	public static assetType = '[asset Generic]';
	public readonly isGeneric = true;

	constructor(public _symbol: T, name: string, public readonly dataClass: new () => T) {
		super(name);	
	}

	get assetType() {
		return GenericAsset.assetType;
	}

	dispose() {
		this._symbol = null;
	}

	clone(): GenericAsset<T> {
		return new GenericAsset<T>(this._symbol, this.name, this.dataClass);
	}
}

var noTimelineDebug = true;
var noExportsDebug = true;
var noSceneGraphDebug = true;

const enum SWFParserProgressState {
	STARTED,
	SCANNED,
	WAIT_FOR_DEPENDENCY,
	WAIT_FOR_FACTORY,
	FACTORY_AVAILABLE,
	FINISHED
}
const enum SWF_ENCRYPTED_TAGS {
	ENCRYPTED = 255,
	ENCRYPTED_CODE_BLOCK = 253
}

/**
 * SWFParser provides a parser for the SWF data type.
 * Based on Shumway
 */
export class SWFParser extends ParserBase {


	public static factory:ISceneGraphFactory = null;

	private pendingUpdateDelays: number;
	// Might be lower than frames.length if eagerly parsed assets pending resolution are blocking
	// us from reporting the given frame as loaded.

	public abcBlocks: ABCBlock[];
	public dictionary: DictionaryEntry[];
	private fonts: { name: string; style: string; id: number }[];
	private swfData: Uint8Array;
	private env: any;

	public symbolClassesMap: string[];
	public symbolClassesList: { id: number; className: string }[];
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
	private _awayUnresolvedSymbols: NumberMap<IAsset> = {};

	public get awayUnresolvedSymbols() {
		return this._awayUnresolvedSymbols;
	}

	public get awaySymbols() {
		return this._symbolDecoder.awaySymbols;
	}

	private _factory: ISceneGraphFactory;
	private _symbolDecoder: SymbolDecoder;
	private _progressState: SWFParserProgressState;
	private _isEncrypted = false;
	private _currentEncrActionBlocks: EncryptedBlock[] = [];

	private _swfFile: SWFFile;

	public get swfFile(): SWFFile {
		return this._swfFile;
	}

	public get factory(): ISceneGraphFactory {
		return this._factory;
	}

	public set factory(value: ISceneGraphFactory) {
		this._factory = value;
		SWFParser.factory = value;
		this._progressState = SWFParserProgressState.FACTORY_AVAILABLE;
	}

	// will be overwritten by AVMhandlers to return Factory to SWFParser after it has been init
	public onFactoryRequest(swfFile: SWFFile) {
		this.factory = SWFParser.factory || new DefaultSceneGraphFactory();
	}

	public soundExports: any = {};

	/**
	 * Creates a new AWD3Parserutils object.
	 * @param uri The url or id of the data or file to be parsed.
	 * @param extra The holder for extra contextual data that the parser might need.
	 */
	constructor(factory: ISceneGraphFactory = null) {
		super(URLLoaderDataFormat.ARRAY_BUFFER);

		this._swfFile = new SWFFile();
		this._factory = factory;
		this._progressState = SWFParserProgressState.STARTED;
		this._symbolDecoder = new SymbolDecoder(this);
	}


	/**
	 * Indicates whether or not a given file extension is supported by the parser.
	 * @param extension The file extension of a potential file to be parsed.
	 * @return Whether or not the given file type is supported.
	 */
	public static supportsType(extension: string): boolean {
		extension = extension.toLowerCase();
		console.log("SWFParser supportsType extension: ", extension, "result: ", extension == "swf");
		return extension == "swf";
	}

	/**
	 * Tests whether a data block can be parsed by the parser.
	 * @param data The data block to potentially be parsed.
	 * @return Whether or not the given data is supported.
	 */
	public static supportsData(data: Uint8Array): boolean {
		return (data[0] === 67 || data[0] === 70 || data[0] === 90) && (data[1] === 87) && (data[2] === 83);
	}

	/**
	 * @inheritDoc
	 */
	public _iResolveDependency(resourceDependency: ResourceDependency): void {
		//console.log("_iResolveDependency", resourceDependency);
		// this will be called when Dependency has finished loading.
		// the ressource dependecniy has a id that point to the awd_block waiting for it.
		//console.log("SWFParser resolve dependencies";

		if (resourceDependency.assets.length == 1) {
			var awaitedObject = this.eagerlyParsedSymbolsMap[resourceDependency.id];
			if (awaitedObject) {
				switch (awaitedObject.type) {
					case SYMBOL_TYPE.IMAGE:
						//console.log("finished image parsing", resourceDependency);
						var myBitmap: BitmapImage2D = (<BitmapImage2D>resourceDependency.assets[0]);
						//myBitmap.width=awaitedObject.definition.width;
						//myBitmap.height=awaitedObject.definition.height;
						this._awayUnresolvedSymbols[resourceDependency.id] = myBitmap;
						break;
					case SYMBOL_TYPE.FONT:
						//console.log("finished font parsing", resourceDependency);
						break;
					case SYMBOL_TYPE.SOUND:
						//console.log("finished sound parsing", resourceDependency);
						var waveAudio: WaveAudio = (<WaveAudio>resourceDependency.assets[0]);
						//myBitmap.width=awaitedObject.definition.width;
						//myBitmap.height=awaitedObject.definition.height;
						this._awayUnresolvedSymbols[resourceDependency.id] = waveAudio;
						break;
					default:
						console.log("finished unknown parsing", resourceDependency);
						break;
				}
			}
			else
				console.log("no eagerlyParsedSymbolsMap for id", resourceDependency.id);

		}
		else {
			throw ("SWFParser: error when resolving dependency");
		}

		this.externalDependenciesCount--;
		if (this.externalDependenciesCount == 0) {
			this.parseSymbolsToAwayJS();
			this._progressState = SWFParserProgressState.FINISHED;
		}

	}

	/**
	 * @inheritDoc
	 */
	public _iResolveDependencyFailure(resourceDependency: ResourceDependency): void {
		//not used - if a dependcy fails, the awaiting Texture or CubeTexture will never be finalized, and the default-bitmaps will be used.
		// this means, that if one Bitmap of a CubeTexture fails, the CubeTexture will have the DefaultTexture applied for all six Bitmaps.
		//console.log("_iResolveDependencyFailure", resourceDependency);
		this.externalDependenciesCount--;
		if (this.externalDependenciesCount == 0) {
			this.parseSymbolsToAwayJS();
			this._progressState = SWFParserProgressState.FINISHED;
		}

	}

	/**
	 * Resolve a dependency name
	 *
	 * @param resourceDependency The dependency to be resolved.
	 */
	public _iResolveDependencyName(resourceDependency: ResourceDependency, asset: IAsset): string {
		var oldName: string = asset.name;

		var newName: string = asset.name;

		asset.name = oldName;

		return newName;
	}

	private externalDependenciesCount: number = 0;
	/**
	 * @inheritDoc
	 */
	public _pProceedParsing(): boolean {
		//console.log("SWFParser - _pProceedParsing");
		if (this._progressState == SWFParserProgressState.STARTED) {

			const byteData: ByteArray = this._pGetByteData();
			const int8Array: Uint8Array = new Uint8Array(byteData.arraybytes);

			if(!SWFParser.supportsData(int8Array)) {

				const head = int8Array.slice(0, 3).reverse().reduce((acc, e) => acc += String.fromCharCode(e), "");

				console.error("[SWF Parser] unknow file type:", head);

				this.parsingFailure = true;
				return false;	
			}

			Stat.rec("parser").begin();

			// get the bytedata
			// preparse all data. after this step we can deal with tag-objects rather than bytedata

			this.initSWFLoading(int8Array, int8Array.length);
			
			this._swfFile.url=this._iFileName;

			if (this._factory) {
				this.parseSymbols();
			}
			else {
				if (!this.onFactoryRequest)
					throw ("Error in SWFParser. no factory and noFactoryRequest method exists.");

				this._progressState = SWFParserProgressState.WAIT_FOR_FACTORY;
				this.onFactoryRequest(this._swfFile);
				if (this._factory) {
					this.parseSymbols();
				}
			}

		}
		else if (this._progressState == SWFParserProgressState.FACTORY_AVAILABLE) {
			if (!this.onFactoryRequest)
				throw ("Error in SWFParser. no factory and noFactoryRequest method exists.");
			if (this._factory) {
				this.parseSymbols();
			}
		}

		if (this._progressState != SWFParserProgressState.FINISHED) {
			return ParserBase.MORE_TO_PARSE;
		}

		Stat.rec("parser").end();

		return ParserBase.PARSING_DONE;
	}

	private parseSymbols() {

		Stat.rec("parser").rec("symbols").begin();

		(<any>this._factory).url = this._iFileName;
		this._pContent = this._factory.createDisplayObjectContainer();
		this._awayUnresolvedSymbols = {};
		this._mapMatsForBitmaps = {};


		if (this.abcBlocks.length && (<any>this._factory).executeABCBytes) {
			(<any>this._factory).executeABCBytes(this.abcBlocks);
		}

		// this.eagerlyParsedSymbolsList can contain image/font data,
		// that must be resolved externally before we can start creating assets for symbols
		this.externalDependenciesCount = 0;
		if (this.eagerlyParsedSymbolsList.length > 0) {
			//console.log("this.eagerlyParsedSymbolsList", this.eagerlyParsedSymbolsList);
			//console.log("this.eagerlyParsedSymbolsMap", this.eagerlyParsedSymbolsMap);
			for (var i = 0; i < this.eagerlyParsedSymbolsList.length; i++) {
				var eagerlySymbol: any = this.eagerlyParsedSymbolsList[i];
				if (eagerlySymbol) {
					switch (eagerlySymbol.type) {
						case SYMBOL_TYPE.IMAGE:
							//console.log("init image parsing", eagerlySymbol);
							this._pAddDependency(
									eagerlySymbol.id.toString(), null, 
									new Image2DParser(this._factory, eagerlySymbol.definition.alphaData), 
									new Blob([eagerlySymbol.definition.data], { type: eagerlySymbol.definition.mimeType }), 
									false, true);
							this.externalDependenciesCount++;
							break;
						case SYMBOL_TYPE.SOUND:
							//console.log("init sound parsing", eagerlySymbol);
							if(!eagerlySymbol.definition.packaged) {
								console.warn("SWF-parser: Missed packaged data for sound-id:",eagerlySymbol.id.toString());
								break;
							}

							this._pAddDependency(
									eagerlySymbol.id.toString(), null, 
									new WaveAudioParser(), 
									new Blob([eagerlySymbol.definition.packaged.data], { type: eagerlySymbol.definition.packaged.mimeType }), 
									false, true);
							
							this.externalDependenciesCount++;
							break;
						case SYMBOL_TYPE.FONT:
							//console.log("encountered eagerly parsed font: ", eagerlySymbol);
							break;
						default:
							console.log("encountered eagerly parsed unknown type: ", eagerlySymbol);
							break;
					}

				}

			}

		}
		if (this.externalDependenciesCount > 0) {
			this._progressState = SWFParserProgressState.WAIT_FOR_DEPENDENCY;
			this._pPauseAndRetrieveDependencies();
		}
		else {
			this.parseSymbolsToAwayJS();
			this._progressState = SWFParserProgressState.FINISHED;

			Stat.rec("parser").rec("symbols").end();
		}
	}

	public getMaterial(bitmapIndex: number): MethodMaterial {
		var material: MethodMaterial = this._mapMatsForBitmaps[bitmapIndex];
		if (!material) {
			material = new MethodMaterial();
			var myImage = this.awaySymbols[bitmapIndex];
			if (!myImage || (!myImage.isAsset(BitmapImage2D) && !myImage.isAsset(SceneImage2D))) {
				release || console.log("error: can not find image for bitmapfill", myImage);
				myImage = new BitmapImage2D(512, 512, true, 0xff0000ff, true);
			}
			material.ambientMethod.texture = new ImageTexture2D(myImage as any);

			material.alphaBlending = true;
			material.useColorTransform = true;
			material.bothSides = true;
			this._mapMatsForBitmaps[bitmapIndex] = material;
		}

		return material;
	}

	private myTestSprite: Sprite;
	private _mapMatsForBitmaps: any;
	private _lockFinalize = false;

	public registerAwayAsset(asset: IAsset, symbol: ISymbol) {
		if(this._lockFinalize) return;

		if(symbol.type !== SYMBOL_TYPE.FONT) {
			this._pFinalizeAsset(asset);
		} else {
			this._pFinalizeAsset((symbol as any).away);
		}
	}

	public parseSymbolsToAwayJS() {
		
		Stat.rec("parser").rec("symbols").rec("away").begin();

		let index = 0;
		const total = Object.keys(this.dictionary).length;
		const step = total / 100 | 0;
		const assetsToFinalize: any = {};

		// disable reqursive parser, because symbol requests one by one
		this._symbolDecoder.reqursive = false;
		// lock finalizer, because we dispatch it after parsing, we need it?
		this._lockFinalize = true;

		console.debug("[Away Symbols] Start");
		for (const entry of this.dictionary) {
			if (!entry) {
				continue;
			}

			index ++;
			if(step && !(index % 100)) {
				console.debug(`[Away Symbols] Decoded (${index}/${total}), ${(100 * index / total) | 0}`);
			}

			const symbol = this.getSymbol(entry.id) as ISymbol;
			let asset: IAsset;
	
			//try {
				asset = this._symbolDecoder.createAwaySymbol(symbol, null, null);
			/*
			} catch(e) {
				console.warn("[SWF Symbol parser error]", e);
			}
			*/

			if(!asset) {
				continue;
			}

			// for FONT we finalize by name
			if(symbol.type !== SYMBOL_TYPE.FONT) {
				assetsToFinalize[entry.id] = asset;
			} else {
				// invalid, because maybe a more that 1 fonts table to same name
				assetsToFinalize[symbol.name] = symbol.away;
			}
		}

		const rootSymbol: any = this.dictionary[0] || {
			id: 0,
			className: this.symbolClassesMap[0]
		};

		noTimelineDebug || console.log("start parsing root-timeline: ", rootSymbol);
		const rootAsset = this._symbolDecoder.framesToTimeline(null, rootSymbol, this._swfFile.frames, null, null);
		rootAsset.isAVMScene = true;

		// manualy send finalisation event after parsing
		for (var key in assetsToFinalize) {
			this._pFinalizeAsset(assetsToFinalize[key]);
		}

		this._pFinalizeAsset(rootAsset, "scene");
		DefaultFontManager.applySharedFonts(this._iFileName);
		//console.log("root-timeline: ", awayMc);
		//console.log("AwayJS loaded SWF with "+ dictionary.length+" symbols", this._swfFile.sceneAndFrameLabelData);

		// unlock
		this._lockFinalize = false;

		// enable recursive parser, finalizer will invoked to for nested symbols that not exist
		this._symbolDecoder.reqursive = true;

		Stat.rec("parser").rec("symbols").rec("away").end();
	}

	public textFormatAlignMap: string[] = [TextFormatAlign.LEFT, TextFormatAlign.RIGHT, TextFormatAlign.CENTER, TextFormatAlign.JUSTIFY];


	public _pStartParsing(frameLimit: number): void {
		//console.log("SWFParser - _pStartParsing");

		super._pStartParsing(frameLimit);


	}
	public dispose(): void {

		this.swfData = null;
		this._dataStream = null;
	}


	private updateTimers(type: number): void {

	}


	private _buttonSounds: any = {};
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


		this._swfFile.bytesTotal = length;
		this._swfFile.frames = [];
		this.abcBlocks = [];
		this.dictionary = [];
		this.fonts = [];

		this.symbolClassesMap = [];
		this.symbolClassesList = [];
		this.eagerlyParsedSymbolsMap = [];
		this.eagerlyParsedSymbolsList = [];
		this._jpegTables = null;

		this._currentFrameLabels = [];
		this._currentSoundStreamHead = null;
		this._currentSoundStreamBlock = null;
		this._currentControlTags = null;
		this._currentActionBlocks = null;
		this._currentInitActionBlocks = null;
		this._currentExports = null;
		this._endTagEncountered = false;

		// farm encrypted actions blocks (named as tag253 to action block)
		this._isEncrypted = false;
		this._currentEncrActionBlocks = null;

		this.readHeaderAndInitialize(initialBytes);
	}

	finishLoading() {
		if (this._swfFile.compression !== CompressionMethod.None) {
			this._decompressor.close();
			this._decompressor = null;
			this.scanLoadedData();
		}
	}

	getSymbol(id: number): ISymbol | EagerlyParsedDictionaryEntry {
		//console.log("getSymbol", id);
		if (this.eagerlyParsedSymbolsMap[id]) {
			return this.eagerlyParsedSymbolsMap[id];
		}

		const unparsed = this.dictionary[id];
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

		if(this._buttonSounds[symbol.id]) {
			(<IButtonSymbol>symbol).buttonSounds = this._buttonSounds[symbol.id];
		}
		if((<any>unparsed).scalingGrid)
			symbol.scalingGrid=(<any>unparsed).scalingGrid;

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
		this._swfFile.mapSWFVersionToFPVersion();

		if (this._swfFile.swfVersion != 6) {
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
		this._swfFile.frameRate = this._swfFile.frameRate = obj.frameRate;
		this._swfFile.frameCount = this._swfFile.frameCount = obj.frameCount;
		//var str = String.fromCharCode.apply(null, data);
		//console.log(obj);
		//console.log("parseHeaderContents this._swfFile.bounds", this._swfFile.bounds);
		//console.log("parseHeaderContents this._swfFile.frameRate", this._swfFile.frameRate);
		//console.log("parseHeaderContents this._swfFile.frameCount", this._swfFile.frameCount);
	}

	private processFirstBatchOfDecompressedData(data: Uint8Array) {

		Stat.rec("parser").rec("unzip").begin();

		this.processDecompressedData(data);
		this.parseHeaderContents();
		this._decompressor.onData = this.processDecompressedData.bind(this);
	}

	private processDecompressedData(data: Uint8Array) {
		// Make sure we don't cause an exception here when trying to set out-of-bound data by clamping the number of bytes
		// to write to the remaining space in our buffer. If this is the case, we probably got a wrong file length from
		// the SWF header. The Flash Player ignores data that goes over that given length, so should we.
		Stat.rec("parser").rec("unzip").end();

		var length = Math.min(data.length, this._uncompressedLength - this._uncompressedLoadedLength);
		memCopy(this.swfData, data, this._uncompressedLoadedLength, 0, length);
		this._uncompressedLoadedLength += length;
	}

	private scanLoadedData() {
		//SWF.enterTimeline('Scan loaded SWF file tags');
		this._dataStream.pos = this._lastScanPosition;

		Stat.rec("parser").rec("scanTags").begin();
		this.scanTagsToOffset(this._uncompressedLoadedLength, true);
		Stat.rec("parser").rec("scanTags").end();

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
		while (i < len) {
			c = array[i++];
			switch (c >> 4) {
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
			var symbol = new EagerlyParsedDictionaryEntry(definition.id, unparsed, SYMBOL_TYPE.SOUND, definition);
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
				this._swfFile.backgroundColor = this._swfFile.backgroundColor = parseRgb(this._dataStream);
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
					//console.log('Registering symbol class ' + symbolClassName + ' to symbol ' + symbolId);
					this.symbolClassesMap[symbolId] = symbolClassName;
					this.symbolClassesList.push({ id: symbolId, className: symbolClassName });
				}
				// Make sure we move to end of tag even if the content is invalid.
				stream.pos = tagEnd;
				break;
			case SwfTagCode.CODE_DO_INIT_ACTION:
				if (this._swfFile.useAVM1) {
					const initActionBlocks = this._currentInitActionBlocks ||
						(this._currentInitActionBlocks = []);
					const spriteId = this._dataView.getUint16(stream.pos, true);
					const actionsData = this.swfData.subarray(byteOffset + 2, byteOffset + tagLength);
					const encryptedData = this._isEncrypted ? this._currentEncrActionBlocks?.pop() : undefined;

					if (encryptedData) {
						//console.log(`Pass enc data to tag ${tagCode}, pos ${stream.pos}`);
					}
					initActionBlocks.push({ spriteId: spriteId, actionsData: actionsData, encryptedData });
				}
				this.jumpToNextTag(tagLength);
				break;
			case SwfTagCode.CODE_DO_ACTION:
				if (this._swfFile.useAVM1) {
					var actionBlocks = this._currentActionBlocks || (this._currentActionBlocks = []);
					var actionsData = this.swfData.subarray(stream.pos, stream.pos + tagLength);
					const encryptedData = this._isEncrypted ? this._currentEncrActionBlocks?.pop() : undefined;

					if (encryptedData) {
						//console.log(`Pass enc data to tag ${tagCode}, pos ${stream.pos}`);
					}
					actionBlocks.push({ actionsData: actionsData, precedence: stream.pos, encryptedData });
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
				//if(!this._currentSoundStreamHead)
				//	throw("Error when parsing CODE_SOUND_STREAM_BLOCK - a _currentSoundStreamHead must exist")
				this._currentSoundStreamBlock = this.swfData.subarray(stream.pos, stream.pos += tagLength);
				//this._currentSoundStreamHead.allChunks.push(this._currentSoundStreamBlock);
				/*console.log(this._currentSoundStreamBlock.buffer);
				console.log(this._currentSoundStreamBlock.length);
				console.log(this._currentSoundStreamBlock.byteLength);
				console.log(this._currentSoundStreamBlock.byteOffset);
				console.log(this._currentSoundStreamBlock.buffer.byteLength);
				var int16array=new Uint16Array(this._currentSoundStreamBlock.buffer, this._currentSoundStreamBlock.byteOffset, this._currentSoundStreamBlock.length);
				console.log(int16array.buffer);
				console.log(int16array.length);
				console.log(int16array.byteLength);
				console.log(int16array[0]);*/
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
				var btn_id = stream.readUi16();

				this._buttonSounds[btn_id] = {};
				for (var s = 0; s < 4; s++) {
					this._buttonSounds[btn_id][s] = {};
					this._buttonSounds[btn_id][s].id = stream.readUi16();
					if (this._buttonSounds[btn_id][s].id != 0) {
						this._buttonSounds[btn_id][s].info = parseSoundInfo(stream);
					}
				}
				stream.pos = tagEnd;

				break;
			case SwfTagCode.CODE_DEFINE_SCALING_GRID:
				let scaleGridtag=this.getParsedTag(tag);
				let unparsedSymbol=this.dictionary[scaleGridtag.symbolId];
				(<any>unparsedSymbol).scalingGrid=scaleGridtag.splitter;
				console.log("scaleGridtag", scaleGridtag, symbol);
				break;
			case SwfTagCode.CODE_DEFINE_BUTTON_CXFORM:
			case SwfTagCode.CODE_DEFINE_FONT_INFO:
			case SwfTagCode.CODE_DEFINE_FONT_INFO2:
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
			case SWF_ENCRYPTED_TAGS.ENCRYPTED:
				console.log("Tag 255 present. SWF is encrypted");
				this._isEncrypted = true;
				this.jumpToNextTag(tagLength);
				break;
			case SWF_ENCRYPTED_TAGS.ENCRYPTED_CODE_BLOCK: {
				if (this._isEncrypted) {
					const block = this._currentEncrActionBlocks || (this._currentEncrActionBlocks = []);
					const data = this.swfData.subarray(byteOffset + 2, byteOffset + tagLength);
					block.push({ data, bytePos: byteOffset + 2, size: tagLength, rawTagId: tagCode });
				}
				this.jumpToNextTag(tagLength);
				break;
			}
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
			type: SYMBOL_TYPE.SPRITE,
			frames: []
		};
		var spriteTagEnd = spriteTag.byteOffset + spriteTag.byteLength;
		var frames = timeline.frames;
		var labels: string[] = [];
		var controlTags: UnparsedTag[] = [];
		var soundStreamHead: SoundStream = null;
		var soundStreamBlock: Uint8Array = null;
		var actionBlocks: { actionsData: Uint8Array; precedence: number }[] = null;
		var initActionBlocks: { spriteId: number; actionsData: Uint8Array }[] = null;
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
						actionBlocks.push({ actionsData: actionsData, precedence: stream.pos });
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
						initActionBlocks.push({ spriteId: spriteId, actionsData: actionsData });
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
					labels.length = 0;
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
				case SwfTagCode.CODE_SOUND_STREAM_HEAD2:
					//console.warn("Timeline sound is set to streaming!");
					var tagStart = stream.pos;
					var tagEnd = stream.pos + tagLength;
					var soundStreamTag = parseSoundStreamHeadTag(stream, tagEnd);
					soundStreamHead = SoundStream.FromTag(soundStreamTag);

					stream.pos = tagStart;
					break;
				case SwfTagCode.CODE_SOUND_STREAM_BLOCK:
					var tagStart = stream.pos;
					var tagEnd = stream.pos + tagLength;
					//if(!this._currentSoundStreamHead)
					//	throw("Error when parsing CODE_SOUND_STREAM_BLOCK - a _currentSoundStreamHead must exist")
					soundStreamBlock = this.swfData.subarray(stream.pos, tagEnd);
					stream.pos = tagStart;
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

		this._currentFrameLabels.length = 0;
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
			useDirectBlit: bits & 0x40
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
		var symbol = new EagerlyParsedDictionaryEntry(definition.id, unparsed, SYMBOL_TYPE.FONT, definition);
		/*if (!release && traceLevel.value > 0) {
		  var style = flagsToFontStyle(definition.bold, definition.italic);
		  console.info("Decoding embedded font " + definition.id + " with name '" + definition.name +
			  "' and style " + style, definition);
		}*/
		this.eagerlyParsedSymbolsMap[symbol.id] = symbol;
		this.eagerlyParsedSymbolsList.push(symbol);

		var style = flagsToFontStyle(definition.bold, definition.italic);
		this.fonts.push({ name: definition.name, id: definition.id, style: style });
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
		this.fonts.push({ name: name, id: id, style: style });
		/*  if (!release && traceLevel.value > 0) {
			console.info("Registering embedded font " + id + " with name '" + name + "' and style " +
				style);
		  }*/
		stream.pos = unparsed.byteOffset + unparsed.byteLength;
	}

	private decodeEmbeddedImage(unparsed: UnparsedTag) {
		var definition = this.getParsedTag(unparsed);
		var symbol = new EagerlyParsedDictionaryEntry(definition.id, unparsed, SYMBOL_TYPE.IMAGE, definition);
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
	
	const d = Stat.rec('parser').rec('symbols').rec('define');
	let rec;
	let ret;

	switch (swfTag.code) {
		case SwfTagCode.CODE_DEFINE_BITS:
		case SwfTagCode.CODE_DEFINE_BITS_JPEG2:
		case SwfTagCode.CODE_DEFINE_BITS_JPEG3:
		case SwfTagCode.CODE_DEFINE_BITS_JPEG4: 
		{
			rec = d.rec('image')
			rec.begin();
			ret = defineImage(swfTag);
			break;
		}
		case SwfTagCode.CODE_DEFINE_BITS_LOSSLESS:
		case SwfTagCode.CODE_DEFINE_BITS_LOSSLESS2:
		{
			rec = d.rec('bitmap')
			rec.begin();
			ret = defineBitmap(swfTag);
			break;
		}
		case SwfTagCode.CODE_DEFINE_BUTTON:
		case SwfTagCode.CODE_DEFINE_BUTTON2:
		{
			rec = d.rec('button')
			rec.begin();
			ret = defineButton(swfTag, symbols);
			break;
		}
		case SwfTagCode.CODE_DEFINE_EDIT_TEXT:
		{
			rec = d.rec('text')
			rec.begin();
			ret = defineText(swfTag);
			break;
		}
		case SwfTagCode.CODE_DEFINE_FONT:
		case SwfTagCode.CODE_DEFINE_FONT2:
		case SwfTagCode.CODE_DEFINE_FONT3:
		case SwfTagCode.CODE_DEFINE_FONT4:
		{
			rec = d.rec('font')
			rec.begin();
			ret = defineFont(swfTag, (<SWFParser>parser)._iFileName);
			break;
		}
		case SwfTagCode.CODE_DEFINE_MORPH_SHAPE:
		case SwfTagCode.CODE_DEFINE_MORPH_SHAPE2:
		case SwfTagCode.CODE_DEFINE_SHAPE:
		case SwfTagCode.CODE_DEFINE_SHAPE2:
		case SwfTagCode.CODE_DEFINE_SHAPE3:
		case SwfTagCode.CODE_DEFINE_SHAPE4:
		{
			rec = d.rec('shape')
			rec.begin();
			ret = defineShape(swfTag, parser);
			break;
		}
		case SwfTagCode.CODE_DEFINE_SOUND:
		{
			rec = d.rec('sound')
			rec.begin();
			ret = defineSound(swfTag);
			break;
		}
		case SwfTagCode.CODE_DEFINE_VIDEO_STREAM:
			return {
				type: SYMBOL_TYPE.VIDEO,
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
				type: SYMBOL_TYPE.BINARY,
				id: swfTag.id,
				data: swfTag.data
			};
		case SwfTagCode.CODE_DEFINE_TEXT:
		case SwfTagCode.CODE_DEFINE_TEXT2:
		{
			rec = d.rec('label')
			rec.begin();			
			ret = defineLabel(swfTag);
			break;
		}
		default:
			//console.log("define default symbol", swfTag, symbols, parser);
			return swfTag;
	}

	rec.end();
	return ret;
}

