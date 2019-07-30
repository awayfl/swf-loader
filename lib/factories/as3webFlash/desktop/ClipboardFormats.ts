/**
 * The ClipboardFormats class defines constants for the names of the standard data formats used with the Clipboard class.
 * Flash Player 10 only supports TEXT_FORMAT, RICH_TEXT_FORMAT, and HTML_FORMAT.
 * @internal	Clipboard, ClipboardFormats and ClipboardTransferMode were all added to AIR 1.0. These are also being added, with some exceptions listed in this file, to FP10.
 */

	
export class ClipboardFormats extends Object
{
	static AIR_PREFIX : string;

	/**
	 * Image data (AIR only).
	 */
	public static BITMAP_FORMAT : string = "air:bitmap";

	/**
	 * An array of files (AIR only).
	 */
	public static FILE_LIST_FORMAT : string = "air:file list";

	/**
	 * File promise list (AIR only).
	 */
	public static FILE_PROMISE_LIST_FORMAT : string = "air:file promise list";
	static FLASH_PREFIX : string;

	/**
	 * HTML data.
	 */
	public static HTML_FORMAT : string = "air:html";
	static REFERENCE_PREFIX : string;

	/**
	 * Rich Text Format data.
	 */
	public static RICH_TEXT_FORMAT : string = "air:rtf";
	static SERIALIZATION_PREFIX : string;

	/**
	 * String data.
	 */
	public static TEXT_FORMAT : string = "air:text";

	/**
	 * A URL string (AIR only).
	 */
	public static URL_FORMAT : string = "air:url";
}

