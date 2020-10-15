
import { notImplemented } from './Debug';

export interface IClipboardService {
	setClipboard(data: string): void;
}

export var ClipboardService: IClipboardService = {
	setClipboard(data: string) { notImplemented('setClipboard'); }
};