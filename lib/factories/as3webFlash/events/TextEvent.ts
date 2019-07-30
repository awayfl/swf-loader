import {Event} from "./Event";
export class TextEvent extends Event{

	public static LINK="link";
	public static TEXT_INPUT="textInput";
	public static NETWORK_ERROR="networkError";
	public static VERIFY_ERROR="verifyError";

	constructor(type:string, bubbles:boolean=false, cancelable:boolean=false, text:string=""){
		super(type, bubbles, cancelable);
	}

	public get text():string{
		console.log("text not implemented yet in flash/IOErrorEvent");
		return "";
	}
	public set text(value:string){
		console.log("text not implemented yet in flash/IOErrorEvent");
	}
	public clone():Event{
		console.log("clone not implemented yet in flash/IOErrorEvent");
		return null;
	}
	public toString():string{
		console.log("toString not implemented yet in flash/IOErrorEvent");
		return "";
	}
}
