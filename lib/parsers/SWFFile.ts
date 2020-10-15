import { CompressionMethod } from './CompressionMethod';
import { SWFFrame } from './SWFFrame';
import { EagerlyParsedDictionaryEntry } from './EagerlyParsedDictionaryEntry';
import { Bounds, DictionaryEntry, ABCBlock } from '@awayjs/graphics';

export class SWFFile {
	public compression: number;//CompressionMethod;
	public swfVersion: number;
	public fpVersion: string;
	public url: string;
	public useAVM1: boolean;
	public backgroundColor: number;
	public bounds: Bounds;//80pro: todo
	public frameRate: number;
	public frameCount: number;
	public attributes: any; // TODO: type strongly
	public sceneAndFrameLabelData: any; // TODO: type strongly

	public bytesLoaded: number;
	public bytesTotal: number;
	public pendingUpdateDelays: number;
	// Might be lower than frames.length if eagerly parsed assets pending resolution are blocking
	// us from reporting the given frame as loaded.
	public framesLoaded: number;

	public frames: SWFFrame[];
	public abcBlocks: ABCBlock[];
	public dictionary: DictionaryEntry[];
	public fonts: {name: string; style: string; id: number}[];
	public data: Uint8Array;
	public env: any;

	public symbolClassesMap: string[];
	public symbolClassesList: {id: number; className: string}[];
	public eagerlyParsedSymbolsMap: EagerlyParsedDictionaryEntry[];
	public eagerlyParsedSymbolsList: EagerlyParsedDictionaryEntry[];

	constructor() {

		this.compression = CompressionMethod.None;
		this.swfVersion = 0;
		this.useAVM1 = true;
		this.backgroundColor = 0xffffffff;
		this.bounds = null;
		this.frameRate = 0;
		this.frameCount = 0;
		this.attributes = null;
		this.sceneAndFrameLabelData = null;

		this.bytesLoaded = 0;
		this.bytesTotal = length;
		this.pendingUpdateDelays = 0;
		this.framesLoaded = 0;
	}

	public mapSWFVersionToFPVersion() {
		const swfToFPVersion: NumberMap<string> = {
			6:'FP6',
			7:'FP7',
			8:'FP8',
			9:'FP9',
			10:'FP10',
			11:'FP10_2',
			12:'FP10_3',
			13:'FP11_0',
			14:'FP11_1',
			15:'FP11_2',
			16:'FP11_3',
			17:'FP11_4',
			18:'FP11_5',
			19:'FP11_6',
			20:'FP11_7',
			21:'FP11_8',
			22:'FP11_9',
			23:'FP12',
			24:'FP13',
			25:'FP14',
			26:'FP15',
			27:'FP16',
			28:'FP17',
			29:'FP18',
			30:'FP19',
			31:'FP20',
			32:'FP21',
			33:'FP22',
			34:'FP23',
			35:'FP24',
			36:'FP25',
			37:'FP26',
			38:'FP27',
			39:'FP28',
			40:'FP29',
			41:'FP30',
			42:'FP31'
		};
		this.fpVersion = swfToFPVersion[this.swfVersion] ? swfToFPVersion[this.swfVersion] : 'unmappedSWFVersion:' + this.swfVersion;
	}
}