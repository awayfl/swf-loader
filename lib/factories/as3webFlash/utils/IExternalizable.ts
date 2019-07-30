//
// C:\Users\80prozent\AppData\Local\FlashDevelop\Apps\flexairsdk\4.6.0+25.0.0\frameworks\libs\player\18.0\playerglobal.swc\flash\utils\IExternalizable
//

import { IDataOutput } from "./IDataOutput";
import { IDataInput } from "./IDataInput";

/**
 * The IExternalizable interface provides control over serialization of a class as it is encoded
 * into a data stream. The <codeph class="+ topic/ph pr-d/codeph ">writeExternal()</codeph> and
 * <codeph class="+ topic/ph pr-d/codeph ">readExternal()</codeph> methods of the IExternalizable interface are implemented by a class to allow customization
 * of the contents and format of the data stream (but not the classname or type) for an object and its supertypes.
 * Each individual class must serialize and reconstruct the state of its instances. These methods must be symmetrical with
 * the supertype to save its state. These methods supercede the native Action Message Format (AMF) serialization behavior.
 * <p class="- topic/p ">If a class does not implement, nor inherits from a class which implements, the IExternalizable interface, then an instance
 * of the class will be serialized using the default mechanism of public members only. As a result, private, internal, and
 * protected members of a class will not be available.</p><p class="- topic/p ">To serialize private members, a class must use the IExternalizable interface.
 */
export interface IExternalizable
{
	/**
	 * A class implements this method to decode itself from a data stream by calling the methods of the IDataInput
	 * interface. This method must read the values in the same sequence and with the same types as
	 * were written by the writeExternal() method.
	 * @param	input	The name of the class that implements the IDataInput interface.
	 */
	readExternal (input:IDataInput);

	/**
	 * A class implements this method to encode itself for a data stream by calling the methods of the IDataOutput
	 * interface.
	 * @param	output	The name of the class that implements the IDataOutput interface.
	 */
	writeExternal (output:IDataOutput);
}

