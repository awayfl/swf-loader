import{URLRequest}from"./URLRequest"
import{EventDispatcher}from"../events/EventDispatcher"
import{ByteArray}from"../utils/ByteArray"
export class FileReference extends EventDispatcher
{
	public creationDate:Date;
	public modificationDate:Date;
	public name:string;
	public size:number;
	public creator:string;
	public type:string;
	public permissionStatus:string;
	public extension:string;
	public data:ByteArray;

	constructor(){
		super();
	}
	//Displays a file-browsing dialog box that lets the user select a file to upload.
	public browse(typelist:any[]):boolean{
		console.log("browse not implemented yet in flash/FileReference");
		return false;
	}

	//Starts the upload of the file to a remote server.
	public upload(url:URLRequest):boolean{
		console.log("upload not implemented yet in flash/FileReference");
		return false;
	}
	//Starts the load of a local file selected by a user.
	public load(){
		console.log("load not implemented yet in flash/FileReference");
	}
	//Opens a dialog box that lets the user save a file to the local filesystem.
	public save(data:any, defaultFileName:string=null){
		console.log("save not implemented yet in flash/FileReference");
	}
	//Requests permission to access filesystem.
	public requestPermission(){
		console.log("upload not implemented yet in flash/FileReference");
	}
	//Opens a dialog box that lets the user download a file from a remote server.
	public download(url:URLRequest, defaultFileName:string):boolean{
		console.log("download not implemented yet in flash/FileReference");
		return false;
	}
	//Cancels any ongoing upload or download operation on this FileReference object.
	public cancel(){
		console.log("cancel not implemented yet in flash/FileReference");
	}
}