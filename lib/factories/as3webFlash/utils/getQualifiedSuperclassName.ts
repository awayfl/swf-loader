/**
 * Returns the fully qualified class name of the base class of the object specified by the value
 * parameter. This function provides a quicker way of retrieving the base class name than describeType(), but also
 * doesn't provide all the information describeType() does.
 * After you retrieve the name of a class with this function, you can convert the class name to a class reference with the getDefinitionByName() function.Note: This function restricts itself to instance hierarchies, whereas the describeType() function
 * uses class object hierarchies if the value parameter is a data type. Calling describeType() on a data type returns the
 * superclass based on the class object hierarchy, in which all class objects inherit from Class. The getQualifiedSuperclassName()
 * function, however, ignores the class object hierarchy and returns the superclass based on the more familiar instance hierarchy.
 * For example, calling getQualifiedSuperclassName(String)
 * returns Object although technically the String class object inherits from Class. In other words, the results are
 * the same whether you use an instance of a type or the type itself.
 * @param	value	Any value.
 * @return	A fully qualified base class name, or null if none exists.
 */
export const getQualifiedSuperclassName=function(name:any){
	//todo
	console.log("getQualifiedSuperclassName is not implemented yet in flash/utils");
	return ""
};