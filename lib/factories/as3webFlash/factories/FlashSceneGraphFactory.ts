import {IAssetAdapter, Point} from "@awayjs/core";
import {BitmapImage2D, Image2D} from "@awayjs/stage";
import {Timeline, MovieClip as AwayMovieClip, Sprite as AwaySprite, DisplayObjectContainer as AwayDisplayObjectContainer, Billboard, ISceneGraphFactory, TextField as AwayTextField, PrefabBase} from "@awayjs/scene";
import {MethodMaterial, MaterialBase} from "@awayjs/materials";
import {DefaultSceneGraphFactory} from "@awayjs/scene";
import {SceneImage2D} from "@awayjs/scene";

import {Sprite} from "../display/Sprite";
import {MovieClip} from "../display/MovieClip";
import {Bitmap} from "../display/Bitmap";
import {BitmapData} from "../display/BitmapData";
import {DisplayObjectContainer} from "../display/DisplayObjectContainer";
import {TextField} from "../text/TextField";
import { Graphics } from '@awayjs/graphics';

export class FlashSceneGraphFactory extends DefaultSceneGraphFactory implements ISceneGraphFactory
{
	public imageStore:Object = {};

	public creatematerial():MaterialBase
	{
		return null;
	}
	public createSprite(prefab:PrefabBase = null, graphics:Graphics = null):AwaySprite
	{
		return <AwaySprite> new Sprite(AwaySprite.getNewSprite(graphics)).adaptee;
	}

	public createDisplayObjectContainer():AwayDisplayObjectContainer
	{
		return <AwayDisplayObjectContainer> new DisplayObjectContainer().adaptee;
	}

	public createMovieClip(timeline:Timeline = null):AwayMovieClip
	{
		return <AwayMovieClip> new MovieClip(new AwayMovieClip(timeline)).adaptee;
	}

	public createTextField():AwayTextField
	{
		return <AwayTextField> new TextField().adaptee;
	}

	public createBillboard(material:MaterialBase):Billboard
	{
		return <Billboard> new Bitmap(<BitmapData> material.style.image.adapter).adaptee;
	}

	public createImage2D(width:number, height:number, transparent:boolean = true, fillColor:number = null, powerOfTwo:boolean = true):Image2D
	{
		return <SceneImage2D> new BitmapData(width, height, transparent, fillColor).adaptee;
	}
}