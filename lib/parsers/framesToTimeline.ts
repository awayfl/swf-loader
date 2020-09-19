import { Billboard, IFilter, MorphSprite, MovieClip, Sprite, Timeline, TimelineActionType } from "@awayjs/scene";
import { PlaceObjectFlags, PlaceObjectTag, SoundInfoFlags, SwfTagCode } from "../factories/base/SWFTags";
import { MovieClipSoundsManager } from "../factories/timelinesounds/MovieClipSoundsManager"
import { BitmapImage2D } from "@awayjs/stage";
import { MethodMaterial } from "@awayjs/materials";
import { Graphics, UnparsedTag } from "@awayjs/graphics";
import { SWFFrame } from "./SWFFrame";
import { IAsset } from "@awayjs/core";

const noTimelineDebug = true;
const noExportsDebug = true;

export function framesToTimeline(symbol: any, swfFrames: SWFFrame[], states: any, buttonActions: any, buttonSound: any = null): MovieClip {
    if (!states && !swfFrames)
        throw ("error when creating timeline - neither movieclip frames nor button-states present");

    
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

    var awayMc: MovieClip = this._factory.createMovieClip(null, symbol);
    awayMc.symbolID = symbol.id;

    var awayTimeline: Timeline = awayMc.timeline;

    var keyframe_durations: number[] = [];
    var frame_command_indices: number[] = [];
    var frame_recipe: number[] = [];
    var command_length_stream: number[] = [];
    var command_index_stream: number[] = [];
    var add_child_stream: number[] = [];
    var add_sounds_stream: number[] = [];
    var remove_child_stream: number[] = [];
    var update_child_stream: number[] = [];
    var update_child_props_indices_stream: number[] = [];
    var update_child_props_length_stream: number[] = [];
    var property_type_stream: number[] = [];
    var property_index_stream: number[] = [];
    var properties_stream_int: number[] = [];
    var properties_stream_filters: IFilter[] = [];

    var properties_stream_f32_mtx_scale_rot: number[] = [];
    var properties_stream_f32_mtx_pos: number[] = [];
    var properties_stream_f32_mtx_all: number[] = [];
    var properties_stream_f32_ct: number[] = [];
    var properties_stream_strings: string[] = [];

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
                let awayAsset = this._awaySymbols[asset.symbolId];
                if (!awayAsset) {
                    console.log("\n\nerror: no away-asset for export\n\n", swfFrames[i].exports[key]);
                }
                else {
                    if (awayAsset.isAsset) {
                        //  this is a awayjs asset. we just update its name. 
                        //  all awayjs-assets will get registered on AssetLibrary by name at very end of parseSymbolsToAwayJS function
                        awayAsset.name = asset.className.toLowerCase();
                    }
                    else if (awayAsset.away) {
                        // this is a font. for now we do nothing (?)
                    }
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
                frame_command_indices.push(command_index_stream.length);
                keyframe_durations[keyframe_durations.length] = 1;
                frame_recipe.push(command_recipe_flag);
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
            frame_command_indices.push(command_index_stream.length);
            keyframe_durations[keyframe_durations.length] = 1;
            if (!isEmpty && (swfFrames[i].labelNames && swfFrames[i].labelNames.length > 0)) {
                fl_len = swfFrames[i].labelNames.length;
                for (fl = 0; fl < fl_len; fl++) {
                    labelName = swfFrames[i].labelNames[fl];
                    let originalLabelName = labelName;
                    if (this.swfFile.swfVersion <= 9) {
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
                awaySymbol = this._awaySymbols[buttonSound[keyFrameCount].id];
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
                    tag = unparsedTag.tagCode === undefined ? unparsedTag : <any>this.getParsedTag(unparsedTag);

                    //console.log("parsed tag", tag);
                    switch (tag.code) {
                        case SwfTagCode.CODE_START_SOUND:
                            //console.log("CODE_START_SOUND", tag)
                            awaySymbol = this._awaySymbols[tag.soundId];
                            if (tag.soundInfo && (tag.soundInfo.flags & SoundInfoFlags.Stop)) {
                                awayTimeline.audioPool[audio_commands_cnt] = { cmd: SwfTagCode.CODE_STOP_SOUND, id: tag.soundId, sound: this._awaySymbols[tag.soundId], props: tag.soundInfo };
                                noTimelineDebug || console.log("stopsound", tag.soundId, tag.soundInfo, i + 1);
                            }
                            else {
                                awayTimeline.audioPool[audio_commands_cnt] = { cmd: SwfTagCode.CODE_START_SOUND, id: tag.soundId, sound: this._awaySymbols[tag.soundId], props: tag.soundInfo };
                                noTimelineDebug || console.log("startsound", tag.soundId, tag.soundInfo, awaySymbol, i + 1);
                            }
                            // todo: volume / pan / other properties
                            cmds_startSounds.push(audio_commands_cnt++);
                            break;
                        case SwfTagCode.CODE_STOP_SOUND:
                            //console.log("CODE_STOP_SOUND", tag)
                            // todo
                            //console.log("stopsound", tag.soundId, tag.soundInfo);
                            awayTimeline.audioPool[audio_commands_cnt] = { cmd: SwfTagCode.CODE_STOP_SOUND, id: tag.soundId, sound: this._awaySymbols[tag.soundId], props: tag.soundInfo };
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
                                awaySymbol = this._awaySymbols[placeObjectTag.symbolId];

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
                                flashSymbol = this.dictionary[placeObjectTag.symbolId];
                                //addedIds[addedIds.length]=placeObjectTag.symbolId;
                                if (awaySymbol.isAsset(Graphics)) {

                                    swapGraphicsID = placeObjectTag.symbolId;
                                    if (!awayTimeline.graphicsPool[placeObjectTag.symbolId]) {
                                        awayTimeline.graphicsPool[placeObjectTag.symbolId] = awaySymbol;
                                    }

                                    // register a new instance for this object
                                    graphicsSprite = this._factory.createSprite(null, <Graphics>awaySymbol, flashSymbol);
                                    graphicsSprite.mouseEnabled = false;

                                    // if this a child is already existing, and it is a sprite, we will just use the swapGraphics command to exchange the graphics it holds
                                    if (child && child.awayChild.isAsset(Sprite)) {
                                        sessionID = child.sessionID;
                                        // a child (sprite) already exists and the swapGraphicsId will be handled in the update command
                                    }
                                    else {
                                        if (placeObjectTag != null && ((placeObjectTag.name && placeObjectTag.name != "") || (this._buttonIds[placeObjectTag.symbolId]) || (this._mcIds[placeObjectTag.symbolId]))) {

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
                                    awaySymbol = this._awaySymbols[child.id];
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
                var start_index = remove_child_stream.length;
                var command_cnt = cmds_removed.length;
                if (command_cnt) {
                    start_index = remove_child_stream.length;
                    for (var cmd = 0; cmd < command_cnt; cmd++) {
                        remove_child_stream.push(cmds_removed[cmd].depth);
                    }
                    command_recipe_flag |= 0x02;
                    command_length_stream.push(remove_child_stream.length - start_index);
                    command_index_stream.push(start_index);
                    if (!noTimelineDebug) {
                        for (var iDebug: number = 0; iDebug < cmds_removed.length; iDebug++) {
                            console.log("				removeCmd", cmds_removed[iDebug]);
                        }
                    }

                }


                // create add commands:
                var command_cnt = cmds_add.length;
                if (command_cnt) {
                    start_index = add_child_stream.length;
                    for (var cmd = 0; cmd < command_cnt; cmd++) {
                        add_child_stream.push(cmds_add[cmd].sessionID);
                        add_child_stream.push(cmds_add[cmd].depth);
                    }
                    command_recipe_flag |= 0x04;
                    command_length_stream.push(command_cnt);
                    command_index_stream.push(start_index / 2);
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

                    start_index = update_child_stream.length;
                    var updateCnt = 0;
                    var updateCmd;
                    for (var cmd = 0; cmd < command_cnt; cmd++) {
                        updateCmd = cmds_update[cmd];
                        placeObjectTag = updateCmd.placeObjectTag;
                        child = updateCmd.child;

                        var childStartIdx: number = property_type_stream.length;
                        var num_updated_props = 0;

                        if ((updateCmd.swapGraphicsID != null && updateCmd.swapGraphicsID >= 0)) {

                            num_updated_props++;
                            property_type_stream.push(TimelineActionType.SWAP_GRAPHICS);
                            property_index_stream.push(properties_stream_int.length);
                            properties_stream_int.push(updateCmd.swapGraphicsID);
                        }


                        if (placeObjectTag != null && ((placeObjectTag.name && placeObjectTag.name != "") || (this._buttonIds[placeObjectTag.symbolId]) || (this._mcIds[placeObjectTag.symbolId]))) {
                            num_updated_props++;
                            if (this._buttonIds[placeObjectTag.symbolId]) {
                                property_type_stream.push(TimelineActionType.UPDATE_BUTTON_NAME);
                            }
                            else {
                                property_type_stream.push(TimelineActionType.UPDATE_NAME);
                            }
                            property_index_stream.push(properties_stream_strings.length);
                            properties_stream_strings.push(placeObjectTag.name);
                        }

                        if (placeObjectTag != null && placeObjectTag.flags & PlaceObjectFlags.HasMatrix) {

                            num_updated_props++;

                            property_type_stream.push(TimelineActionType.UPDATE_MTX);//matrix type: 1=all, 11=no position, 12=no scale
                            property_index_stream.push(properties_stream_f32_mtx_all.length / 6);

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

                            properties_stream_f32_mtx_all[properties_stream_f32_mtx_all.length] = placeObjectTag.matrix.a;
                            properties_stream_f32_mtx_all[properties_stream_f32_mtx_all.length] = placeObjectTag.matrix.b;
                            properties_stream_f32_mtx_all[properties_stream_f32_mtx_all.length] = placeObjectTag.matrix.c;
                            properties_stream_f32_mtx_all[properties_stream_f32_mtx_all.length] = placeObjectTag.matrix.d;
                            properties_stream_f32_mtx_all[properties_stream_f32_mtx_all.length] = placeObjectTag.matrix.tx / 20;
                            properties_stream_f32_mtx_all[properties_stream_f32_mtx_all.length] = placeObjectTag.matrix.ty / 20;
                            transformsAtDepth[updateCmd.depth.toString()] = placeObjectTag.matrix;

                        }
                        else if (updateCmd.depth != null) {

                            var exTransform = transformsAtDepth[updateCmd.depth.toString()];
                            if (exTransform) {
                                num_updated_props++;

                                property_type_stream.push(TimelineActionType.UPDATE_MTX);//matrix type: 1=all, 11=no position, 12=no scale
                                property_index_stream.push(properties_stream_f32_mtx_all.length / 6);

                                properties_stream_f32_mtx_all[properties_stream_f32_mtx_all.length] = exTransform.a;
                                properties_stream_f32_mtx_all[properties_stream_f32_mtx_all.length] = exTransform.b;
                                properties_stream_f32_mtx_all[properties_stream_f32_mtx_all.length] = exTransform.c;
                                properties_stream_f32_mtx_all[properties_stream_f32_mtx_all.length] = exTransform.d;
                                properties_stream_f32_mtx_all[properties_stream_f32_mtx_all.length] = exTransform.tx / 20;
                                properties_stream_f32_mtx_all[properties_stream_f32_mtx_all.length] = exTransform.ty / 20;
                            }
                        }

                        if (placeObjectTag != null && placeObjectTag.flags & PlaceObjectFlags.HasColorTransform) {
                            //console.log("PlaceObjectFlags.HasColorTransform", placeObjectTag.cxform);
                            property_type_stream.push(TimelineActionType.UPDATE_CMTX);
                            property_index_stream.push(properties_stream_f32_ct.length / 8);
                            num_updated_props++;
                            properties_stream_f32_ct[properties_stream_f32_ct.length] = placeObjectTag.cxform.redMultiplier / 255;
                            properties_stream_f32_ct[properties_stream_f32_ct.length] = placeObjectTag.cxform.greenMultiplier / 255;
                            properties_stream_f32_ct[properties_stream_f32_ct.length] = placeObjectTag.cxform.blueMultiplier / 255;
                            properties_stream_f32_ct[properties_stream_f32_ct.length] = placeObjectTag.cxform.alphaMultiplier / 255;
                            properties_stream_f32_ct[properties_stream_f32_ct.length] = placeObjectTag.cxform.redOffset;
                            properties_stream_f32_ct[properties_stream_f32_ct.length] = placeObjectTag.cxform.greenOffset;
                            properties_stream_f32_ct[properties_stream_f32_ct.length] = placeObjectTag.cxform.blueOffset;
                            properties_stream_f32_ct[properties_stream_f32_ct.length] = placeObjectTag.cxform.alphaOffset;
                        }

                        if (updateCmd.ratio != null && updateCmd.ratio >= 0) {
                            num_updated_props++;
                            property_type_stream.push(TimelineActionType.SET_RATIO);
                            property_index_stream.push(properties_stream_int.length);
                            properties_stream_int.push(updateCmd.ratio | 0);
                            //console.log("PlaceObjectFlags.HasRatio", placeObjectTag, child);
                        }

                        if (child.maskingChanged) {
                            num_updated_props++;
                            property_type_stream.push(TimelineActionType.UPDATE_MASKS);
                            property_index_stream.push(properties_stream_int.length);
                            properties_stream_int.push(child.masks.length);
                            for (let val of child.masks)
                                properties_stream_int.push(val);
                        }
                        if (placeObjectTag != null && placeObjectTag.flags & PlaceObjectFlags.HasClipDepth) {

                            num_updated_props++;
                            property_type_stream.push(TimelineActionType.ENABLE_MASKMODE);
                            property_index_stream.push(0);

                        }

                        if (placeObjectTag != null && placeObjectTag.flags & PlaceObjectFlags.HasFilterList) {
                            //console.log("encountered filters", placeObjectTag.filters);
                            num_updated_props++;
                            property_type_stream.push(TimelineActionType.UPDATE_FILTERS);
                            property_index_stream.push(properties_stream_int.length);
                            properties_stream_int.push(properties_stream_filters.length);
                            properties_stream_int.push(placeObjectTag.filters.length);
                            for (let f=0; f<placeObjectTag.filters.length; f++)
                                properties_stream_filters.push(placeObjectTag.filters[f]);
                        }

                        if (placeObjectTag != null && placeObjectTag.flags & PlaceObjectFlags.HasVisible) {
                            num_updated_props++;
                            property_type_stream.push(TimelineActionType.UPDATE_VISIBLE);
                            property_index_stream.push(placeObjectTag.visibility ? 1 : 0);
                        }

                        if (placeObjectTag != null && placeObjectTag.flags & PlaceObjectFlags.HasBlendMode) {
                            num_updated_props++;
                            property_type_stream.push(TimelineActionType.UPDATE_BLENDMODE);
                            property_index_stream.push(placeObjectTag.blendMode);
                        }

                        if (num_updated_props > 0) {
                            updateCnt++;
                            update_child_stream.push(child.sessionID);
                            update_child_props_indices_stream.push(childStartIdx);
                            update_child_props_length_stream.push(num_updated_props);
                        }
                    }
                    if (updateCnt > 0) {
                        command_recipe_flag |= 0x08;
                        command_length_stream.push(command_cnt);
                        command_index_stream.push(start_index);
                    }

                }
                var command_cnt = cmds_startSounds.length;
                if (command_cnt) {
                    command_recipe_flag |= 16;
                    start_index = add_sounds_stream.length;
                    //console.log("startsound", tag.soundId, tag.soundInfo, awaySymbol);
                    for (var cmd = 0; cmd < command_cnt; cmd++) {
                        add_sounds_stream.push(cmds_startSounds[cmd]);
                        //console.log("add", cmds_add[cmd].childID , cmds_add[cmd].depth);
                    }
                    command_length_stream.push(command_cnt);
                    command_index_stream.push(start_index);
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
            if (frame_recipe.length == 0) {
                command_recipe_flag |= 0x01;
            }
            frame_recipe.push(command_recipe_flag);
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
    awayTimeline.frame_command_indices = new Uint32Array(frame_command_indices);
    awayTimeline.frame_recipe = new Uint32Array(frame_recipe);
    awayTimeline.command_length_stream = new Uint32Array(command_length_stream);
    awayTimeline.command_index_stream = new Uint32Array(command_index_stream);
    awayTimeline.add_child_stream = new Uint32Array(add_child_stream);
    awayTimeline.add_sounds_stream = new Uint32Array(add_sounds_stream);
    awayTimeline.remove_child_stream = new Uint32Array(remove_child_stream);
    awayTimeline.update_child_stream = new Uint32Array(update_child_stream);
    awayTimeline.update_child_props_indices_stream = new Uint32Array(update_child_props_indices_stream);
    awayTimeline.update_child_props_length_stream = new Uint32Array(update_child_props_length_stream);
    awayTimeline.property_type_stream = new Uint32Array(property_type_stream);
    awayTimeline.property_index_stream = new Uint32Array(property_index_stream);
    awayTimeline.properties_stream_int = new Uint32Array(properties_stream_int);

    awayTimeline.properties_stream_f32_mtx_scale_rot = new Float32Array(properties_stream_f32_mtx_scale_rot);
    awayTimeline.properties_stream_f32_mtx_pos = new Float32Array(properties_stream_f32_mtx_pos);
    awayTimeline.properties_stream_f32_mtx_all = new Float32Array(properties_stream_f32_mtx_all);
    awayTimeline.properties_stream_f32_ct = new Float32Array(properties_stream_f32_ct);
    awayTimeline.properties_stream_strings = properties_stream_strings;
    awayTimeline.properties_stream_filters = properties_stream_filters;
    

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