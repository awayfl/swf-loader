import opentype from 'opentype.js'

export class OpenTypeParser {

	public static parseData(tag: any) {
		const font = opentype.parse(tag.data.buffer);
		return font;
	}
}
