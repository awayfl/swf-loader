import {LoaderInfo as LoaderInfoAway} from "@awayjs/core"
import {ISecurityDomain} from "../ISecurityDomain";

export class LoaderInfo extends LoaderInfoAway{
	public swfVersion:number=0;
	public sec:ISecurityDomain;
	public _avm1Context:any;
	public getSymbolById(id:number):any{

	};
}
