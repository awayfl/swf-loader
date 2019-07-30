import { XMLNode } from "./XMLNode";
import { XMLNodeType } from "./XMLNodeType";

/**
 * The XMLDocument class represents the legacy XML object
 * that was present in ActionScript 2.0. It was renamed in ActionScript 3.0
 * to XMLDocument to avoid name conflicts with the new
 * XML class in ActionScript 3.0. In ActionScript 3.0,
 * it is recommended that you use the new
 * <xref href="../../XML.html" class="- topic/xref ">XML</xref> class and related classes,
 * which support E4X (ECMAScript for XML).
 *
 *   <p class="- topic/p ">The XMLDocument class, as well as XMLNode and XMLNodeType, are present for backward
 * compatibility. The functionality for loading XML documents can now be found in the
 * URLLoader class.</p>
 */
export class XMLDocumentAway extends XMLNode
{

	// for AVM1:
	public axCallPublicProperty(value1:any, value2:any):any{
		return null;
	}
	public axGetPublicProperty(value:any):any{
		return null;
	}
	public axSetPublicProperty(value:any, value2:any):any{
		return null;
	}
	/**
	 * Creates a new XMLDocument object. You must use the constructor to create an XMLDocument object before you call any of the methods of the XMLDocument class.
	 * Note: Use the createElement() and createTextNode() methods to add elements and text nodes to an XML document tree.
	 * @param	source	The XML text parsed to create the new XMLDocument object.
	 */
	constructor(source:string=null){
		super(XMLNodeType.DOCUMENT_TYPE_NODE, "null");
	}
	/**
	 * Specifies information about the XML document's DOCTYPE declaration.
	 * After the XML text has been parsed into an XMLDocument object, the
	 * XMLDocument.docTypeDecl property of the XMLDocument object is set to the
	 * text of the XML document's DOCTYPE declaration
	 * (for example, <!DOCTYPEgreeting SYSTEM "hello.dtd">).
	 * This property is set using a string representation of the DOCTYPE declaration,
	 * not an XMLNode object.
	 * The legacy ActionScript XML parser is not a validating parser. The DOCTYPE
	 * declaration is read by the parser and stored in the XMLDocument.docTypeDecl property,
	 * but no DTD validation is performed.If no DOCTYPE declaration was encountered during a parse operation,
	 * the XMLDocument.docTypeDecl property is set to null.
	 * The XML.toString() method outputs the contents of XML.docTypeDecl
	 * immediately after the XML declaration stored in XML.xmlDecl, and before any other
	 * text in the XML object. If XMLDocument.docTypeDecl is null, no
	 * DOCTYPE declaration is output.
	 */
	public docTypeDecl : any;

	/**
	 * An Object containing the nodes of the XML that have an id attribute assigned.
	 * The names of the properties of the object (each containing a node) match the values of the
	 * id attributes.
	 *
	 */
	public idMap : any;

	/**
	 * When set to true, text nodes that contain only white space are discarded during the parsing process. Text nodes with leading or trailing white space are unaffected. The default setting is false.
	  */
	public ignoreWhite : boolean;

	/**
	 * A string that specifies information about a document's XML declaration.
	 * After the XML document is parsed into an XMLDocument object, this property is set
	 * to the text of the document's XML declaration. This property is set using a string
	 * representation of the XML declaration, not an XMLNode object. If no XML declaration
	 * is encountered during a parse operation, the property is set to null.
	 * The XMLDocument.toString() method outputs the contents of the
	 * XML.xmlDecl property before any other text in the XML object.
	 * If the XML.xmlDecl property contains null,
	 * no XML declaration is output.
	 * */
	public xmlDecl : any;

	/**
	 * Creates a new XMLNode object with the name specified in the parameter.
	 * The new node initially has no parent, no children, and no siblings.
	 * The method returns a reference to the newly created XMLNode object
	 * that represents the element. This method and the XMLDocument.createTextNode()
	 * method are the constructor methods for creating nodes for an XMLDocument object.
	 * @param	name	The tag name of the XMLDocument element being created.
	 * @return	An XMLNode object.
	 * */
	public createElement (name:string) : XMLNode{
		console.log("createElement not implemented yet in flash/XMLDocument");
		return null;
	}

	/**
	 * Creates a new XML text node with the specified text. The new node initially has no parent, and text nodes cannot have children or siblings. This method returns a reference to the XMLDocument object that represents the new text node. This method and the XMLDocument.createElement() method are the constructor methods for creating nodes for an XMLDocument object.
	 * @param	text	The text used to create the new text node.
	 * @return	An XMLNode object.
	 */
	public createTextNode (text:string) : XMLNode{
		console.log("createTextNode not implemented yet in flash/XMLDocument");
		return null;
	}

	/**
	 * Parses the XML text specified in the value parameter
	 * and populates the specified XMLDocument object with the resulting XML tree. Any existing trees in the XMLDocument object are discarded.
	 * @param	source	The XML text to be parsed and passed to the specified XMLDocument object.
	 */
	public parseXML (source:string){
		console.log("parseXML not implemented yet in flash/XMLDocument");
	}

	/**
	 * Returns a string representation of the XML object.
	 * @return	A string representation of the XML object.
	 */
	public toString () : string{
		console.log("toString not implemented yet in flash/XMLDocument");
		return "";
	}

}

