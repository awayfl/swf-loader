export class OpenTypeParser {

	public static openType: any;

	public static parseData(tag: any) {
		const opentype = OpenTypeParser.openType;
		if (!opentype)
			console.error('[OpenTypeParser] - opentype.js is not registered');

		const font = opentype.parse(tag.data.buffer);
		return font;
	}
}
