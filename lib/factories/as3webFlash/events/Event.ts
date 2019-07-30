/*
/// @eventType	flash.events.Event.ACTIVATE
[Event(name="activate", type="flash.events.Event")]

/// @eventType	flash.events.Event.ADDED_TO_STAGE
[Event(name="addedToStage", type="flash.events.Event")]

/// @eventType	flash.events.Event.ADDED
[Event(name="added", type="flash.events.Event")]

/// @eventType	flash.events.Event.CANCEL
[Event(name="cancel", type="flash.events.Event")]

/// @eventType	flash.events.Event.CHANGE
[Event(name="change", type="flash.events.Event")]

/// @eventType	flash.events.Event.CLEAR
[Event(name="copy", type="flash.events.Event")]

/// @eventType	flash.events.Event.CLOSE
[Event(name="close", type="flash.events.Event")]

/// @eventType	flash.events.Event.CLOSING
[Event(name="closing", type="flash.events.Event")]

/// @eventType	flash.events.Event.COMPLETE
[Event(name="complete", type="flash.events.Event")]

/// @eventType	flash.events.Event.CONNECT
[Event(name="connect", type="flash.events.Event")]

/// @eventType	flash.events.Event.COPY
[Event(name="copy", type="flash.events.Event")]

/// @eventType	flash.events.Event.CUT
[Event(name="cut", type="flash.events.Event")]

/// @eventType	flash.events.Event.DEACTIVATE
[Event(name="deactivate", type="flash.events.Event")]

/// @eventType	flash.events.Event.DISPLAYING
[Event(name="displaying", type="flash.events.Event")]

/// @eventType	flash.events.Event.ENTER_FRAME
[Event(name="enterFrame", type="flash.events.Event")]

/// @eventType	flash.events.Event.EXITING
[Event(name="exiting", type="flash.events.Event")]

/// @eventType	flash.events.Event.EXIT_FRAME
[Event(name="exitFrame", type="flash.events.Event")]

/// @eventType	flash.events.Event.FRAME_CONSTRUCTED
[Event(name="frameConstructed", type="flash.events.Event")]

/// @eventType	flash.events.Event.FULLSCREEN
[Event(name="fullScreen", type="flash.events.Event")]

/// @eventType	flash.events.Event.HTML_BOUNDS_CHANGE
[Event(name="htmlBoundsChange", type="flash.events.Event")]

/// @eventType	flash.events.Event.HTML_DOM_INITIALIZE
[Event(name="htmlDOMInitialize", type="flash.events.Event")]

/// @eventType	flash.events.Event.HTML_RENDER
[Event(name="htmlRender", type="flash.events.Event")]

/// @eventType	flash.events.Event.ID3
[Event(name="id3", type="flash.events.Event")]

/// @eventType	flash.events.Event.INIT
[Event(name="init", type="flash.events.Event")]

/// @eventType	flash.events.Event.LOCATION_CHANGE
[Event(name="locationChange", type="flash.events.Event")]

/// @eventType	flash.events.Event.MOUSE_LEAVE
[Event(name="mouseLeave", type="flash.events.Event")]

/// @eventType	flash.events.Event.NETWORK_CHANGE
[Event(name="networkChange", type="flash.events.Event")]

/// @eventType	flash.events.Event.OPEN
[Event(name="open", type="flash.events.Event")]

/// @eventType	flash.events.Event.PASTE
[Event(name="paste", type="flash.events.Event")]

/// @eventType	flash.events.Event.PREPARING
[Event(name="flash.events.Event", type="flash.events.Event")]

/// @eventType	flash.events.Event.REMOVED_FROM_STAGE
[Event(name="removedFromStage", type="flash.events.Event")]

/// @eventType	flash.events.Event.REMOVED
[Event(name="removed", type="flash.events.Event")]

/// @eventType	flash.events.Event.RENDER
[Event(name="render", type="flash.events.Event")]

/// @eventType	flash.events.Event.RESIZE
[Event(name="resize", type="flash.events.Event")]

/// @eventType	flash.events.Event.SCROLL
[Event(name="scroll", type="flash.events.Event")]

/// @eventType	flash.events.Event.SELECT_ALL
[Event(name="selectAll", type="flash.events.Event")]

/// @eventType	flash.events.Event.SELECT
[Event(name="select", type="flash.events.Event")]

/// @eventType	flash.events.Event.SOUND_COMPLETE
[Event(name="soundComplete", type="flash.events.Event")]

/// @eventType	flash.events.Event.STANDARD_ERROR_CLOSE
[Event(name="flash.events.Event", type="flash.events.Event")]

/// @eventType	flash.events.Event.STANDARD_INPUT_CLOSE
[Event(name="flash.events.Event", type="flash.events.Event")]

/// @eventType	flash.events.Event.STANDARD_OUTPUT_CLOSE
[Event(name="flash.events.Event", type="flash.events.Event")]

/// @eventType	flash.events.Event.TAB_CHILDREN_CHANGE
[Event(name="tabChildrenChange", type="flash.events.Event")]

/// @eventType	flash.events.Event.TAB_ENABLED_CHANGE
[Event(name="tabEnabledChange", type="flash.events.Event")]

/// @eventType	flash.events.Event.TAB_INDEX_CHANGE
[Event(name="tabIndexChange", type="flash.events.Event")]

/// @eventType	flash.events.Event.TEXT_INTERACTION_MODE_CHANGE
[Event(name="textInteractionModeChange", type="flash.events.Event")]

/// @eventType	flash.events.Event.UNLOAD
[Event(name="unload", type="flash.events.Event")]

/// @eventType	flash.events.Event.USER_IDLE
[Event(name="userIdle", type="flash.events.Event")]

/// @eventType	flash.events.Event.USER_PRESENT
[Event(name="userIdle", type="flash.events.Event")]

 * The Event class is used as the base class for the creation of Event objects,
 * which are passed as parameters to event listeners when an event occurs.
 *
 *   <p class="- topic/p ">The properties of the Event class carry basic information about an event, such as
 * the event's type or whether the event's default behavior can be canceled. For many
 * events, such as the events represented by the Event class constants, this basic information
 * is sufficient. Other events, however, may require more detailed information. <ph class="- topic/ph ">Events associated
 * with a mouse click, for example, need to include additional information about the location of
 * the click event and whether any keys were pressed during the click event.  You can pass such additional
 * information to event listeners by extending the Event class, which is what
 * the MouseEvent class does. ActionScript 3.0</ph> API defines several Event subclasses for common
 * events that require additional information. Events associated with each of the Event
 * subclasses are described in the documentation for each class.</p><p class="- topic/p ">The methods of the Event class can be used in event listener functions to affect the
 * behavior of the event object. Some events have an associated default behavior.<ph class="- topic/ph "> For example,
 * the <codeph class="+ topic/ph pr-d/codeph ">doubleClick</codeph> event has an associated default behavior that highlights
 * the word under the mouse pointer at the time of the event.</ph>
 * Your event listener can cancel this
 * behavior by calling the <codeph class="+ topic/ph pr-d/codeph ">preventDefault()</codeph> method.
 * <ph class="- topic/ph ">You can also make the current
 * event listener the last one to process an event by calling the <codeph class="+ topic/ph pr-d/codeph ">stopPropagation()</codeph>
 * or <codeph class="+ topic/ph pr-d/codeph ">stopImmediatePropagation()</codeph> method.</ph></p><p class="- topic/p ">Other sources of information include:</p><ul class="- topic/ul "><li class="- topic/li ">A useful description about the timing of events, code execution, and rendering at runtime in Ted Patrick's blog entry:
 * <xref href="http://www.onflex.org/ted/2005/07/flash-player-mental-model-elastic.php" scope="external" class="- topic/xref ">Flash Player Mental Model - The Elastic Racetrack</xref>.</li><li class="- topic/li ">A blog entry by Johannes Tacskovics about the timing of frame events, such as ENTER_FRAME, EXIT_FRAME:
 * <xref href="http://blog.johannest.com/2009/06/15/the-movieclip-life-cycle-revisited-from-event-added-to-event-removed_from_stage/" scope="external" class="- topic/xref ">The MovieClip Lifecycle</xref>.</li><li class="- topic/li ">An article by Trevor McCauley about the order of ActionScript operations:
 * <xref href="http://www.senocular.com/flash/tutorials/orderofoperations/" scope="external" class="- topic/xref ">Order of Operations in ActionScript</xref>.</li><li class="- topic/li ">A blog entry by Matt Przybylski on creating custom events:
 * <xref href="http://evolve.reintroducing.com/2007/10/23/as3/as3-custom-events/" scope="external" class="- topic/xref ">AS3: Custom Events</xref>.</li></ul>
 *
 */
