import {TextEvent} from "./TextEvent";
import {Event} from "./Event";
export class ErrorEvent extends TextEvent{

	public static ERROR="error";

	constructor(type:string, bubbles:boolean=false, cancelable:boolean=false, text:string="", id:number=0){
		super(type, bubbles, cancelable, text);
	}

	public get errorID () : number{
		console.log("errorID not implemented yet in flash/ErrorEvent");
		return 0;
	}

	public clone():Event{
		console.log("clone not implemented yet in flash/ErrorEvent");
		return null;
	}
	public toString():string{
		console.log("toString not implemented yet in flash/ErrorEvent");
		return "";
	}
}