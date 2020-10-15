import { UnparsedTag, DictionaryEntry } from '@awayjs/graphics';

export declare class EagerlyParsedDictionaryEntry extends DictionaryEntry {
	type: string;
	definition: Object;
	env: any;
	ready: boolean;
	constructor(id: number, unparsed: UnparsedTag, type: string, definition: any, env: any);
}