import {URLRequest} from "./URLRequest";

export function navigateToURL(url:URLRequest, target:string):void{
	window.open(url.url, "_blank"); 
}
