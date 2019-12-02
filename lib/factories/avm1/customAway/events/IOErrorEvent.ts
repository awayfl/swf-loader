import {EventBase} from "@awayjs/core";
export class IOErrorEvent extends EventBase{

	public static IO_ERROR="ioError";
	public static DISK_ERROR="diskError";
	public static NETWORK_ERROR="networkError";
	public static VERIFY_ERROR="verifyError";

	public clone():EventBase{
		console.log("clone not implemented yet in flash/IOErrorEvent");
		return null;
	}
	public toString():string{
		console.log("toString not implemented yet in flash/IOErrorEvent");
		return "";
	}
}
