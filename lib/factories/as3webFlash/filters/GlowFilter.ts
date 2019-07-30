import{BitmapFilter}from "./BitmapFilter";
export class GlowFilter extends BitmapFilter{
	constructor(color:number=0xffffff,
				alpha:number=1,
				blurX:number=1,
				blurY:number=1,
				strength:number=1,
				quality:number=1,
				inner:boolean=false,
				knockout:boolean=false) {
		super();
	}
	public clone():GlowFilter{
		console.log("clone not implemented yet in flash/GlowFilter");
		return null;
	}
}