/**
 * Runs a function at a specified interval (in milliseconds).
 *
 *   Instead of using the setInterval() method, consider
 * creating a Timer object, with the specified interval, using 0 as the repeatCount
 * parameter (which sets the timer to repeat indefinitely).If you intend to use the clearInterval() method to cancel the
 * setInterval() call, be sure to assign the setInterval() call to a
 * variable (which the clearInterval() function will later reference).
 * If you do not call the clearInterval() function to cancel the
 * setInterval() call, the object containing the set timeout closure
 * function will not be garbage collected.
 * @param	closure	The name of the function to execute. Do not include quotation marks or
 *   parentheses, and do not specify parameters of the function to call. For example, use
 *   functionName, not functionName() or functionName(param).
 * @param	delay	The interval, in milliseconds.
 * @param	arguments	An optional list of arguments that are passed to the closure function.
 * @return	Unique numeric identifier for the timed process. Use this identifier to cancel
 *   the process, by calling the clearInterval() method.
 */
export const setInterval = window.setInterval;