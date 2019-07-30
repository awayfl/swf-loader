//import { NumberParseResult } from "./NumberParseResult";

/**
 * The NumberFormatter class provides locale-sensitive formatting and parsing of numeric values. It can format <codeph class="+ topic/ph pr-d/codeph ">int</codeph>,
 * <codeph class="+ topic/ph pr-d/codeph ">uint</codeph>, and <codeph class="+ topic/ph pr-d/codeph ">Number</codeph> objects.
 *
 *   <p class="- topic/p ">The NumberFormatter class uses the data and functionality provided by the operating system
 * and is designed to format numbers according to the conventions
 * of a specific locale, based on the user's preferences and features supported by the user's operating system.
 * The position of the negative symbol, the decimal separator,
 * the grouping separator, the grouping pattern, and other elements within the number format can vary depending on the locale.</p><p class="- topic/p ">If the operating system supports the requested locale, the number formatting properties
 * are set according to the conventions and defaults of the requested locale.
 * If the requested locale is not available, then the properties are set according to
 * a fallback or default system locale, which can be retrieved using the <codeph class="+ topic/ph pr-d/codeph ">actualLocaleIDName</codeph> property.
 * </p><p class="- topic/p ">
 * Due to the use of the user's settings, the use of formatting patterns
 * provided by the operating system, and the use of a fallback locale when a requested locale is not supported,
 * different users can see different formatting results, even when using the same locale ID.
 * </p>
 */
export class NumberFormatter
{
	/**
	 * The name of the actual locale ID used by this NumberFormatter object.
	 *
	 *   There are three possibilities for the value of the name, depending on operating system and the
	 * value of the requestedLocaleIDName parameter passed to the Collator() constructor.If the requested locale was not LocaleID.DEFAULT and
	 * the operating system provides support for the requested locale,
	 * then the name returned is the same as the requestedLocaleIDName property.
	 * If LocaleID.DEFAULT was used as the value for the requestedLocaleIDName
	 * parameter to the constructor, then the name of the current locale specified by the user's operating system is
	 * used. The LocaleID.DEFAULT value preserves user's customized setting in the OS.
	 * Passing an explicit value as the requestedLocaleIDName parameter does not necessarily give the
	 * same result as using the LocaleID.DEFAULT even if the two locale ID names are the same.
	 * The user could have customized the locale settings on their machine, and by requesting an
	 * explicit locale ID name rather than using LocaleID.DEFAULT your application would not
	 * retrieve those customized settings.
	 */
	public get actualLocaleIDName () : string{
		console.log("actualLocaleIDName not implemented yet in flash/NumberFormatter");
		return "";

	}

	/**
	 * The decimal separator character used for formatting or parsing numbers that have a decimal part.
	 *
	 *   This property is initially set based on the locale that is selected when the formatter object
	 * is constructed.When this property is assigned a value and there are no errors or warnings, the lastOperationStatus property
	 * is set to:LastOperationStatus.NO_ERROROtherwise the lastOperationStatus property is set to one of the constants defined in the
	 * LastOperationStatus class.
	 * @throws	TypeError if this property is assigned a null value.
	 */
	public get decimalSeparator () : string{
		console.log("decimalSeparator not implemented yet in flash/NumberFormatter");
		return "";

	}
	public set decimalSeparator (value:string){
		console.log("decimalSeparator not implemented yet in flash/NumberFormatter");

	}

	/**
	 * Defines the set of digit characters to be used when formatting numbers.
	 *
	 *   Different languages and regions use different sets of characters to represent the
	 * digits 0 through 9.  This property defines the set of digits to be used.The value of this property represents the Unicode value for the zero digit of a decimal digit set.
	 * The valid values for this property are defined in the NationalDigitsType class.When this property is assigned a value and there are no errors or warnings, the lastOperationStatus property
	 * is set to:LastOperationStatus.NO_ERROROtherwise the lastOperationStatus property is set to one of the constants defined in the
	 * LastOperationStatus class.
	 * @throws	TypeError if this property is assigned a null value.
	 */
	public get digitsType () : number{
		console.log("digitsType not implemented yet in flash/NumberFormatter");
		return 0;

	}
	public set digitsType (value:number){
		console.log("digitsType not implemented yet in flash/NumberFormatter");

	}

