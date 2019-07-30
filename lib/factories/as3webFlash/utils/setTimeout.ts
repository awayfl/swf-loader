/**
 * Runs a specified function after a specified delay (in milliseconds).
 *
 *   Instead of using this method, consider
 * creating a Timer object, with the specified interval, using 1 as the repeatCount
 * parameter (which sets the timer to run only once).If you intend to use the clearTimeout() method to cancel the
 * setTimeout() call, be sure to assign the setTimeout() call to a
 * variable (which the clearTimeout() function will later reference).
 * If you do not call the clearTimeout() function to cancel the
 * setTimeout() call, the object containing the set timeout closure
 * function will not be garbage collected.
 * @param	closure	The name of the function to execute. Do not include quotation marks or
 *   parentheses, and do not specify parameters of the function to call. For example, use
 *   functionName, not functionName() or functionName(param).
 * @param	delay	The delay, in milliseconds, until the function is executed.
 * @param	arguments	An optional list of arguments that are passed to the closure function.
 * @return	Unique numeric identifier for the timed process. Use this identifier to cancel
 *   the process, by calling the clearTimeout() method.
 */
export const setTimeout = window.setTimeout;