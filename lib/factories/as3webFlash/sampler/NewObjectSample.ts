import { Sample } from "./Sample";

/**
 * The NewObjectSample class represents objects that are created within a <codeph class="+ topic/ph pr-d/codeph ">getSamples()</codeph> stream.
 * For Flash Player debugger version only.
 */
export class NewObjectSample extends Sample
{
	public id : number;

	/**
	 * The Class object corresponding to the object created within a getSamples() stream.
	 * For Flash Player debugger version only.
	 */
	public type : any;

	/**
	 * The NewObjectSample object if it still exists. If the object has been garbage collected, this property is
	 * undefined and a corresponding DeleteObjectSample exists. For Flash Player debugger version only.
	 */
	public get object () : any{
		console.log("object not implemented yet in flash/NewObjectSample");
		return null;

	}

	/**
	 * The NewObjectSample object size. If the object has been garbagecollected, this property is
	 * undefined and a corresponding DeleteObjectSample exists. For FlashPlayer debugger version only.
	 */
	public get size () : number{
		console.log("size not implemented yet in flash/NewObjectSample");
		return 0;

	}

	constructor (){
		super();
	}
}

