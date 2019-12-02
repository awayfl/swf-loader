/**
 * The XMLNode class represents the legacy XML object
 * that was present in ActionScript 2.0 and that was renamed in ActionScript 3.0.
 * In ActionScript 3.0, consider using the new top-level <xref href="../../XML.html" class="- topic/xref ">XML</xref>
 * class and related classes instead,
 * which support E4X (ECMAScript for XML).
 * The XMLNode class is present for backward compatibility.
 */
export class XMLNode
{
	/**
	 * Creates a new XMLNode object. You must use the constructor to create an XMLNode object before you
	 * call any of the methods of the XMLNode class.
	 * Note: Use the createElement() and createTextNode()
	 * methods to add elements and text nodes to an XML document tree.
	 * @param	type	The node type: either 1 for an XML element or 3 for a text node.
	 * @param	value	The XML text parsed to create the new XMLNode object.
	 */
	constructor (type:number, value:string){
	}

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
	 * Evaluates the specified XMLDocument object and references the first child in the parent node's child list.
	 * This property is null if the node does not have children. This property is
	 * undefined if the node is a text node. This is a read-only property and cannot be used
	 * to manipulate child nodes; use the appendChild(), insertBefore(), and
	 * removeNode() methods to manipulate child nodes.
	 */
	public firstChild : XMLNode;

	public removeChild(child:any){

	}
	/**
	 * An XMLNode value that references the last child in the node's child list. The
	 * XMLNode.lastChild property is null if the node does not have children.
	 * This property cannot be used to manipulate child nodes; use the appendChild(),
	 * insertBefore(), and removeNode() methods to manipulate child nodes.
	 */
	public lastChild : XMLNode;

	/**
	 * An XMLNode value that references the next sibling in the parent node's child list. This property is
	 * null if the node does not have a next sibling node. This property cannot be used to
	 * manipulate child nodes; use the appendChild(), insertBefore(), and
	 * removeNode() methods to manipulate child nodes.
	 */
	public nextSibling : XMLNode;

	/**
	 * A string representing the node name of the XMLNode object. If the XMLNode object is an XML
	 * element (nodeType == 1), nodeName is the name of the tag that
	 * represents the node in the XML file. For example, TITLE is the nodeName
	 * of an HTML TITLE tag. If the XMLNode object is a text node
	 * (nodeType == 3), nodeName is null.
	 */
	public nodeName : string;

	/**
	 * A nodeType constant value, either XMLNodeType.ELEMENT_NODE for an XML element or
	 * XMLNodeType.TEXT_NODE for a text node.
	 * The nodeType is a numeric value from the NodeType enumeration in the W3C DOM
	 * Level 1 recommendation:
	 * http://www.w3.org/TR/1998/REC-DOM-Level-1-19981001/level-one-core.html.
	 * The following table lists the values:4CDATA_SECTION_NODEInteger valueDefined
	 * constant1ELEMENT_NODE3TEXT_NODE5ENTITY_REFERENCE_NODE7PROCESSING_INSTRUCTION_NODE9DOCUMENT_NODE11DOCUMENT_FRAGMENT_NODEIn Flash Player, the built-in XMLNode class only supports XMLNodeType.ELEMENT_NODE and
	 * XMLNodeType.TEXT_NODE.
	 */
	public nodeType : number;

	/**
	 * The node value of the XMLDocument object. If the XMLDocument object is a text node, the nodeType
	 * is 3, and the nodeValue is the text of the node. If the XMLDocument object is an XML element
	 * (nodeType is 1), nodeValue is null and read-only.
	 */
	public nodeValue : string;

	/**
	 * An XMLNode value that references the parent node of the specified XML object, or returns
	 * null if the node has no parent. This is a read-only property and cannot be used to
	 * manipulate child nodes; use the appendChild(), insertBefore(), and
	 * removeNode() methods to manipulate child nodes.
	 */
	public parentNode : XMLNode;

	/**
	 * An XMLNode value that references the previous sibling in the parent node's child list.
	 * The property has a value of null if the node does not have a previous sibling node. This property
	 * cannot be used to manipulate child nodes; use the appendChild(),
	 * insertBefore(), and removeNode() methods to manipulate child nodes.
	 */
	public previousSibling : XMLNode;

