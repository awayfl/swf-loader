

// win flash this is located in flash.trace.Trace, but i didnt want to create a new folder just for it, so i put it into utils
export class Trace extends Object
{
	public static FILE : any;
	public static LISTENER : any;
	public static METHODS : number;
	public static METHODS_AND_LINES : number;
	public static METHODS_AND_LINES_WITH_ARGS : number;
	public static METHODS_WITH_ARGS : number;
	public static OFF : number;

	public static getLevel (target:number=2) : number{
		console.log("getLevel is not implemented yet in flash/Trace");
		return 0;
	}

	public static getListener () : Function{
		console.log("getListener is not implemented yet in flash/Trace");
		return null;
	}

	public static setLevel (l:number, target:number=2) : any{
		console.log("setLevel is not implemented yet in flash/Trace");
	}

	public static setListener (f:Function) : any{
		console.log("setListener is not implemented yet in flash/Trace");
	}
}

