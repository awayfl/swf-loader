

import {notImplemented} from "./Debug";

export interface IClipboardService {
	setClipboard(data: string): void;
}

export var instance: IClipboardService = {
	setClipboard(data: string) { notImplemented('setClipboard'); }
};


export class ClipboardService{
	public static IClipboardService=IClipboardService;
	public static instance=IClipboardService;
}