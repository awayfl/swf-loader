
/**
 * Returns an escaped copy of the input string encoded as either UTF-8 or system code page, depending on the value of System.useCodePage.
 * Use of System.useCodePage allows legacy content encoded in local code pages to be accessed by the runtime, but only on systems using that legacy code page.
 * For example, Japanese data encoded as Shift-JIS will only be escaped and unescaped properly on an OS using a Japanese default code page.
 * @param	value	The string to be escaped.
 * @return	An escaped copy of the input string.  If System.useCodePage is true, the escaped string is encoded in the system code page.
 *   If System.useCodePage is false, the escaped string is encoded in UTF-8.
 *   For example, the input string "Crüe" will be escaped as "Cr%C3%BCe" on all systems if System.useCodePage is false.
 *   If system.useCodePage is true, and the system uses a Latin code page, "Crüe" will be escaped as "Cr%FCe".
 *   If the system uses a non Latin code page that does not contain the letter 'ü' the result will probably be "Cr?e".
 *   Unescaping "Cr%C3%BCe" with System.useCodePage set to true will produce different undesired results on different systems, such as "CrÃ¼e" on a Latin system.
 *   Similarly, unescaping "Cr%FCe" with System.useCodePage set to false could produce "Cre" or "Cr?e" or other variations depending on the code page of the system.
 * @langversion	3.0
 * @playerversion	Flash 9
 * @playerversion	Lite 4
 */
export const escapeMultiByte = function(value:string) : string{
	console.log("escapeMultiByte is not implemented yet in flash/utils");
	return "";
};