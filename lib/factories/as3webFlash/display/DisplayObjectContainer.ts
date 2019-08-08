import {Box} from "@awayjs/core";
import {Billboard, TextField as AwayTextField, DisplayObjectContainer as AwayDisplayObjectContainer, Sprite as AwaySprite, MovieClip as AwayMovieClip, DisplayObject as AwayDisplayObject} from "@awayjs/scene";
import {DisplayObject} from "./DisplayObject";
import {InteractiveObject} from "./InteractiveObject";
import {Event} from "../events/Event";
import {PickGroup} from "@awayjs/view";
import { constructClassFromSymbol } from '../../flash/constructClassFromSymbol';
import { Point } from '../geom/Point';

export class DisplayObjectContainer extends InteractiveObject{

	// for AVM1:
	public _children:any[];
	public addTimelineObjectAtDepth(child:any, depth:number){

	}
	public getTimelineObjectAtDepth(depth:number):any{
		return null;
	}
	public _lookupChildByName(name:string, lookupOptions:any=null):any{

	}
	public _lookupChildByIndex(idx:number, lookupOptions:any=null):any{

	}

	private _eventRemoved:Event;
	private _eventAdded:Event;
	private _eventAddedToStage:Event;
	/**
	 * The DisplayObjectContainer class is the base class for all objects that can serve as display object containers on
	 * the display list. The display list manages all objects displayed in the Flash runtimes.
	 * Use the DisplayObjectContainer class to arrange the display objects in the display list.
	 * Each DisplayObjectContainer object has its own child list for organizing the z-order of the objects.
	 * The z-order is the front-to-back order that determines which object is drawn in front, which is behind,
	 * and so on.
	 *
	 *   <p class="- topic/p ">DisplayObject is an abstract base class; therefore, you cannot call DisplayObject directly. Invoking
	 * <codeph class="+ topic/ph pr-d/codeph ">new DisplayObject()</codeph> throws an <codeph class="+ topic/ph pr-d/codeph ">ArgumentError</codeph> exception.</p>
	 *
	 *   The DisplayObjectContainer class is an abstract base class for all objects that can contain child objects.
	 * It cannot be instantiated directly; calling the <codeph class="+ topic/ph pr-d/codeph ">new DisplayObjectContainer()</codeph> constructor
	 * throws an <codeph class="+ topic/ph pr-d/codeph ">ArgumentError</codeph> exception.
	 *
	 *   <p class="- topic/p ">For more information, see the "Display Programming" chapter of the <i class="+ topic/ph hi-d/i ">ActionScript 3.0 Developer's Guide</i>.</p>

	 /**
	 * Calling the new DisplayObjectContainer() constructor throws an
	 * ArgumentError exception. You can, however, call constructors for
	 * the following subclasses of DisplayObjectContainer:
	 *
	 *   new Loader()new Sprite()new MovieClip()
	 */
	constructor(adaptee:AwayDisplayObjectContainer = null)
	{
		super(adaptee || new AwayDisplayObjectContainer());
		this._eventRemoved=new this.sec.flash.events.Event(Event.REMOVED);
		this._eventAdded=new this.sec.flash.events.Event(Event.ADDED);
		this._eventAddedToStage=new this.sec.flash.events.Event(Event.ADDED_TO_STAGE);
	}
	//---------------------------stuff added to make it work:

	public clone():DisplayObjectContainer
	{
		if(!(<any>this)._symbol){
			throw("_symbol not defined when cloning movieclip")
		}
		//var clone: MovieClip = MovieClip.getNewMovieClip(AwayMovieClip.getNewMovieClip((<AwayMovieClip>this.adaptee).timeline));
		var clone=constructClassFromSymbol((<any>this)._symbol, (<any>this)._symbol.symbolClass);
		clone.axInitializer();
		this.adaptee.copyTo(clone.adaptee);
		return clone;
	}

