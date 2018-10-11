import {Vector3D, Point} from "@awayjs/core";

import {IPicker, TraverserBase, INode, IEntity, PickingCollision, IRenderable, PartitionBase} from "@awayjs/renderer";

import {TriangleElements, LineElements, Shape} from "@awayjs/graphics";

import {Billboard, DisplayObject, DisplayObjectContainer, Sprite, Scene, MorphSprite, MovieClip, TextField, TextFieldType} from "@awayjs/scene";

import {View, MouseManager} from "@awayjs/view";

/**
 * Picks a 3d object from a view or scene by 3D raycast calculations.
 * Performs an initial coarse boundary calculation to return a subset of entities whose bounding volumes intersect with the specified ray,
 * then triggers an optional picking collider on individual renderable objects to further determine the precise values of the picking ray collision.
 *
 * @class away.pick.RaycastPicker
 */
export class AVMRaycastPicker extends TraverserBase implements IPicker
{
	private _partition:PartitionBase;
	private _rayPosition:Vector3D;
	private _rayDirection:Vector3D;
	private _findClosestCollision:boolean;
	private _bestCollision:PickingCollision;
	private _testCollision:PickingCollision;
	private _ignoredEntities:IEntity[];

	private _dragEntity:IEntity;


	private _entity:IEntity;
	private _entities:IEntity[] = [];

	private _tabEntities:IEntity[] = [];
	private _customTabEntities:IEntity[] = [];

	private _avm1Stage:DisplayObject;


	/**
	 * @inheritDoc
	 */
	public onlyMouseEnabled:boolean = true;

	/**
	 * Creates a new <code>RaycastPicker</code> object.
	 *
	 * @param findClosestCollision Determines whether the picker searches for the closest bounds collision along the ray,
	 * or simply returns the first collision encountered. Defaults to false.
	 */
	constructor(partition:PartitionBase, findClosestCollision:boolean = false, avm1Stage:DisplayObject)
	{
		super();
		
		this._partition = partition;
		this._avm1Stage=avm1Stage;
		this._findClosestCollision = findClosestCollision;
	}

	/**
	 * Returns true if the current node is at least partly in the frustum. If so, the partition node knows to pass on the traverser to its children.
	 *
	 * @param node The Partition3DNode object to frustum-test.
	 */
	public enterNode(node:INode):boolean
	{
		if((<any>node)._entity && (<any>node)._entity.isTabEnabled){
			if(!(<any>node)._entity.isAsset(TextField) || (<TextField>(<any>node)._entity).type==TextFieldType.INPUT){
				// add the entity to the correct tab list.
				if((<any>node)._entity.tabIndex>=0){
					if(this._customTabEntities.length<(<any>node)._entity.tabIndex){
						this._customTabEntities.length=(<any>node)._entity.tabIndex;
					}
					this._customTabEntities[(<any>node)._entity.tabIndex]=(<any>node)._entity;
				}
				else{
					this._tabEntities[this._tabEntities.length]=(<any>node)._entity;
				}

			}
		}
		return node.isIntersectingRay(this._rayPosition, this._rayDirection) && !node.isMask();
	}

