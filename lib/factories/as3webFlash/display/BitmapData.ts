import { IAssetAdapter, ColorUtils } from "@awayjs/core";
import { StageManager, ImageUtils } from "@awayjs/stage";
//****************************************************************************
// ActionScript Standard Library
// flash.display.BitmapData object
//****************************************************************************
import { Rectangle } from "../geom/Rectangle"
import { Point } from "../geom/Point"
import { Matrix } from "../geom/Matrix"
import { ColorTransform } from "../geom/ColorTransform"
import { BitmapFilter } from "../filters/BitmapFilter"
import { IBitmapDrawable } from "./IBitmapDrawable"
import { SceneImage2D } from "@awayjs/scene"

import { IBitmapDataOwner } from "./IBitmapDataOwner";
import { ASObject } from '../../avm2/nat/ASObject';
import { notImplemented } from '../../base/utilities/Debug';
import { ByteArray } from '../../avm2/natives/byteArray';
import { Uint32Vector } from '../../avm2/natives/uint32Vector';
import { GenericVector } from '../../avm2/natives/GenericVector';
import { ActiveLoaderContext } from '../../avm2/run/axConstruct';

export class BitmapData extends ASObject implements IBitmapDrawable, IAssetAdapter {
	private _adaptee: SceneImage2D;
	private _owners: Array<IBitmapDataOwner> = new Array<IBitmapDataOwner>();

	// for AVM1:
	public compare(other: BitmapData): boolean {
		return true;
	}


	public get adaptee(): SceneImage2D {
		return this._adaptee;
	}

	static loadBitmap(id: string): BitmapData {
		console.log("loadBitmap not implemented yet in flash/BitmapData");
		return null;

	}

	public setPixels(rect: Rectangle, inputByteArray: ByteArray): void {
		console.log("todo: BitmapData.setPixels");
		//this._putPixelData(rect, new Int32Array(inputByteArray.readRawBytes()));
	  }

	public getPixels(rect: Rectangle): ByteArray {
		/*var outputByteArray = new ByteArray();
		this.copyPixelsToByteArray(rect, outputByteArray);*/
		console.log("getPixels not implemented yet in flash/BitmapData");
		return null;
	}

	public copyPixelsToByteArray(rect: Rectangle, data: ByteArray): void {
		console.log("copyPixelsToByteArray not implemented yet in flash/BitmapData");
	}



	public getVector(rect: Rectangle): Uint32Vector {
		notImplemented("public flash.display.BitmapData::getVector");
		return null;
	}



	public setVector(rect: Rectangle, inputVector: Uint32Vector): void {
		notImplemented("public flash.display.BitmapData::encode");
	}



	public histogram(hRect: Rectangle = null): GenericVector {
		notImplemented("public flash.display.BitmapData::encode");
		return;
	}

	public encode(rect: Rectangle, compressor: ASObject,
		byteArray: ByteArray = null): ByteArray {
		notImplemented("public flash.display.BitmapData::encode");
		return;
	}
	public drawWithQuality(source: IBitmapDrawable, matrix: Matrix = null,
		colorTransform: ColorTransform = null, blendMode: string = null,
		clipRect: Rectangle = null, smoothing: boolean = false,
		quality: string = null): void {
		notImplemented("public flash.display.BitmapData::drawWithQuality");
	}
	constructor(width: number, height: number, transparent: boolean = true, fillColor: number = 0xffffffff) {
		super();
		if(ActiveLoaderContext.sceneImage2DForBitmapConstructor){
			this._adaptee=ActiveLoaderContext.sceneImage2DForBitmapConstructor;
			ActiveLoaderContext.sceneImage2DForBitmapConstructor=null;
		}
		else{
			this._adaptee = new SceneImage2D(width, height, transparent, fillColor, false, StageManager.getInstance().getStageAt(0));
		}
		this._adaptee.adapter = this;
	}

	public get transparent(): boolean {
		return this._adaptee.transparent;
	}
	public set transparent(value: boolean) {
		this._adaptee.transparent = value;
	}

	public get width(): number {
		return this._adaptee.width;
	}
	public set width(value: number) {
		this._adaptee.width = value;
	}

	public get height(): number {
		return this._adaptee.height;
	}
	public set height(value: number) {
		this._adaptee.height = value;
	}

	public clone(): BitmapData {
		var clone: BitmapData = new this.sec.flash.display.BitmapData(this._adaptee.width, this._adaptee.height, this._adaptee.transparent, 0x0);
		clone.copyPixels(this, this.rect, new this.sec.flash.geom.Point());
		return clone;
	}