	/* gets called from stage in order to move the playhead of the root-movieclips to next frame.
	 the DisplayObjectContainer should call this function on all children if they extend DisplayObjectContainer themself.
	 if any child is a MovieClip this function will not be called on its childrens adapter.
	 */
	public advanceFrame(events:any[]) {
		this.dispatchEvent(events[0]);//ENTER_FRAME
		var i:number=(<AwayDisplayObjectContainer> this._adaptee)._children.length;
		while(i>0){
			i--;
			var oneChild:AwayDisplayObject=(<AwayDisplayObjectContainer> this._adaptee)._children[i];
			if(oneChild.isAsset(AwayDisplayObjectContainer)){
				if(oneChild.adapter){
					(<DisplayObjectContainer>oneChild.adapter).advanceFrame(events);
				}
			}
			else if(oneChild.isAsset(AwaySprite)) {
				if (oneChild.adapter) {
					(<DisplayObjectContainer>oneChild.adapter).advanceFrame(events);
				}
			}
			else if(oneChild.isAsset(AwayMovieClip)){
				(<AwayMovieClip>oneChild).update(events);
			}
		}
		this.dispatchEvent(events[1]);//EXIT_FRAME

	}
	public debugDisplayGraph(obj:any) {
		obj.object=this;
		obj.rectangle="x:"+this.x+", y:"+this.y+", width:"+this.width+", height:"+this.height;
		obj.children={};
		var i:number=0;
		for(i=0;i<(<AwayDisplayObjectContainer> this._adaptee).numChildren;i++){
			var oneChild:AwayDisplayObject=(<AwayDisplayObjectContainer> this._adaptee).getChildAt(i);
			var childname="child_"+i+" "+(<any>oneChild.adapter).constructor.name;
			if(oneChild.isAsset(AwaySprite)||oneChild.isAsset(AwayDisplayObjectContainer)){
				if(oneChild.adapter){
					obj.children[childname]={};
					(<DisplayObjectContainer>oneChild.adapter).debugDisplayGraph(obj.children[childname]);
				}
			}
			else if(oneChild.isAsset(Billboard)){
				obj.children[childname]={};
				obj.children[childname].object=oneChild.adapter;
				obj.children[childname].name=oneChild.name;
				obj.children[childname].rectangle="x:"+oneChild.x+", y:"+oneChild.y;//+", width:"+oneChild.width+", height:"+oneChild.height;
				
				/*var box:Box = PickGroup.getInstance(this._stage.view).getBoundsPicker(oneChild.partition).getBoxBounds(oneChild);				
				obj.children[childname].width=(box == null)? 0 : box.width;		
				obj.children[childname].height=(box == null)? 0 : box.height;*/
				//(<AwayMovieClip>oneChild).graphics.endFill();
				//console.log("Reached MC", oneChild);
				//(<AwayMovieClip>oneChild).update();
			}
			else if(oneChild.isAsset(AwayMovieClip)){
				obj.children[childname]={};
				obj.children[childname].object=oneChild.adapter;
				obj.children[childname].name=oneChild.name;
				obj.children[childname].rectangle="x:"+oneChild.x+", y:"+oneChild.y;//+", width:"+oneChild.width+", height:"+oneChild.height;
				/*var box:Box = PickGroup.getInstance(this._stage.view).getBoundsPicker(oneChild.partition).getBoxBounds(oneChild);				
				obj.children[childname].width=(box == null)? 0 : box.width;		
				obj.children[childname].height=(box == null)? 0 : box.height;*/
				//(<AwayMovieClip>oneChild).graphics.endFill();
				//console.log("Reached MC", oneChild);
				//(<AwayMovieClip>oneChild).update();
			}
			else if(oneChild.isAsset(AwayTextField)){
				obj.children[childname]={};
				obj.children[childname].object=oneChild.adapter;
				obj.children[childname].text=(<AwayTextField>oneChild).text;
				obj.children[childname].rectangle="x:"+oneChild.x+", y:"+oneChild.y;//+", width:"+oneChild.width+", height:"+oneChild.height;
				var box:Box = PickGroup.getInstance(this._stage.view).getBoundsPicker(oneChild.partition).getBoxBounds(oneChild);				
				obj.children[childname].width=(box == null)? 0 : box.width;		
				obj.children[childname].height=(box == null)? 0 : box.height;
				//(<AwayMovieClip>oneChild).graphics.endFill();
				//console.log("Reached MC", oneChild);
				//(<AwayMovieClip>oneChild).update();
			}
		}

	}

