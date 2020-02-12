import {Event} from "./Event";
export class TextEvent extends Event{

	public static LINK="link";
	public static TEXT_INPUT="textInput";
	public static NETWORK_ERROR="networkError";
	public static VERIFY_ERROR="verifyError";

	private _text:string;

	constructor(type:string, bubbles:boolean=false, cancelable:boolean=false, text:string=""){
		super(type, bubbles, cancelable);
		this._text=text;
	}

	public get text():string{
		return this._text;
	}
	public set text(value:string){
		this._text=value
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