	public getNextTabEntity(currentFocus:IEntity):IEntity
	{
		if(this._customTabEntities.length<=0 && this._tabEntities.length<=0)
			return currentFocus;

		if(this._customTabEntities.length>0){
			var newTabIndex:number=-1;
			if(currentFocus){
				newTabIndex=currentFocus.tabIndex;
			}
			newTabIndex++;
			var i:number=newTabIndex;
			while(i<this._customTabEntities.length){
				if(this._customTabEntities[i]){
					return this._customTabEntities[i];
				}
				i++;
			}
			i=0;
			while(i<this._customTabEntities.length){
				if(this._customTabEntities[i]){
					return this._customTabEntities[i];
				}
				i++;
			}
			return currentFocus;
		}
		if(currentFocus){
			var len:number=this._tabEntities.length;
			for(var i:number=0; i<len; i++){
				if(this._tabEntities[i]==currentFocus){
					if(i==0){
						return this._tabEntities[len-1];
					}
					return this._tabEntities[i-1];						
				}
			}
		}
		// this point we would already have exit out if tabEntities.length was 0
		return this._tabEntities[0];	

	}
	public getPrevTabEntity(currentFocus:IEntity):IEntity
	{
		if(this._customTabEntities.length<=0 && this._tabEntities.length<=0)
			return currentFocus;

		if(this._customTabEntities.length>0){
			var newTabIndex:number=-1;
			if(currentFocus){
				newTabIndex=currentFocus.tabIndex;
			}
			newTabIndex--;
			var i:number=newTabIndex;
			while(i>=0){
				if(this._customTabEntities[i]){
					return this._customTabEntities[i];
				}
				i--;
			}
			i=newTabIndex;
			while(i>=0){
				if(this._customTabEntities[i]){
					return this._customTabEntities[i];
				}
				i--;
			}
			return currentFocus;
		}
		if(currentFocus){
			var len:number=this._tabEntities.length;
			for(var i:number=0; i<len; i++){
				if(this._tabEntities[i]==currentFocus){
					if(i==len-1){
						return this._tabEntities[0];
					}
					return this._tabEntities[i+1];						
				}
			}
		}
		// this point we would already have exit out if tabEntities.length was 0
		return this._tabEntities[0];	

	}
	/**
	 * @inheritDoc
	 */
	public getCollision(rayPosition:Vector3D, rayDirection:Vector3D, shapeFlag:boolean = false):PickingCollision
	{
		this._rayPosition = rayPosition;
		this._rayDirection = rayDirection;


		this._tabEntities.length = 0;
		this._customTabEntities.length = 0;
		// collect entities to test
		this._partition.traverse(this);

		//early out if no collisions detected
		if (!this._entities.length)
			return null;

		//console.log("entities: ", this._entities)
		var collision:PickingCollision = this._getPickingCollision(shapeFlag);



		//discard entities
		this._entities.length = 0;

		return collision;
	}

//		public getEntityCollision(position:Vector3D, direction:Vector3D, entities:Array<IEntity>):PickingCollision
//		{
//			this._numRenderables = 0;
//
//			var renderable:IEntity;
//			var l:number = entities.length;
//
//			for (var c:number = 0; c < l; c++) {
//				renderable = entities[c];
//
//				if (renderable.isIntersectingRay(position, direction))
//					this._renderables[this._numRenderables++] = renderable;
//			}
//
//			return this.getPickingCollision(this._raycastCollector);
//		}

	public setIgnoreList(entities:Array<IEntity>):void
	{
		this._ignoredEntities = entities;
	}


	public get dragEntity():IEntity
	{
		return this._dragEntity;
	}
	public set dragEntity(entity:IEntity)
	{
		MouseManager.getInstance().isAVM1Dragging=true;
		this._dragEntity = entity;
	}


	private isIgnored(entity:IEntity):boolean
	{
		if (this.onlyMouseEnabled && !entity._iIsVisible && !entity._iIsMouseEnabled())
			return true;

		// ignored if this is entity is currently being dragged
		if(this._dragEntity == entity)
			return true;

		// 	check all parents:
		var parent:DisplayObject=<DisplayObject>entity.parent;	
		while(parent && parent.name!="scene"){
			// ignored if parent is currently being dragged
			if(this._dragEntity == parent)
				return true;
			// ignored if parent has a hitArea set
			if(parent.isAsset(MovieClip) && (<MovieClip>parent).hitArea!=null)
				return true;
			parent=parent.parent;
		}

		if (this._ignoredEntities) {
			var len:number = this._ignoredEntities.length;
			for (var i:number = 0; i < len; i++)
				if (this._ignoredEntities[i] == entity)
					return true;
		}

		return false;
	}

