import{BitmapFilter}from "./BitmapFilter";
export class GradientBevelFilter extends BitmapFilter{
	constructor(distance:number,
				angle:number,
				colors:any[],
				alphas:any[],
				ratios:any[],
				blurX:number,
				blurY:number,
				strength:number,
				quality:number,
				type:string,
				knockout:boolean) {
		super();
		
	}
	public clone():GradientBevelFilter{
		console.log("clone not implemented yet in flash/GradientBevelFilter");
		return null;
	}
}

