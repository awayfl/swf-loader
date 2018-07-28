import {TextField} from "@awayjs/scene"
export interface ISoftKeyboardManager{
	openKeyboard(activeText:TextField, fromMouseDown:boolean);
}