	/**
	 * The maximum number of digits that can appear after the decimal separator.
	 *
	 *   Numbers are rounded to the number of digits specified by this property. The rounding scheme
	 * varies depending on the user's operating system.When the trailingZeros property is set to true, the fractional portion of the
	 * number (after the decimal point) is padded with trailing zeros until its length matches the value of this
	 * fractionalDigits property.When this property is assigned a value and there are no errors or warnings, the lastOperationStatus property
	 * is set to:LastOperationStatus.NO_ERROROtherwise the lastOperationStatus property is set to one of the constants defined in the
	 * LastOperationStatus class.
	 */
	public get fractionalDigits () : number{
		console.log("fractionalDigits not implemented yet in flash/NumberFormatter");
		return 0;

	}
	public set fractionalDigits (value:number){
		console.log("fractionalDigits not implemented yet in flash/NumberFormatter");

	}

	/**
	 * Describes the placement of grouping separators within the formatted number string.
	 *
	 *   When the useGrouping property is set to true, the groupingPattern property is used
	 * to define the placement and pattern used for the grouping separator.The grouping pattern is defined as a string containing numbers separated by semicolons and optionally may end
	 * with an asterisk. For example: "3;2;*". Each number in the string represents the number of digits
	 * in a group. The grouping separator is placed before each group of digits. An asterisk at the end of the string
	 * indicates that groups with that number of digits should be repeated for the rest of the formatted string.
	 * If there is no asterisk then there are no additional groups or separators for the rest of the formatted string. The first number in the string corresponds to the first group of digits to the left of the decimal separator.
	 * Subsequent numbers define the number of digits in subsequent groups to the left. Thus the string "3;2;*"
	 * indicates that a grouping separator is placed after the first group of 3 digits, followed by groups of 2 digits.
	 * For example: 98,76,54,321The following table shows examples of formatting the number 123456789.12 with various grouping patterns.
	 * The grouping separator is a comma and the decimal separator is a period.
	 * Grouping PatternSample Format3;*123,456,789.123;2;*12,34,56,789.123123456,789.12Only a limited number of grouping sizes can be defined. On some operating systems, grouping patterns can only contain
	 * two numbers plus an asterisk. Other operating systems can support up to four numbers and an asterisk.
	 * For patterns without an asterisk, some operating systems only support one number while others support up to three numbers.
	 * If the maximum number of grouping pattern elements is exceeded, then additional elements
	 * are ignored and the lastOperationStatus property is set as described below.
	 * When this property is assigned a value and there are no errors or warnings, the lastOperationStatus property
	 * is set to:LastOperationStatus.NO_ERROROtherwise the lastOperationStatus property is set to one of the constants defined in the
	 * LastOperationStatus class.
	 * @throws	TypeError if this property is assigned a null value.
	 */
	public get groupingPattern () : string{
		console.log("groupingPattern not implemented yet in flash/NumberFormatter");
		return "";

	}
	public set groupingPattern (value:string){
		console.log("groupingPattern not implemented yet in flash/NumberFormatter");

	}

	/**
	 * The character or string used for the grouping separator.
	 *
	 *   The value of this property is used as the grouping separator when formatting numbers with the
	 * useGrouping property set to true. This
	 * property is initially set based on the locale that is selected when the formatter object
	 * is constructed.When this property is assigned a value and there are no errors or warnings, the lastOperationStatus property
	 * is set to:LastOperationStatus.NO_ERROROtherwise the lastOperationStatus property is set to one of the constants defined in the
	 * LastOperationStatus class.
	 * @throws	TypeError if this property is assigned a null value.
	 */
	public get groupingSeparator () : string{
		console.log("groupingSeparator not implemented yet in flash/NumberFormatter");
		return "";

	}
	public set groupingSeparator (value:string){
		console.log("groupingSeparator not implemented yet in flash/NumberFormatter");

	}

	/**
	 * The status of previous operation that this NumberFormatter object performed.
	 * The lastOperationStatus property is set whenever the constructor or a method of
	 * this class is called, or another property is set. For the possible values see the description for each method.
	 */
	public get lastOperationStatus () : string{
		console.log("lastOperationStatus not implemented yet in flash/NumberFormatter");
		return "";

	}