import {EventBase} from "@awayjs/core";
export class Event extends EventBase
{
	/**
	 * Creates an Event object to pass as a parameter to event listeners.
	 * @param	type	The type of the event, accessible as Event.type.
	 * @param	bubbles	Determines whether the Event object participates in the bubbling stage of the event flow. The default value is false.
	 * @param	cancelable	Determines whether the Event object can be canceled. The default values is false.
	 */
	constructor (type:string, bubbles:boolean=false, cancelable:boolean=false){
		super(type);
	}

	// for AVM1:
	public axCallPublicProperty(value1:any, value2:any):any{
		return null;
	}
	public axGetPublicProperty(value:any):any{
		return null;
	}
	public axSetPublicProperty(value:any):any{
		return null;
	}
	/**
	 * The ACTIVATE constant defines the value of the type property of an activate event object.
	 * Note: This event has neither a "capture phase" nor a "bubble phase",
	 * which means that event listeners must be added directly to any potential targets,
	 * whether the target is on the display list or not.AIR for TV devices never automatically dispatch this event. You can, however, dispatch it manually.This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetAny DisplayObject instance with a listener registered for the activate event.
	 * @langversion	3.0
	 */
	public static ACTIVATE : string = "activate";

	/**
	 * The Event.ADDED constant defines the value of the type property of
	 * an added event object.
	 *
	 *   This event has the following properties:PropertyValuebubblestruecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetThe DisplayObject instance being added to the display list.
	 * The target is not always the object in the display list
	 * that registered the event listener. Use the currentTarget
	 * property to access the object in the display list that is currently processing the event.
	 * @langversion	3.0
	 */
	public static ADDED : string = "added";

