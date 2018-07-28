import {EventBase} from "@awayjs/core";
export class ProgressEvent extends EventBase{
	public static PROGRESS="progress";
	public static SOCKET_DATA="socketData";
	public static STANDARD_ERROR_DATA="standardErrorData";
	public static STANDARD_OUTPUT_DATA="standardOutputData";

	private _byteLoaded:number;
	private _bytesTotal:number;

	public get bytesTotal():number
	{
		return this._bytesTotal;
	}
	public get bytesLoaded():number
	{
		return this._byteLoaded;
	}
	public clone():EventBase{
		return new ProgressEvent(this.type, null, null, this._byteLoaded, this._bytesTotal);
	}

	constructor (type:string, bubbles:boolean=true, cancelable:boolean=false, byteLoaded:number = 0, bytesTotal:number = 0)
	{
		super(type);

		this._byteLoaded = byteLoaded;
		this._bytesTotal = bytesTotal;
	}
}
