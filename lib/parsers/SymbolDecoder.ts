import { 
    Billboard, 
    IFilter, 
    ISceneGraphFactory, 
    MorphSprite, 
    MovieClip, 
    Sprite, 
    TesselatedFontTable, 
    TextField, 
    TextFormat, 
    TextFormatAlign, 
    Timeline, 
    TimelineActionType 
} from "@awayjs/scene";
import { 
    PlaceObjectFlags, 
    PlaceObjectTag, 
    SoundInfoFlags, 
    SwfTagCode, 
    TextFlags 
} from "../factories/base/SWFTags";

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
    SYMBOL_TYPE 
} from './ISymbol';

import { MovieClipSoundsManager } from "../factories/timelinesounds/MovieClipSoundsManager"
import { BitmapImage2D } from "@awayjs/stage";
import { MethodMaterial } from "@awayjs/materials";
import { Graphics, Shape, UnparsedTag } from "@awayjs/graphics";
import { SWFFrame } from "./SWFFrame";
import { ColorUtils, IAsset, Rectangle, WaveAudio } from "@awayjs/core";
import { Matrix, ColorTransform } from "../factories/base/SWFTags"
import { SWFParser } from './SWFParser';

const noTimelineDebug = true;
const noExportsDebug = true;

function matrixToStream(stream: number[] | Uint32Array, index: number, matrix: Matrix) {

    stream[index ++] = matrix.a;
    stream[index ++] = matrix.b;
    stream[index ++] = matrix.c;
    stream[index ++] = matrix.d;
    stream[index ++] = matrix.tx / 20;
    stream[index ++] = matrix.ty / 20;

    return index;
}

function colorMatrixToStream(stream: number[] | Uint32Array, index: number, matrix: ColorTransform) {
    
    stream[index ++] = matrix.redMultiplier / 255;
    stream[index ++] = matrix.greenMultiplier / 255;
    stream[index ++] = matrix.blueMultiplier / 255;
    stream[index ++] = matrix.alphaMultiplier / 255;
    stream[index ++] = matrix.redOffset;
    stream[index ++] = matrix.greenOffset;
    stream[index ++] = matrix.blueOffset;
    stream[index ++] = matrix.alphaOffset;

    return index;
}

const TF_ALIGNS: string[] = [
    TextFormatAlign.LEFT, 
    TextFormatAlign.RIGHT, 
    TextFormatAlign.CENTER, 
    TextFormatAlign.JUSTIFY
];

export class SymbolDecoder {

    private _awaySymbols: NumberMap<IAsset> = {};
    private _buttonIds: NumberMap<boolean> = {};
    private _mcIds: NumberMap<boolean> = {};

    /**
     * @description Force reqursive decoding of nested symbols, disable it when sure that symbol exist
     */
    public reqursive: boolean = true;

    constructor(public parser: SWFParser) {}

    get factory() : ISceneGraphFactory {
        return this.parser.factory;
    }

    get awaySymbols() {
        return this._awaySymbols;
    }

    private _createShape(symbol: IShapeSymbol, target?: Shape, name?: string): IAsset {
        
        const sh = symbol as IShapeSymbol;
        //console.warn("Warning: SWF contains shapetweening!!!");
        //symbol.shape.name = symbol.id;
        sh.shape.name = name ||  "AwayJS_shape_" + symbol.id.toString();
        sh.shape.className = symbol.className;

        return sh.shape;
        //this._awaySymbols[dictionary[i].id] = sh.shape;
        //assetsToFinalize[dictionary[i].id] = sh.shape;
    }

    private _createFont(symbol: ISymbol, target?: any, name?: string): IAsset {
        //symbol.away._smybol=symbol;
        symbol.away.className = symbol.className;
        return symbol as any;
    }