	/**
	 * The Event.ADDED_TO_STAGE constant defines the value of the type
	 * property of an addedToStage event object.
	 *
	 *   This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetThe DisplayObject instance being added to the on stage display list,
	 * either directly or through the addition of a sub tree in which the DisplayObject instance is contained.
	 * If the DisplayObject instance is being directly added, the added event occurs before this event.
	 * @langversion	3.0
	 */
	public static ADDED_TO_STAGE : string = "addedToStage";
	public static BROWSER_ZOOM_CHANGE : string;

	/**
	 * The Event.CANCEL constant defines the value of the type property of a cancel event object.
	 * This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetA reference to the object on which the operation is canceled.
	 * @langversion	3.0
	 */
	public static CANCEL : string = "cancel";

	/**
	 * The Event.CHANGE constant defines the value of the type property of a change event object.
	 *
	 *   This event has the following properties:PropertyValuebubblestruecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetThe object that has had its value modified.
	 * The target is not always the object in the display list
	 * that registered the event listener. Use the currentTarget
	 * property to access the object in the display list that is currently processing the event.
	 * @langversion	3.0
	 */
	public static CHANGE : string = "change";
	public static CHANNEL_MESSAGE : string;
	public static CHANNEL_STATE : string;

	/**
	 * The Event.CLEAR constant defines the value of the type property
	 * of a clear event object.
	 * This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetAny InteractiveObject instance with a listener registered for the clear event.Note: TextField objects do not dispatch clear, copy, cut, paste,
	 * or selectAll events. TextField objects always include Cut, Copy, Paste, Clear, and Select All commands in the context menu.
	 * You cannot remove these commands from the context menu for TextField objects. For TextField objects, selecting these commands
	 * (or their keyboard equivalents) does not generate clear, copy, cut, paste,
	 * or selectAll events. However, other classes that extend the InteractiveObject class, including components built
	 * using the Flash Text Engine (FTE), will dispatch these events in response to user actions such as keyboard shortcuts and context menus.
	 * @langversion	3.0
	 */
	public static CLEAR : string = "clear";

