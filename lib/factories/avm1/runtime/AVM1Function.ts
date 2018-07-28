import { AVM1Object } from "./AVM1Object";
import { IAVM1Context, IAVM1Callable } from "../runtime";

/**
 * Base class for ActionsScript functions.
 */
export class AVM1Function extends AVM1Object implements IAVM1Callable {
	public isOnEnter:boolean;
	public constructor(context: IAVM1Context) {
		super(context);
		this.alPrototype = context.builtins.Function.alGetPrototypeProperty();
		this.isOnEnter=false;
	}

	public alConstruct(args?: any[]): AVM1Object {
		throw new Error('not implemented AVM1Function.alConstruct');
	}

	public alCall(thisArg: any, args?: any[]): any {
		throw new Error('not implemented AVM1Function.alCall');
	}

	/**
	 * Wraps the function to the callable JavaScript function.
	 * @returns {Function} a JavaScript function.
	 */
	public toJSFunction(thisArg: AVM1Object = null): Function {
		var fn = this;
		var context = this.context;
		return function () {
			var args = Array.prototype.slice.call(arguments, 0);
			return context.executeFunction(fn, thisArg, args);
		};
	}
}