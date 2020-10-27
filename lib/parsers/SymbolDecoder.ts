import {
	Billboard,
	DisplayObject,
	IFilter,
	IFrameScript,
	ISceneGraphFactory,
	ISymbolDecoder,
	MorphSprite,
	MovieClip,
	Sprite,
	TesselatedFontTable,
	TextField,
	TextFormat,
	TextFormatAlign,
	Timeline,
	TimelineActionType,
} from '@awayjs/scene';
import { PlaceObjectFlags, PlaceObjectTag, SoundInfoFlags, SwfTagCode, TextFlags } from '../factories/base/SWFTags';

import {
	IBinarySymbol,
	IButtonSymbol,
	IImageSymbol,
	ILabelSymbol,
	IShapeSymbol,
	ISpriteSymbol,
	ISymbol,
	ITextSymbol,
	IVideoSymbol,
	IFontSymbol,
	SYMBOL_TYPE,
} from './ISymbol';

import { MovieClipSoundsManager } from '../factories/timelinesounds/MovieClipSoundsManager';
import { BitmapImage2D } from '@awayjs/stage';
import { MethodMaterial } from '@awayjs/materials';
import { Graphics, Shape, UnparsedTag } from '@awayjs/graphics';
import { SWFFrame } from './SWFFrame';
import { ColorUtils, IAsset, Rectangle, WaveAudio } from '@awayjs/core';
import { Matrix, ColorTransform } from '../factories/base/SWFTags';
import { SWFParser } from './SWFParser';

const noTimelineDebug = true;
const noExportsDebug = true;

function matrixToStream(stream: number[] | Uint32Array, index: number, matrix: Matrix) {
	stream[index++] = matrix.a;
	stream[index++] = matrix.b;
	stream[index++] = matrix.c;
	stream[index++] = matrix.d;
	stream[index++] = matrix.tx / 20;
	stream[index++] = matrix.ty / 20;

	return index;
}

function colorMatrixToStream(stream: number[] | Uint32Array, index: number, matrix: ColorTransform) {
	stream[index++] = matrix.redMultiplier / 255;
	stream[index++] = matrix.greenMultiplier / 255;
	stream[index++] = matrix.blueMultiplier / 255;
	stream[index++] = matrix.alphaMultiplier / 255;
	stream[index++] = matrix.redOffset;
	stream[index++] = matrix.greenOffset;
	stream[index++] = matrix.blueOffset;
	stream[index++] = matrix.alphaOffset;

	return index;
}

const TF_ALIGNS: string[] = [
	TextFormatAlign.LEFT,
	TextFormatAlign.RIGHT,
	TextFormatAlign.CENTER,
	TextFormatAlign.JUSTIFY,
];

<<<<<<< HEAD
export class SymbolDecoder {
=======
export class SymbolDecoder implements ISymbolDecoder {

>>>>>>> timeline_refactor
	private _awaySymbols: NumberMap<IAsset> = {};
	private _buttonIds: NumberMap<boolean> = {};
	private _mcIds: NumberMap<boolean> = {};

	/**
	 * @description Force reqursive decoding of nested symbols, disable it when sure that symbol exist
	 */
	public reqursive: boolean = true;

	constructor(public parser: SWFParser) {}

	get factory(): ISceneGraphFactory {
		return this.parser.factory;
	}

	get awaySymbols() {
		return this._awaySymbols;
	}

	/**
	 * prepares framescript for use in AVM
	 * this is actually only used for AVM1
	 * @param source
	 * @param frameIdx
	 */
	public prepareFrameScriptsForAVM1(source: IFrameScript[],
		frameIdx: number,
		objName: string,
		objID: number): IFrameScript[] {
		if (!this.parser.swfFile.useAVM1) {
			return source;
		}
		return this.parser.factory.createFrameScripts(source, frameIdx, objName, objID);
	}

	/**
	 * Get a instance for a given SymbolID and assign a sessionID to it.
	 * This is used by timeline to create children
	 *
	 * @param symbolID
	 * @param sessionID
	 */
	public createChildInstanceForTimeline(timeline: Timeline, symbolID: number, sessionID: number): IAsset {
		const asset: IAsset = this.awaySymbols[symbolID];
		let clone: DisplayObject;
		if (asset.isAsset(Graphics)) {
			clone = Sprite.getNewSprite(<Graphics> asset);
			clone.mouseEnabled = false;
		} else if (asset.isAsset(Sprite)) {
			clone = Sprite.getNewSprite((<Sprite> asset).graphics);
			clone.mouseEnabled = false;
		} else if (asset.isAsset(MorphSprite)) {
			clone = MorphSprite.getNewMorphSprite((<MorphSprite> asset).graphics);
			clone.mouseEnabled = false;
		} else if (asset.isAsset(BitmapImage2D)) {
			// enable blending for symbols, because if you place image directly on stage
			// it not enable blend mode
			const m = new MethodMaterial(<BitmapImage2D>asset);
			m.alphaBlending = (<BitmapImage2D>asset).transparent;
			clone = Billboard.getNewBillboard(m);
		} else {
			clone = (<any> asset.adapter).clone(false).adaptee;
		}
		if (this.parser.swfFile.useAVM1) {
			const placeObjectTag: any = timeline.placeObjectTagsForSessionIDs[sessionID];
			if (placeObjectTag
				&& ((<any>placeObjectTag).variableName
				|| (placeObjectTag.events && placeObjectTag.events.length > 0))) {
				(<any>clone.adapter).placeObjectTag = placeObjectTag;
				(<any>clone.adapter).initEvents = placeObjectTag;
			}
		}
		clone._sessionID = sessionID;
		return clone;
	}

	private _createShape(symbol: IShapeSymbol & {lazyParser: () => any}, target?: Shape, name?: string): IAsset {

		const shape = new Graphics();

		/*
		if(symbol.lazyParser) {
			symbol.lazyParser();
		}*/

		shape.queueShapeTag(symbol);

		shape.name = name || 'AwayJS_shape_' + symbol.id.toString();
		(shape as any).className = symbol.className;

		if (symbol.type === SYMBOL_TYPE.MORPH) {
			return new MorphSprite(shape);
		}

		return shape;
	}

	private _createFont(symbol: IFontSymbol, target?: any, name?: string): IAsset {
		symbol.away.className = symbol.className;
		return symbol as any;
	}

