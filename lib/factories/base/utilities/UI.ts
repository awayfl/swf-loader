
/*
 * Converts a |MouseCursor| number to a CSS |cursor| property value.
 */
export function toCSSCursor(mouseCursor:number) {
	switch (mouseCursor) {
		case 0: // MouseCursor.AUTO
			return 'auto';
		case 2: // MouseCursor.BUTTON
			return 'pointer';
		case 3: // MouseCursor.HAND
			return 'grab';
		case 4: // MouseCursor.IBEAM
			return 'text';
		case 1: // MouseCursor.ARROW
		default:
			return 'default';
	}

}
export let UI={
	toCSSCursor:toCSSCursor
};