	/*
	//	overwrite 
	public dispatchEventRecursive(event:Event) {
		this.dispatchEvent(event);

		if((<AwayDisplayObjectContainer> this._adaptee)){
			var i:number=(<AwayDisplayObjectContainer> this._adaptee).numChildren;
			while(i>0){
				i--;
				var oneChild:AwayDisplayObject=(<AwayDisplayObjectContainer> this._adaptee).getChildAt(i);
				if(oneChild.adapter){
					(<DisplayObject>oneChild.adapter).dispatchEventRecursive(event);
				}
			}
		}
	};
	*/

	

	//---------------------------original as3 properties / methods:

	/**
	 * Determines whether or not the children of the object are mouse, or user input device, enabled.
	 * If an object is enabled, a user can interact with it by using a mouse or user input device. The default is true.
	 *
	 *   This property is useful when you create a button with an instance of the Sprite class
	 * (instead of using the SimpleButton class). When you use a Sprite instance to create a button,
	 * you can choose to decorate the button by using the addChild() method to add additional
	 * Sprite instances. This process can cause unexpected behavior with mouse events because
	 * the Sprite instances you add as children can become the target object of a mouse event
	 * when you expect the parent instance to be the target object. To ensure that the parent
	 * instance serves as the target objects for mouse events, you can set the
	 * mouseChildren property of the parent instance to false. No event is dispatched by setting this property. You must use the
	 * addEventListener() method to create interactive functionality.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 */
	public get mouseChildren () : boolean {
		return (<AwayDisplayObjectContainer> this._adaptee).mouseChildren;
	}
	public set mouseChildren (enable:boolean)  {
		(<AwayDisplayObjectContainer> this._adaptee).mouseChildren=enable;
	}

	/**
	 * Returns the number of children of this object.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 */
	public get numChildren () : number{
		return (<AwayDisplayObjectContainer>(<AwayDisplayObjectContainer> this._adaptee)).numChildren;
	}

	/**
	 * Determines whether the children of the object are tab enabled. Enables or disables tabbing for the
	 * children of the object. The default is true.
	 * Note: Do not use the tabChildren property with Flex.
	 * Instead, use the mx.core.UIComponent.hasFocusableChildren property.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 * @throws	IllegalOperationError Calling this property of the Stage object
	 *   throws an exception. The Stage object does not implement this property.
	 */
	public get tabChildren () : boolean {
		//todo
		//console.warn("tabChildren not implemented yet in flash/DisplayObjectContainer");
		return false;
	}
	public set tabChildren (enable:boolean)  {
		//console.warn("tabChildren not implemented yet in flash/DisplayObjectContainer");
		//todo
	}

	/**
	 * Returns a TextSnapshot object for this DisplayObjectContainer instance.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 */
	public get textSnapshot () : any {
		throw("textSnapshot not implemented yet in flash/DisplayObjectContainer");
		// todo: flash.text.TextSnapshot;
		//return null;
	}

