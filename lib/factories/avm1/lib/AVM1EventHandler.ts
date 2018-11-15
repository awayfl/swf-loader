
import {AVM1ClipEvents} from "../../base/SWFTags";
import {MouseEvent, KeyboardEvent, FocusEvent, TextfieldEvent} from "@awayjs/scene";

export class AVM1EventHandler {
	constructor(public propertyName: string,
				public eventName: string,
                public stageEvent:boolean, 
                public allowDisable:boolean,
                public isMouse:boolean,
                public isButton:boolean ) { }
}


export var ClipEventMappings = Object.create(null);

ClipEventMappings[AVM1ClipEvents.Construct] = true;
ClipEventMappings[AVM1ClipEvents.Initialize] = true;

ClipEventMappings[AVM1ClipEvents.KeyPress] = new AVM1EventHandler('onKey', 'onkey', true, true, false, false);

ClipEventMappings[AVM1ClipEvents.Load] = new AVM1EventHandler('onLoad', 'load', false, false, false, false);
ClipEventMappings[AVM1ClipEvents.Unload] = new AVM1EventHandler('onUnload', 'unload', false, false, false, false),
ClipEventMappings[AVM1ClipEvents.Data] = new AVM1EventHandler('onData', 'data', false, false, false, false),
ClipEventMappings[AVM1ClipEvents.EnterFrame] = new AVM1EventHandler('onEnterFrame', 'enterFrame', false, false, false, false),
ClipEventMappings[AVM1ClipEvents.KeyDown] = new AVM1EventHandler('onKeyDown', KeyboardEvent.KEYDOWN, true, true, false, false);
ClipEventMappings[AVM1ClipEvents.KeyUp] = new AVM1EventHandler('onKeyUp', KeyboardEvent.KEYUP, true, true, false, false);

ClipEventMappings[AVM1ClipEvents.MouseMove] = new AVM1EventHandler('onMouseMove', MouseEvent.MOUSE_MOVE, true, true, true, false);
ClipEventMappings[AVM1ClipEvents.MouseDown] = new AVM1EventHandler('onMouseDown', MouseEvent.MOUSE_DOWN, true, true, true, false);
ClipEventMappings[AVM1ClipEvents.MouseUp] = new AVM1EventHandler('onMouseUp', MouseEvent.MOUSE_UP, true, true, true, false);
ClipEventMappings[AVM1ClipEvents.Press] = new AVM1EventHandler('onPress', MouseEvent.MOUSE_DOWN, false, true, true, true);
ClipEventMappings[AVM1ClipEvents.Release] = new AVM1EventHandler('onRelease', MouseEvent.MOUSE_UP, false, true, true, true);
ClipEventMappings[AVM1ClipEvents.ReleaseOutside] = new AVM1EventHandler('onReleaseOutside', MouseEvent.MOUSE_UP_OUTSIDE, false, true, true, true);
ClipEventMappings[AVM1ClipEvents.RollOver] = new AVM1EventHandler('onRollOver', MouseEvent.MOUSE_OVER, false, true, true, true);
ClipEventMappings[AVM1ClipEvents.RollOut] = new AVM1EventHandler('onRollOut', MouseEvent.MOUSE_OUT, false, true, true, true);
ClipEventMappings[AVM1ClipEvents.DragOver] = new AVM1EventHandler('onDragOver', MouseEvent.DRAG_OVER, false, true, true, true);
ClipEventMappings[AVM1ClipEvents.DragOut] = new AVM1EventHandler('onDragOut', MouseEvent.DRAG_OUT, false, true, true, true);

var setFocusEventMapping:AVM1EventHandler=new AVM1EventHandler('onSetFocus', FocusEvent.FOCUS_IN, false, true, false, false);
var unFocusEventMapping:AVM1EventHandler=new AVM1EventHandler('onKillFocus', FocusEvent.FOCUS_OUT, false, true, false, false);
var onChangedEventMapping:AVM1EventHandler=new AVM1EventHandler('onChanged', TextfieldEvent.CHANGED, false, true, false, false);

export var EventsListForMC:AVM1EventHandler[]=[
    ClipEventMappings[AVM1ClipEvents.Load],
    ClipEventMappings[AVM1ClipEvents.Unload],
    ClipEventMappings[AVM1ClipEvents.Data],
    ClipEventMappings[AVM1ClipEvents.EnterFrame],
    ClipEventMappings[AVM1ClipEvents.KeyDown],
    ClipEventMappings[AVM1ClipEvents.KeyUp],
    ClipEventMappings[AVM1ClipEvents.MouseMove],
    ClipEventMappings[AVM1ClipEvents.MouseDown],
    ClipEventMappings[AVM1ClipEvents.MouseUp],
    ClipEventMappings[AVM1ClipEvents.Press],
    ClipEventMappings[AVM1ClipEvents.Release],
    ClipEventMappings[AVM1ClipEvents.ReleaseOutside],
    ClipEventMappings[AVM1ClipEvents.RollOver],
    ClipEventMappings[AVM1ClipEvents.RollOut],
    ClipEventMappings[AVM1ClipEvents.DragOver],
    ClipEventMappings[AVM1ClipEvents.DragOut],
    ClipEventMappings[AVM1ClipEvents.KeyPress],
    setFocusEventMapping,
    unFocusEventMapping,
    onChangedEventMapping
];
export var EventsListForButton:AVM1EventHandler[]=[
    ClipEventMappings[AVM1ClipEvents.Load],
    ClipEventMappings[AVM1ClipEvents.Unload],
    ClipEventMappings[AVM1ClipEvents.Data],
    ClipEventMappings[AVM1ClipEvents.EnterFrame],
    ClipEventMappings[AVM1ClipEvents.KeyDown],
    ClipEventMappings[AVM1ClipEvents.KeyUp],
    ClipEventMappings[AVM1ClipEvents.Press],
    ClipEventMappings[AVM1ClipEvents.Release],
    ClipEventMappings[AVM1ClipEvents.ReleaseOutside],
    ClipEventMappings[AVM1ClipEvents.RollOver],
    ClipEventMappings[AVM1ClipEvents.RollOut],
    ClipEventMappings[AVM1ClipEvents.DragOver],
    ClipEventMappings[AVM1ClipEvents.DragOut],
    ClipEventMappings[AVM1ClipEvents.KeyPress],
    setFocusEventMapping,
    unFocusEventMapping,
    onChangedEventMapping
];

