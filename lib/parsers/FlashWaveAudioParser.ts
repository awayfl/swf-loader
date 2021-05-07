import { ParserBase, WaveAudio, WaveAudioData, WaveAudioParser } from '@awayjs/core';
import { ISoundSymbol } from './../parsers/ISymbol';

export class FlashWaveAudioParser extends WaveAudioParser {
	public _pProceedParsing(): boolean {
		const data: ISoundSymbol = this.data;
		const define = data.definition!;

		const meta = {
			sampleRate: define.sampleRate,
			samplesCount: define.samplesCount,
			startOffset: define.packaged.seek,
		};
		//@ts-ignore
		this._pContent = new WaveAudio(new WaveAudioData(define.packaged.data.buffer, meta));
		this._pFinalizeAsset(this._pContent, this._iFileName);

		return ParserBase.PARSING_DONE;
	}
}