	private sortOnNearT(entity1:IEntity, entity2:IEntity):number
	{
		//return entity1._iPickingCollision.rayEntryDistance > entity2._iPickingCollision.rayEntryDistance? 1 : -1;// use this for Icycle;
		return entity1._iPickingCollision.rayEntryDistance > entity2._iPickingCollision.rayEntryDistance? 1 : entity1._iPickingCollision.rayEntryDistance < entity2._iPickingCollision.rayEntryDistance?-1:0;
	}
	private sortOnDepth(entity1:IEntity, entity2:IEntity):number
	{
		return entity1._depthID < entity2._depthID? 1 : -1;//entity1._depthID > entity2._depthID?-1:0;
	}

	private printPath(obj:DisplayObject):string
	{
		var path:string="";
		var parent=obj;
		var name=[];
		var objs=[];
		while (parent && parent.name!="scene"){
			name.push(parent.name+"."+parent.id+" / ");
			objs.push(parent);
			parent=parent.parent;
		}
		for(var i=name.length-1;i>=0;i--){
			path+=name[i];
		}
		console.log(objs);
		return path;
	}
	private _getPickingCollision(shapeFlag:boolean):PickingCollision
	{
		// 	no sorting for entities is needed
		// 	this is already taken care by the order the entitites are added

		// 	this function should always return a selectable TextField 
		//	or a MovieClip that is listening for MouseEvents

		// 	in Flash shapes (which we wrap by Sprites) can not be interactive, 
		//	so they should bever be the result of the picking collision
		//	We can not just ignore sprites tho, because they are needed to detect collisions on their parent MCs

		this._bestCollision = null;

		var len:number = this._entities.length;
		for (var i:number = 0; i < len; i++) {
			this._entity = this._entities[i];
			this._testCollision = this._entity._iPickingCollision;
			if (this._bestCollision == null || this._testCollision.rayEntryDistance < this._bestCollision.rayEntryDistance) {

				// possible object-types for AVM1:
				//		-	TextField (selectable vs non-selectable)
				//		-	Sprite as child of MovieClip
				//		-	MovieClip 
				//		- 	Billboards (not implemented here yet)


				if(this._entity.isAsset(Sprite)){
					if(this._entity.parent.isAsset(TextField)){
						// this is a child of a textfield (used for masked textfields)
						// transfer the hit to the parent textfield
						this._bestCollision = this._testCollision.entity.parent._iPickingCollision;
						this._entity=this._entity.parent;
					}
				}

				// collisions on non-selectable TextField can just be ignored
				if(this._entity.isAsset(TextField)){
					this._bestCollision = this._testCollision;
				}
				
				// 	collisions on sprites need to hitTest against graphics
				//	in AVM1 these sprites never have children, 
				//	a hit on them can be considered a hit on the parent-mc
				else if(this._entity.isAsset(Sprite) || this._entity.isAsset(MorphSprite)){
					this.updatePosition(this._testCollision);
					if((<Sprite>this._entity).graphics._hitTestPointInternal(this._testCollision.position.x, this._testCollision.position.y)){
						this._bestCollision = this._testCollision.entity.parent._iPickingCollision;
					}
					else{
						continue;	
					}				
				}

				// 	collisions on MovieClip need to be hittested against graphics, 
				//	or against hitArea if it set
				else if(this._entity.isAsset(MovieClip)){
					this.updatePosition(this._testCollision);
					if((<MovieClip>this._entity).hitArea){
						//	hitTest against hitArea
						if((<MovieClip>this._entity).hitArea._hitTestPointInternal(this._testCollision.position.x, this._testCollision.position.y, true, false)){
							this._bestCollision = this._testCollision;
						}
						else{
							continue;	
						}	
					}
					else{
						//	hitTest against graphics
						if((<MovieClip>this._entity).graphics._hitTestPointInternal(this._testCollision.position.x, this._testCollision.position.y)){
							this._bestCollision = this._testCollision;
						}
						else{
							continue;	
						}	
					}
				}	
				else{
					// billboards and other stuff ignored for now
					continue;
				}			
			}
			if (this._bestCollision){

				// 	potential hit
				//console.log("potential hit", this._bestCollision);

				// 	if we are looking for the droptarget, this is good enough
				//	flash allows all movieclips and selectable texts as drop-target, even if they are not named.
				if(this._dragEntity)
					break;
				

				// 	find the top parent-MovieClip of this object
				//	that is listening for MouseEvents
				// 	checks can stop at the SWF-root (MC with name "scene")

				var parent:DisplayObject=<DisplayObject>this._bestCollision.entity.parent;
				var foundButtonparent:boolean=false;
				while(parent && parent.name!="scene"){
					// in AVM1 the only object that can hold children is MovieClip
					// stop checking if we encounter anything else (should not happen for loaded swfs)
					if(parent.isAsset(MovieClip)){
						if((<MovieClip>parent).mouseListenerCount>0){
							this._bestCollision=parent._iPickingCollision;
							foundButtonparent=true;							
							parent=parent.parent;// keep checking until we reach the swf-root
						}
						else parent=parent.parent;
					} 
					else parent=null;				
				}
				// a parent matches the conditions ? - exit
				if(foundButtonparent)
					break;

				var potentialHit:DisplayObject=<DisplayObject>this._bestCollision.entity;
				// 	object should be either a selectable Textfield or MovieClips
				
				// 	selectable textfield is a found hit - exit
				if(potentialHit.isAsset(TextField) && (<TextField>potentialHit).selectable)
					break;
				
				// 	MovieClip with mouselistener is a found hit - exit
				if(potentialHit.isAsset(MovieClip) && (<MovieClip>potentialHit).mouseListenerCount>0){
					break;
				}
				//console.log("MovieClip not mouseenabled", this.printPath(<DisplayObject>this._bestCollision.entity),this._bestCollision.entity);
				
				// everything else is considered a miss, and we keep checking
				this._bestCollision=null;
			}
		}

		if (this._bestCollision){
			// if we have a dragEntity set, we store the droptarget
			this.updatePosition(this._bestCollision);
			//console.log("collision:", this.printPath(<DisplayObject>this._bestCollision.entity));
		}
		if(this._dragEntity){
			if(this._dragEntity.isAsset(MovieClip) && this._dragEntity.adapter){
				(<any>this._dragEntity.adapter).setDropTarget(this._bestCollision?this._bestCollision.entity:null);
			}
		}

		// if nothing was hit, or the scene was hit, we set the AVM1Stage as hit
		if((!this._bestCollision || this._bestCollision.entity.isAsset(Scene)) && this._avm1Stage){
			// todo: how to make sure the picking collision is correctly processed for stage?
			this._bestCollision = this._avm1Stage._iPickingCollision;
		}

		return this._bestCollision;
	}

	private updatePosition(pickingCollision:PickingCollision):void
	{
		var collisionPos:Vector3D = pickingCollision.position || (pickingCollision.position = new Vector3D());

		var rayDir:Vector3D = pickingCollision.rayDirection;
		var rayPos:Vector3D = pickingCollision.rayPosition;
		var t:number = pickingCollision.rayEntryDistance;
		collisionPos.x = rayPos.x + t*rayDir.x;
		collisionPos.y = rayPos.y + t*rayDir.y;
		collisionPos.z = rayPos.z + t*rayDir.z;
	}

	public dispose():void
	{
		//TODO
	}

	/**
	 *
	 * @param entity
	 */
	public applyEntity(entity:IEntity):void
	{
		if (!this.isIgnored(entity)){
			this._entities.push(entity);
		}
	}

	public applyRenderable(renderable:IRenderable):void
	{
		if (renderable.testCollision(this._testCollision, this._findClosestCollision))
			this._bestCollision = this._testCollision;
	}
}