	/**
	 * The Event.CLOSE constant defines the value of the type property of a close event object.
	 *
	 *   This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetThe object whose connection has been closed.
	 * @langversion	3.0
	 */
	public static CLOSE : string = "close";

	/**
	 * The Event.COMPLETE constant defines the value of the type property of a complete event object.
	 *
	 *   This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetThe network object that has completed loading.
	 * @langversion	3.0
	 */
	public static COMPLETE : string = "complete";

	/**
	 * The Event.CONNECT constant defines the value of the type property of a connect event object.
	 *
	 *   This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetThe Socket or XMLSocket object that has established a network connection.
	 * @langversion	3.0
	 */
	public static CONNECT : string = "connect";
	public static CONTEXT3D_CREATE : string;

	/**
	 * Defines the value of the type property of a copy event object.
	 * This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetAny InteractiveObject instance with a listener registered for the copy event.Note: TextField objects do not dispatch clear, copy, cut, paste,
	 * or selectAll events. TextField objects always include Cut, Copy, Paste, Clear, and Select All commands in the context menu.
	 * You cannot remove these commands from the context menu for TextField objects. For TextField objects, selecting these commands
	 * (or their keyboard equivalents) does not generate clear, copy, cut, paste,
	 * or selectAll events. However, other classes that extend the InteractiveObject class, including components built
	 * using the Flash Text Engine (FTE), will dispatch these events in response to user actions such as keyboard shortcuts and context menus.
	 * @langversion	3.0
	 */
	public static COPY : string = "copy";

	/**
	 * Defines the value of the type property of a cut event object.
	 * This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetAny InteractiveObject instance with a listener registered for the cut event.Note: TextField objects do not dispatch clear, copy, cut, paste,
	 * or selectAll events. TextField objects always include Cut, Copy, Paste, Clear, and Select All commands in the context menu.
	 * You cannot remove these commands from the context menu for TextField objects. For TextField objects, selecting these commands
	 * (or their keyboard equivalents) does not generate clear, copy, cut, paste,
	 * or selectAll events. However, other classes that extend the InteractiveObject class, including components built
	 * using the Flash Text Engine (FTE), will dispatch these events in response to user actions such as keyboard shortcuts and context menus.
	 * @langversion	3.0
	 */
	public static CUT : string = "cut";

	/**
	 * The Event.DEACTIVATE constant defines the value of the type property of a deactivate event object.
	 * Note: This event has neither a "capture phase" nor a "bubble phase",
	 * which means that event listeners must be added directly to any potential targets,
	 * whether the target is on the display list or not.AIR for TV devices never automatically dispatch this event. You can, however, dispatch it manually.This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetAny DisplayObject instance with a listener registered for the deactivate event.
	 */
	public static DEACTIVATE : string = "deactivate";

	/**
	 * The Event.ENTER_FRAME constant defines the value of the type property of an enterFrame event object.
	 * Note: This event has neither a "capture phase" nor a "bubble phase",
	 * which means that event listeners must be added directly to any potential targets,
	 * whether the target is on the display list or not.This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetAny DisplayObject instance with a listener registered for the enterFrame event.
	 */
	public static ENTER_FRAME : string = "enterFrame";