    private _createSprite(symbol: ISpriteSymbol, target?: MovieClip, name?: string): IAsset {
        noTimelineDebug || console.log("start parsing timeline: ", symbol);

        const awayMc = this.framesToTimeline(target, symbol, symbol.frames, null, null);

        (<any>awayMc).className = symbol.className;
        awayMc.name = name || "AwayJS_mc_" + symbol.id.toString();

        if(awayMc.buttonMode) {
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

        const flashFont = (this.reqursive ? this.createAwaySymbol(symbol.tag.fontId) : this._awaySymbols[symbol.tag.fontId]) as any;

        if (flashFont) {
            target.textFormat.font = flashFont.away;
            target.textFormat.font_table = <TesselatedFontTable>flashFont.away.get_font_table(flashFont.fontStyleName, TesselatedFontTable.assetType);
        }

        const tag = symbol.tag;
        target.textFormat.size = tag.fontHeight / 20;
        //awayText.textFormat.color = (symbol.tag.flags & TextFlags.HasColor)?ColorUtils.f32_RGBA_To_f32_ARGB(symbol.tag.color):0xffffff;
        target.textColor = (tag.flags & TextFlags.HasColor) ? ColorUtils.f32_RGBA_To_f32_ARGB(tag.color) : 0xffffff;
        target.textFormat.leftMargin = tag.leftMargin / 20;
        target.textFormat.rightMargin = tag.rightMargin / 20;
        target.textFormat.letterSpacing = tag.letterSpacing / 20;
        target.textFormat.leading = tag.leading / 20;
        target.textFormat.align = TF_ALIGNS[tag.align];

        target.textOffsetX = symbol.fillBounds.xMin / 20;
        target.textOffsetY = symbol.fillBounds.yMin / 20;
        target.width = ((symbol.fillBounds.xMax - symbol.fillBounds.xMin) / 20);
        target.height = (symbol.fillBounds.yMax - symbol.fillBounds.yMin) / 20;
        target.border = !!(tag.flags & TextFlags.Border);
        target.background = target.border;

        target.multiline = (tag.flags & TextFlags.Multiline) ? true : false;
        target.wordWrap = (tag.flags & TextFlags.WordWrap) ? true : false;
        target.selectable = tag.flags ? !(tag.flags & TextFlags.NoSelect) : false;

        if (tag.maxLength && tag.maxLength > 0) {
            target.maxChars = tag.maxLength;
        }
        if (tag.flags & TextFlags.ReadOnly) {
            target.type = "dynamic";
        }
        else {
            target.type = "input";
        }

        if (tag.flags & TextFlags.Html) {
            target.html = true;
            if (tag.initialText && tag.initialText != "")
                target.htmlText = tag.initialText;
        }
        else {
            target.html = false;
            if (tag.initialText && tag.initialText != "")
                target.text = tag.initialText;
        }
        target.name = name || "tf_" + symbol.id.toString();

        return target;
    }

    private _createSound(symbol: ISymbol, target?: any, name?: string): IAsset {
    
        const awaySound: WaveAudio = (<WaveAudio>this.parser.awayUnresolvedSymbols[symbol.id]);

        if (awaySound) {
            (<any>awaySound).className = this.parser.symbolClassesMap[symbol.id] || null;
            awaySound.name = (<any>awaySound).className;
            //awaySound.play(0,false);
        } else {
            console.warn("SWF-parser: no sound loaded for sound-id:", symbol.id);
        }
        
        return awaySound;
    }

    private _createButton(symbol: IButtonSymbol, target?: any, name?: string): IAsset {
        noTimelineDebug || console.log("start parsing button: ", symbol);
        target = this.framesToTimeline(target, symbol, null, symbol.states, symbol.buttonActions, symbol.buttonSounds);
        //awayMc._symbol=symbol;
        target.name = name || "AwayJS_button_" + symbol.id.toString();
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

    private _createLabel(symbol: ILabelSymbol, target?: any, name?: string): IAsset {        
        target = target || this.factory.createTextField(symbol);

        let font = null;
        let invalid_font = false;
        (<any>target).className = symbol.className;
        for (var r = 0; r < symbol.records.length; r++) {
            var record: any = symbol.records[r];
            if (record.fontId) {
                font = this.reqursive ?  this.createAwaySymbol(record.fontId) : this._awaySymbols[record.fontId];
                if (font) {

                    //awayText.textFormat.font=font.away;
                    record.font_table = <TesselatedFontTable>font.away.get_font_table(font.fontStyleName, TesselatedFontTable.assetType);
                    if (!record.font_table) {
                        invalid_font = true;
                        console.log("no font_table set");
                    }
                    //record.font_table=font.away.font_styles[0];
                }
            }
        }

        target.staticMatrix = symbol.matrix;
        target.textOffsetX = symbol.fillBounds.xMin / 20;
        target.textOffsetY = symbol.fillBounds.yMin / 20;
        target.width = (symbol.fillBounds.xMax / 20 - symbol.fillBounds.xMin / 20) - 1;
        target.height = (symbol.fillBounds.yMax / 20 - symbol.fillBounds.yMin / 20) - 1;
        
        if (!invalid_font) {
            target.setLabelData(symbol);
        }

        target.name = name || "AwayJS_label_" + symbol.id.toString();
        /*
        assetsToFinalize[dictionary[i].id] = target;
        this._awaySymbols[dictionary[i].id] = target;
    */
        target.selectable = (symbol.tag.flags && !(symbol.tag.flags & TextFlags.NoSelect));

        return target;
    }

    private _createImage(symbol: IImageSymbol, target?: BitmapImage2D, name?: string): IAsset 
    {
        target = target || (<BitmapImage2D>this.parser.awayUnresolvedSymbols[symbol.id]);
     
        if (!target && symbol.definition) {
            const def = symbol.definition;
            target = new BitmapImage2D(def.width, def.height, true, 0xff0000, false);
            if (def.data.length != (4 * def.width * def.height)
                && def.data.length != (3 * def.width * def.height)) 
            {
                def.data = new Uint8ClampedArray(4 * def.width * def.height);
                //symbol.definition.data.fill
            }
            target.setPixels(new Rectangle(0, 0, def.width, def.height), def.data);
        }
        if (target) {

            (<any>target).className = this.parser.symbolClassesMap[symbol.id] ? this.parser.symbolClassesMap[symbol.id] : symbol.className;
            target.name = (<any>target).className;
            
            //assetsToFinalize[dictionary[i].id] = target;
        }

        return target;
    }

    public _createBinary(symbol: IBinarySymbol, target?: any, name?: string): IAsset {
        
        if ((<any>this.factory).createBinarySymbol)
            (<any>this.factory).createBinarySymbol(symbol);
        
        /*
        const bin = new ByteArray(bs.byteLength);
        const asset = new GenericAsset<ByteArray>(bin, bs.className, ByteArray);
        bin.setArrayBuffer(bs.data.buffer);
        */
        return null;
    }

    public _createVideo(symbol: IVideoSymbol, target: any, name?: string): IAsset {
        const dummyVideo = new BitmapImage2D(symbol.width, symbol.height, false, 0x00ff00, false);
        dummyVideo._symbol = symbol;

        (<any>dummyVideo).className = this.parser.symbolClassesMap[symbol.id] ? this.parser.symbolClassesMap[symbol.id] : symbol.className;
        dummyVideo.name = (<any>dummyVideo).className;

        return dummyVideo;
    }

    public createAwaySymbol<T extends IAsset = IAsset>(symbol: ISymbol | number, target?: IAsset, name?: string): T
    {
        if(typeof symbol === 'number') {
            // Return existed away symbol by ID, skip getSymbol
            if(!target && this._awaySymbols[symbol]) {
                return this._awaySymbols[symbol] as T;
            }

            symbol = this.parser.getSymbol(symbol) as ISymbol;
        }

        if(!symbol) {
            throw new Error("Symbol can't be null");
        }

        // return existed away symbol by ID inside symbol
        if(!target && this._awaySymbols[symbol.id]) {
            return this._awaySymbols[symbol.id] as T;
        }
    
        let asset: IAsset;

        //Stat.rec("parser").rec("symbols").rec("away").begin();

        //symbol.className && console.log(symbol.type, symbol.className);
        switch (symbol.type) {
            case SYMBOL_TYPE.MORPH:
            {
                asset = this._createShape(symbol, target as Shape, name || "AwayJS_morphshape_" + symbol.id.toString());
                break;
            }
            case SYMBOL_TYPE.SHAPE:
            {
                asset = this._createShape(symbol, target as Shape, name);
                break;
            }
            case SYMBOL_TYPE.FONT:
            {
                asset = this._createFont(symbol, target as any, name);
                break;
            }
            case SYMBOL_TYPE.SPRITE:
            {        
                asset = this._createSprite(symbol as ISpriteSymbol, target as MovieClip, name)
                break;
            }
            case SYMBOL_TYPE.TEXT:
            {
                asset = this._createText(symbol as ITextSymbol, target as TextField, name)
                break;
            }
            case SYMBOL_TYPE.SOUND:
            {
                asset = this._createSound(symbol, target, name);
                break;
            }
            case SYMBOL_TYPE.BUTTON:
            {
                asset = this._createButton(symbol as IButtonSymbol, target, name);
                break;
            }
            case SYMBOL_TYPE.LABEL:
            {
                asset = this._createLabel(symbol as ILabelSymbol, target, name);
                break;
            }
            case SYMBOL_TYPE.IMAGE:
            {
                asset = this._createImage(symbol as IImageSymbol, target as BitmapImage2D, name);
                break;
            }
            case SYMBOL_TYPE.BINARY: 
            {
                asset = this._createBinary(symbol as IBinarySymbol, target, name);
                break;
            }
            case SYMBOL_TYPE.VIDEO:
            {
                asset = this._createVideo(symbol as IVideoSymbol, target, name);
                break;
            }
            default:
                throw Error ("Unknown symbol type:" + symbol.type);
        }
 
        this._awaySymbols[symbol.id] = asset;

        this.parser.registerAwayAsset(asset, symbol);
        
        return asset as T;
    
    }

    framesToTimeline(awayMc: MovieClip, symbol: any, swfFrames: SWFFrame[], states: any, buttonActions: any, buttonSound: any = null): MovieClip {
        if (!states && !swfFrames) {
            throw ("error when creating timeline - neither movieclip frames nor button-states present");
        }

        const getSymbol = this.reqursive ? 
            (id: number) => (this._awaySymbols[id] || this.createAwaySymbol(id)) : 
            (id: number) => this._awaySymbols[id];

        //console.log("swfFrames", swfFrames);
        var isButton: boolean = false;
        var key: string;
        symbol.isButton = false;
        if (states && !swfFrames) {
            isButton = true;
            symbol.isButton = true;
            swfFrames = [];
            for (key in states) {
                var newSWFFrame: SWFFrame = new SWFFrame();
                newSWFFrame.controlTags = states[key];
                newSWFFrame.buttonStateName = key;
                swfFrames[swfFrames.length] = newSWFFrame;
                //console.log("buttonSound ", buttonSound);
            }
        }

        awayMc = awayMc || this.factory.createMovieClip(null, symbol);
        awayMc.symbolID = symbol.id;

        var awayTimeline: Timeline = awayMc.timeline;

        var keyframe_durations: number[] = [];
        var frameCmdInd: number[] = [];
        var frameRecipe: number[] = [];
        var cmdStreamLength: number[] = [];
        var cmdStremInd: number[] = [];
        var addChildStream: number[] = [];
        var addSoundsStream: number[] = [];
        /**
         * @description Remove Child Stream
         */
        var remChildStream: number[] = [];
        /**
         * @description Update Child Stream
         */
        var updChildStream: number[] = [];
        /**
         * @description Update Child Stream: Property Index
         */
        var updСhildStreamPropsInd: number[] = [];
        
        /**
         * @description Update Child Stream: Property Lenght 
         */
        var updChildStreamPropsLen: number[] = [];

        
        var propStreamType: number[] = [];
        var propStreamIndex: number[] = [];
        var propStreamInt: i32[] = [];
        var propStreamFilters: IFilter[] = [];

        /**
         * @description Matrix: Scale + Rotation props,
         * @type {Float32Array}
         */ 
        var propStramMatrixSR: f32[] = [];
        
        /**
         * @description Matrix: Position props,
         * @type {Float32Array}
         */ 
        var propStreamMatrixPos: f32[] = [];
        var propStreamMatrixAll: f32[] = [];
        var propStreamCT: f32[] = [];
        var propStreamStr: string[] = [];

        var virtualScenegraph: any = {};
        var freeChilds: any = {};
        var keyFrameCount = 0;
        var framesLen: number = 0;

        var cmds_removed: any[] = [];
        var cmds_add: any[] = [];
        var cmds_update: any[] = [];
        var cmds_startSounds: any[] = [];
        var cmds_stopSounds: any[] = [];
        var unparsedTags: any[] = [];
        var transformsAtDepth: any = {};

        var instanceCNT: number = 0;
        var child: any;
        var name: string;
        var freeChildsForID: any;
        var i: number;
        var framesLen: number = swfFrames.length;
        var command_recipe_flag: number = 0;
        var audio_commands_cnt: number = 0;
        var labelName: string;
        var fl: number;
        var fl_len: number;
        var isEmpty: boolean;
        var len: number;
        var ct: number;
        var unparsedTag: UnparsedTag;
        var placeObjectTag: PlaceObjectTag;
        var hasCharacter: boolean;
        var awaySymbol: IAsset = null;
        var sessionID: number = -1;
        var swapGraphicsID: number = -1;
        var ratio: number = -1;
        var flashSymbol;
        var graphicsSprite: Sprite;
        var doAdd = true;
        var tag: any;
        MovieClip.movieClipSoundsManagerClass = MovieClipSoundsManager;

        for (i = 0; i < framesLen; i++) {
            noTimelineDebug || console.log("	process frame:", i + 1, "/", framesLen);

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
                    let asset = swfFrames[i].exports[key];
                    let awayAsset = getSymbol(asset.symbolId);
                    if (!awayAsset) {
                        console.log("\n\nerror: no away-asset for export\n\n", swfFrames[i].exports[key]);
                    }
                    else {
                        if (awayAsset.isAsset) {
                            //  this is a awayjs asset. we just update its name. 
                            //  all awayjs-assets will get registered on AssetLibrary by name at very end of parseSymbolsToAwayJS function
                            awayAsset.name = asset.className.toLowerCase();
                        }/*
                        else if (awayAsset.away) {
                            // this is a font. for now we do nothing (?)
                        }*/
                        else {
                            // this is a binary asset. should already be handled in AXSecurityDomain.createInitializerFunction
                        }
                    }
                    noExportsDebug || console.log("			added export", swfFrames[i].exports[key], asset.className, asset.symbolId, awayAsset);
                }
            }
            // check if this is a empty frame
            isEmpty = ((!swfFrames[i].controlTags || swfFrames[i].controlTags.length == 0) &&
                (!swfFrames[i].labelNames || swfFrames[i].labelNames.length == 0) &&
                (!swfFrames[i].actionBlocks || swfFrames[i].actionBlocks.length == 0));




            noTimelineDebug || console.log("	process frame:", i + 1, "/", isEmpty, swfFrames[i]);
            if ((keyframe_durations.length != 0) && isEmpty) {
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
                        freeChildsForID = freeChilds[child.id];
                        if (!freeChildsForID) {
                            freeChildsForID = freeChilds[child.id] = {};
                        }
                        name = child.name;//+"#"+key;
                        if (!freeChildsForID[name]) {
                            freeChildsForID[name] = [];
                        }
                        freeChildsForID[name].push(child.sessionID);

                    }
                    virtualScenegraph = {};
                    keyFrameCount++;
                    //transformsAtDepth[tag.depth.toString()]=null;
                    noTimelineDebug || console.log("			remove all to  create empty button frame");
                }
                else {
                    noTimelineDebug || console.log("			extending last frames duration");
                    keyframe_durations[keyframe_durations.length - 1] += 1;
                }
            }
            else {
                // frame is not empty, or it is the first frame, or both
                command_recipe_flag = 0;
                if (isButton) {
                    command_recipe_flag |= 0x01;
                    for (key in virtualScenegraph) {
                        child = virtualScenegraph[key];
                        freeChildsForID = freeChilds[child.id];
                        if (!freeChildsForID) {
                            freeChildsForID = freeChilds[child.id] = {};
                        }
                        name = child.name;//+"#"+key;
                        if (!freeChildsForID[name]) {
                            freeChildsForID[name] = [];
                        }
                        freeChildsForID[name].push(child.sessionID);

                    }
                    virtualScenegraph = {};
                }
                frameCmdInd.push(cmdStremInd.length);
                keyframe_durations[keyframe_durations.length] = 1;
                if (!isEmpty && (swfFrames[i].labelNames && swfFrames[i].labelNames.length > 0)) {
                    fl_len = swfFrames[i].labelNames.length;
                    for (fl = 0; fl < fl_len; fl++) {
                        labelName = swfFrames[i].labelNames[fl];
                        let originalLabelName = labelName;
                        if (this.parser.swfFile.swfVersion <= 9) {
                            labelName = labelName.toLowerCase();
                        }
                        if (!awayTimeline._labels[labelName])
                            awayTimeline._labels[labelName] = {
                                keyFrameIndex: keyFrameCount,
                                name: originalLabelName
                            }
                    }
                }
                if (!isEmpty && swfFrames[i].actionBlocks && swfFrames[i].actionBlocks.length > 0) {
                    awayTimeline.add_framescript(swfFrames[i].actionBlocks, i, awayMc);
                }
                if (buttonSound && buttonSound[keyFrameCount] && buttonSound[keyFrameCount].id != 0) {
                    awaySymbol = getSymbol(buttonSound[keyFrameCount].id);
                    if (awaySymbol) {
                        awayTimeline.audioPool[audio_commands_cnt] = { cmd: SwfTagCode.CODE_START_SOUND, id: buttonSound[keyFrameCount].id, sound: awaySymbol, props: buttonSound[keyFrameCount].info };
                        cmds_startSounds.push(audio_commands_cnt++);
                    }
                }
                keyFrameCount++;
                if (!isEmpty && swfFrames[i].controlTags && swfFrames[i].controlTags.length > 0) {
                    noTimelineDebug || console.log("			Start parsing controltags", swfFrames[i].controlTags.length);
                    len = swfFrames[i].controlTags.length;
                    for (ct = 0; ct < len; ct++) {
                        unparsedTag = swfFrames[i].controlTags[ct];
                        tag = unparsedTag.tagCode === undefined ? unparsedTag : <any>this.parser.getParsedTag(unparsedTag);

                        //console.log("parsed tag", tag);
                        switch (tag.code) {
                            case SwfTagCode.CODE_START_SOUND:
                                //console.log("CODE_START_SOUND", tag)
                                awaySymbol = getSymbol(tag.soundId);
                                if (tag.soundInfo && (tag.soundInfo.flags & SoundInfoFlags.Stop)) {
                                    awayTimeline.audioPool[audio_commands_cnt] = { 
                                        cmd: SwfTagCode.CODE_STOP_SOUND, 
                                        id: tag.soundId, 
                                        sound: getSymbol(tag.soundId), 
                                        props: tag.soundInfo 
                                    };
                                    noTimelineDebug || console.log("stopsound", tag.soundId, tag.soundInfo, i + 1);
                                }
                                else {
                                    awayTimeline.audioPool[audio_commands_cnt] = { 
                                        cmd: SwfTagCode.CODE_START_SOUND, 
                                        id: tag.soundId, 
                                        sound: getSymbol(tag.soundId), 
                                        props: tag.soundInfo 
                                    };
                                    noTimelineDebug || console.log("startsound", tag.soundId, tag.soundInfo, awaySymbol, i + 1);
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
                                    props: tag.soundInfo 
                                };
                                noTimelineDebug || console.log("stopsound", tag.soundId, tag.soundInfo, i + 1);
                                cmds_startSounds.push(audio_commands_cnt++);
                                break;

                            case SwfTagCode.CODE_REMOVE_OBJECT:
                            case SwfTagCode.CODE_REMOVE_OBJECT2:
                                child = virtualScenegraph[tag.depth];
                                if (!child) {
                                    console.log("Error in timeline. remove cant find the obejct to remove")
                                }

                                cmds_removed[cmds_removed.length] = { depth: tag.depth | 0 };
                                //awayTimeline.freePotentialChild(child.awayChild, child.sessionID);
                                virtualScenegraph[tag.depth] = null;
                                transformsAtDepth[tag.depth.toString()] = null;
                                freeChildsForID = freeChilds[child.id];
                                if (!freeChildsForID) {
                                    freeChildsForID = freeChilds[child.id] = {};
                                }
                                name = child.name;//+"#"+tag.depth;
                                if (!freeChildsForID[name]) {
                                    freeChildsForID[name] = [];
                                }
                                freeChildsForID[name].push(child.sessionID);

                                delete virtualScenegraph[tag.depth];
                                noTimelineDebug || console.log("				remove", "depth", tag.depth);

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
                                //		we need to put a child into the display list. might need to create sprite for graphics !

                                // hasCharacter && child
                                //		need to update a child with a new graphic
                                //		if the existing child is not a graphic, we need to remove it and add a new sprite for it, so we can update the graphics there

                                // !hasCharacter && child
                                //		need to update a child

                                // !hasCharacter && !child
                                //		something is wrong ?

                                if (hasCharacter) {
                                    //console.log("placeTag symbol id",placeObjectTag.symbolId )
                                    awaySymbol = getSymbol(placeObjectTag.symbolId);

                                    if(!awaySymbol) {
                                        console.warn("Symbol missed:", placeObjectTag.symbolId);
                                        break;
                                    }

                                    if (awaySymbol.isAsset(BitmapImage2D)) {
                                        // enable blending for symbols, because if you place image directly on stage
                                        // it not enable blend mode 
                                        const m = new MethodMaterial(<BitmapImage2D>awaySymbol);
                                        m.alphaBlending = (<BitmapImage2D>awaySymbol).transparent;
                                        awaySymbol = Billboard.getNewBillboard(m);
                                    }
                                    flashSymbol = this.parser.dictionary[placeObjectTag.symbolId];
                                    //addedIds[addedIds.length]=placeObjectTag.symbolId;
                                    if (awaySymbol.isAsset(Graphics)) {

                                        swapGraphicsID = placeObjectTag.symbolId;
                                        if (!awayTimeline.graphicsPool[placeObjectTag.symbolId]) {
                                            awayTimeline.graphicsPool[placeObjectTag.symbolId] = awaySymbol;
                                        }

                                        // register a new instance for this object
                                        graphicsSprite = this.factory.createSprite(null, <Graphics>awaySymbol, flashSymbol);
                                        graphicsSprite.mouseEnabled = false;

                                        // if this a child is already existing, and it is a sprite, we will just use the swapGraphics command to exchange the graphics it holds
                                        if (child && child.awayChild.isAsset(Sprite)) {
                                            sessionID = child.sessionID;
                                            // a child (sprite) already exists and the swapGraphicsId will be handled in the update command
                                        }
                                        else {
                                            if (placeObjectTag != null && ((placeObjectTag.name && placeObjectTag.name != "") || this._mcIds[placeObjectTag.symbolId] || this._buttonIds[placeObjectTag.symbolId])) {

                                                if (!placeObjectTag.name || placeObjectTag.name == "")
                                                    placeObjectTag.name = "instance" + placeObjectTag.symbolId + "_" + instanceCNT++;
                                            }
                                            if (child) {
                                                cmds_removed[cmds_removed.length] = { depth: tag.depth | 0 };
                                                //awayTimeline.freePotentialChild(child.awayChild, child.sessionID);
                                                freeChildsForID = freeChilds[child.id];
                                                if (!freeChildsForID) {
                                                    freeChildsForID = freeChilds[child.id] = {};
                                                }
                                                name = child.name;//+"#"+tag.depth;
                                                if (!freeChildsForID[name]) {
                                                    freeChildsForID[name] = [];
                                                }
                                                freeChildsForID[name].push(child.sessionID);

                                                virtualScenegraph[tag.depth] = null;
                                                transformsAtDepth[tag.depth.toString()] = null;
                                                delete virtualScenegraph[tag.depth];
                                                noTimelineDebug || console.log("				remove because we want to add a shape at this depth", "depth", tag.depth);

                                            }

                                            // check if we can reuse a free instance for this symbol:
                                            if (freeChilds[placeObjectTag.symbolId]) {
                                                name = placeObjectTag.name ? placeObjectTag.name : "noname";
                                                // first we check if a instance is available that had the same instance-name
                                                if (freeChilds[placeObjectTag.symbolId][name] && freeChilds[placeObjectTag.symbolId][name].length > 0) {
                                                    sessionID = freeChilds[placeObjectTag.symbolId][name].shift();
                                                }
                                                else {
                                                    // if not, we try to grab any other                                                    
                                                    for (key in freeChilds[placeObjectTag.symbolId]) {
                                                        if (freeChilds[placeObjectTag.symbolId][key].length > 0) {
                                                            sessionID = freeChilds[placeObjectTag.symbolId][key].shift();
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                            if (sessionID == -1) {
                                                sessionID = awayTimeline.registerPotentialChild(graphicsSprite);
                                            }

                                            if ((<any>placeObjectTag).name || (<any>placeObjectTag).variableName || (placeObjectTag.events && placeObjectTag.events.length > 0)) {
                                                awayTimeline.potentialPrototypesInitEventsMap[sessionID + "#" + i] = placeObjectTag;
                                            }

                                            noTimelineDebug || console.log("				add shape", "session-id", sessionID, "depth", tag.depth, tag, awaySymbol);
                                            child = virtualScenegraph[tag.depth] = {
                                                sessionID: sessionID,
                                                id: placeObjectTag.symbolId,
                                                masks: [],
                                                isMask: false,
                                                clipDepth: 0,
                                                depth: 0,
                                                awayChild: graphicsSprite,
                                                name: placeObjectTag.name ? placeObjectTag.name : "noname"
                                            }
                                            cmds_add[cmds_add.length] = { sessionID: sessionID, depth: tag.depth, id: placeObjectTag.symbolId, name: placeObjectTag.name };


                                        }
                                    }
                                    else {
                                        if (!placeObjectTag.name || placeObjectTag.name == "")
                                            placeObjectTag.name = "instance" + placeObjectTag.symbolId + "_" + instanceCNT++;

                                        // check if we can reuse a free instance for this symbol:
                                        if (freeChilds[placeObjectTag.symbolId]) {
                                            name = placeObjectTag.name ? placeObjectTag.name : "noname";
                                            // first we check if a instance is available that had the same instance-name
                                            if (freeChilds[placeObjectTag.symbolId][name] && freeChilds[placeObjectTag.symbolId][name].length > 0) {
                                                sessionID = freeChilds[placeObjectTag.symbolId][name].shift();
                                            }
                                            else {
                                                // if not, we try to grab any other
                                                for (key in freeChilds[placeObjectTag.symbolId]) {
                                                    if (freeChilds[placeObjectTag.symbolId][key].length > 0) {
                                                        sessionID = freeChilds[placeObjectTag.symbolId][key].shift();
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                        if (sessionID == -1) {
                                            sessionID = awayTimeline.registerPotentialChild(awaySymbol);
                                        }

                                        if ((<any>placeObjectTag).name || (<any>placeObjectTag).variableName || (placeObjectTag.events && placeObjectTag.events.length > 0)) {
                                            awayTimeline.potentialPrototypesInitEventsMap[sessionID + "#" + i] = placeObjectTag;
                                        }

                                        doAdd = true;
                                        if (virtualScenegraph[tag.depth] && virtualScenegraph[tag.depth].id == placeObjectTag.symbolId) {
                                            doAdd = false;
                                        }
                                        child = virtualScenegraph[tag.depth] = {
                                            sessionID: sessionID,
                                            id: placeObjectTag.symbolId,
                                            masks: [],
                                            isMask: false,
                                            clipDepth: 0,
                                            depth: 0,
                                            awayChild: awaySymbol,
                                            name: placeObjectTag.name ? placeObjectTag.name : "noname"
                                        }
                                        if (doAdd) {
                                            noTimelineDebug || console.log("				add", "session-id", sessionID, "depth", tag.depth, tag, awaySymbol);
                                            cmds_add[cmds_add.length] = { sessionID: sessionID, depth: tag.depth, id: placeObjectTag.symbolId, name: placeObjectTag.name };
                                        }


                                    }
                                }

                                if (placeObjectTag.flags & PlaceObjectFlags.HasRatio) {
                                    if (!awaySymbol)
                                        awaySymbol = getSymbol(child.id);
                                    if (awaySymbol.isAsset(MorphSprite))
                                        ratio = placeObjectTag.ratio;
                                }

                                if (child) {
                                    cmds_update[cmds_update.length] = { child: child, placeObjectTag: placeObjectTag, swapGraphicsID: swapGraphicsID, ratio: ratio, depth: tag.depth };
                                    noTimelineDebug || console.log("				update", "session-id", child.sessionID, "hasCharacter", hasCharacter, "depth", tag.depth, "swapGraphicsID", swapGraphicsID, tag, awaySymbol);

                                }
                                else {
                                    throw ("error in add command");
                                }


                                break;
                            default:
                                console.log("unknown timeline command tag", tag)
                        }

                        //console.log("parsed a tag: ", tag);
                    }

                    // create remove commands:
                    var start_index = remChildStream.length;
                    var command_cnt = cmds_removed.length;
                    if (command_cnt) {
                        start_index = remChildStream.length;
                        for (var cmd = 0; cmd < command_cnt; cmd++) {
                            remChildStream.push(cmds_removed[cmd].depth);
                        }
                        command_recipe_flag |= 0x02;
                        cmdStreamLength.push(remChildStream.length - start_index);
                        cmdStremInd.push(start_index);
                        if (!noTimelineDebug) {
                            for (var iDebug: number = 0; iDebug < cmds_removed.length; iDebug++) {
                                console.log("				removeCmd", cmds_removed[iDebug]);
                            }
                        }

                    }


                    // create add commands:
                    var command_cnt = cmds_add.length;
                    if (command_cnt) {
                        start_index = addChildStream.length;
                        for (var cmd = 0; cmd < command_cnt; cmd++) {
                            addChildStream.push(cmds_add[cmd].sessionID);
                            addChildStream.push(cmds_add[cmd].depth);
                        }
                        command_recipe_flag |= 0x04;
                        cmdStreamLength.push(command_cnt);
                        cmdStremInd.push(start_index / 2);
                        if (!noTimelineDebug) {
                            for (var iDebug: number = 0; iDebug < cmds_add.length; iDebug++) {
                                console.log("				addCommands", cmds_add[iDebug]);
                            }
                        }

                    }

                    // create update commands:
                    var command_cnt: number = cmds_update.length;

                    // virtualScenegraph is already updated.
                    // making sure all childs update their masking if needed:

                    for (var key in virtualScenegraph) {
                        virtualScenegraph[key].oldMasks = virtualScenegraph[key].masks;
                        virtualScenegraph[key].masks = [];
                        virtualScenegraph[key].maskingChanged = false;
                    }
                    // for newly added objects, we translate the clipDepth to isMask
                    if (command_cnt) {
                        for (var cmd: number = 0; cmd < command_cnt; cmd++) {
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
                    for (var key in virtualScenegraph) {
                        if (virtualScenegraph[key].isMask) {
                            var depth = virtualScenegraph[key].clipDepth;
                            while (depth > virtualScenegraph[key].depth) {
                                if (virtualScenegraph[depth])
                                    virtualScenegraph[depth].masks.push(virtualScenegraph[key].sessionID);
                                depth--;
                            }
                        };
                    }

                    var m = 0;
                    var mLen = 0;
                    var childsWithMaskChanges = [];
                    // check for what objects the masking has been changed in this frame
                    for (var key in virtualScenegraph) {
                        var myChild = virtualScenegraph[key];
                        myChild.masks.sort();
                        myChild.oldMasks.sort();
                        if (myChild.masks.length != myChild.oldMasks.length) {
                            childsWithMaskChanges.push(myChild);
                            myChild.maskingChanged = true;
                        }
                        else {
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

                        var hasCmd = false;
                        if (command_cnt) {
                            for (var cmd = 0; cmd < command_cnt; cmd++) {
                                if (cmds_update[cmd].child == childsWithMaskChanges[m]) {
                                    hasCmd = true;
                                }
                            }
                        }
                        if (!hasCmd) {
                            cmds_update[cmds_update.length] = { child: childsWithMaskChanges[m], placeObjectTag: null, swapGraphicsID: null, ratio: null, depth: null };

                        }
                    }

                    command_cnt = cmds_update.length;
                    if (command_cnt) {

                        // process updated props
                        if (!noTimelineDebug) {
                            for (var iDebug: number = 0; iDebug < cmds_update.length; iDebug++) {
                                console.log("				cmds_update", cmds_update[iDebug]);
                            }
                        }

                        start_index = updChildStream.length;
                        var updateCnt = 0;
                        var updateCmd;
                        for (var cmd = 0; cmd < command_cnt; cmd++) {
                            updateCmd = cmds_update[cmd];
                            placeObjectTag = updateCmd.placeObjectTag;
                            child = updateCmd.child;

                            var childStartIdx: number = propStreamType.length;
                            var num_updated_props = 0;

                            if ((updateCmd.swapGraphicsID != null && updateCmd.swapGraphicsID >= 0)) {

                                num_updated_props++;
                                propStreamType.push(TimelineActionType.SWAP_GRAPHICS);
                                propStreamIndex.push(propStreamInt.length);
                                propStreamInt.push(updateCmd.swapGraphicsID);
                            }

                            let isButtonOrMc = placeObjectTag && (this._buttonIds[placeObjectTag.symbolId] || this._mcIds[placeObjectTag.symbolId]);
                            if (placeObjectTag && ((placeObjectTag.name && placeObjectTag.name != "") || isButtonOrMc)) {
                                num_updated_props++;
                                if (this._buttonIds[placeObjectTag.symbolId]) {
                                    propStreamType.push(TimelineActionType.UPDATE_BUTTON_NAME);
                                }
                                else {
                                    propStreamType.push(TimelineActionType.UPDATE_NAME);
                                }
                                propStreamIndex.push(propStreamStr.length);
                                propStreamStr.push(placeObjectTag.name);
                            }

                            if (placeObjectTag != null && placeObjectTag.flags & PlaceObjectFlags.HasMatrix) {

                                num_updated_props++;

                                propStreamType.push(TimelineActionType.UPDATE_MTX);//matrix type: 1=all, 11=no position, 12=no scale
                                propStreamIndex.push(propStreamMatrixAll.length / 6);

                                // todo: we can save memory by checking if only scale or position was changed,
                                // but it means we would need to check against the matrix of the current child, not against identy matrix

                                //  in swf there seem to a some transforms coming in with scale=0 when it should be scale=1
                                //  This is a flash-bug (?) todo with sharing graphics across multiple mc
                                //  i checked and if we set a object to scale=0 on purpose in Flash, we still get a scale>0 in swf,
                                //  so looks like we can fix this by making sure that scale=0 is converted to scale = 1

                                if (placeObjectTag.matrix.a == 0 && placeObjectTag.matrix.b == 0 && placeObjectTag.matrix.c == 0 && placeObjectTag.matrix.d != 0) {
                                    placeObjectTag.matrix.a = 1;
                                }
                                else if (placeObjectTag.matrix.d == 0 && placeObjectTag.matrix.b == 0 && placeObjectTag.matrix.c == 0 && placeObjectTag.matrix.a != 0) {
                                    placeObjectTag.matrix.d = 1;
                                }

                                matrixToStream(propStreamMatrixAll, propStreamMatrixAll.length, placeObjectTag.matrix);
                                transformsAtDepth[updateCmd.depth.toString()] = placeObjectTag.matrix;

                            }
                            else if (updateCmd.depth != null) {

                                var exTransform = transformsAtDepth[updateCmd.depth.toString()];
                                if (exTransform) {
                                    num_updated_props++;

                                    propStreamType.push(TimelineActionType.UPDATE_MTX);//matrix type: 1=all, 11=no position, 12=no scale
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
                                for (let val of child.masks)
                                    propStreamInt.push(val);
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
                                for (let f=0; f<placeObjectTag.filters.length; f++)
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
                    var command_cnt = cmds_startSounds.length;
                    if (command_cnt) {
                        command_recipe_flag |= 16;
                        start_index = addSoundsStream.length;
                        //console.log("startsound", tag.soundId, tag.soundInfo, awaySymbol);
                        for (var cmd = 0; cmd < command_cnt; cmd++) {
                            addSoundsStream.push(cmds_startSounds[cmd]);
                            //console.log("add", cmds_add[cmd].childID , cmds_add[cmd].depth);
                        }
                        cmdStreamLength.push(command_cnt);
                        cmdStremInd.push(start_index);
                        noTimelineDebug || console.log("				cmds_startSounds", cmds_startSounds.length, cmds_startSounds);
                    }

                }
                else {
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

        var buttonFrameNames: string[] = ["_up", "_over", "_down", "_hit"];
        if (framesLen == 4) {
            var isButtonFrames: number = 0;
            for (i = 0; i < framesLen; i++) {

                if (swfFrames[i].labelNames && swfFrames[i].labelNames.length > 0 && swfFrames[i].labelNames[0] == buttonFrameNames[i]) {
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
            awayMc.mouseEnabled = false; //a movieclip that isn't a button automatically defaults to mouesEnabled = false
        }
        return awayMc;

    }
}