import {BitmapData} from "./../display/BitmapData";
import {ByteArray} from "./../utils/ByteArray";
export class Texture{

	// todo. can probably route directly to awayjs class


	public static fromBitmapData(bitmapData:BitmapData):Texture{
		console.log("fromBitmapData not implemented yet in flash/Texture");
		return null;
	}
	constructor (){
	}

	public uploadCompressedTextureFromByteArray (data:ByteArray, byteArrayOffset:number, async:boolean=false){
		console.log("uploadCompressedTextureFromByteArray not implemented yet in flash/Texture");

	}

	public uploadFromBitmapData (source:BitmapData, miplevel:number=0){
		console.log("uploadFromBitmapData not implemented yet in flash/Texture");

	}

	public uploadFromByteArray (data:ByteArray, byteArrayOffset:number, miplevel:number=0){
		console.log("uploadFromByteArray not implemented yet in flash/Texture");

	}
}

