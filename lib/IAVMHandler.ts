import { SWFFile } from './parsers/SWFFile';
import { IAVMStage } from './IAVMStage';
import { ISceneGraphFactory } from '@awayjs/scene';
import { IAsset } from '@awayjs/core';

export interface IAVMHandler{
	avmVersion: string;
	init(avmStage: IAVMStage, swfFile: SWFFile, callback: (hasInit: boolean) => void): void;
	factory: ISceneGraphFactory;
	addAsset(asset: IAsset, addScene: boolean);
	resizeStage();
	enterFrame(dt: number);
}