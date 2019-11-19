
export class ASObject{

	public axCallPublicProperty(value1:any, value2:any):any{
		return null;
	}
	public axGetPublicProperty(value:any):any{
		return null;
	}
	public axSetPublicProperty(value:any, value2:any):any{
		return null;
	}
	public axHasPublicProperty(value:any):any{
		return null;
	}
	public axDeletePublicProperty(value:any):any{
		return null;
	}
	public axGetEnumerableKeys():string[]{
		return [];
	}

}

export class ASBoolean extends ASObject{

}
export class ASArray extends ASObject{

}
export class ASFunction extends ASObject{

}
export class ASNumber extends ASObject{

}
export class ASString extends ASObject{

}

export class ASClass extends ASObject{
	tPrototype:any;
}

export class AXClass{
	axConstruct(value:any[]=[]){

	}
	axIsType(value:any):boolean{
		return true;
	}
}

export function FlashUtilScript_getTimer(param1: any){
	return 0;
}
export function FlashNetScript_navigateToURL(param1: any, param2:any, param3:any=null){
	window.open(param2.url, param3);
}
export function forEachPublicProperty(param1: any, param2:any, param3:any=null){
	return 0;
}

export function axCoerceString(x:any):string{
	if (typeof x === "string") {
		return x;
	} else if (x == undefined) {
		return null;
	}
	return x + '';
}