	/**
	 * Adds a child DisplayObject instance to this DisplayObjectContainer instance. The child is added
	 * to the front (top) of all other children in this DisplayObjectContainer instance. (To add a child to a
	 * specific index position, use the addChildAt() method.)
	 *
	 *   If you add a child object that already has a different display object container as
	 * a parent, the object is removed from the child list of the other display object container. Note: The command stage.addChild() can cause problems with a published SWF file,
	 * including security problems and conflicts with other loaded SWF files. There is only one Stage within a Flash runtime instance,
	 * no matter how many SWF files you load into the runtime. So, generally, objects
	 * should not be added to the Stage, directly, at all. The only object the Stage should
	 * contain is the root object. Create a DisplayObjectContainer to contain all of the items on the
	 * display list. Then, if necessary, add that DisplayObjectContainer instance to the Stage.
	 * @param	child	The DisplayObject instance to add as a child of this DisplayObjectContainer instance.
	 * @return	The DisplayObject instance that you pass in the
	 *   child parameter.
	 * @throws	ArgumentError Throws if the child is the same as the parent.  Also throws if
	 *   the caller is a child (or grandchild etc.) of the child being added.
	 */
	public addChild (child:DisplayObject) : DisplayObject {
		
		//child.dispatchEventRecursive(new Event(Event.ADDED_TO_STAGE));

		(<AwayDisplayObjectContainer> this._adaptee).addChild((<DisplayObject>child).adaptee);
		child.dispatchEvent(this._eventAdded);
		child.dispatchEvent(this._eventAddedToStage);
		
		return child;
	}

	/**
	 * Adds a child DisplayObject instance to this DisplayObjectContainer
	 * instance.  The child is added
	 * at the index position specified. An index of 0 represents the back (bottom)
	 * of the display list for this DisplayObjectContainer object.
	 *
	 *   For example, the following example shows three display objects, labeled a, b, and c, at
	 * index positions 0, 2, and 1, respectively:If you add a child object that already has a different display object container as
	 * a parent, the object is removed from the child list of the other display object container.
	 * @param	child	The DisplayObject instance to add as a child of this
	 *   DisplayObjectContainer instance.
	 * @param	index	The index position to which the child is added. If you specify a
	 *   currently occupied index position, the child object that exists at that position and all
	 *   higher positions are moved up one position in the child list.
	 * @return	The DisplayObject instance that you pass in the
	 *   child parameter.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 * @throws	RangeError Throws if the index position does not exist in the child list.
	 * @throws	ArgumentError Throws if the child is the same as the parent.  Also throws if
	 *   the caller is a child (or grandchild etc.) of the child being added.
	 */
	public addChildAt (child:DisplayObject, index:number) : DisplayObject {
		//child.dispatchEventRecursive(new Event(Event.ADDED_TO_STAGE));
		// todo: this should be done much more efficient (in awayjs)
		var allChildren=[];
		for(var i:number /*uint*/ = 0; i < (<AwayDisplayObjectContainer> this._adaptee).numChildren; i++){
			if(child.adaptee.id != (<AwayDisplayObjectContainer> this._adaptee)._children[i].id){
				allChildren[allChildren.length]=(<AwayDisplayObjectContainer> this._adaptee)._children[i];
			}
		}
		for(i = 0; i < allChildren.length; i++){

			(<AwayDisplayObjectContainer> this._adaptee).removeChild(allChildren[i]);
		}
		var newChildCnt=0;
		for(i = 0; i < allChildren.length+1; i++){
			if(i==index){
				(<AwayDisplayObjectContainer> this._adaptee).addChild(child.adaptee);
			}
			else{
				(<AwayDisplayObjectContainer> this._adaptee).addChild(allChildren[newChildCnt++]);
			}
		}
		child.dispatchEvent(this._eventAdded);
		child.dispatchEvent(this._eventAddedToStage);
		//(<AwayDisplayObjectContainer>(<AwayDisplayObjectContainer> this._adaptee)).addChildAt(child.adaptee, index);
		return child;
	}

	/**
	 * Indicates whether the security restrictions
	 * would cause any display objects to be omitted from the list returned by calling
	 * the DisplayObjectContainer.getObjectsUnderPoint() method
	 * with the specified point point. By default, content from one domain cannot
	 * access objects from another domain unless they are permitted to do so with a call to the
	 * Security.allowDomain() method. For more information, related to security,
	 * see the Flash Player Developer Center Topic:
	 * Security.
	 *
	 *   The point parameter is in the coordinate space of the Stage,
	 * which may differ from the coordinate space of the display object container (unless the
	 * display object container is the Stage). You can use the globalToLocal() and
	 * the localToGlobal() methods to convert points between these coordinate
	 * spaces.
	 * @param	point	The point under which to look.
	 * @return	true if the point contains child display objects with security restrictions.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 */
	public areInaccessibleObjectsUnderPoint (point:Point) : boolean {
		//todo
		throw("areInaccessibleObjectsUnderPoint not implemented yet in flash/DisplayObjectContainer");
		//return false;
	}

