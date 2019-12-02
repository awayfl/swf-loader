import {XML} from "./XML"
/**
 * The XMLList class contains methods for working with one or more XML elements. An XMLList object
 * can represent one or more XML objects or elements (including multiple nodes or attributes), so
 * you can call methods on the elements as a group or on the individual elements in the collection.
 * <p class="- topic/p ">If an XMLList object has only one XML element, you can use the XML class methods on the
 * XMLList object directly. In the following example, <codeph class="+ topic/ph pr-d/codeph ">example.two</codeph> is an XMLList
 * object of length 1, so you can call any XML method on it.</p><codeblock xml:space="preserve" class="+ topic/pre pr-d/codeblock ">
 * var example2 = &lt;example&gt;&lt;two&gt;2&lt;/two&gt;&lt;/example&gt;;</codeblock><p class="- topic/p ">If you attempt to use XML class methods with an XMLList object containing more than one XML
 * object, an exception is thrown; instead, iterate over the XMLList collection (using a
 * <codeph class="+ topic/ph pr-d/codeph ">for each..in</codeph> statement, for example) and apply the methods to each XML object in
 * the collection.</p>
 */
export class XMLList
{
	public static length : any;

	/**
	 * Creates a new XMLList object.
	 * @param	value	Any object that can be converted to an XMLList object by using the top-level XMLList() function.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 */
	constructor (value:any=null){
	}

	public addNamespace (ns:any) : XML{
		console.log("addNamespace not implemented yet in flash/XMLList");
		return null;
	}

	public appendChild (child:any) : XML{
		console.log("appendChild not implemented yet in flash/XMLList");
		return null;
	}

	/**
	 * Calls the attribute() method of each XML object and returns an XMLList object
	 * of the results. The results match the given attributeName parameter. If there is no
	 * match, the attribute() method returns an empty XMLList object.
	 * @param	attributeName	The name of the attribute that you want to include in an XMLList object.
	 * @return	An XMLList object of matching XML objects or an empty XMLList object.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 */
	public attribute (arg:any) : XMLList{
		console.log("attribute not implemented yet in flash/XMLList");
		return null;
	}

	/**
	 * Calls the attributes() method of each XML object and
	 * returns an XMLList object of attributes for each XML object.
	 * @return	An XMLList object of attributes for each XML object.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 */
	public attributes () : XMLList{
		console.log("attributes not implemented yet in flash/XMLList");
		return null;
	}

	/**
	 * Calls the child() method of each XML object and returns an XMLList object that
	 * contains the results in order.
	 * @param	propertyName	The element name or integer of the XML child.
	 * @return	An XMLList object of child nodes that match the input parameter.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 */
	public child (propertyName:any) : XMLList{
		console.log("child not implemented yet in flash/XMLList");
		return null;
	}

	public childIndex () : number{
		console.log("childIndex not implemented yet in flash/XMLList");
		return 0;
	}

	/**
	 * Calls the children() method of each XML object and
	 * returns an XMLList object that contains the results.
	 * @return	An XMLList object of the children in the XML objects.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 */
	public children () : XMLList{
		console.log("children not implemented yet in flash/XMLList");
		return null;
	}

	/**
	 * Calls the comments() method of each XML object and returns
	 * an XMLList of comments.
	 * @return	An XMLList of the comments in the XML objects.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 */
	public comments () : XMLList{
		console.log("comments not implemented yet in flash/XMLList");
		return null;
	}

	/**
	 * Checks whether the XMLList object contains an XML object that is equal to the given
	 * value parameter.
	 * @param	value	An XML object to compare against the current XMLList object.
	 * @return	If the XMLList contains the XML object declared in the value parameter,
	 *   then true; otherwise false.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 */
	public contains (value:any) : boolean{
		console.log("contains not implemented yet in flash/XMLList");
		return false;
	}

	/**
	 * Returns a copy of the given XMLList object. The copy is a duplicate of the entire tree of nodes.
	 * The copied XML object has no parent and returns null if you attempt to call the parent() method.
	 * @return	The copy of the XMLList object.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 */
	public copy () : XMLList{
		console.log("copy not implemented yet in flash/XMLList");
		return null;
	}

