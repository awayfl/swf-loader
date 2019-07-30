//
// C:\Users\80prozent\AppData\Local\FlashDevelop\Apps\flexairsdk\4.6.0+25.0.0\frameworks\libs\player\18.0\playerglobal.swc\flash\text\StyleSheet
//

import {EventDispatcher} from "../events/EventDispatcher";
import { TextFormat } from "./TextFormat";

/**
 * The StyleSheet class lets you create a StyleSheet object that contains text
 * formatting rules for font size, color, and other styles. You can then apply
 * styles defined by a style sheet to a TextField object that contains HTML- or
 * XML-formatted text. The text in the TextField object is automatically
 * formatted according to the tag styles defined by the StyleSheet object.
 * You can use text styles to define new formatting tags, redefine built-in HTML
 * tags, or create style classes that you can apply to certain HTML tags.
 *
 *   <p class="- topic/p ">To apply styles to a TextField object, assign the StyleSheet
 * object to a TextField object's <codeph class="+ topic/ph pr-d/codeph ">styleSheet</codeph> property.</p><p class="- topic/p "><b class="+ topic/ph hi-d/b ">Note:</b> A text field with a style sheet is not editable. In other words, a text field with the <codeph class="+ topic/ph pr-d/codeph ">type</codeph> property set to <codeph class="+ topic/ph pr-d/codeph ">TextFieldType.INPUT</codeph> applies the StyleSheet to the default text for the text field, but the content will no longer be editable by the user. Consider using the TextFormat class to assign styles to input text fields.</p><p class="- topic/p ">Flash Player supports a subset of properties in the original CSS1 specification
 * (<xref href="http://www.w3.org/TR/REC-CSS1" scope="external" class="- topic/xref ">www.w3.org/TR/REC-CSS1</xref>).
 * The following table shows the supported Cascading Style Sheet (CSS) properties and values, as well as their corresponding
 * ActionScript property names. (Each ActionScript property name is derived from the corresponding
 * CSS property name; if the name contains a hyphen, the hyphen is omitted and the subsequent character is capitalized.)</p><adobetable class="innertable"><tgroup cols="3" class="- topic/tgroup "><thead class="- topic/thead "><row class="- topic/row "><entry class="- topic/entry ">CSS property</entry><entry class="- topic/entry ">ActionScript property</entry><entry class="- topic/entry ">Usage and supported values</entry></row></thead><tbody class="- topic/tbody "><row class="- topic/row "><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">color</codeph></entry><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">color</codeph></entry><entry class="- topic/entry ">Only hexadecimal color values are supported. Named colors (such as <codeph class="+ topic/ph pr-d/codeph ">blue</codeph>)
 * are not supported. Colors are written in the following format: <codeph class="+ topic/ph pr-d/codeph ">#FF0000</codeph>.</entry></row><row class="- topic/row "><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">display</codeph></entry><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">display</codeph></entry><entry class="- topic/entry ">Supported values are <codeph class="+ topic/ph pr-d/codeph ">inline</codeph>, <codeph class="+ topic/ph pr-d/codeph ">block</codeph>, and <codeph class="+ topic/ph pr-d/codeph ">none</codeph>.</entry></row><row class="- topic/row "><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">font-family</codeph></entry><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">fontFamily</codeph></entry><entry class="- topic/entry ">A comma-separated list of fonts to use, in descending order of desirability. Any font
 * family name can be used. If you specify a generic font name, it is converted to an
 * appropriate device font. The following font conversions are available: <codeph class="+ topic/ph pr-d/codeph ">mono</codeph> is
 * converted to <codeph class="+ topic/ph pr-d/codeph ">_typewriter</codeph>, <codeph class="+ topic/ph pr-d/codeph ">sans-serif</codeph> is converted to
 * <codeph class="+ topic/ph pr-d/codeph ">_sans</codeph>, and <codeph class="+ topic/ph pr-d/codeph ">serif</codeph> is converted to <codeph class="+ topic/ph pr-d/codeph ">_serif</codeph>.</entry></row><row class="- topic/row "><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">font-size</codeph></entry><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">fontSize</codeph></entry><entry class="- topic/entry ">Only the numeric part of the value is used. Units (px, pt) are not parsed; pixels and points
 * are equivalent.</entry></row><row class="- topic/row "><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">font-style</codeph></entry><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">fontStyle</codeph></entry><entry class="- topic/entry ">Recognized values are <codeph class="+ topic/ph pr-d/codeph ">normal</codeph> and <codeph class="+ topic/ph pr-d/codeph ">italic</codeph>.</entry></row><row class="- topic/row "><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">font-weight</codeph></entry><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">fontWeight</codeph></entry><entry class="- topic/entry ">Recognized values are <codeph class="+ topic/ph pr-d/codeph ">normal</codeph> and <codeph class="+ topic/ph pr-d/codeph ">bold</codeph>.</entry></row><row class="- topic/row "><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">kerning</codeph></entry><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">kerning</codeph></entry><entry class="- topic/entry ">Recognized values are <codeph class="+ topic/ph pr-d/codeph ">true</codeph> and <codeph class="+ topic/ph pr-d/codeph ">false</codeph>.
 * Kerning is supported for embedded fonts only. Certain fonts, such as Courier New, do not support kerning.
 * The kerning property is only supported in SWF files created in Windows, not in SWF files created on the
 * Macintosh. However, these SWF files can be played in non-Windows versions of Flash Player and the kerning
 * still applies.</entry></row><row class="- topic/row "><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">leading</codeph></entry><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">leading</codeph></entry><entry class="- topic/entry ">The amount of space that is uniformly distributed between lines. The value specifies the
 * number of pixels that are added after each line. A negative value condenses the space
 * between lines. Only the numeric part of the value is used. Units (px, pt) are not parsed;
 * pixels and points are equivalent.</entry></row><row class="- topic/row "><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">letter-spacing</codeph></entry><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">letterSpacing</codeph></entry><entry class="- topic/entry ">The amount of space that is uniformly distributed between characters.
 * The value specifies the number of pixels that are added after each
 * character. A negative value condenses the space between characters. Only the numeric part of the
 * value is used. Units (px, pt) are not parsed; pixels and points are equivalent.</entry></row><row class="- topic/row "><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">margin-left</codeph></entry><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">marginLeft</codeph></entry><entry class="- topic/entry ">Only the numeric part of the value is used. Units (px, pt) are not parsed; pixels and points
 * are equivalent. </entry></row><row class="- topic/row "><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">margin-right</codeph></entry><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">marginRight</codeph></entry><entry class="- topic/entry ">Only the numeric part of the value is used. Units (px, pt) are not parsed; pixels and
 * points are equivalent.</entry></row><row class="- topic/row "><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">text-align</codeph></entry><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">textAlign</codeph></entry><entry class="- topic/entry ">Recognized values are <codeph class="+ topic/ph pr-d/codeph ">left</codeph>, <codeph class="+ topic/ph pr-d/codeph ">center</codeph>, <codeph class="+ topic/ph pr-d/codeph ">right</codeph>, and
 * <codeph class="+ topic/ph pr-d/codeph ">justify</codeph>.</entry></row><row class="- topic/row "><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">text-decoration</codeph></entry><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">textDecoration</codeph></entry><entry class="- topic/entry ">Recognized values are <codeph class="+ topic/ph pr-d/codeph ">none</codeph> and <codeph class="+ topic/ph pr-d/codeph ">underline</codeph>.</entry></row><row class="- topic/row "><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">text-indent</codeph></entry><entry class="- topic/entry "><codeph class="+ topic/ph pr-d/codeph ">textIndent</codeph></entry><entry class="- topic/entry ">Only the numeric part of the value is used. Units (px, pt) are not parsed; pixels and
 * points are equivalent. </entry></row></tbody></tgroup></adobetable><p class="- topic/p "><ph outputclass="flexonly" class="- topic/ph ">You can use the StyleSheet class to perform low-level text rendering.
 * However, in Flex, you typically use the Label, Text, TextArea, and TextInput controls to process text.</ph></p>
 *
 */
