import {EventBase} from "@awayjs/core";
export class KeyboardEvent extends EventBase{

	public keyCode:number;
	public clone():EventBase{
		return new KeyboardEvent(this.type, this.keyCode);
	}

	constructor (type:string, keyCode:number=0)
	{
		super(type);

		this.keyCode = keyCode;
	}
}
