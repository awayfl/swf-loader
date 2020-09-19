
import { Bbox, Shape} from "@awayjs/graphics";
import { SWFFrame } from "./SWFFrame";
import { UnparsedTag } from "@awayjs/graphics";
import { TextTag, BinaryDataTag, VideoStreamTag } from "../factories/base/SWFTags";

export const enum SYMBOL_TYPE {
	SHAPE = 'shape',
	MORPH = 'morphshape',
	FONT = "font",
	SPRITE = "sprite",
	TEXT = "text",
	SOUND = "sound",
	BUTTON = "button",
	LABEL = "label",
	IMAGE = "image",
	BINARY = "binary",
	VIDEO = "video"
}

export interface ISymbol extends UnparsedTag {
	className: string;
	name: string;
	id: number;
	type: SYMBOL_TYPE;
	away: any;
	tag: any;
}

export interface IShapeSymbol extends ISymbol {
	shape?: Shape & {className: string, };
}

export interface ISpriteSymbol extends ISymbol {
	frames: SWFFrame[];
}

export interface ITextSymbol extends ISymbol {
	tag: TextTag & {letterSpacing: number};
	fillBounds: Bbox;
}

export interface IButtonSymbol extends ISymbol {
	states: any;
    buttonActions: any;
    sounds: any;
}

export interface ILabelSymbol extends ITextSymbol {
	records: any[];
	matrix: number[];
}

export interface IImageSymbol extends ISymbol {
	definition: {
		width: number;
		height: number;
		data: Uint8ClampedArray;
	}
}

export interface IBinarySymbol extends BinaryDataTag, ISymbol {};
export interface IVideoSymbol extends VideoStreamTag, ISymbol {};