	/**
	 * Determines whether the specified display object is a child of the DisplayObjectContainer instance or
	 * the instance itself.
	 * The search includes the entire display list including this DisplayObjectContainer instance. Grandchildren,
	 * great-grandchildren, and so on each return true.
	 * @param	child	The child object to test.
	 * @return	true if the child object is a child of the DisplayObjectContainer
	 *   or the container itself; otherwise false.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 */
	public contains(child:DisplayObject) : boolean
	{
		return (<AwayDisplayObjectContainer>(<AwayDisplayObjectContainer> this._adaptee)).contains(child.adaptee);
	}


	/**
	 * Returns the child display object instance that exists at the specified index.
	 * @param	index	The index position of the child object.
	 * @return	The child display object at the specified index position.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 * @throws	RangeError Throws if the index does not exist in the child list.
	 * @throws	SecurityError This child display object belongs to a sandbox
	 *   to which you do not have access. You can avoid this situation by having
	 *   the child movie call Security.allowDomain().
	 */
	public getChildAt (index:number) : DisplayObject {
		return (<DisplayObject>(<AwayDisplayObjectContainer>(<AwayDisplayObjectContainer> this._adaptee)).getChildAt(index).adapter);
	}

	/**
	 * Returns the child display object that exists with the specified name.
	 * If more that one child display object has the specified name,
	 * the method returns the first object in the child list.
	 *
	 *   The getChildAt() method is faster than the
	 * getChildByName() method. The getChildAt() method accesses
	 * a child from a cached array, whereas the getChildByName() method
	 * has to traverse a linked list to access a child.
	 * @param	name	The name of the child to return.
	 * @return	The child display object with the specified name.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 * @throws	SecurityError This child display object belongs to a sandbox
	 *   to which you do not have access. You can avoid this situation by having
	 *   the child movie call the Security.allowDomain() method.
	 */
	public getChildByName (name:string) : DisplayObject {
		return (<AwayDisplayObjectContainer>(<AwayDisplayObjectContainer> this._adaptee)).getChildByName(name)? (<DisplayObject>(<AwayDisplayObjectContainer>(<AwayDisplayObjectContainer> this._adaptee)).getChildByName(name).adapter) : null;
	}

	/**
	 * Returns the index position of a child DisplayObject instance.
	 * @param	child	The DisplayObject instance to identify.
	 * @return	The index position of the child display object to identify.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 * @throws	ArgumentError Throws if the child parameter is not a child of this object.
	 */
	public getChildIndex (child:DisplayObject) : number {
		return (<AwayDisplayObjectContainer>(<AwayDisplayObjectContainer> this._adaptee)).getChildIndex(child.adaptee);
	}

	/**
	 * Returns an array of objects that lie under the specified point and are children
	 * (or grandchildren, and so on) of this DisplayObjectContainer instance. Any child objects that
	 * are inaccessible for security reasons are omitted from the returned array. To determine whether
	 * this security restriction affects the returned array, call the
	 * areInaccessibleObjectsUnderPoint() method.
	 *
	 *   The point parameter is in the coordinate space of the Stage,
	 * which may differ from the coordinate space of the display object container (unless the
	 * display object container is the Stage). You can use the globalToLocal() and
	 * the localToGlobal() methods to convert points between these coordinate
	 * spaces.
	 * @param	point	The point under which to look.
	 * @return	An array of objects that lie under the specified point and are children
	 *   (or grandchildren, and so on) of this DisplayObjectContainer instance.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 */
	public getObjectsUnderPoint(point:Point):DisplayObject[]
	{
		var children:DisplayObject[] = [];

		this._getObjectsUnderPointInternal(point, children);

		return children;
	}

