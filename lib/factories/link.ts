
import {AVM1ActionsData} from "./avm1/context";
import {Debug, release} from "./base/utilities/Debug";
import { AXClass } from './avm2/run/AXClass';

export class AVM1ButtonAction {
	keyCode: number;
	stateTransitionFlags: number;
	actionsData: Uint8Array;
	actionsBlock: AVM1ActionsData;
}
export class TimelineSymbol{}

export function constructClassFromSymbol(symbol: TimelineSymbol, axClass: AXClass) {
	var instance = Object.create(axClass.tPrototype);
	if (instance._symbol) {
		release || Debug.assert(instance._symbol === symbol);
	} else {
		instance._symbol = symbol;
	}
	//instance.applySymbol();
	return instance;
}