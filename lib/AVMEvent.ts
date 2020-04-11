import {EventBase} from "@awayjs/core";
import {AVMVERSION} from "./factories/base/AVMVersion";

export class AVMEvent extends EventBase
{
	private _avmVersion:AVMVERSION;

	/**
	 * Dispatched when a AVM has been init (should only happen once for each AVM)
	 */
	public static AVM_COMPLETE:string = 'avmComplete';



	constructor(type:string, avmVersion:AVMVERSION)
	{
		super(type);

		this._avmVersion = avmVersion;
	}


	/**
	 * Additional human-readable message. Usually supplied for ParserEvent.PARSE_ERROR events.
	 */
	public get avmVersion():AVMVERSION
	{
		return this._avmVersion;
	}


	public clone():AVMEvent
	{
		return new AVMEvent(this.type, this._avmVersion);
	}
}