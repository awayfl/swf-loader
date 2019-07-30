import{BitmapFilter}from "./BitmapFilter";
export class DropShadowFilter extends BitmapFilter{
	constructor(distance:number,
				angle:number,
				color:number=0xffffff,
				alpha:number=1,
				blurX:number=1,
				blurY:number=1,
				strength:number=1,
				quality:number=1,
				inner:boolean=false,
				knockout:boolean=false,
				hideObject:boolean=false) {
		super();
		
	}
	public clone():DropShadowFilter{
		console.log("clone not implemented yet in flash/DropShadowFilter");
		return null;
	}
}

