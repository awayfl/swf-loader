import { IAVM1SymbolBase } from "./AVM1Utils";

export class AVM1EventHandler {
	constructor(public propertyName: string,
				public eventName: string,
				public argsConverter: Function = null,
				public stageEvent:boolean=false) { }

	public onBind(target: IAVM1SymbolBase): void {}
	public onUnbind(target: IAVM1SymbolBase): void {}
}