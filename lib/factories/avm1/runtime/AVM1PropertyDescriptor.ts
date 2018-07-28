import { AVM1PropertyFlags, IAVM1Callable, IAVM1PropertyWatcher } from "../runtime";

export class AVM1PropertyDescriptor {
	public originalName: string;
	constructor(public flags: AVM1PropertyFlags,
				public value?: any,
				public get?: IAVM1Callable,
				public set?: IAVM1Callable,
				public watcher?: IAVM1PropertyWatcher) {
		// Empty block
	}
}