	/**
	 * The Event.EXIT_FRAME constant defines the value of the type property of an exitFrame event object.
	 * Note: This event has neither a "capture phase" nor a "bubble phase",
	 * which means that event listeners must be added directly to any potential targets,
	 * whether the target is on the display list or not.This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetAny DisplayObject instance with a listener registered for the enterFrame event.
	 */
	public static EXIT_FRAME : string = "exitFrame";

	/**
	 * The Event.FRAME_CONSTRUCTED constant defines the value of the type property of an frameConstructed event object.
	 *
	 *   Note: This event has neither a "capture phase" nor a "bubble phase",
	 * which means that event listeners must be added directly to any potential targets,
	 * whether the target is on the display list or not.This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetAny DisplayObject instance with a listener registered for the frameConstructed event.
	 */
	public static FRAME_CONSTRUCTED : string = "frameConstructed";
	public static FRAME_LABEL : string;

	/**
	 * The Event.FULL_SCREEN constant defines the value of the type property of a fullScreen event object.
	 *
	 *   This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetThe Stage object.
	 */
	public static FULLSCREEN : string = "fullScreen";

	/**
	 * The Event.ID3 constant defines the value of the type property of an id3 event object.
	 * This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetThe Sound object loading the MP3 for which ID3 data is now available.
	 * The target is not always the object in the display list
	 * that registered the event listener. Use the currentTarget
	 * property to access the object in the display list that is currently processing the event.
	 */
	public static ID3 : string = "id3";

	/**
	 * The Event.INIT constant defines the value of the type property of an init event object.
	 *
	 *   This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetThe LoaderInfo object associated with the SWF file being loaded.
	 */
	public static INIT : string = "init";

	/**
	 * The Event.MOUSE_LEAVE constant defines the value of the type property of a mouseLeave event object.
	 *
	 *   This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetThe Stage object.
	 * The target is not always the object in the display list
	 * that registered the event listener. Use the currentTarget
	 * property to access the object in the display list that is currently processing the event.
	 */
	public static MOUSE_LEAVE : string = "mouseLeave";

	/**
	 * The Event.OPEN constant defines the value of the type property of an open event object.
	 *
	 *   This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetThe network object that has opened a connection.
	 */
	public static OPEN : string = "open";

	/**
	 * The Event.PASTE constant defines the value of the type property of a paste event object.
	 * This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetAny InteractiveObject instance with a listener registered for the paste event.Note: TextField objects do not dispatch clear, copy, cut, paste,
	 * or selectAll events. TextField objects always include Cut, Copy, Paste, Clear, and Select All commands in the context menu.
	 * You cannot remove these commands from the context menu for TextField objects. For TextField objects, selecting these commands
	 * (or their keyboard equivalents) does not generate clear, copy, cut, paste,
	 * or selectAll events. However, other classes that extend the InteractiveObject class, including components built
	 * using the Flash Text Engine (FTE), will dispatch these events in response to user actions such as keyboard shortcuts and context menus.
	 */
	public static PASTE : string = "paste";

	/**
	 * The Event.REMOVED constant defines the value of the type property of
	 * a removed event object.
	 *
	 *   This event has the following properties:PropertyValuebubblestruecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetThe DisplayObject instance to be removed from the display list.
	 * The target is not always the object in the display list
	 * that registered the event listener. Use the currentTarget
	 * property to access the object in the display list that is currently processing the event.
	 */
	public static REMOVED : string = "removed";

	/**
	 * The Event.REMOVED_FROM_STAGE constant defines the value of the type
	 * property of a removedFromStage event object.
	 *
	 *   This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetThe DisplayObject instance being removed from the on stage display list,
	 * either directly or through the removal of a sub tree in which the DisplayObject instance is contained.
	 * If the DisplayObject instance
	 */
	public static REMOVED_FROM_STAGE : string = "removedFromStage";

	/**
	 * The Event.RENDER constant defines the value of the type property of a render event object.
	 * Note: This event has neither a "capture phase" nor a "bubble phase",
	 * which means that event listeners must be added directly to any potential targets,
	 * whether the target is on the display list or not.This event has the following properties:PropertyValuebubblesfalsecancelablefalse; the default behavior cannot be canceled.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetAny DisplayObject instance with a listener registered for the render event.
	 * @langversion	3.0
	 */
	public static RENDER : string = "render";