	protected _getObjectsUnderPointInternal(point:Point, children:DisplayObject[])
	{
		var numChildren:number = (<AwayDisplayObjectContainer> this._adaptee).numChildren;
		var child:AwayDisplayObject;
		for(var i:number = 0; i < numChildren; i++){
			child = (<AwayDisplayObjectContainer> this._adaptee)._children[i];
			if(child.visible){
				
				if(PickGroup.getInstance(this._stage.view).getBoundsPicker((<AwayDisplayObject>child.adaptee).partition).hitTestPoint(point.x, point.y, true))
					children.push(<DisplayObject> child.adapter);
				(<DisplayObjectContainer> child.adapter)._getObjectsUnderPointInternal(point, children);
			}
		}
	}

	/**
	 * Removes the specified child DisplayObject instance from the child list of the DisplayObjectContainer instance.
	 * The parent property of the removed child is set to null
	 * , and the object is garbage collected if no other
	 * references to the child exist. The index positions of any display objects above the child in the
	 * DisplayObjectContainer are decreased by 1.
	 *
	 *   The garbage collector reallocates unused memory space. When a variable
	 * or object is no longer actively referenced or stored somewhere, the garbage collector sweeps
	 * through and wipes out the memory space it used to occupy if no other references to it exist.
	 * @param	child	The DisplayObject instance to remove.
	 * @return	The DisplayObject instance that you pass in the
	 *   child parameter.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 * @throws	ArgumentError Throws if the child parameter is not a child of this object.
	 */
	public removeChild (child:DisplayObject) : DisplayObject {
		//child.dispatchEventRecursive(new Event(Event.REMOVED_FROM_STAGE));
		child.dispatchEvent(this._eventRemoved);
		(<AwayDisplayObjectContainer> this._adaptee).removeChild(child.adaptee);
		//console.log("removeChild not implemented yet in flash/DisplayObjectContainer");
		return child;
	}

	/**
	 * Removes a child DisplayObject from the specified index position in the child list of
	 * the DisplayObjectContainer. The parent property of the removed child is set to
	 * null, and the object is garbage collected if no other references to the child exist. The index
	 * positions of any display objects above the child in the DisplayObjectContainer are decreased by 1.
	 *
	 *   The garbage collector reallocates unused memory space. When a variable or
	 * object is no longer actively referenced or stored somewhere, the garbage collector sweeps
	 * through and wipes out the memory space it used to occupy if no other references to it exist.
	 * @param	index	The child index of the DisplayObject to remove.
	 * @return	The DisplayObject instance that was removed.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 * @throws	SecurityError This child display object belongs to a sandbox
	 *   to which the calling object does not have access. You can avoid this situation by having
	 *   the child movie call the Security.allowDomain() method.
	 * @throws	RangeError Throws if the index does not exist in the child list.
	 */
	public removeChildAt (index:number) : DisplayObject {
		var awayChild:AwayDisplayObject=(<AwayDisplayObjectContainer> this._adaptee).removeChildAt(index);
		var childadapter:DisplayObject=(<DisplayObject>awayChild.adapter);

		//childadapter.dispatchEventRecursive(new Event(Event.REMOVED_FROM_STAGE));
		childadapter.dispatchEvent(new Event(Event.REMOVED));
		//console.log("removeChildAt not implemented yet in flash/DisplayObjectContainer");
		return childadapter;
	}