	private _createSprite(symbol: ISpriteSymbol, target?: MovieClip, name?: string): IAsset {
		noTimelineDebug || console.log('start parsing timeline: ', symbol);

		const awayMc = this.framesToTimeline(target, symbol, symbol.frames, null, null);

		if (symbol.scalingGrid)
			awayMc.scale9Grid = new Rectangle(
				symbol.scalingGrid.xMin / 20,
				symbol.scalingGrid.yMin / 20,
				symbol.scalingGrid.xMax / 20,
				symbol.scalingGrid.yMax / 20
			);

		(<any>awayMc).className = symbol.className;
		awayMc.name = name || 'AwayJS_mc_' + symbol.id.toString();

		if (awayMc.buttonMode) {
			this._buttonIds[symbol.id] = true;
		} else {
			this._mcIds[symbol.id] = true;
		}

		return awayMc;
	}

	private _createText(symbol: ITextSymbol, target?: TextField, name?: string): IAsset {
		target = target || this.factory.createTextField(symbol);
		target._symbol = symbol;
		target.textFormat = new TextFormat();

		(<any>target).className = symbol.className;

		const flashFont = (this.reqursive ?
			this.createAwaySymbol(symbol.tag.fontId) : this._awaySymbols[symbol.tag.fontId]) as any;

		if (flashFont) {
			target.textFormat.font = flashFont.away;
			target.textFormat.font_table = <TesselatedFontTable>
				flashFont.away.get_font_table(flashFont.fontStyleName, TesselatedFontTable.assetType);
		}

		const tag = symbol.tag;
		target.textFormat.size = tag.fontHeight / 20;
		target.textColor = (tag.flags & TextFlags.HasColor) ? ColorUtils.f32_RGBA_To_f32_ARGB(tag.color) : 0xffffff;
		target.textFormat.leftMargin = tag.leftMargin / 20;
		target.textFormat.rightMargin = tag.rightMargin / 20;
		target.textFormat.letterSpacing = tag.letterSpacing / 20;
		target.textFormat.leading = tag.leading / 20;
		target.textFormat.align = TF_ALIGNS[tag.align];

		target.textOffsetX = symbol.fillBounds.xMin / 20;
		target.textOffsetY = symbol.fillBounds.yMin / 20;
		target.width = (symbol.fillBounds.xMax - symbol.fillBounds.xMin) / 20;
		target.height = (symbol.fillBounds.yMax - symbol.fillBounds.yMin) / 20;
		target.border = !!(tag.flags & TextFlags.Border);
		target.background = target.border;

		target.multiline = tag.flags & TextFlags.Multiline ? true : false;
		target.wordWrap = tag.flags & TextFlags.WordWrap ? true : false;
		target.selectable = tag.flags ? !(tag.flags & TextFlags.NoSelect) : false;

		if (tag.maxLength && tag.maxLength > 0) {
			target.maxChars = tag.maxLength;
		}
		if (tag.flags & TextFlags.ReadOnly) {
			target.type = 'dynamic';
		} else {
			target.type = 'input';
		}

		if (tag.flags & TextFlags.Html) {
			target.html = true;
			if (tag.initialText && tag.initialText != '') target.htmlText = tag.initialText;
		} else {
			target.html = false;
			if (tag.initialText && tag.initialText != '') target.text = tag.initialText;
		}
		target.name = name || 'tf_' + symbol.id.toString();

		return target;
	}

	private _createSound(symbol: ISymbol, target?: any, name?: string): IAsset {
		const awaySound: WaveAudio = <WaveAudio> this.parser.awayUnresolvedSymbols[symbol.id];

		if (awaySound) {
			(<any>awaySound).className = this.parser.symbolClassesMap[symbol.id] || null;
			awaySound.name = (<any>awaySound).className;
			//awaySound.play(0,false);
		} else {
			console.warn('SWF-parser: no sound loaded for sound-id:', symbol.id);
		}

		return awaySound;
	}

	private _createButton(symbol: IButtonSymbol, target?: any, name?: string): IAsset {
		noTimelineDebug || console.log('start parsing button: ', symbol);
		target = this.framesToTimeline(target, symbol, null, symbol.states, symbol.buttonActions, symbol.buttonSounds);
		//awayMc._symbol=symbol;
		target.name = name || 'AwayJS_button_' + symbol.id.toString();
		(<any>target).className = symbol.className;

		this._buttonIds[symbol.id] = true;
		return target;
		/*
		assetsToFinalize[dictionary[i].id] = awayMc;
		this._awaySymbols[dictionary[i].id] = awayMc;
		*/

		/*
		var mySprite:SimpleButton=new SimpleButton();
		console.log("Button:", symbol);
		//var awayMc = this.framesToAwayTimeline(symbol.frames);
		//mySprite._symbol=symbol;
		this._pFinalizeAsset(mySprite, symbol.id);
		this._awaySymbols[dictionary[i].id] = mySprite;
		*/
	}

	private _createLabel(symbol: ILabelSymbol, target?: TextField, name?: string): IAsset {
		target = target || this.factory.createTextField(symbol);

		let font: IFontSymbol = null;
		let fontExist = false;
		(<any>target).className = symbol.className;
		for (let r = 0; r < symbol.records.length; r++) {
			const record: any = symbol.records[r];
			if (record.fontId) {
				font = this.reqursive ?
					(this.createAwaySymbol(record.fontId) as any) : this._awaySymbols[record.fontId];

				if (font) {
					//awayText.textFormat.font=font.away;
					record.font = font;
					record.font_table = <TesselatedFontTable>
						font.away.get_font_table(font.fontStyleName, TesselatedFontTable.assetType);

					if (!record.font_table) {
						fontExist = true;
						console.log('no font_table set');
					}
					//record.font_table=font.away.font_styles[0];
				}
			}
		}

		target.staticMatrix = symbol.matrix;
		target.textOffsetX = symbol.fillBounds.xMin / 20;
		target.textOffsetY = symbol.fillBounds.yMin / 20;
		target.width = symbol.fillBounds.xMax / 20 - symbol.fillBounds.xMin / 20 - 1;
		target.height = symbol.fillBounds.yMax / 20 - symbol.fillBounds.yMin / 20 - 1;

		if (!fontExist) {
			target.setLabelData(symbol);
		}

		target.name = name || 'AwayJS_label_' + symbol.id.toString();
		/*
		assetsToFinalize[dictionary[i].id] = target;
		this._awaySymbols[dictionary[i].id] = target;
		*/
		target.selectable = symbol.tag.flags && !(symbol.tag.flags & TextFlags.NoSelect);

		return target;
	}

