import { CompressionMethod } from "./CompressionMethod";
import { SWFFrame } from "./SWFFrame";
import { ABCBlock, DictionaryEntry } from "@awayjs/graphics/dist/lib/data/utilities";
import { EagerlyParsedDictionaryEntry } from "./EagerlyParsedDictionaryEntry";
import { Bounds } from "@awayjs/graphics";

  export class SWFFile {
    public compression: number;//CompressionMethod;
    public swfVersion: number;
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
  }