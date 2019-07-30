/**
 * The StringTools class provides locale-sensitive case conversion methods.
 *
 *   <p class="- topic/p ">In some situations the
 * conversion between uppercase and lowercase letters is not a simple mapping from one character
 * to another and instead requires language- or context-specific processing.  For example:</p><ul class="- topic/ul "><li class="- topic/li ">In Turkish and Azeri,
 * the uppercase of the dotted lowercase <b class="+ topic/ph hi-d/b ">i</b> is an uppercase dotted <b class="+ topic/ph hi-d/b ">İ</b> (U+0130).
 * Similarly the lowercase of a
 * dotless uppercase <b class="+ topic/ph hi-d/b ">I</b>, is a lowercase dotless <b class="+ topic/ph hi-d/b ">ı</b> (U+0131). </li><li class="- topic/li ">The lowercase sharp S, <b class="+ topic/ph hi-d/b ">ß</b> (U+00DF), used in German
 * is converted to uppercase double SS.</li><li class="- topic/li ">In Greek there are two representations of the
 * lowercase sigma, <b class="+ topic/ph hi-d/b ">σ</b> (U+03C3) and <b class="+ topic/ph hi-d/b ">ς</b> (U+03C2), which both convert to the single
 * uppercase sigma <b class="+ topic/ph hi-d/b ">Σ</b> (U+03A3). </li></ul><p class="- topic/p ">
 * The <codeph class="+ topic/ph pr-d/codeph ">toLowerCase()</codeph> and <codeph class="+ topic/ph pr-d/codeph ">toUpperCase()</codeph> methods of this
 * class provide this special case conversion logic.
 * </p><p class="- topic/p ">
 * Due to the use of the user's settings, the use of case conversion rules
 * provided by the operating system, and the use of a fallback locale when a requested locale is not supported,
 * different users can see different case conversion results even when using the same locale ID.
 * </p>
 */
export class StringTools
{
	/**
	 * The name of the actual locale ID used by this StringTools object.
	 *
	 *   There are three possibilities for the value of the name, depending on operating system and the
	 * value of the requestedLocaleIDName parameter passed to the StringTools() constructor.If the requested locale was not LocaleID.DEFAULT and
	 * the operating system provides support for the requested locale,
	 * then the name returned is the same as the requestedLocaleIDName property.
	 * If LocaleID.DEFAULT was used as the value for the requestedLocaleIDName
	 * parameter to the constructor, then the name of the current locale specified by the user's operating system is
	 * used. The LocaleID.DEFAULT value preserves user's customized setting in the OS.
	 * Passing an explicit value as the requestedLocaleIDName parameter does not necessarily give the
	 * same result as using the LocaleID.DEFAULT even if the two locale ID names are the same.
	 * The user could have customized the locale settings on the machine, and by requesting an
	 * explicit locale ID name rather than using LocaleID.DEFAULT your application would not
	 * retrieve those customized settings.
	 */
	public get actualLocaleIDName () : string{
		console.log("actualLocaleIDName not implemented yet in flash/StringTools");
		return "";

	}

	/**
	 * The status of the most recent operation that this StringTools object performed.
	 * The lastOperationStatus property is set whenever the constructor or a method of
	 * this class is called or another property is set. For the possible values see the description for each method.
	 */
	public get lastOperationStatus () : string{
		console.log("lastOperationStatus not implemented yet in flash/StringTools");
		return "";

	}

	/**
	 * The name of the requested locale ID that was passed to the constructor of this StringTools object.
	 *
	 *   If the LocaleID.DEFAULT value was used then the name returned is "i-default".
	 * The actual locale used can differ from the requested locale when a fallback locale is applied.
	 * The name of the actual locale can be retrieved using the actualLocaleIDName property.
	 */
	public get requestedLocaleIDName () : string{
		console.log("requestedLocaleIDName not implemented yet in flash/StringTools");
		return "";

	}

	/**
	 * Lists all of the locale ID names supported by this class.
	 *
	 *   If this class is not supported on the current operating system, this method returns a null value.When this method is called and it completes successfully, the lastOperationStatus property is set to:LastOperationStatus.NO_ERROROtherwise the lastOperationStatus property is set to one of the constants defined in the
	 * LastOperationStatus class.
	 * @return	A vector of strings containing all of the locale ID names supported by this class.
	 */
	public static getAvailableLocaleIDNames () : string[]{
		console.log("getAvailableLocaleIDNames not implemented yet in flash/StringTools");
		return []

	}

	/**
	 * Constructs a new StringTools object that provides case conversion and other utilities according to
	 * the conventions of a given locale.
	 *
	 *   This constructor determines if the current operating system supports the requested locale ID name.
	 * If it is not supported then a fallback locale is used instead.
	 * If a fallback locale is used then the lastOperationStatus property
	 * indicates the type of fallback, and the actualLocaleIDName property contains
	 * the name of the fallback locale ID. When this constructor completes successfully the lastOperationStatus property is set to:LastOperationStatus.NO_ERRORWhen the requested locale ID name is not available then the lastOperationStatus
	 * is set to one of the following:LastOperationStatus.USING_FALLBACK_WARNINGLastOperationStatus.USING_DEFAULT_WARNINGOtherwise the lastOperationStatus property is set to one of the constants defined in
	 * the LastOperationStatus class.
	 * @param	requestedLocaleIDName	The preferred locale ID name to use when determining date or time formats.
	 * @throws	ArgumentError when the requestedLocaleIDName parameter is null
	 */
	constructor (requestedLocaleIDName:string){
	}

	/**
	 * Converts a string to lowercase according to language conventions.
	 * Depending on the locale, the output string length can differ from the input string length.
	 *
	 *   When this method is called and it completes successfully, the lastOperationStatus property is set to:LastOperationStatus.NO_ERROROtherwise the lastOperationStatus property is set to one of the constants defined in the
	 * LastOperationStatus class.
	 * @param	s	A string to convert to lowercase.
	 * @return	The converted lowercase string.
	 * @throws	ArgumentError when  the s parameter is null.
	 */
	public toLowerCase (s:string) : string{
		console.log("toLowerCase not implemented yet in flash/StringTools");
		return "";

	}

	/**
	 * Converts a string to uppercase according to language conventions.
	 * Depending on the locale, the output string length can differ from the input string length.
	 *
	 *   When this method is called and it completes successfully, the lastOperationStatus property is set to:LastOperationStatus.NO_ERROROtherwise the lastOperationStatus property is set to one of the constants defined in the
	 * LastOperationStatus class.
	 * @param	s	A string to convert to uppercase.
	 * @return	The converted uppercase string.
	 * @throws	ArgumentError when the s parameter is null.
	 */
	public toUpperCase (s:string) : string{
		console.log("toUpperCase not implemented yet in flash/StringTools");
		return "";

	}
}

