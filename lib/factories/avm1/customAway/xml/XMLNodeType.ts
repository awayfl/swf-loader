

/**
 * The XMLNodeType class contains constants used with
 * <codeph class="+ topic/ph pr-d/codeph ">XMLNode.nodeType</codeph>. The values are defined
 * by the NodeType enumeration in the
 * W3C DOM Level 1 recommendation:
 * <xref href="http://www.w3.org/TR/1998/REC-DOM-Level-1-19981001/level-one-core.html" scope="external" class="- topic/xref ">http://www.w3.org/TR/1998/REC-DOM-Level-1-19981001/level-one-core.html</xref>
 * @langversion	3.0
 * @playerversion	Flash 9
 * @playerversion	Lite 4
 */
export class XMLNodeType
{
	//80pro todo: all values above 100 are value i assigned, maybe worth to check what they was in original as3
	public static CDATA_NODE : number = 100;
	public static COMMENT_NODE : number = 101;
	public static DOCUMENT_TYPE_NODE : number = 102;

	/**
	 * Specifies that the node is an element.
	 * This constant is used with XMLNode.nodeType.
	 * The value is defined by the NodeType enumeration in the
	 * W3C DOM Level 1 recommendation:
	 * http://www.w3.org/TR/1998/REC-DOM-Level-1-19981001/level-one-core.html
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 */
	public static ELEMENT_NODE : number = 1;
	public static PROCESSING_INSTRUCTION_NODE : number = 103;

	/**
	 * Specifies that the node is a text node.
	 * This constant is used with XMLNode.nodeType.
	 * The value is defined by the NodeType enumeration in the
	 * W3C DOM Level 1 recommendation:
	 * http://www.w3.org/TR/1998/REC-DOM-Level-1-19981001/level-one-core.html
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 */
	public static TEXT_NODE : number = 3;
	public static XML_DECLARATION : number=104;

	constructor (){
		// todo: why does this have a constructor ? it just provides static props...
	}
}

