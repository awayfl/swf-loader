import {wrapAVM1NativeClass} from "./AVM1Utils";
import {DisplayObject, TextField, MouseManager} from "@awayjs/scene";
import {AVM1Context} from "../context";
import {notImplemented, warning} from "../../base/utilities/Debug";
import {PickGroup} from "@awayjs/view";
import { AVM1Object } from "../runtime/AVM1Object";
import { AVM1Stage } from './AVM1Stage';

var noManagerDebug:boolean=false;

export class AVM1Selection extends AVM1Object {

	private url: string = "";
	private targetMC: any = null;

	private _queued_focus_value:any=null;
	private _queued_focus:boolean=false;
	private callbackName: string = "";
	private callbackTarget: any = null;

	public static createAVM1Class(context: AVM1Context): AVM1Object {
		var wrapped = wrapAVM1NativeClass(context, true, AVM1Selection, [],
			['addListener', 'getFocus', 'getBeginIndex', 'getEndIndex', 'removeListener', 'setFocus', 'setSelection', 'getCaretIndex'],
			null, AVM1Selection.prototype.avm1Constructor);
		return wrapped;
	}
	public avm1Constructor(url, targetMC) {
		this.url = url;
		this.targetMC = targetMC;
		this._queued_focus=false;
	}

	//	Registers an object to receive keyboard focus change notifications.
	addListener(listener:any){
		notImplemented("AVM1Selection.addListener");
	}

	//	Removes an object previously registered with the Selection.addListener() method.
	removeListener(listener:any) : boolean{
		notImplemented("AVM1Selection.removeListener");
		return true;
	}
    getBeginIndex():number{
        var objectinFocus:DisplayObject=<DisplayObject>MouseManager.getInstance(PickGroup.getInstance((<AVM1Stage>this.context.globals.Stage)._awayAVMStage.scene.renderer.view)).getFocus();
        if(objectinFocus && objectinFocus.isAsset(TextField)){
            return (<TextField>objectinFocus).selectionBeginIndex;
        }
        return -1;
    }
    getEndIndex():number{
        var objectinFocus:DisplayObject=<DisplayObject>MouseManager.getInstance(PickGroup.getInstance((<AVM1Stage>this.context.globals.Stage)._awayAVMStage.scene.view)).getFocus();
        if(objectinFocus && objectinFocus.isAsset(TextField)){
            return (<TextField>objectinFocus).selectionEndIndex;
        }
        return -1;
    }
    getCaretIndex():number{
        var objectinFocus:DisplayObject=<DisplayObject>MouseManager.getInstance(PickGroup.getInstance((<AVM1Stage>this.context.globals.Stage)._awayAVMStage.scene.view)).getFocus();
        if(objectinFocus && objectinFocus.isAsset(TextField)){
            return (<TextField>objectinFocus).selectionBeginIndex;
        }
        return -1;
    }
	// 	Returns a string specifying the target path of the object that has focus.
	getFocus():string{
		var objectinFocus:DisplayObject=<DisplayObject>MouseManager.getInstance(PickGroup.getInstance((<AVM1Stage>this.context.globals.Stage)._awayAVMStage.scene.view)).getFocus();
		if(objectinFocus){
			var names:string[]=[];
			while (objectinFocus){
				if(objectinFocus.name=="scene"){
					objectinFocus=null;
				}
				else{
					names.push(objectinFocus.name);
					objectinFocus=objectinFocus.parent;
				}
			}
			var i:number=names.length;
			var mc_path:string="";
			while(i>0){
				i--;
				mc_path+=names[i];
				if(i>0)
					mc_path+=".";
			}
			//console.log(mc_path);
			return mc_path;

		}
		return "";
	}



	// 	Gives focus to the selectable (editable) text field, button, or movie clip, 
	//	that the newFocus parameter specifies.
	//	also might be a path to a variable that is bound to a textfield.
	//	in that case we want to focus the textfield
	//	todo: potential bug (?): it might happen that this variable is not yet defined, because that script has not run yet
	//	either queue the getFocus, or maybe add it as a callback for MosueManager to execute before fireEvents?

	setFocus(newFocus:any) : boolean{
        if(newFocus==="")
            return;
		if(typeof newFocus === "string"){			
			var focusObj = this.context.resolveTarget(newFocus);
			if(focusObj && focusObj.adaptee){
				MouseManager.getInstance(PickGroup.getInstance((<AVM1Stage>this.context.globals.Stage)._awayAVMStage.scene.view)).setFocus(focusObj.adaptee);
				return;
			}
			var focusObj = this.context.resolveTarget(newFocus+"_internal_TF");
			if(focusObj && focusObj.adaptee){
				MouseManager.getInstance(PickGroup.getInstance((<AVM1Stage>this.context.globals.Stage)._awayAVMStage.scene.view)).setFocus(focusObj.adaptee);
				return;
			}
			var myThis=this;
			//MouseManager.getInstance().setFocusCallback(function(){myThis.setFocus(newFocus);});

			warning("AVM1Selection.setFocus - no object found for string "+newFocus);			
			return;
		}
		var focusObj = this.context.resolveTarget(newFocus);
		if(focusObj && focusObj.adaptee)
			MouseManager.getInstance(PickGroup.getInstance((<AVM1Stage>this.context.globals.Stage)._awayAVMStage.scene.view)).setFocus(focusObj.adaptee);
		else{
			//MouseManager.getInstance().setFocusCallback(function(){myThis.setFocus(newFocus);});
			warning("AVM1Selection.setFocus - no object found '"+newFocus.toString()+"'");
		}
		return true;
	}



	// Sets the selection span of the currently focused text field.

	setSelection(beginIndex:number, endIndex:number){
		var objectinFocus:DisplayObject=<DisplayObject>MouseManager.getInstance(PickGroup.getInstance((<AVM1Stage>this.context.globals.Stage)._awayAVMStage.scene.view)).getFocus();
		if(objectinFocus && objectinFocus.isAsset(TextField)){
			(<TextField>objectinFocus).setSelection(beginIndex, endIndex);
		}
		
	};

}