	/**
	 * Specifies whether a leading zero is included in a formatted number when there are no integer digits
	 * to the left of the decimal separator.
	 *
	 *   When this property is set to true a leading zero is included to the left of the decimal separator
	 * when formatting numeric values between -1.0 and 1.0.
	 * When this property is set to false a leading zero is not included.For example if the number is 0.321 and this property is set true, then the leading
	 * zero is included in the formatted string. If the property is set to false, the leading zero
	 * is not included. In that case the string would just include the decimal separator followed by the decimal digits,
	 * like .321. The following table shows examples of how numbers are formatted based on the values of this property and
	 * the related fractionalDigits and trailingZeros properties.
	 * trailingZerosleadingZerofractionalDigits0.120truetrue30.1200.000falsetrue30.120truefalse3.120.000falsefalse3.120When this property is assigned a value and there are no errors or warnings, the lastOperationStatus property
	 * is set to:LastOperationStatus.NO_ERROROtherwise the lastOperationStatus property is set to one of the constants defined in the
	 * LastOperationStatus class.
	 * @throws	TypeError if this property is assigned a null value.
	 */
	public get leadingZero () : boolean{
		console.log("leadingZero not implemented yet in flash/NumberFormatter");
		return false;

	}
	public set leadingZero (value:boolean){
		console.log("leadingZero not implemented yet in flash/NumberFormatter");

	}

	/**
	 * A numeric value that indicates a formatting pattern for negative numbers.
	 * This pattern defines the location of the negative symbol
	 * or parentheses in relation to the numeric portion of the formatted number.
	 *
	 *   The following table summarizes the possible formats for negative numbers. When a negative number is formatted,
	 * the minus sign in the format is replaced with the value of
	 * the negativeSymbol property and the 'n' character is replaced with the formatted numeric value.Negative number format typeFormat0(n)1-n2- n3n-4n -When this property is assigned a value and there are no errors or warnings, the lastOperationStatus property
	 * is set to:LastOperationStatus.NO_ERROROtherwise the lastOperationStatus property is set to one of the constants defined in the
	 * LastOperationStatus class.
	 * @throws	ArgumentError if the assigned value is not a number between 0 and 4.
	 */
	public get negativeNumberFormat () : number{
		console.log("negativeNumberFormat not implemented yet in flash/NumberFormatter");
		return 0;

	}
	public set negativeNumberFormat (value:number){
		console.log("negativeNumberFormat not implemented yet in flash/NumberFormatter");

	}

	/**
	 * The negative symbol to be used when formatting negative values.
	 *
	 *   This symbol is used with the negative number
	 * format when formatting a number that is less than zero. It is not used in negative number formats that do not include
	 * a negative sign (e.g. when negative numbers are enclosed in parentheses).  This property is set to a default value for the actual locale selected when this
	 * formatter is constructed. It can be set with a value to override the default setting.When this property is assigned a value and there are no errors or warnings, the lastOperationStatus property
	 * is set to:LastOperationStatus.NO_ERROROtherwise the lastOperationStatus property is set to one of the constants defined in the
	 * LastOperationStatus class.
	 * @throws	MemoryError if the system cannot allocate enough internal memory.
	 */
	public get negativeSymbol () : string{
		console.log("negativeSymbol not implemented yet in flash/NumberFormatter");
		return "";

	}
	public set negativeSymbol (value:string){
		console.log("negativeSymbol not implemented yet in flash/NumberFormatter");

	}

	/**
	 * The name of the requested locale ID that was passed to the constructor of this NumberFormatter object.
	 *
	 *   If the LocaleID.DEFAULT value was used then the name returned is "i-default".
	 * The actual locale used can differ from the requested locale when a fallback locale is applied.
	 * The name of the actual locale can be retrieved using the actualLocaleIDName property.
	 */
	public get requestedLocaleIDName () : string{
		console.log("requestedLocaleIDName not implemented yet in flash/NumberFormatter");
		return "";

	}

