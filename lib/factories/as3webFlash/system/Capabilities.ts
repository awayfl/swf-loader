export class Capabilities{

	public static  get playerType():string
	{
		return "StandAlone"; //"Plugin"
	}
	public static  get touchscreenType():string
	{
		return "none"; //"Plugin"
	}
	public static  get screenDPI():number
	{
		return 0; //"Plugin"
	}
	public static  get screenResolutionX():number
	{
		return screen.width;
	}

	public static  get screenResolutionY():number
	{
		return screen.height;
	}


}