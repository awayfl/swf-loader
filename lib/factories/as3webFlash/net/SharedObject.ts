export class SharedObject
{
	public data : Object;
	private _object_name : string;


	//for AVM1:
	public fps:number;

	constructor(name:string)
	{
		this._object_name=name;
		if(typeof(Storage) !== "undefined") {
			this.data = JSON.parse(localStorage.getItem(name));
		}
		if(this.data==null){
			console.log("no shared object found");
			this.data = {};
		}
	}

	public static getLocal(name:string, localPath?:string, secure?:boolean) : SharedObject
	{
		return new SharedObject(name);
	}
	public static getRemote(name:string, remotePath?:string, persistence?:boolean, secure?:boolean) : SharedObject
	{
		return new SharedObject(name);
	}

	public flush(minDiscSapce:number=0) : void
	{
		if(typeof(Storage) !== "undefined") {
			localStorage.setItem(this._object_name, JSON.stringify(this.data));
		}
		else{
			console.log("no local storage available");

		}
	}
	public clear() : void {
	}
	public close() : void {
	}
	public connect(myConnection:any , params:string = null) : void {//todo NetConnection
	}
	public setDirty(propertyname:string):void{

	}
	public setProperty(propertyname:string, value:any):void{
		
	}
	public send(args:any) : void {
	}
}