	/**
	 * The Event.RESIZE constant defines the value of the type property of a resize event object.
	 *
	 *   This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetThe Stage object.
	 * @langversion	3.0
	 */
	public static RESIZE : string = "resize";

	/**
	 * The Event.SCROLL constant defines the value of the type property of a scroll event object.
	 *
	 *   This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetThe TextField object that has been scrolled.
	 * The target property is not always the object in the display list
	 * that registered the event listener. Use the currentTarget
	 * property to access the object in the display list that is currently processing the event.
	 * @langversion	3.0
	 */
	public static SCROLL : string = "scroll";

	/**
	 * The Event.SELECT constant defines the value of the type property of a select event object.
	 *
	 *   This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetThe object on which an item has been selected.
	 * @langversion	3.0
	 */
	public static SELECT : string = "select";

	/**
	 * The Event.SELECT_ALL constant defines the value of the type property of a selectAll event object.
	 * This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetAny InteractiveObject instance with a listener registered for the selectAll event.Note: TextField objects do not dispatch clear, copy, cut, paste,
	 * or selectAll events. TextField objects always include Cut, Copy, Paste, Clear, and Select All commands in the context menu.
	 * You cannot remove these commands from the context menu for TextField objects. For TextField objects, selecting these commands
	 * (or their keyboard equivalents) does not generate clear, copy, cut, paste,
	 * or selectAll events. However, other classes that extend the InteractiveObject class, including components built
	 * using the Flash Text Engine (FTE), will dispatch these events in response to user actions such as keyboard shortcuts and context menus.
	 * @langversion	3.0
	 */
	public static SELECT_ALL : string = "selectAll";

	/**
	 * The Event.SOUND_COMPLETE constant defines the value of the type property of a soundComplete event object.
	 *
	 *   This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetThe SoundChannel object in which a sound has finished playing.
	 */
	public static SOUND_COMPLETE : string = "soundComplete";
	public static SUSPEND : string;

	/**
	 * The Event.TAB_CHILDREN_CHANGE constant defines the value of the type property of a tabChildrenChange event object.
	 * This event has the following properties:PropertyValuebubblestruecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetThe object whose tabChildren flag has changed.
	 * The target is not always the object in the display list
	 * that registered the event listener. Use the currentTarget
	 * property to access the object in the display list that is currently processing the event.
	 */
	public static TAB_CHILDREN_CHANGE : string = "tabChildrenChange";

	/**
	 * The Event.TAB_ENABLED_CHANGE constant defines the value of the type
	 * property of a tabEnabledChange event object.
	 *
	 *   This event has the following properties:PropertyValuebubblestruecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetThe InteractiveObject whose tabEnabled flag has changed.
	 * The target is not always the object in the display list
	 * that registered the event listener. Use the currentTarget
	 * property to access the object in the display list that is currently processing the event.
	 */
	public static TAB_ENABLED_CHANGE : string = "tabEnabledChange";

	/**
	 * The Event.TAB_INDEX_CHANGE constant defines the value of the
	 * type property of a tabIndexChange event object.
	 *
	 *   This event has the following properties:PropertyValuebubblestruecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetThe object whose tabIndex has changed.
	 * The target is not always the object in the display list
	 * that registered the event listener. Use the currentTarget
	 * property to access the object in the display list that is currently processing the event.
	 */
	public static TAB_INDEX_CHANGE : string = "tabIndexChange";

	/**
	 * The Event.TEXT_INTERACTION_MODE_CHANGE constant defines the value of the type property of a interaction mode event object.
	 *
	 *   This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetThe TextField object whose interaction mode property is changed. For example on Android, one can change the interaction mode to SELECTION via context menu.
	 * The target property is not always the object in the display list
	 * that registered the event listener. Use the currentTarget
	 * property to access the object in the display list that is currently processing the event.
	 */
	public static TEXT_INTERACTION_MODE_CHANGE : string = "textInteractionModeChange";
	public static TEXTURE_READY : string;

