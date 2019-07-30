import {ErrorEvent} from "./ErrorEvent";
import {Event} from "./Event";
export class IOErrorEvent extends ErrorEvent{

	public static IO_ERROR="ioError";
	public static DISK_ERROR="diskError";
	public static NETWORK_ERROR="networkError";
	public static VERIFY_ERROR="verifyError";

	public clone():Event{
		console.log("clone not implemented yet in flash/IOErrorEvent");
		return null;
	}
	public toString():string{
		console.log("toString not implemented yet in flash/IOErrorEvent");
		return "";
	}
}