	/**
	 * An object containing all of the attributes of the specified XMLNode instance. The
	 * XMLNode.attributes object contains one variable for each attribute of the XMLNode instance.
	 * Because these variables are defined as part of the object, they are generally referred to as
	 * properties of the object. The value of each attribute is stored in the corresponding property as a
	 * string. For example, if you have an attribute named color, you would retrieve
	 * that attribute's value
	 * by specifying color as the property name, as the following code shows:
	 *
	 *   var myColor:String = doc.firstChild.attributes.color
	 */
	public get attributes () : any{
		console.log("attributes not implemented yet in flash/XMLNode");
		return null;
	}

	public set attributes (value:any){
		console.log("attributes not implemented yet in flash/XMLNode");
	}

	/**
	 * An array of the specified XMLNode object's children. Each element in the array is a reference
	 * to an XMLNode object that represents a child node. This is a read-only property and cannot be
	 * used to manipulate child nodes. Use the appendChild(), insertBefore(),
	 * and removeNode()  methods to manipulate child nodes.
	 *
	 *   This property is undefined for text nodes (nodeType == 3).
	 */
	public get childNodes () : any[]{
		console.log("childNodes not implemented yet in flash/XMLNode");
		return [];
	}

	/**
	 * The local name portion of the XML node's name. This is the element name without
	 * the namespace prefix. For example, the node
	 * <contact:mailbox/>bob@example.com</contact:mailbox>
	 *   has the local name "mailbox", and the prefix "contact", which comprise the full
	 *   element name "contact.mailbox".
	 *
	 *     You can access the namespace prefix through the prefix property of
	 *   the XML node object. The nodeName property returns the full name
	 *   (including the prefix and the local name).
	 */
	public get localName () : string{
		console.log("localName not implemented yet in flash/XMLNode");
		return "";
	}

	/**
	 * If the XML node has a prefix, namespaceURI is the value of the xmlns
	 * declaration for that prefix (the URI), which is typically called the namespace URI.
	 * The xmlns declaration is in the current node or in a node higher in the XML
	 * hierarchy.
	 *
	 *   If the XML node does not have a prefix, the value of the namespaceURI property
	 * depends on whether there is a default namespace defined (as in
	 * xmlns="http://www.example.com/"). If there is a default namespace, the value of
	 * the namespaceURI property is the value of the default namespace.
	 * If there is no default namespace, the namespaceURI property for
	 * that node is an empty string ("").You can use the getNamespaceForPrefix() method to identify the namespace associated with a
	 * specific prefix. The namespaceURI property returns the prefix associated with the node name.
	 */
	public get namespaceURI () : string{
		console.log("namespaceURI not implemented yet in flash/XMLNode");
		return "";
	}

	/**
	 * The prefix portion of the XML node name. For example, the node
	 * <contact:mailbox/>bob@example.com</contact:mailbox> prefix
	 *   "contact" and the local name "mailbox", which comprise the full element name "contact.mailbox".
	 *
	 *     The nodeName property of an XML node object returns the full name
	 *   (including the prefix and the  local name). You can access the local name portion of the
	 *   element's name via the localName property.
	 */
	public get prefix () : string{
		console.log("prefix not implemented yet in flash/XMLNode");
		return "";
	}

	/**
	 * Appends the specified node to the XML object's child list. This method operates directly on the
	 * node referenced by the childNode parameter; it does not append a copy of the
	 * node. If the node to be appended already exists in another tree structure, appending the node to the
	 * new location will remove it from its current location. If the childNode
	 * parameter refers to a node that already exists in another XML tree structure, the appended child node
	 * is placed in the new tree structure after it is removed from its existing parent node.
	 * @param	node	An XMLNode that represents the node to be moved from its current location to the child
	 *   list of the my_xml object.
	 */
	public appendChild (node:XMLNode){
		console.log("appendChild not implemented yet in flash/XMLNode");
	}

