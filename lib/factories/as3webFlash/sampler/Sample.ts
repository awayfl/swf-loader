
/**
 * The Sample class creates objects that hold memory analysis information over distinct durations.
 * For Flash Player debugger version only.
 */
export class Sample
{
	/**
	 * Contains information about the methods executed by Flash Player over a specified period of time. The format for the
	 * stack trace is similiar to the content shown in the exception dialog box of the Flash Player debugger version.
	 * For Flash Player debugger version only.
	 */
	public stack : any[];

	/**
	 * The microseconds that define the duration of the Sample instance. For Flash Player debugger version only.
	 */
	public time : number;

	constructor (){

	}
}

