import { ParserBase, WaveAudio, WaveAudioData, WaveAudioParser } from '@awayjs/core';
import { ISoundSymbol } from './../parsers/ISymbol';

export class FlashWaveAudioParser extends WaveAudioParser {
	protected proceedParsing(): void {
		const data: ISoundSymbol = this.data;
		const define = data.definition!;

		const meta = {
			sampleRate: define.sampleRate,
			samplesCount: define.samplesCount,
			startOffset: define.packaged.seek,
		};
		//@ts-ignore
		this._content = new WaveAudio(new WaveAudioData(define.packaged.data.buffer, meta));
		this.finalizeAsset(this._content, this.fileName);

		this.finishParsing();
	}
}