	/**
	 * The Event.UNLOAD constant defines the value of the type property of an unload event object.
	 *
	 *   This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.currentTargetThe object that is actively processing the Event
	 * object with an event listener.targetThe LoaderInfo object associated with the SWF file being unloaded or replaced.
	 */
	public static UNLOAD : string = "unload";
	public static VIDEO_FRAME : string;
	public static WORKER_STATE : string;

	/**
	 * Indicates whether an event is a bubbling event. If the event can bubble,
	 * this value is true; otherwise it is false.
	 *
	 *   When an event occurs, it moves through the three phases of the event flow: the capture
	 * phase, which flows from the top of the display list hierarchy to the node just before the
	 * target node; the target phase, which comprises the target node; and the bubbling phase,
	 * which flows from the node subsequent to the target node back up the display list hierarchy.Some events, such as the activate and unload events, do not
	 * have a bubbling phase. The bubbles property has a value of
	 * false for events that do not have a bubbling phase.
	 */
	public get bubbles () : boolean{
		console.log("bubbles not implemented yet in flash/Event");
		return false;
	}	

	/**
	 * Indicates whether the behavior associated with the event can be prevented.
	 * If the behavior can be canceled, this value is true; otherwise it is false.
	 */
	public get cancelable () : boolean{
		console.log("cancelable not implemented yet in flash/Event");
		return false;
	}

	private _currentTarget:any;
	/**
	 * The object that is actively processing the Event object with an event listener. For example, if a user clicks an OK button, the current target could be the node containing that button or one of its ancestors that has registered an event listener for that event.
	 */
	public get currentTarget () : any{
		return this._currentTarget;
	}
	public set currentTarget (value: any) {
		this._currentTarget=value;
	}

	/**
	 * The current phase in the event flow. This property can contain the following numeric values:
	 * The capture phase (EventPhase.CAPTURING_PHASE). The target phase (EventPhase.AT_TARGET). The bubbling phase (EventPhase.BUBBLING_PHASE).
	 */
	public get eventPhase () : number{
		console.log("eventPhase not implemented yet in flash/Event");
		return 0;
	}

	/**
	 * The event target. This property contains the target node. For example, if a user clicks an OK button, the target node is the display list node containing that button.
	 */
	/* provided because awayjs-eventbase has "target" as public property
	public get target () : any{
		console.log("target not implemented yet in flash/Event");
		return null;
	}

	/**
	 * The type of event. The type is case-sensitive.
	 */
	/* provided because awayjs-eventbase has "type" as public property
	public get type () : string{
		console.log("type not implemented yet in flash/Event");
		return "";
	}
	*/

	/**
	 * Duplicates an instance of an Event subclass.
	 *
	 *   Returns a new Event object that is a copy of the original instance of the Event object.
	 * You do not normally call clone(); the EventDispatcher class calls it automatically
	 * when you redispatch an event—that is, when you call dispatchEvent(event) from a handler
	 * that is handling event.The new Event object includes all the properties of the original.When creating your own custom Event class, you must override the
	 * inherited Event.clone() method in order for it to duplicate the
	 * properties of your custom class. If you do not set all the properties that you add
	 * in your event subclass, those properties will not have the correct values when listeners
	 * handle the redispatched event.In this example, PingEvent is a subclass of Event
	 * and therefore implements its own version of clone().
	 * <codeblock>
	 *
	 *   class PingEvent extends Event {
		 * var URL:String;
		 *
		 *   public override function clone():Event {
		 * return new PingEvent(type, bubbles, cancelable, URL);
		 * }
		 * }
	 *
	 *   </codeblock>
	 * @return	A new Event object that is identical to the original.
	 */
	public clone () : EventBase{
		console.log("clone not implemented yet in flash/Event");
		return null;
	}