	/**
	 * Specifies whether trailing zeros are included in a formatted number.
	 *
	 *   When this property is set to true, trailing zeros are included in the fractional part
	 * of the formatted number up to the limit specified by the fractionalDigits property.
	 * When this property is set to false then no trailing zeros are shown.For example if the numeric value is 123.4, and this property is set true, and the fractionalDigits property
	 * is set to 3, the formatted string would show trailing zeros, like 123.400 .
	 * If this property is false, trailing zeros are not included, and the string shows just the decimal
	 * separator followed by the non-zero decimal digits, like 123.4 .The following table shows examples of how numeric values are formatted based on the values of this property and
	 * the related fractionalDigits and leadingZero properties.
	 * trailingZerosleadingZerofractionalDigits0.120truetrue30.1200.000falsetrue30.120truefalse3.120.000falsefalse3.120When this property is assigned a value and there are no errors or warnings, the lastOperationStatus property
	 * is set to:LastOperationStatus.NO_ERROROtherwise the lastOperationStatus property is set to one of the constants defined in the
	 * LastOperationStatus class.
	 * @throws	TypeError if this property is assigned a null value.
	 */
	public get trailingZeros () : boolean{
		console.log("trailingZeros not implemented yet in flash/NumberFormatter");
		return false;

	}
	public set trailingZeros (value:boolean){
		console.log("trailingZeros not implemented yet in flash/NumberFormatter");

	}

	/**
	 * Enables the use of the grouping separator when formatting numbers.
	 *
	 *   When the useGrouping property is set to true, digits are grouped and
	 * delimited by the grouping separator character.
	 * For example: 123,456,789.22When the useGrouping property is set to false, digits are not grouped or separated.
	 * For example: 123456789.22The symbol to be used as a grouping separator is defined by the groupingSeparator property. The number of digits
	 * between grouping separators is defined by the groupingPattern property.When this property is assigned a value and there are no errors or warnings, the lastOperationStatus property
	 * is set to:LastOperationStatus.NO_ERROROtherwise the lastOperationStatus property is set to one of the constants defined in the
	 * LastOperationStatus class.
	 */
	public get useGrouping () : boolean{
		console.log("useGrouping not implemented yet in flash/NumberFormatter");
		return false;

	}
	public set useGrouping (value:boolean){
		console.log("useGrouping not implemented yet in flash/NumberFormatter");

	}

	/**
	 * Formats an int value.
	 *
	 *   This function is equivalent to the formatNumber() method except that it takes an int value.
	 * If the value passed in is too large or small, such as a value greater than 1.72e308 or less than 1.72e-308, then this function returns 0.
	 *
	 *   When this method is called and it completes successfully, the lastOperationStatus property is set to:LastOperationStatus.NO_ERROROtherwise the lastOperationStatus property is set to one of the constants defined in the
	 * LastOperationStatus class.
	 * @param	value	An int value to format.
	 * @return	A formatted number string.
	 * @throws	MemoryError for any internal memory allocation problems.
	 */
	public formatInt (value:number) : string{
		console.log("formatInt not implemented yet in flash/NumberFormatter");
		return "";

	}

	/**
	 * Formats a Number value.
	 *
	 *   This function formats the number based on the property values of the formatter. If the properties are
	 * not modified after the the numberFormatter object is created, the numbers are formatted
	 * according to the locale specific conventions provided by the operating system for the locale identified
	 * by actualLocaleIDName.  To customize the format, the properties can be altered to control specific
	 * aspects of formatting a number.
	 * Very large numbers and very small magnitude numbers can be formatted with this function. However, the
	 * number of significant digits is limited to the precision provided by the Number object. Scientific notation
	 * is not supported.
	 * When this method is called and it completes successfully, the lastOperationStatus property is set to:LastOperationStatus.NO_ERROROtherwise the lastOperationStatus property is set to one of the constants defined in the
	 * LastOperationStatus class.
	 * @param	value	A Number value to format.
	 * @return	A formatted number string.
	 * @throws	MemoryError if there are any internal memory allocation problems.
	 */
	public formatNumber (value:number) : string{
		console.log("formatNumber not implemented yet in flash/NumberFormatter");
		return "";

	}

	/**
	 * Formats a uint value.
	 *
	 *   This function is equivalent to the formatNumber() method except that it takes a uint.
	 * If the value passed in is too large, such as a value greater than 1.72e308, then this function returns 0.
	 *
	 *   When this method is called and it completes successfully, the lastOperationStatus property is set to:LastOperationStatus.NO_ERROROtherwise the lastOperationStatus property is set to one of the constants defined in the
	 * LastOperationStatus class.
	 * @param	value	A uint value.
	 * @return	A formatted number string.
	 * @throws	MemoryError if there are any internal memory allocation problems.
	 */
	public formatUint (value:number) : string{
		console.log("formatUint not implemented yet in flash/NumberFormatter");
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
		console.log("getAvailableLocaleIDNames not implemented yet in flash/NumberFormatter");
		return [];

	}