	private _createImage(symbol: IImageSymbol, target?: BitmapImage2D, name?: string): IAsset {
		const useLazy = true;

		target = target || <BitmapImage2D> this.parser.awayUnresolvedSymbols[symbol.id];

		if (!target && symbol.definition) {
			const def = symbol.definition;

			target = new BitmapImage2D(def.width, def.height, true, null, false);
			target.addLazySymbol(symbol);

			if (!useLazy) {
				target.applySymbol();
			}

			/*
			if (def.data.length != (4 * def.width * def.height)
				&& def.data.length != (3 * def.width * def.height))
			{
				def.data = new Uint8ClampedArray(4 * def.width * def.height);
				//symbol.definition.data.fill
			}
			target.setPixels(new Rectangle(0, 0, def.width, def.height), def.data);
			*/
		}
		if (target) {

			(<any>target).className = this.parser.symbolClassesMap[symbol.id] ?
				this.parser.symbolClassesMap[symbol.id] : symbol.className;
			target.name = (<any>target).className;

			//assetsToFinalize[dictionary[i].id] = target;
		}

		return target;
	}

	public _createBinary(symbol: IBinarySymbol, target?: any, name?: string): IAsset {
		if ((<any> this.factory).createBinarySymbol) (<any> this.factory).createBinarySymbol(symbol);

		/*
		const bin = new ByteArray(bs.byteLength);
		const asset = new GenericAsset<ByteArray>(bin, bs.className, ByteArray);
		bin.setArrayBuffer(bs.data.buffer);
		*/
		return null;
	}

	public _createVideo(symbol: IVideoSymbol, target: any, name?: string): IAsset {
		const dummyVideo = new BitmapImage2D(symbol.width, symbol.height, false, 0x00ff00, false);
		dummyVideo._symbol = symbol as any;

		(<any>dummyVideo).className = this.parser.symbolClassesMap[symbol.id] ?
			this.parser.symbolClassesMap[symbol.id] : symbol.className;
		dummyVideo.name = (<any>dummyVideo).className;

		return dummyVideo;
	}

	public createAwaySymbol<T extends IAsset = IAsset>(symbol: ISymbol | number, target?: IAsset, name?: string): T {
		if (typeof symbol === 'number') {
			// Return existed away symbol by ID, skip getSymbol
			if (!target && this._awaySymbols[symbol]) {
				return this._awaySymbols[symbol] as T;
			}

			symbol = this.parser.getSymbol(symbol) as ISymbol;
		}

		if (!symbol) {
			throw new Error('Symbol can\'t be null');
		}
		//name = symbol.className;

		// return existed away symbol by ID inside symbol
		if (!target && this._awaySymbols[symbol.id]) {
			return this._awaySymbols[symbol.id] as T;
		}

		let asset: IAsset;

		//Stat.rec("parser").rec("symbols").rec("away").begin();

		//symbol.className && console.log(symbol.type, symbol.className);
		switch (symbol.type) {
			case SYMBOL_TYPE.MORPH:
			{
				asset = this._createShape(symbol as IShapeSymbol,
					target as Shape, name || 'AwayJS_morphshape_' + symbol.id.toString());
				break;
			}
			case SYMBOL_TYPE.SHAPE: {
				asset = this._createShape(symbol as IShapeSymbol, target as Shape, name);
				break;
			}
			case SYMBOL_TYPE.FONT: {
				asset = this._createFont(symbol as IFontSymbol, target as any, name);
				break;
			}
			case SYMBOL_TYPE.SPRITE: {
				asset = this._createSprite(symbol as ISpriteSymbol, target as MovieClip, name);
				break;
			}
			case SYMBOL_TYPE.TEXT: {
				asset = this._createText(symbol as ITextSymbol, target as TextField, name);
				break;
			}
			case SYMBOL_TYPE.SOUND: {
				asset = this._createSound(symbol, target, name);
				break;
			}
			case SYMBOL_TYPE.BUTTON: {
				asset = this._createButton(symbol as IButtonSymbol, target, name);
				break;
			}
			case SYMBOL_TYPE.LABEL: {
				asset = this._createLabel(symbol as ILabelSymbol, target as TextField, name);
				break;
			}
			case SYMBOL_TYPE.IMAGE: {
				asset = this._createImage(symbol as IImageSymbol, target as BitmapImage2D, name);
				break;
			}
			case SYMBOL_TYPE.BINARY: {
				asset = this._createBinary(symbol as IBinarySymbol, target, name);
				break;
			}
			case SYMBOL_TYPE.VIDEO: {
				asset = this._createVideo(symbol as IVideoSymbol, target, name);
				break;
			}
			default:
				throw Error('Unknown symbol type:' + symbol.type);
		}

		this._awaySymbols[symbol.id] = asset;

		this.parser.registerAwayAsset(asset, symbol);

		return asset as T;
	}