	/**
	 * Returns all descendants (children, grandchildren, great-grandchildren, and so on) of the XML object
	 * that have the given name parameter. The name parameter can be a
	 * QName object, a String data type, or any other data type that is then converted to a String
	 * data type.
	 *
	 *   To return all descendants, use
	 * the asterisk (~~) parameter. If no parameter is passed,
	 * the string "~~" is passed and returns all descendants of the XML object.
	 * @param	name	The name of the element to match.
	 * @return	An XMLList object of the matching descendants (children, grandchildren, and so on) of the XML objects
	 *   in the original list. If there are no descendants, returns an empty XMLList object.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 */
	public descendants (name:any="*") : XMLList{
		console.log("descendants not implemented yet in flash/XMLList");
		return null;
	}

	/**
	 * Calls the elements() method of each XML object. The name parameter is
	 * passed to the descendants() method. If no parameter is passed, the string "~~" is passed to the
	 * descendants() method.
	 * @param	name	The name of the elements to match.
	 * @return	An XMLList object of the matching child elements of the XML objects.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 */
	public elements (name:any="*") : XMLList{
		console.log("elements not implemented yet in flash/XMLList");
		return null;
	}

	/**
	 * Checks whether the XMLList object contains complex content. An XMLList object is
	 * considered to contain complex content if it is not empty and either of the following conditions is true:
	 *
	 *   The XMLList object contains a single XML item with complex content.The XMLList object contains elements.
	 * @return	If the XMLList object contains complex content, then true; otherwise false.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 */
	public hasComplexContent () : boolean{
		console.log("hasComplexContent not implemented yet in flash/XMLList");
		return false;
	}

	/**
	 * Checks for the property specified by p.
	 * @param	p	The property to match.
	 * @return	If the parameter exists, then true; otherwise false.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 */
	public hasOwnProperty (P:any=null) : boolean{
		console.log("hasOwnProperty not implemented yet in flash/XMLList");
		return false;
	}

	/**
	 * Checks whether the XMLList object contains simple content. An XMLList object is
	 * considered to contain simple content if one or more of the following
	 * conditions is true:
	 * The XMLList object is emptyThe XMLList object contains a single XML item with simple contentThe XMLList object contains no elements
	 * @return	If the XMLList contains simple content, then true; otherwise false.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 */
	public hasSimpleContent () : boolean{
		console.log("hasSimpleContent not implemented yet in flash/XMLList");
		return false;
	}

	public inScopeNamespaces () : any[]{
		console.log("inScopeNamespaces not implemented yet in flash/XMLList");
		return [];
	}

	public insertChildAfter (child1:any, child2:any) : any{
		console.log("insertChildAfter not implemented yet in flash/XMLList");
		return null;
	}

	public insertChildBefore (child1:any, child2:any) : any{
		console.log("insertChildBefore not implemented yet in flash/XMLList");
		return null;
	}

	/**
	 * Returns the number of properties in the XMLList object.
	 * @return	The number of properties in the XMLList object.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 */
	public length () : number{
		console.log("length not implemented yet in flash/XMLList");
		return 0;
	}

	public localName () : any{
		console.log("localName not implemented yet in flash/XMLList");
		return null;
	}

	public name () : any{
		console.log("name not implemented yet in flash/XMLList");
		return null;
	}

	public namespace (prefix:any=null) : any{
		console.log("namespace not implemented yet in flash/XMLList");
		return null;
	}

	public namespaceDeclarations () : any[]{
		console.log("namespaceDeclarations not implemented yet in flash/XMLList");
		return [];
	}

	public nodeKind () : string{
		console.log("nodeKind not implemented yet in flash/XMLList");
		return "";
	}

	/**
	 * Merges adjacent text nodes and eliminates empty text nodes for each
	 * of the following: all text nodes in the XMLList, all the XML objects
	 * contained in the XMLList, and the descendants of all the XML objects in
	 * the XMLList.
	 * @return	The normalized XMLList object.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 */
	public normalize () : XMLList{
		console.log("normalize not implemented yet in flash/XMLList");
		return null;
	}