	/**
	 * Constructs a new NumberFormatter object to format numbers according to
	 * the conventions of a given locale.
	 *
	 *   This constructor determines if the current operating system supports the requested locale ID name.
	 * If it is not supported then a fallback locale is used instead.
	 * If a fallback locale is used then the the lastOperationStatus property
	 * indicates the type of fallback, and the actualLocaleIDName property contains
	 * the name of the fallback locale ID. To format based on the user's current operating system preferences, pass the value LocaleID.DEFAULT
	 * in the requestedLocaleIDName parameter to the constructor.
	 * When the constructor completes successfully, the lastOperationStatus property is set to:LastOperationStatus.NO_ERRORWhen the requested locale ID name is not available then the lastOperationStatus
	 * is set to one of the following:LastOperationStatus.USING_FALLBACK_WARNINGLastOperationStatus.USING_DEFAULT_WARNINGIf this class is not supported on the current operating system, then the lastOperationStatus property is set to:LastOperationStatus.UNSUPPORTED_ERROROtherwise the lastOperationStatus property is set to one of the constants defined in
	 * the LastOperationStatus class.For details on the warnings listed above and other possible values of the
	 * lastOperationStatus property see the descriptions in the LastOperationStatus class.
	 * @param	requestedLocaleIDName	The preferred locale ID name to use when determining number formats.
	 * @throws	TypeError if the requestedLocaleIDName is null
	 */
	constructor (requestedLocaleIDName:string){

	}

	/**
	 * Parses a string and returns a NumberParseResult object containing the parsed elements.
	 *
	 *   The NumberParseResult object contains
	 * the value of the first number found in the input string, the starting index for the number within the string, and the index
	 * of the first character after the number in the string. If the string does not contain a number, the value property of the NumberParseResult is set to NaN and the
	 * startIndex and endIndex properties are set to the hexadecimal value 0x7fffffff.
	 * This function uses the value of the decimalSeparator property to determine the portion of the number
	 * that contains fractional
	 * digits, and the groupingSeparator property to determine which characters are allowed within the digits of a number,
	 * and the negativeNumberFormat property to control how negative values are represented. The following table identifies the result of strings parsed for the various NegativeNumberFormat values:NegativeNumberFormatInput StringResult(n)"(123)" or "( 123 )""-123"-n"-123" or "- 123""-123"- n"-123" or "- 123""-123"n-"123-" or "123 -""-123"n -"123-" or "123 -""-123"A single white space is allowed between the number and the minus sign or parenthesis.Other properties are ignored when determining a valid number. Specifically the value of the
	 * digitsType property is ignored and the digits can be from any of
	 * the digit sets that are enumerated in the NationalDigitsType class. The values of the groupingPattern
	 * and useGrouping properties do not influence the parsing of the number.
	 * If numbers are preceded or followed in the string by a plus sign '+', the plus sign is treated as
	 * a character that is not part of the number.
	 * This function does not parse strings containing numbers in scientific notation (e.g. 1.23e40).When this method is called and it completes successfully, the lastOperationStatus property is set to:LastOperationStatus.NO_ERROROtherwise the lastOperationStatus property is set to one of the constants defined in the
	 * LastOperationStatus class.
	 * @throws	TypeError if the parseString is null
	 */
	public parse (parseString:string) : any{
		// todo: any is NumberParseResult
		console.log("parse not implemented yet in flash/NumberFormatter");
		return null;

	}

	/**
	 * Parses a string that contains only digits and optional whitespace characters and returns a Number.
	 * If the string does not begin
	 * with a number or contains characters other than whitespace that are not part of the number, then
	 * this method returns NaN. White space before or after the numeric digits is ignored. A white space
	 * character is a character that has a Space Separator (Zs) property in the Unicode Character Database (see http://www.unicode.org/ucd/).
	 *
	 *   If the numeric digit is preceded or followed by a plus sign '+' it is treated as a non-whitespace character.
	 * The return value is NaN.
	 * See the description of the parse function for more information about number parsing and what constitutes
	 * a valid number.
	 * When this method is called and it completes successfully, the lastOperationStatus property is set to:LastOperationStatus.NO_ERROROtherwise the lastOperationStatus property is set to one of the constants defined in the
	 * LastOperationStatus class.
	 * @throws	TypeError if the parseString is null
	 */
	public parseNumber (parseString:string) : number{
		console.log("parseNumber not implemented yet in flash/NumberFormatter");
		return 0;
	}
}

