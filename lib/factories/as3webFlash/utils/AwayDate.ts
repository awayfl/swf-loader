export class AwayDate{
	// todo check why this differs from the header file i converted from as3
	// just made it compatible for compile right now
	constructor(param1:any=0, param2:number=0,param3:number=0)//yearOrTimevalue:number,month:number,date:number,hour:number,minute:number,second:number,millisecond:number){
	{
	}

	public date:number;
	public fullYear:number;
	public month:number;

	public static UTC(year:number,month:number,date:number,
					  hour:number,minute:number,second:number,
					  millisecond:number):number{
		return 0;}

	public getDate():number{return 0;}
	public getDay():number{ return 0;}
	public getFullYear():number{ return 0;}
	public getHours():number{ return 0;}
	public getMilliseconds():number{ return 0;}
	public getMinutes():number{ return 0;}
	public getMonth():number{ return 0;}
	public getSeconds():number{ return 0;}
	public getTime():number{ return 0;}
	public getTimezoneOffset():number{ return 0;}
	public getUTCDate():number{ return 0;}
	public getUTCDay():number{ return 0;}
	public getUTCFullYear():number{ return 0;}
	public getUTCHours():number{ return 0;}
	public getUTCMilliseconds():number{ return 0;}
	public getUTCMinutes():number{ return 0;}
	public getUTCMonth():number{ return 0;}
	public getUTCSeconds():number{ return 0;}
	public getYear():number{ return 0;}
	public setDate(date:number):number{ return 0;}
	public setFullYear(year:number, month:number, date:number):number{ return 0;}
	public setHours(hour:number):number{ return 0;}
	public setMilliseconds(millisecond:number):number{ return 0;}
	public setMinutes(minute:number):number{ return 0;}
	public setMonth(month:number, date:number):number{ return 0;}
	public setSeconds(second:number):number{ return 0;}
	public setTime(millisecond:number):number{ return 0;}
	public setUTCDate(date:number):number{ return 0;}
	public setUTCFullYear(year:number, month:number, date:number):number{ return 0;}
	public setUTCHours(hour:number, minute:number, second:number, millisecond:number):number{ return 0;}
	public setUTCMilliseconds(millisecond:number):number{ return 0;}
	public setUTCMinutes(minute:number, second:number, millisecond:number):number{ return 0;}
	public setUTCMonth(month:number, date:number):number{ return 0;}
	public setUTCSeconds(second:number, millisecond:number):number{ return 0;}
	public setYear(year:number):number{ return 0;}
	public toString():string{ return "";}
	public valueOf():number{ return 0;}

	// Mobile specific
	public getLocaleLongDate():string{ return "";}
	public getLocaleShortDate():string{ return "";}
	public getLocaleTime():string{ return "";}
}
