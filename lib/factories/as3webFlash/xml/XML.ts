import { XMLNode } from "./XMLNode";
import { XMLNodeType } from "./XMLNodeType";
import { XMLList } from "./XMLList";
export class XML extends XMLNode
{
	public contentType:string;
	public docTypeDecl:string;
	public ignoreWhite:boolean;
	public loaded:boolean;
	public status:number;
	public xmlDecl:string;
	public static ignoreWhitespace:boolean;
	public col:XMLList;
	public attribute:any;

	constructor(text:string){
		super(XMLNodeType.XML_DECLARATION, "null");
	}

	public addRequestHeader(header:any, headerValue:string){
		console.log("addRequestHeader not implemented yet in flash/XML");
	}
	public createElement(name:string):XMLNode{
		console.log("createElement not implemented yet in flash/XML");
		return null;
	}
	public createTextNode(value:string):XMLNode{
		console.log("createTextNode not implemented yet in flash/XML");
		return null;
	}
	public getBytesLoaded():number{
		console.log("getBytesLoaded not implemented yet in flash/XML");
		return 0;
	}
	public getBytesTotal():number{
		console.log("getBytesTotal not implemented yet in flash/XML");
		return 0;
	}
	// Central API
	public getRequestHeaders():any{
		console.log("getRequestHeaders not implemented yet in flash/XML");
		return null;
	}
	// Central API
	public getRequestHeader( key:string ):any{
		console.log("getRequestHeader not implemented yet in flash/XML");
		return null;
	}
	// Central API
	public getResponseHeaders():any{
		console.log("getResponseHeaders not implemented yet in flash/XML");
		return null;
	}
	// Central API
	public getResponseHeader( key:string ):any{
		console.log("getResponseHeader not implemented yet in flash/XML");
		return null;
	}
	// Central API
	public getResponseBody():any{
		console.log("getResponseBody not implemented yet in flash/XML");
		return null;
	}
	public load(url:string):boolean{
		console.log("load not implemented yet in flash/XML");
		return false;
	}
	public parseXML(value:string){
		console.log("parseXML not implemented yet in flash/XML");
	}
	public send(url:string,target:string,method:string):boolean{
		console.log("send not implemented yet in flash/XML");
		return false;
	}
	public sendAndLoad(url:string, resultXML:XML){
		console.log("sendAndLoad not implemented yet in flash/XML");
	}
	public onLoad(success:boolean){
		console.log("onLoad not implemented yet in flash/XML");
	}
	public onData(src:string){
		console.log("onData not implemented yet in flash/XML");
	}
}