	/**
	 * Fill all properties from awayjs-event
	 * @param	awayEvent	The awayjs-event
	 *   the className parameter is PingEvent.
	 */

	public fillFromAway (awayEvent:EventBase){
		console.log("flash/Event.cloneFromAway should be implemented in SubClass");
	}
	/**
	 * A utility function for implementing the toString() method in custom
	 * ActionScript 3.0 Event classes. Overriding the
	 * toString() method is recommended, but not required.
	 * class PingEvent extends Event {
		 * var URL:String;
		 *
		 *   public override function toString():String {
		 * return formatToString("PingEvent", "type", "bubbles", "cancelable", "eventPhase", "URL");
		 * }
		 * }
	 * @param	className	The name of your custom Event class. In the previous example,
	 *   the className parameter is PingEvent.
	 * @param	arguments	The properties of the Event class and the
	 *   properties that you add in your custom Event class. In the previous example, the ...arguments
	 *   parameter includes type, bubbles, cancelable,
	 *   eventPhase, and URL.
	 * @return	The name of your custom Event class and the String value of your ...arguments
	 *   parameter.
	 */
	public formatToString (className:string, ...rest) : string{
		console.log("formatToString not implemented yet in flash/Event");
		return "";
	}

	/**
	 * Checks whether the preventDefault() method has been called on the event. If the
	 * preventDefault() method has been called,
	 * returns true; otherwise, returns false.
	 * @return	If preventDefault() has been called, returns true; otherwise,
	 *   returns false.
	 */
	public isDefaultPrevented () : boolean{
		console.log("isDefaultPrevented not implemented yet in flash/Event");
		return false;
	}

	/**
	 * Cancels an event's default behavior if that behavior can be canceled.
	 *
	 *   Many events have associated behaviors that are carried out by default.
	 * For example, if a user types a character
	 * into a text field, the default behavior is that the character is
	 * displayed in the text field. Because the TextEvent.TEXT_INPUT
	 * event's default behavior can be canceled, you can use the preventDefault()
	 * method to prevent the character from appearing.An example of a behavior that is not cancelable is the default behavior associated with
	 * the Event.REMOVED event, which is generated whenever Flash Player is about to
	 * remove a display object from the display list. The default behavior (removing the element)
	 * cannot be canceled, so the preventDefault() method has no effect on this
	 * default behavior. You can use the Event.cancelable property to check whether you can prevent
	 * the default behavior associated with a particular event. If the value of
	 * Event.cancelable is true, then preventDefault() can
	 * be used to cancel the event; otherwise, preventDefault() has no effect.
	 */
	public preventDefault () {
		console.log("preventDefault not implemented yet in flash/Event");
	}

	/**
	 * Prevents processing of any event listeners in the current node and any subsequent nodes in
	 * the event flow. This method takes effect immediately, and it affects event listeners
	 * in the current node. In contrast, the stopPropagation() method doesn't take
	 * effect until all the event listeners in the current node finish processing.Note:  This method does not cancel the behavior associated with this event; see preventDefault() for that functionality.

	 */
	public stopImmediatePropagation () {
		console.log("stopImmediatePropagation not implemented yet in flash/Event");
	}

	/**
	 * Prevents processing of any event listeners in nodes subsequent to the current node in the
	 * event flow. This method does not affect any event listeners in the current node
	 * (currentTarget). In contrast, the stopImmediatePropagation() method
	 * prevents processing of event listeners in both the current node and subsequent nodes.
	 * Additional calls to this method have no effect. This method can be called in any phase
	 * of the event flow.Note:  This method does not cancel the behavior associated with this event; see preventDefault() for that functionality.
	 */
	public stopPropagation () {
		console.log("stopPropagation not implemented yet in flash/Event");
	}

	/**
	 * Returns a string containing all the properties of the Event object. The string is in the following format:
	 * [Event type=value bubbles=value cancelable=value]
	 * @return	A string containing all the properties of the Event object.
	 */
	public toString () : string{
		console.log("toString not implemented yet in flash/Event");
		return "";
	}
}

