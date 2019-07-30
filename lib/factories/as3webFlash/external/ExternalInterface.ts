
export class ExternalInterface
{
	static available:boolean; // read only

	static addCallback(methodName:string, instance:any, method:Function):boolean{
		console.log("addCallback not implemented yet in flash/ExternalInterface");
		return false;

	}
	static call(methodName:string, parameter1:any):any{
		console.log("methodName not implemented yet in flash/ExternalInterface");
		return null;

	}
}