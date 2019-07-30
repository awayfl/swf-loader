
/**
 * Returns an unescaped copy of the input string, which is decoded from either system code page page or UTF-8 depending on the value of System.useCodePage.
 * Use of System.useCodePage allows legacy content encoded in local code pages to be accessed by the runtime, but only on systems using that legacy code page.
 * For example, Japanese data encoded as Shift-JIS will only be escaped and unescaped properly on an OS using a Japanese default code page.
 * @param	value	The escaped string to be unescaped.
 * @return	An unescaped copy of the input string.  If System.useCodePage is true, the escaped string is decoded from the system code page.
 *   If System.useCodePage is false, the escaped string is decoded from UTF-8.
 *   For example, if the input string is "Crüe" and System.useCodePage is false, the result will be "CrÃ¼e" on all systems.
 *   If System.useCodePage is true and the input string is "Cr%FCe", and the system uses a Latin code page, the result will also be "CrÃ¼e".
 *   Unescaping "Cr%C3%BCe" with System.useCodePage set to true will produce different undesired results on different systems, such as "CrÃÂ¼e" on a Latin system.
 *   Similarly, unescaping "Cr%FCe" with System.useCodePage set to false could produce "Cre" or "Cr?e" or other variations depending on the code page of the system.
 */
export const unescapeMultiByte=function(value:string) : string{
	console.log("unescapeMultiByte is not implemented yet in flash/utils");
	return "";
}