	public removeChildren (beginIndex:number=0, endIndex:number=2147483647)  {

		if(endIndex>=(<AwayDisplayObjectContainer> this._adaptee).numChildren) {
			endIndex=(<AwayDisplayObjectContainer> this._adaptee).numChildren-1;
		}

		for(var i:number /*uint*/ = beginIndex; i <= endIndex; i++){
			var oneChild:AwayDisplayObject=(<AwayDisplayObjectContainer> this._adaptee)._children[i];
			if(oneChild.adapter){
				//(<DisplayObject>oneChild.adapter).dispatchEventRecursive(new Event(Event.REMOVED_FROM_STAGE));
				(<DisplayObject>oneChild.adapter).dispatchEvent(this._eventRemoved);
			}
		}


		(<AwayDisplayObjectContainer> this._adaptee).removeChildren(beginIndex, endIndex+1);

		//console.log("removeChildren not implemented yet in flash/DisplayObjectContainer");
	}

	/**
	 * Changes the  position of an existing child in the display object container.
	 * This affects the layering of child objects. For example, the following example shows three
	 * display objects, labeled a, b, and c, at index positions 0, 1, and 2, respectively:
	 *
	 *   When you use the setChildIndex() method and specify an index position
	 * that is already occupied, the only positions that change are those in between the display object's former and new position.
	 * All others will stay the same.
	 * If a child is moved to an index LOWER than its current index, all children in between will INCREASE by 1 for their index reference.
	 * If a child is moved to an index HIGHER than its current index, all children in between will DECREASE by 1 for their index reference.
	 * For example, if the display object container
	 * in the previous example is named container, you can swap the position
	 * of the display objects labeled a and b by calling the following code:
	 * <codeblock>
	 * container.setChildIndex(container.getChildAt(1), 0);
	 * </codeblock>
	 * This code results in the following arrangement of objects:
	 * @param	child	The child DisplayObject instance for which you want to change
	 *   the index number.
	 * @param	index	The resulting index number for the child display object.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 * @throws	RangeError Throws if the index does not exist in the child list.
	 * @throws	ArgumentError Throws if the child parameter is not a child of this object.
	 */
	public setChildIndex (child:DisplayObject, index:number)  {

		// todo: this should be done much more efficient (in awayjs)
		var allChildren=[];
		for(var i:number /*uint*/ = 0; i < (<AwayDisplayObjectContainer> this._adaptee).numChildren; i++){
			allChildren[allChildren.length]=(<AwayDisplayObjectContainer> this._adaptee)._children[i];
		}
		for(i = 0; i < allChildren.length; i++){

			(<AwayDisplayObjectContainer> this._adaptee).removeChild(allChildren[i]);
		}
		var newChildCnt=0;
		var oldChild;
		for(i = 0; i < allChildren.length; i++){
			if(i==index){
				(<AwayDisplayObjectContainer> this._adaptee).addChild(child.adaptee);
			}
			else{
				oldChild=allChildren[newChildCnt++];
				if(oldChild.id!=child.adaptee.id){
					(<AwayDisplayObjectContainer> this._adaptee).addChild(oldChild);
				}
				else{
					oldChild = allChildren[newChildCnt++];
					(<AwayDisplayObjectContainer> this._adaptee).addChild(oldChild);
				}

			}
		}
	}

	public stopAllMovieClips ()  {
		//todo
		throw("stopAllMovieClips not implemented yet in flash/DisplayObjectContainer");
	}


	/**
	 * Swaps the z-order (front-to-back order) of the two specified child objects.  All other child
	 * objects in the display object container remain in the same index positions.
	 * @param	child1	The first child object.
	 * @param	child2	The second child object.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 * @throws	ArgumentError Throws if either child parameter is not a child of this object.
	 */
	public swapChildren (child1:DisplayObject, child2:DisplayObject) {
		(<AwayDisplayObjectContainer> this._adaptee).swapChildren(child1.adaptee, child2.adaptee);

	}

	/**
	 * Swaps the z-order (front-to-back order) of the child objects at the two specified index positions in the
	 * child list. All other child objects in the display object container remain in the same index positions.
	 * @param	index1	The index position of the first child object.
	 * @param	index2	The index position of the second child object.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 * @throws	RangeError If either index does not exist in the child list.
	 */
	public swapChildrenAt (index1:number, index2:number)  {
		//todo
		throw("swapChildrenAt not implemented yet in flash/DisplayObjectContainer");
	}
}