	framesToTimeline(awayMc: MovieClip, symbol: any, swfFrames: SWFFrame[],
		states: any, buttonActions: any, buttonSound: any = null): MovieClip {
		if (!states && !swfFrames) {
			throw 'error when creating timeline - neither movieclip frames nor button-states present';
		}

		const getSymbol = this.reqursive
			? (id: number) => this._awaySymbols[id] || this.createAwaySymbol(id)
			: (id: number) => this._awaySymbols[id];

		//console.log("swfFrames", swfFrames);
		let isButton: boolean = false;
		let key: string;
		symbol.isButton = false;
		if (states && !swfFrames) {
			isButton = true;
			symbol.isButton = true;
			swfFrames = [];
			for (key in states) {
				const newSWFFrame: SWFFrame = new SWFFrame();
				newSWFFrame.controlTags = states[key];
				newSWFFrame.buttonStateName = key;
				swfFrames[swfFrames.length] = newSWFFrame;
				//console.log("buttonSound ", buttonSound);
			}
		}

		awayMc = awayMc || this.factory.createMovieClip(null, symbol);
		awayMc.symbolID = symbol.id;

		let sessionIDCount: number = 0;
		const awayTimeline: Timeline = awayMc.timeline;
		awayMc.timeline.symbolDecoder = this;
		const keyframe_durations: number[] = [];
		const frameCmdInd: number[] = [];
		const frameRecipe: number[] = [];
		const cmdStreamLength: number[] = [];
		const cmdStremInd: number[] = [];
		const addChildStream: number[] = [];
		const addSoundsStream: number[] = [];
		/**
		 * @description Remove Child Stream
		 */
		const remChildStream: number[] = [];
		/**
		 * @description Update Child Stream
		 */
		const updChildStream: number[] = [];
		/**
		 * @description Update Child Stream: Property Index
		 */
		const updСhildStreamPropsInd: number[] = [];

		/**
		 * @description Update Child Stream: Property Lenght
		 */
		const updChildStreamPropsLen: number[] = [];

		const propStreamType: number[] = [];
		const propStreamIndex: number[] = [];
		const propStreamInt: i32[] = [];
		const propStreamFilters: IFilter[] = [];

		/**
		 * @description Matrix: Scale + Rotation props,
		 * @type {Float32Array}
		 */
		const propStramMatrixSR: f32[] = [];

		/**
		 * @description Matrix: Position props,
		 * @type {Float32Array}
		 */
		const propStreamMatrixPos: f32[] = [];
		const propStreamMatrixAll: f32[] = [];
		const propStreamCT: f32[] = [];
		const propStreamStr: string[] = [];

		let virtualScenegraph: any = {};
		let keyFrameCount = 0;

		const cmds_removed: any[] = [];
		const cmds_add: any[] = [];
		const cmds_update: any[] = [];
		const cmds_startSounds: any[] = [];
		const cmds_stopSounds: any[] = [];
		const unparsedTags: any[] = [];
		const transformsAtDepth: any = {};

		let instanceCNT: number = 0;
		let child: any;
		let i: number;
		const framesLen: number = swfFrames.length;
		let command_recipe_flag: number = 0;
		let audio_commands_cnt: number = 0;
		let labelName: string;
		let fl: number;
		let fl_len: number;
		let isEmpty: boolean;
		let len: number;
		let ct: number;
		let unparsedTag: UnparsedTag;
		let placeObjectTag: PlaceObjectTag;
		let hasCharacter: boolean;
		let awaySymbol: IAsset = null;
		let sessionID: number = -1;
		let swapGraphicsID: number = -1;
		let ratio: number = -1;
		let flashSymbol;
		let graphicsSprite: Sprite;
		let doAdd = true;
		let tag: any;
		MovieClip.movieClipSoundsManagerClass = MovieClipSoundsManager;

		for (i = 0; i < framesLen; i++) {
			noTimelineDebug || console.log('	process frame:', i + 1, '/', framesLen);

			cmds_removed.length = 0;
			cmds_add.length = 0;
			cmds_update.length = 0;
			cmds_startSounds.length = 0;
			cmds_stopSounds.length = 0;
			unparsedTags.length = 0;
			if (swfFrames[i].soundStreamHead) {
				awayMc.initSoundStream(swfFrames[i].soundStreamHead, framesLen);
				//console.log("stream encountered", swfFrames[i].soundStreamHead)
			}
			if (swfFrames[i].soundStreamBlock) {
				awayMc.addSoundStreamBlock(i, swfFrames[i].soundStreamBlock);
				//console.log("stream encountered", swfFrames[i].soundStreamHead)
			}
			if (swfFrames[i].initActionBlocks) {
				awayTimeline.avm1InitActions[i] = swfFrames[i].initActionBlocks;
			}
			if (swfFrames[i].exports) {
				awayTimeline.avm1Exports[i] = swfFrames[i].exports;
				for (key in swfFrames[i].exports) {
					//console.log("\n\nfound export\n\n", swfFrames[i].exports[key]);
					const asset = swfFrames[i].exports[key];
					const awayAsset = getSymbol(asset.symbolId);
					if (!awayAsset) {
						console.log('\n\nerror: no away-asset for export\n\n', swfFrames[i].exports[key]);
					} else {
						if (awayAsset.isAsset) {
							// this is a awayjs asset. we just update its name.
							// all awayjs-assets will get registered on AssetLibrary
							// by name at very end of parseSymbolsToAwayJS function
							awayAsset.name = asset.className.toLowerCase();
						} else {
							// this is a binary asset.
							// should already be handled in AXSecurityDomain.createInitializerFunction
						}
					}
					noExportsDebug || console.log('			added export',
						swfFrames[i].exports[key], asset.className, asset.symbolId, awayAsset);
				}
			}
			// check if this is a empty frame
			isEmpty =
				(!swfFrames[i].controlTags || swfFrames[i].controlTags.length == 0) &&
				(!swfFrames[i].labelNames || swfFrames[i].labelNames.length == 0) &&
				(!swfFrames[i].actionBlocks || swfFrames[i].actionBlocks.length == 0);

			noTimelineDebug || console.log('	process frame:', i + 1, '/', isEmpty, swfFrames[i]);
			if (keyframe_durations.length != 0 && isEmpty) {
				// frame is empty and it is not the first frame
				// we just add to the duration of the last keyframe
				if (isButton) {
					command_recipe_flag = 0;
					command_recipe_flag |= 0x01;
					frameCmdInd.push(cmdStremInd.length);
					keyframe_durations[keyframe_durations.length] = 1;
					frameRecipe.push(command_recipe_flag);
					for (key in virtualScenegraph) {
						child = virtualScenegraph[key];
					}
					virtualScenegraph = {};
					keyFrameCount++;
					//transformsAtDepth[tag.depth.toString()]=null;
					noTimelineDebug || console.log('			remove all to  create empty button frame');
				} else {
					noTimelineDebug || console.log('			extending last frames duration');
					keyframe_durations[keyframe_durations.length - 1] += 1;
				}
			} else {
				// frame is not empty, or it is the first frame, or both
				command_recipe_flag = 0;
				if (isButton) {
					command_recipe_flag |= 0x01;
					for (key in virtualScenegraph) {
						child = virtualScenegraph[key];
					}
					virtualScenegraph = {};
				}
				frameCmdInd.push(cmdStremInd.length);
				keyframe_durations[keyframe_durations.length] = 1;
				if (!isEmpty && swfFrames[i].labelNames && swfFrames[i].labelNames.length > 0) {
					fl_len = swfFrames[i].labelNames.length;
					for (fl = 0; fl < fl_len; fl++) {
						labelName = swfFrames[i].labelNames[fl];
						const originalLabelName = labelName;

						if (this.parser.swfFile.useAVM1) {
							labelName = labelName.toLowerCase();
						}
						if (!awayTimeline._labels[labelName])
							awayTimeline._labels[labelName] = {
								keyFrameIndex: keyFrameCount,
								name: originalLabelName,
							};
					}
				}
				if (!isEmpty && swfFrames[i].actionBlocks && swfFrames[i].actionBlocks.length > 0) {
					awayTimeline.add_framescript(swfFrames[i].actionBlocks, i, awayMc, true);
				}
				if (buttonSound && buttonSound[keyFrameCount] && buttonSound[keyFrameCount].id != 0) {
					awaySymbol = getSymbol(buttonSound[keyFrameCount].id);
					if (awaySymbol) {
						awayTimeline.audioPool[audio_commands_cnt] = {
							cmd: SwfTagCode.CODE_START_SOUND,
							id: buttonSound[keyFrameCount].id,
							sound: awaySymbol,
							props: buttonSound[keyFrameCount].info
						};
						cmds_startSounds.push(audio_commands_cnt++);
					}
				}
				keyFrameCount++;
				if (!isEmpty && swfFrames[i].controlTags && swfFrames[i].controlTags.length > 0) {
					noTimelineDebug || console.log('			Start parsing controltags',
						swfFrames[i].controlTags.length);
					len = swfFrames[i].controlTags.length;
					for (ct = 0; ct < len; ct++) {
						unparsedTag = swfFrames[i].controlTags[ct];
						tag = unparsedTag.tagCode === undefined ?
							unparsedTag : <any> this.parser.getParsedTag(unparsedTag);

						//console.log("parsed tag", tag);
						switch (tag.code) {
							case SwfTagCode.CODE_START_SOUND:
								//console.log("CODE_START_SOUND", tag)
								awaySymbol = getSymbol(tag.soundId);
								if (tag.soundInfo && tag.soundInfo.flags & SoundInfoFlags.Stop) {
									awayTimeline.audioPool[audio_commands_cnt] = {
										cmd: SwfTagCode.CODE_STOP_SOUND,
										id: tag.soundId,
										sound: getSymbol(tag.soundId),
										props: tag.soundInfo,
									};
									noTimelineDebug || console.log('stopsound', tag.soundId, tag.soundInfo, i + 1);
								} else {
									awayTimeline.audioPool[audio_commands_cnt] = {
										cmd: SwfTagCode.CODE_START_SOUND,
										id: tag.soundId,
										sound: getSymbol(tag.soundId),
										props: tag.soundInfo,
									};
									noTimelineDebug || console.log('startsound',
										tag.soundId, tag.soundInfo, awaySymbol, i + 1);
								}
								// todo: volume / pan / other properties
								cmds_startSounds.push(audio_commands_cnt++);
								break;
							case SwfTagCode.CODE_STOP_SOUND:
								//console.log("CODE_STOP_SOUND", tag)
								// todo
								//console.log("stopsound", tag.soundId, tag.soundInfo);
								awayTimeline.audioPool[audio_commands_cnt] = {
									cmd: SwfTagCode.CODE_STOP_SOUND,
									id: tag.soundId,
									sound: getSymbol(tag.soundId),
									props: tag.soundInfo,
								};
								noTimelineDebug || console.log('stopsound', tag.soundId, tag.soundInfo, i + 1);
								cmds_startSounds.push(audio_commands_cnt++);
								break;

							case SwfTagCode.CODE_REMOVE_OBJECT:
							case SwfTagCode.CODE_REMOVE_OBJECT2:
								child = virtualScenegraph[tag.depth];
								if (!child) {
									console.log('Error in timeline. remove cant find the object to remove');
								}

								if (this.parser.swfFile.useAVM1)
									cmds_removed[cmds_removed.length] = { depth: tag.depth | 0 };
								else
									cmds_removed[cmds_removed.length] = { depth: child.sessionID | 0 };

								virtualScenegraph[tag.depth] = null;
								transformsAtDepth[tag.depth.toString()] = null;

								delete virtualScenegraph[tag.depth];
								noTimelineDebug || console.log('				remove', 'depth', tag.depth);

								break;
							case SwfTagCode.CODE_PLACE_OBJECT:
							case SwfTagCode.CODE_PLACE_OBJECT2:
							case SwfTagCode.CODE_PLACE_OBJECT3:
								placeObjectTag = <PlaceObjectTag>tag;
								//console.log("CODE_PLACE_OBJECT", tag.depth | 0, placeObjectTag);
								child = virtualScenegraph[tag.depth];
								hasCharacter = placeObjectTag.symbolId > -1;
								// Check for invalid flag constellations.
								if (placeObjectTag.flags & PlaceObjectFlags.Move) {
									// Invalid case 1: Move flag set but no child found at given depth.
									if (!child) {
										//  Ignore the current tag.
										break;
									}
								}
								awaySymbol = null;
								sessionID = -1;
								swapGraphicsID = -1;
								ratio = -1;

								// possible options:

								// hasCharacter && !child
								//		we need to put a child into the display list.
								//		might need to create sprite for graphics !

								// hasCharacter && child
								//		need to update a child with a new graphic
								//		if the existing child is not a graphic, we need to remove it
								//		and add a new sprite for it, so we can update the graphics there

								// !hasCharacter && child
								//		need to update a child

								// !hasCharacter && !child
								//		something is wrong ?

								if (hasCharacter) {
									//console.log("placeTag symbol id",placeObjectTag.symbolId )
									awaySymbol = getSymbol(placeObjectTag.symbolId);

									if (!awaySymbol) {
										console.warn('Symbol missed:', placeObjectTag.symbolId);
										break;
									}

									flashSymbol = this.parser.dictionary[placeObjectTag.symbolId];
									//addedIds[addedIds.length]=placeObjectTag.symbolId;
									if (awaySymbol.isAsset(Graphics)) {
										swapGraphicsID = placeObjectTag.symbolId;
										if (!awayTimeline.graphicsPool[placeObjectTag.symbolId]) {
											awayTimeline.graphicsPool[placeObjectTag.symbolId] = awaySymbol;
										}

										// register a new instance for this object
										graphicsSprite = this.factory.createSprite(null,
											<Graphics>awaySymbol,
											flashSymbol);
										graphicsSprite.mouseEnabled = false;

										// if this a child is already existing, and it is a sprite,
										// we will just use the swapGraphics command to exchange the graphics it holds
										if (child && child.awayChild.isAsset(Sprite)) {
											sessionID = child.sessionID;
											// a child (sprite) already exists
											// the swapGraphicsId will be handled in the update command
										} else {
											if (placeObjectTag != null
												&& ((placeObjectTag.name && placeObjectTag.name != '')
												|| this._mcIds[placeObjectTag.symbolId]
												|| this._buttonIds[placeObjectTag.symbolId])) {

												if (!placeObjectTag.name || placeObjectTag.name == '')
													placeObjectTag.name = 'instance' +
														placeObjectTag.symbolId + '_' + instanceCNT++;
											}
											if (child) {

												if (this.parser.swfFile.useAVM1)
													cmds_removed[cmds_removed.length] = { depth: tag.depth | 0 };
												else
													cmds_removed[cmds_removed.length] = { depth: child.sessionID | 0 };

												virtualScenegraph[tag.depth] = null;
												transformsAtDepth[tag.depth.toString()] = null;
												delete virtualScenegraph[tag.depth];
												noTimelineDebug	|| console.log(
													'	remove because we want to add a shape at this depth',
													'depth', tag.depth);

											}

											sessionID = sessionIDCount++;

											if ((<any>placeObjectTag).name
												|| (<any>placeObjectTag).variableName
												|| (placeObjectTag.events && placeObjectTag.events.length > 0)) {
												awayTimeline.placeObjectTagsForSessionIDs[sessionID] = placeObjectTag;
											}

											noTimelineDebug || console.log('				add shape',
												'session-id', sessionID, 'depth', tag.depth, tag, awaySymbol);
											child = virtualScenegraph[tag.depth] = {
												sessionID: sessionID,
												id: placeObjectTag.symbolId,
												masks: [],
												isMask: false,
												clipDepth: 0,
												depth: 0,
												awayChild: graphicsSprite,
												name: placeObjectTag.name ? placeObjectTag.name : 'noname',
											};
											cmds_add[cmds_add.length] = {
												sessionID: sessionID,
												depth: tag.depth,
												id: placeObjectTag.symbolId,
												name: placeObjectTag.name,
											};
											cmds_add[cmds_add.length] = {
												sessionID: sessionID,
												depth: tag.depth,
												id: placeObjectTag.symbolId,
												name: placeObjectTag.name };

										}
									} else {
										if (!placeObjectTag.name || placeObjectTag.name == '')
											placeObjectTag.name = 'instance'
												+ placeObjectTag.symbolId + '_' + instanceCNT++;

										sessionID = sessionIDCount++;

										if ((<any>placeObjectTag).name
											|| (<any>placeObjectTag).variableName
											|| (placeObjectTag.events && placeObjectTag.events.length > 0)) {
											awayTimeline.placeObjectTagsForSessionIDs[sessionID] = placeObjectTag;
										}

										doAdd = true;
										if (virtualScenegraph[tag.depth]
											&& virtualScenegraph[tag.depth].id == placeObjectTag.symbolId) {
											doAdd = false;
										} else if (virtualScenegraph[tag.depth]) {
											// if depth is occupied remove existing child
											if (this.parser.swfFile.useAVM1)
												cmds_removed[cmds_removed.length] = { depth: tag.depth | 0 };
											else
												cmds_removed[cmds_removed.length] = {
													depth: virtualScenegraph[tag.depth].sessionID | 0 };
										}
										child = virtualScenegraph[tag.depth] = {
											sessionID: sessionID,
											id: placeObjectTag.symbolId,
											masks: [],
											isMask: false,
											clipDepth: 0,
											depth: 0,
											awayChild: awaySymbol,
											name: placeObjectTag.name ? placeObjectTag.name : 'noname',
										};
										if (doAdd) {
											noTimelineDebug || console.log('				add', 'session-id',
												sessionID, 'depth', tag.depth, tag, awaySymbol);
											cmds_add[cmds_add.length] = {
												sessionID: sessionID,
												depth: tag.depth,
												id: placeObjectTag.symbolId,
												name: placeObjectTag.name };
										}
									}
								}

								if (placeObjectTag.flags & PlaceObjectFlags.HasRatio) {
									if (!awaySymbol) awaySymbol = getSymbol(child.id);
									if (awaySymbol.isAsset(MorphSprite)) ratio = placeObjectTag.ratio;
								}

								if (child) {
									cmds_update[cmds_update.length] = {
										child: child, placeObjectTag: placeObjectTag,
										swapGraphicsID: swapGraphicsID,
										ratio: ratio, depth: tag.depth };
									noTimelineDebug || console.log('				update',
										'session-id', child.sessionID, 'hasCharacter',
										hasCharacter, 'depth', tag.depth, 'swapGraphicsID',
										swapGraphicsID, tag, awaySymbol);

								} else {
									throw 'error in add command';
								}

								break;
							default:
								console.log('unknown timeline command tag', tag);
						}

						//console.log("parsed a tag: ", tag);
					}

					// create remove commands:
					let start_index = remChildStream.length;
					let command_cnt = cmds_removed.length;
					if (command_cnt) {
						start_index = remChildStream.length;
						for (let cmd = 0; cmd < command_cnt; cmd++) {
							remChildStream.push(cmds_removed[cmd].depth);
						}
						command_recipe_flag |= 0x02;
						cmdStreamLength.push(remChildStream.length - start_index);
						cmdStremInd.push(start_index);
						if (!noTimelineDebug) {
							for (let iDebug: number = 0; iDebug < cmds_removed.length; iDebug++) {
								console.log('				removeCmd', cmds_removed[iDebug]);
							}
						}
					}

					// create add commands:
					command_cnt = cmds_add.length;
					if (command_cnt) {
						start_index = addChildStream.length;
						for (let cmd = 0; cmd < command_cnt; cmd++) {
							addChildStream.push(cmds_add[cmd].sessionID);
							addChildStream.push(cmds_add[cmd].depth);
							addChildStream.push(cmds_add[cmd].id);
						}
						command_recipe_flag |= 0x04;
						cmdStreamLength.push(command_cnt);
						cmdStremInd.push(start_index / 3);
						if (!noTimelineDebug) {
							for (let iDebug: number = 0; iDebug < cmds_add.length; iDebug++) {
								console.log('				addCommands', cmds_add[iDebug]);
							}
						}
					}

					// create update commands:
					command_cnt = cmds_update.length;

					// virtualScenegraph is already updated.
					// making sure all childs update their masking if needed:

					for (key in virtualScenegraph) {
						virtualScenegraph[key].oldMasks = virtualScenegraph[key].masks;
						virtualScenegraph[key].masks = [];
						virtualScenegraph[key].maskingChanged = false;
					}
					// for newly added objects, we translate the clipDepth to isMask
					if (command_cnt) {
						for (let cmd: number = 0; cmd < command_cnt; cmd++) {
							placeObjectTag = cmds_update[cmd].placeObjectTag;
							child = cmds_update[cmd].child;
							child.maskingChanged = true;
							if (placeObjectTag.flags & 64 /* HasClipDepth */) {
								virtualScenegraph[placeObjectTag.depth].isMask = true;
								virtualScenegraph[placeObjectTag.depth].clipDepth = placeObjectTag.clipDepth - 1;
								virtualScenegraph[placeObjectTag.depth].depth = placeObjectTag.depth;
							}
						}
					}
					// now we are sure all scenegraphobjects know if they are a mask.
					// we loop over all of them and apply the masking to the maskee
					for (key in virtualScenegraph) {
						if (virtualScenegraph[key].isMask) {
							let depth = virtualScenegraph[key].clipDepth;
							while (depth > virtualScenegraph[key].depth) {
								if (virtualScenegraph[depth])
									virtualScenegraph[depth].masks.push(virtualScenegraph[key].sessionID);
								depth--;
							}
						}
					}

					let m = 0;
					let mLen = 0;
					const childsWithMaskChanges = [];
					// check for what objects the masking has been changed in this frame
					for (key in virtualScenegraph) {
						const myChild = virtualScenegraph[key];
						myChild.masks.sort();
						myChild.oldMasks.sort();
						if (myChild.masks.length != myChild.oldMasks.length) {
							childsWithMaskChanges.push(myChild);
							myChild.maskingChanged = true;
						} else {
							m = 0;
							mLen = myChild.masks.length;
							for (m = 0; m < mLen; m++) {
								if (myChild.masks[m] != myChild.oldMasks[m]) {
									childsWithMaskChanges.push(myChild);
									myChild.maskingChanged = true;
									break;
								}
							}
						}
					}

					mLen = childsWithMaskChanges.length;
					for (m = 0; m < mLen; m++) {
						let hasCmd = false;
						if (command_cnt) {
							for (let cmd = 0; cmd < command_cnt; cmd++) {
								if (cmds_update[cmd].child == childsWithMaskChanges[m]) {
									hasCmd = true;
								}
							}
						}
						if (!hasCmd) {
							cmds_update[cmds_update.length] = {
								child: childsWithMaskChanges[m],
								placeObjectTag: null,
								swapGraphicsID: null,
								ratio: null, depth: null };

						}
					}

					command_cnt = cmds_update.length;
					if (command_cnt) {
						// process updated props
						if (!noTimelineDebug) {
							for (let iDebug: number = 0; iDebug < cmds_update.length; iDebug++) {
								console.log('				cmds_update', cmds_update[iDebug]);
							}
						}

						start_index = updChildStream.length;
						let updateCnt = 0;
						for (let cmd = 0; cmd < command_cnt; cmd++) {
							const updateCmd = cmds_update[cmd];
							placeObjectTag = updateCmd.placeObjectTag;
							child = updateCmd.child;

							const childStartIdx: number = propStreamType.length;
							let num_updated_props = 0;

							if (updateCmd.swapGraphicsID != null && updateCmd.swapGraphicsID >= 0) {
								num_updated_props++;
								propStreamType.push(TimelineActionType.SWAP_GRAPHICS);
								propStreamIndex.push(propStreamInt.length);
								propStreamInt.push(updateCmd.swapGraphicsID);
							}

							const isButtonOrMc = placeObjectTag
								&& (this._buttonIds[placeObjectTag.symbolId] || this._mcIds[placeObjectTag.symbolId]);
							if (placeObjectTag
								&& ((placeObjectTag.name && placeObjectTag.name != '')
								|| isButtonOrMc)) {
								num_updated_props++;
								if (this._buttonIds[placeObjectTag.symbolId]) {
									propStreamType.push(TimelineActionType.UPDATE_BUTTON_NAME);
								} else {
									propStreamType.push(TimelineActionType.UPDATE_NAME);
								}
								propStreamIndex.push(propStreamStr.length);
								propStreamStr.push(placeObjectTag.name);
							}

							if (placeObjectTag != null && placeObjectTag.flags & PlaceObjectFlags.HasMatrix) {
								num_updated_props++;
								//matrix type: 1=all, 11=no position, 12=no scale
								propStreamType.push(TimelineActionType.UPDATE_MTX);
								propStreamIndex.push(propStreamMatrixAll.length / 6);

								// todo: we can save memory by checking if only scale or position was changed,
								// but it means we would need to check against the matrix
								// of the current child, not against identy matrix

								// there seem to a some transforms coming in with scale=0 when it should be scale=1
								// This is a flash-bug (?) todo with sharing graphics across multiple mc
								// if we set a object to scale=0 on purpose in Flash, we still get a scale>0 in swf,
								// so looks like we can fix this by making sure that scale=0 is converted to scale = 1

								if (placeObjectTag.matrix.a == 0
									&& placeObjectTag.matrix.b == 0
									&& placeObjectTag.matrix.c == 0
									&& placeObjectTag.matrix.d != 0) {
									placeObjectTag.matrix.a = 1;
								} else if (placeObjectTag.matrix.d == 0
									&& placeObjectTag.matrix.b == 0
									&& placeObjectTag.matrix.c == 0
									&& placeObjectTag.matrix.a != 0) {
									placeObjectTag.matrix.d = 1;
								}

								matrixToStream(propStreamMatrixAll, propStreamMatrixAll.length, placeObjectTag.matrix);
								transformsAtDepth[updateCmd.depth.toString()] = placeObjectTag.matrix;
							} else if (updateCmd.depth != null) {
								const exTransform = transformsAtDepth[updateCmd.depth.toString()];
								if (exTransform) {
									num_updated_props++;
									//matrix type: 1=all, 11=no position, 12=no scale
									propStreamType.push(TimelineActionType.UPDATE_MTX);
									propStreamIndex.push(propStreamMatrixAll.length / 6);

									matrixToStream(propStreamMatrixAll, propStreamMatrixAll.length, exTransform);
								}
							}

							if (placeObjectTag != null && placeObjectTag.flags & PlaceObjectFlags.HasColorTransform) {
								//console.log("PlaceObjectFlags.HasColorTransform", placeObjectTag.cxform);
								propStreamType.push(TimelineActionType.UPDATE_CMTX);
								propStreamIndex.push(propStreamCT.length / 8);
								num_updated_props++;
								colorMatrixToStream(propStreamCT, propStreamCT.length, placeObjectTag.cxform);
							}

							if (updateCmd.ratio != null && updateCmd.ratio >= 0) {
								num_updated_props++;
								propStreamType.push(TimelineActionType.SET_RATIO);
								propStreamIndex.push(propStreamInt.length);
								propStreamInt.push(updateCmd.ratio | 0);
								//console.log("PlaceObjectFlags.HasRatio", placeObjectTag, child);
							}

							if (child.maskingChanged) {
								num_updated_props++;
								propStreamType.push(TimelineActionType.UPDATE_MASKS);
								propStreamIndex.push(propStreamInt.length);
								propStreamInt.push(child.masks.length);
								for (const val of child.masks) propStreamInt.push(val);
							}
							if (placeObjectTag != null && placeObjectTag.flags & PlaceObjectFlags.HasClipDepth) {
								num_updated_props++;
								propStreamType.push(TimelineActionType.ENABLE_MASKMODE);
								propStreamIndex.push(0);
							}

							if (placeObjectTag != null && placeObjectTag.flags & PlaceObjectFlags.HasFilterList) {
								//console.log("encountered filters", placeObjectTag.filters);
								num_updated_props++;
								propStreamType.push(TimelineActionType.UPDATE_FILTERS);
								propStreamIndex.push(propStreamInt.length);
								propStreamInt.push(propStreamFilters.length);
								propStreamInt.push(placeObjectTag.filters.length);
								for (let f = 0; f < placeObjectTag.filters.length; f++)
									propStreamFilters.push(placeObjectTag.filters[f]);
							}

							if (placeObjectTag != null && placeObjectTag.flags & PlaceObjectFlags.HasVisible) {
								num_updated_props++;
								propStreamType.push(TimelineActionType.UPDATE_VISIBLE);
								propStreamIndex.push(placeObjectTag.visibility ? 1 : 0);
							}

							if (placeObjectTag != null && placeObjectTag.flags & PlaceObjectFlags.HasBlendMode) {
								num_updated_props++;
								propStreamType.push(TimelineActionType.UPDATE_BLENDMODE);
								propStreamIndex.push(placeObjectTag.blendMode);
							}

							if (num_updated_props > 0) {
								updateCnt++;
								updChildStream.push(child.sessionID);
								updСhildStreamPropsInd.push(childStartIdx);
								updChildStreamPropsLen.push(num_updated_props);
							}
						}
						if (updateCnt > 0) {
							command_recipe_flag |= 0x08;
							cmdStreamLength.push(command_cnt);
							cmdStremInd.push(start_index);
						}
					}
					command_cnt = cmds_startSounds.length;
					if (command_cnt) {
						command_recipe_flag |= 16;

						start_index = addSoundsStream.length;
						//console.log("startsound", tag.soundId, tag.soundInfo, awaySymbol);
						for (let cmd = 0; cmd < command_cnt; cmd++) {
							addSoundsStream.push(cmds_startSounds[cmd]);
							//console.log("add", cmds_add[cmd].childID , cmds_add[cmd].depth);
						}
						cmdStreamLength.push(command_cnt);
						cmdStremInd.push(start_index);
						noTimelineDebug || console.log('				cmds_startSounds',
							cmds_startSounds.length, cmds_startSounds);
					}
				} else {
					if (isButton) {
						//	sessionID = awayTimeline.potentialPrototypes.length;
						//	awayTimeline.registerPotentialChild(this.myTestSprite);
					}
					//console.log("empty frame");
				}
				if (frameRecipe.length == 0) {
					command_recipe_flag |= 0x01;
				}
				frameRecipe.push(command_recipe_flag);
			}
		}

		const buttonFrameNames: string[] = ['_up', '_over', '_down', '_hit'];
		if (framesLen == 4) {
			let isButtonFrames: number = 0;
			for (i = 0; i < framesLen; i++) {

				if (swfFrames[i].labelNames
					&& swfFrames[i].labelNames.length > 0
					&& swfFrames[i].labelNames[0] == buttonFrameNames[i]) {
					isButtonFrames++;
				}
			}
			if (isButtonFrames == 4) {
				isButton = true;
			}
		}

		awayTimeline.numKeyFrames = keyFrameCount;
		awayTimeline.keyframe_durations = new Uint32Array(keyframe_durations);
		awayTimeline.frame_command_indices = new Uint32Array(frameCmdInd);
		awayTimeline.frame_recipe = new Uint32Array(frameRecipe);
		awayTimeline.command_length_stream = new Uint32Array(cmdStreamLength);
		awayTimeline.command_index_stream = new Uint32Array(cmdStremInd);
		awayTimeline.add_child_stream = new Uint32Array(addChildStream);
		awayTimeline.add_sounds_stream = new Uint32Array(addSoundsStream);
		awayTimeline.remove_child_stream = new Uint32Array(remChildStream);
		awayTimeline.update_child_stream = new Uint32Array(updChildStream);
		awayTimeline.update_child_props_indices_stream = new Uint32Array(updСhildStreamPropsInd);
		awayTimeline.update_child_props_length_stream = new Uint32Array(updChildStreamPropsLen);
		awayTimeline.property_type_stream = new Uint32Array(propStreamType);
		awayTimeline.property_index_stream = new Uint32Array(propStreamIndex);
		awayTimeline.properties_stream_int = new Uint32Array(propStreamInt);

		awayTimeline.properties_stream_f32_mtx_scale_rot = new Float32Array(propStramMatrixSR);
		awayTimeline.properties_stream_f32_mtx_pos = new Float32Array(propStreamMatrixPos);
		awayTimeline.properties_stream_f32_mtx_all = new Float32Array(propStreamMatrixAll);
		awayTimeline.properties_stream_f32_ct = new Float32Array(propStreamCT);
		awayTimeline.properties_stream_strings = propStreamStr;
		awayTimeline.properties_stream_filters = propStreamFilters;

		awayTimeline.init();

		if (isButton) {
			// this is a button - set ButtonActions and also get the hitArea from the last frame
			awayMc.buttonMode = true;
			awayTimeline.isButton = true;
			if (buttonActions) {
				awayTimeline.avm1ButtonActions = buttonActions;
			}
			awayTimeline.extractHitArea(awayMc);
		} else {
			//a movieclip that isn't a button automatically defaults to mouesEnabled = false
			awayMc.mouseEnabled = false;
		}
		return awayMc;
	}
}