export class StyleSheet extends EventDispatcher
{
	/**
	 * Creates a new StyleSheet object.
	 */
	constructor (){
		super();
	}
	/**
	 * An array that contains the names (as strings) of all of the styles registered
	 * in this style sheet.
	 */
	public get styleNames () : any[]{
		console.log("styleNames not implemented yet in flash/Stylesheet");
		return [];
	}

	/**
	 * Removes all styles from the style sheet object.
	 */
	public clear () {
		console.log("clear not implemented yet in flash/Stylesheet");

	}

	/**
	 * Returns a copy of the style object associated with the style named styleName.
	 * If there is no style object associated with styleName,
	 * null is returned.
	 * @param	styleName	A string that specifies the name of the style to retrieve.
	 * @return	An object.
	 */
	public getStyle (styleName:string) : any{
		console.log("getStyle not implemented yet in flash/Stylesheet");
		return null;

	}

	/**
	 * Parses the CSS in CSSText and loads the style sheet with it. If a style in
	 * CSSText is already in styleSheet, the properties in
	 * styleSheet are retained, and only the ones in CSSText
	 * are added or changed in styleSheet.
	 *
	 *   To extend the native CSS parsing capability, you can override this method by creating a subclass
	 * of the StyleSheet class.
	 * @param	CSSText	The CSS text to parse (a string).
	 */
	public parseCSS (CSSText:string) {
		console.log("parseCSS not implemented yet in flash/Stylesheet");

	}

	/**
	 * Adds a new style with the specified name to the style sheet object.
	 * If the named style does not already exist in the style sheet, it is added.
	 * If the named style already exists in the style sheet, it is replaced.
	 * If the styleObject parameter is null, the named style is removed.
	 *
	 *   Flash Player creates a copy of the style object that you pass to this method.For a list of supported styles, see the table in the description for the StyleSheet class.
	 * @param	styleName	A string that specifies the name of the style to add to the style sheet.
	 * @param	styleObject	An object that describes the style, or null.
	 */
	public setStyle (styleName:string, styleObject:any) {
		console.log("setStyle not implemented yet in flash/Stylesheet");

	}


	/**
	 * Extends the CSS parsing capability. Advanced developers can override this method by extending the
	 * StyleSheet class.
	 * @param	formatObject	An object that describes the style, containing style rules as properties of the object,
	 *   or null.
	 * @return	A TextFormat object containing the result of the mapping of CSS rules
	 *   to text format properties.
	 */
	public transform (formatObject:any) : TextFormat{
		console.log("transform not implemented yet in flash/Stylesheet");
		return null;

	}
}