	public get rect(): Rectangle {
		return new this.sec.flash.geom.Rectangle(this._adaptee.rect);
	}
	public getPixel(x: number, y: number): number {
		return this._adaptee.getPixel(x, y);
	}
	public getPixel32(x: number, y: number): number {
		return this._adaptee.getPixel32(x, y);
	}
	public setPixel(x: number, y: number, color: number) {
		this._adaptee.setPixel(x, y, color);
	}
	public setPixel32(x: number, y: number, color: number) {
		this._adaptee.setPixel32(x, y, color);
	}
	public applyFilter(sourceBitmap: BitmapData, sourceRect: Rectangle, destPoint: Point, filter: BitmapFilter): number {
		console.log("applyFilter not implemented yet in flash/BitmapData");
		return 0;
	}
	public colorTransform(rect: Rectangle, colorTransform: ColorTransform) {
		this._adaptee.colorTransform(rect.adaptee, colorTransform.adaptee);
	}
	public copyChannel(sourceBitmap: BitmapData, sourceRect: Rectangle,
		destPoint: Point, sourceChannel: number, destChannel: number) {
		this._adaptee.copyChannel(sourceBitmap.adaptee, sourceRect.adaptee, destPoint.adaptee, sourceChannel, destChannel);

	}
	public copyPixels(sourceBitmap: any, sourceRect: Rectangle, destPoint: Point, alphaBitmapData: BitmapData = null, alphaPoint: Point = null, mergeAlpha: boolean = false) {
		this._adaptee.copyPixels(sourceBitmap.adaptee, sourceRect.adaptee, destPoint.adaptee);
	}
	public dispose() {
		this._adaptee.dispose();
		this._adaptee = null;
	}

	public draw(source: any, matrix: Matrix, colorTransform: ColorTransform = null, blendMode: any = "", clipRect: Rectangle = null, smooth: boolean = false) {
		
		this._adaptee.draw(source.adaptee, matrix?matrix.adaptee:null, colorTransform?colorTransform.adaptee:null, blendMode, clipRect?(<any>clipRect).adaptee:null, smooth);
	}
	public fillRect(rect: Rectangle, color: number) {
		var colorArr=ColorUtils.float32ColorToARGB(color);
		color=ColorUtils.ARGBtoFloat32(colorArr[0], colorArr[3], colorArr[2], colorArr[1]);
		this._adaptee.fillRect(rect.adaptee, color);
	}

	public floodFill(x: number, y: number, color: number) {
		console.log("floodFill not implemented yet in flash/BitmapData");

	}
	public generateFilterRect(sourceRect: Rectangle, filter: BitmapFilter): Rectangle {
		console.log("generateFilterRect not implemented yet in flash/BitmapData");
		return null;

	}
	public getColorBoundsRect(mask: number, color: number, findColor: boolean): Rectangle {
		console.log("getColorBoundsRect not implemented yet in flash/BitmapData");
		return null;

	}
	public hitTest(firstPoint: Point,
		firstAlphaThreshold: number,
		secondObject: any,
		secondBitmapPoint: Point = new this.sec.flash.geom.Point(0, 0),
		secondAlphaThreshold: number = 0): boolean {
		console.log("hitTest not implemented yet in flash/BitmapData");
		return false;

	}

	public lock(): void {
		this._adaptee.lock();
	}

	public merge(sourceBitmap: BitmapData,
		sourceRect: Rectangle,
		destPoint: Point,
		redMult: number,
		greenMult: number,
		blueMult: number,
		alphaMult: number) {
		this._adaptee.merge(sourceBitmap.adaptee, sourceBitmap.rect.adaptee, destPoint.adaptee, redMult, greenMult, blueMult, alphaMult)

	}
	public noise(randomSeed: number, low: number, high: number,
		channelOptions: number,
		grayScale: boolean) {
		console.log("noise not implemented yet in flash/BitmapData");

	}
	public paletteMap(sourceBitmap: BitmapData,
		sourceRect: Rectangle,
		destPoint: Point,
		redArray: any[],
		greenArray: any[],
		blueArray: any[],
		alphaArray: any[]) {
		console.log("paletteMap not implemented yet in flash/BitmapData");

	}
	public perlinNoise(baseX: number, baseY: number,
		numOctaves: number, randomSeed: number,
		stitch: boolean, fractalNoise: boolean,
		channelOptions: number,
		grayScale: boolean,
		offsets: any) {
		console.log("perlinNoise not implemented yet in flash/BitmapData");

	}
	public pixelDissolve(sourceBitmap: BitmapData,
		sourceRect: Rectangle,
		destPoint: Point,
		randomSeed: number,
		numberOfPixels: number,
		fillColor: number): number {
		console.log("pixelDissolve not implemented yet in flash/BitmapData");
		return 0;

	}
	public scroll(x: number, y: number) {
		console.log("scroll not implemented yet in flash/BitmapData");

	}
	public threshold(sourceBitmap: BitmapData,
		sourceRect: Rectangle,
		destPoint: Point,
		operation: string,
		threshold: number,
		color: number,
		mask: number,
		copySource: boolean): number {
		console.log("threshold not implemented yet in flash/BitmapData");
		return 0;

	}

	public unlock(): void {
		this._adaptee.unlock();
	}

	public _addOwner(owner: IBitmapDataOwner) {
		if (this._owners.indexOf(owner) == -1)
			this._owners.push(owner);
	}

	public _removeOwner(owner: IBitmapDataOwner) {
		var index: number = this._owners.indexOf(owner);

		if (index != -1)
			this._owners.splice(index, 1);

		if (!this._owners.length)
			this._adaptee.clear();
	}
}