	/**
	 * Constructs and returns a new XML node of the same type, name, value, and attributes as the
	 * specified XML object. If deep is set to true, all child nodes are
	 * recursively cloned, resulting in an exact copy of the original object's document tree.
	 * The clone of the node that is returned is no longer associated with the tree of the cloned item.
	 * Consequently, nextSibling, parentNode, and previousSibling
	 * all have a value of null. If the deep parameter is set to
	 * false, or the my_xml node has no child nodes,
	 * firstChild and lastChild are also null.
	 * @param	deep	A Boolean value; if set to true, the children of the specified XML object will be recursively cloned.
	 * @return	An XMLNode Object.
	 */
	public cloneNode (deep:boolean) : XMLNode{
		console.log("cloneNode not implemented yet in flash/XMLNode");
		return null;
	}

	/**
	 * Returns the namespace URI that is associated with the specified prefix for the node. To determine
	 * the URI, getPrefixForNamespace() searches up the XML hierarchy from the node, as
	 * necessary, and returns the namespace URI of the first xmlns declaration for the
	 * given prefix.
	 *
	 *   If no namespace is defined for the specified prefix, the method returns null.If you specify an empty string ("") as the prefix and there is a
	 * default namespace defined for the node (as in xmlns="http://www.example.com/"),
	 * the method returns that default namespace URI.
	 * @param	prefix	The prefix for which the method returns the associated namespace.
	 * @return	The namespace that is associated with the specified prefix.
	 * @refpath
	 */
	public getNamespaceForPrefix (prefix:string) : string{
		console.log("getNamespaceForPrefix not implemented yet in flash/XMLNode");
		return "";
	}

	/**
	 * Returns the prefix that is associated with the specified namespace URI for the node. To determine
	 * the prefix, getPrefixForNamespace() searches up the XML hierarchy from the node, as
	 * necessary, and returns the prefix of the first xmlns declaration with a namespace URI
	 * that matches ns.
	 *
	 *   If there is no xmlns
	 * assignment for the given URI, the method returns null. If there is an
	 * xmlns assignment for the given URI but no prefix is associated with the assignment,
	 * the method returns an empty string
	 * ("").
	 * @param	ns	The namespace URI for which the method returns the associated prefix.
	 * @return	The prefix associated with the specified namespace.
	 */
	public getPrefixForNamespace (ns:string) : string{
		console.log("getPrefixForNamespace not implemented yet in flash/XMLNode");
		return "";
	}

	/**
	 * Indicates whether the specified XMLNode object has child nodes. This property is true if the
	 * specified XMLNode object has child nodes; otherwise, it is false.
	 * @return	Returns true if the
	 *   specified XMLNode object has child nodes; otherwise, false.
	 */
	public hasChildNodes () : boolean{
		console.log("hasChildNodes not implemented yet in flash/XMLNode");
		return false;
	}

	/**
	 * Inserts a new child node into the XML object's child list, before the
	 * beforeNode node. If the beforeNode parameter is undefined
	 * or null, the node is added using the appendChild() method. If beforeNode
	 * is not a child of my_xml, the insertion fails.
	 * @param	node	The XMLNode object to be inserted.
	 * @param	before	The XMLNode object before the insertion point for the childNode.
	 */
	public insertBefore (node:XMLNode, before:XMLNode){
		console.log("insertBefore not implemented yet in flash/XMLNode");
	}

	/**
	 * Removes the specified XML object from its parent. Also deletes all descendants of the node.
	 */
	public removeNode () {
		console.log("removeNode not implemented yet in flash/XMLNode");
	}

	/**
	 * Evaluates the specified XMLNode object, constructs a textual representation of the XML structure,
	 * including the node, children, and attributes, and returns the result as a string.
	 *
	 *   For top-level XMLDocument objects (those created with the constructor),
	 * the XMLDocument.toString() method outputs the document's XML declaration
	 * (stored in the XMLDocument.xmlDecl property), followed by the document's
	 * DOCTYPE declaration (stored in the XMLDocument.docTypeDecl property),
	 * followed by the text representation of all XML nodes in the object. The XML declaration is not
	 * output if the XMLDocument.xmlDecl property is null.
	 * The DOCTYPE declaration is not output if the
	 * XMLDocument.docTypeDecl property is null.
	 * @return	The string representing the XMLNode object.
	 */
	public toString () : string{
		console.log("toString not implemented yet in flash/XMLNode");
		return "";
	}

}