	/**
	 * Returns the parent of the XMLList object if all items in the XMLList object have the same parent.
	 * If the XMLList object has no parent or different parents, the method returns undefined.
	 * @return	Returns the parent XML object.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 */
	public parent () : any{
		console.log("parent not implemented yet in flash/XMLList");
		return null;
	}

	public prependChild (value:any) : XML{
		console.log("prependChild not implemented yet in flash/XMLList");
		return null;
	}

	/**
	 * If a name parameter is provided, lists all the children of the XMLList object that
	 * contain processing instructions with that name. With no parameters, the method lists all the
	 * children of the XMLList object that contain any processing instructions.
	 * @param	name	The name of the processing instructions to match.
	 * @return	An XMLList object that contains the processing instructions for each XML object.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 */
	public processingInstructions (name:any="*") : XMLList{
		console.log("processingInstructions not implemented yet in flash/XMLList");
		return null;
	}

	/**
	 * Checks whether the property p is in the set of properties that can be iterated in a for..in statement
	 * applied to the XMLList object. This is true only if toNumber(p) is greater than or equal to 0
	 * and less than the length of the XMLList object.
	 * @param	p	The index of a property to check.
	 * @return	If the property can be iterated in a for..in statement, then true; otherwise false.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 */
	public propertyIsEnumerable (P:any=null) : boolean{
		console.log("propertyIsEnumerable not implemented yet in flash/XMLList");
		return false;
	}

	public removeNamespace (ns:any) : XML{
		console.log("removeNamespace not implemented yet in flash/XMLList");
		return null;
	}

	public replace (propertyName:any, value:any) : XML{
		console.log("replace not implemented yet in flash/XMLList");
		return null;
	}

	public setChildren (value:any) : XML{
		console.log("setChildren not implemented yet in flash/XMLList");
		return null;
	}

	public setLocalName (name:any){
		console.log("setLocalName not implemented yet in flash/XMLList");
	}

	public setName (name:any){
		console.log("setName not implemented yet in flash/XMLList");
	}

	public setNamespace (ns:any) {
		console.log("setNamespace not implemented yet in flash/XMLList");
	}

	/**
	 * Calls the text() method of each XML
	 * object and returns an XMLList object that contains the results.
	 * @return	An XMLList object of all XML properties of the XMLList object that represent XML text nodes.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 */
	public text () : XMLList{
		console.log("text not implemented yet in flash/XMLList");
		return null;
	}

	public toJSON (k:string) : any{
		console.log("toJSON not implemented yet in flash/XMLList");
		return null;
	}

	/**
	 * Returns a string representation of all the XML objects in an XMLList object. The rules for
	 * this conversion depend on whether the XML object has simple content or complex content:
	 *
	 *   If the XML object has simple content, toString() returns the string contents of the
	 * XML object with  the following stripped out: the start tag, attributes, namespace declarations, and
	 * end tag. If the XML object has complex content, toString() returns an XML encoded string
	 * representing the entire XML object, including the start tag, attributes, namespace declarations,
	 * and end tag.To return the entire XML object every time, use the toXMLString() method.
	 * @return	The string representation of the XML object.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 */
	public toString () : string{
		console.log("toString not implemented yet in flash/XMLList");
		return "";
	}

	/**
	 * Returns a string representation of all the XML objects in an XMLList object.
	 * Unlike the toString() method, the toXMLString()
	 * method always returns the start tag, attributes,
	 * and end tag of the XML object, regardless of whether the XML object has simple content
	 * or complex content. (The toString() method strips out these items for XML
	 * objects that contain simple content.)
	 * @return	The string representation of the XML object.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 */
	public toXMLString () : string{
		console.log("toXMLString not implemented yet in flash/XMLList");
		return "";
	}

	/**
	 * Returns the XMLList object.
	 * @return	Returns the current XMLList object.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 */
	public valueOf () : XMLList{
		console.log("valueOf not implemented yet in flash/XMLList");
		return null;
	}

}

