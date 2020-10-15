
import { SoundStream } from '../parsers/utils/parser/sound';

import {
	ActionBlock,
	InitActionBlock,
	SymbolExport,
	UnparsedTag } from '@awayjs/graphics';
export class SWFFrame {
	controlTags: UnparsedTag[];
	labelNames: string[];
	soundStreamHead: SoundStream;
	soundStreamBlock: Uint8Array;
	actionBlocks: ActionBlock[];
	initActionBlocks: InitActionBlock[];
	exports: SymbolExport[];
	buttonStateName: string;

	constructor(controlTags?: UnparsedTag[], labelNames?: string[],
		soundStreamHead?: SoundStream,
		soundStreamBlock?: Uint8Array,
		actionBlocks?: ActionBlock[],
		initActionBlocks?: InitActionBlock[],
		exports?: SymbolExport[]) {
		controlTags && Object.freeze(controlTags);
		this.controlTags = controlTags;
		this.labelNames = labelNames;
		actionBlocks && Object.freeze(actionBlocks);
		this.soundStreamHead = soundStreamHead;
		this.soundStreamBlock = soundStreamBlock;
		this.actionBlocks = actionBlocks;
		initActionBlocks && Object.freeze(initActionBlocks);
		this.initActionBlocks = initActionBlocks;
		this.buttonStateName = '';
		exports && Object.freeze(exports);
		this.exports = exports;
	}
}