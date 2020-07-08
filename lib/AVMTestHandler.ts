import { IInputRecorder } from "@awayjs/scene";
import { SWFFile } from './parsers/SWFFile';
var hasshownServerError: boolean = false;
function serverError(error: any) {
	if (hasshownServerError)
		return;
	hasshownServerError = true;
	alert("Can not connect to Server. Is Server.js running ?");

}
export enum TEST_MODE {
	TESTING = "TESTING",
	RECORDING = "RECORDING"
}
export class AVMTestHandler implements IInputRecorder {
	public frames: IAVMTestFrame[];
	public frameIdx: number = 0;
	public swfInfo: ISWFTestInfo;
	public config: IAVMTestConfig;
	public reportedSWFInfos: boolean;
	public snapshotCnt:number=0;
	public snapShotsUploaded:number=0;
	private _finished: boolean;
	private _avmStage: any;

	constructor(config: IAVMTestConfig, avmStage: any) {
		this.config = config;
		this._avmStage = avmStage;
		this.frameIdx = 0;
		this.reportedSWFInfos = false;
		this.frames = [{
			messages: [],
			frameIdx: this.frameIdx
		}];
		this._finished = false;
		this.snapshotCnt=0;

		//if(this.config.mode==TEST_MODE.RECORDING){
		//	if recording, we must have a way to stop the recording,
		//	so we listen for a keyboard sortcut here on window
		window.addEventListener("keydown", (event) => {
			if (event.ctrlKey && event.keyCode == 69) {
				this.finishTest();
			}
		});
		//}
	}
	/**
	 * called from trace-function, to collect all traces for a frame
	 * @param message 
	 */
	public addMessage(message: string) {
		if(this._finished)
			return;
		this.frames[this.frames.length - 1].messages.push(message);
		this.checkIfFinished();
	}

	public setSWF(swfFile: SWFFile) {
		this.swfInfo = {
			frameRate: swfFile.frameRate,
			swfVersion: swfFile.swfVersion,
			asVersion: swfFile.useAVM1 ? 2 : 3,
			width: swfFile.bounds.width / 20,
			height: swfFile.bounds.height / 20,
		};
	}

	public recordEvent() {
	}

	public closeBrowserTab() {
		if(!this._finished)
			return;
		if((this.snapShotsUploaded==0 && this.snapshotCnt==0) || this.snapShotsUploaded==this.snapshotCnt-1){
			this.finishAndUploadTest();
		}
	}
	public takeSnapshot() {
		if(this._finished)
			return;
		let myThis=this;
		let snapShotFrame=this.snapshotCnt++;
		this.addMessage("AWAYFLTEST SNAPSHOT "+ snapShotFrame);
		this._avmStage.snapshot(htmlCanvas => {
			
			htmlCanvas.toBlob((blob)=>onBlob(blob));
			function onBlob (blob) {
				console.log("snapshot done");

				const formData = new FormData();
				var fileName ="snapshot_"+snapShotFrame+".png";
				formData.append("file", blob, fileName);
				
				const request = new XMLHttpRequest();
				request.onreadystatechange = function (oEvent) {
					if (request.readyState == 4) {
						if (request.status == 200 || request.status == 0) {
							//console.log("AWAYFLTEST END");
							myThis.snapShotsUploaded++;
							myThis.closeBrowserTab();
							//console.log(request.responseText)
						} else {
							serverError(request.statusText + "-" + request.readyState + "-" + request.responseText + "-" + request.status);
						}
					}
				};
				request.onerror = function (e) {
					serverError(request.statusText + "-" + request.readyState + "-" + request.responseText + "-" + request.status);
				};
				try {
					request.open("POST", "http://localhost:" + myThis.config.port + "/uploadImage", true);
					request.send(formData);
				}
				catch (e) {
					serverError("Could not save json on server. The Server.js is probably not running. Error: " + e);
				}
			};
		});
	}
	/**
	 * called from onEnter on stage
	 */
	public nextFrame() {
		console.log("AVMTestHandler - showNextFrame");
		this.frameIdx++;
		if(this.config.settings.stopRecAfterFrame>0 && this.frameIdx>=this.config.settings.stopRecAfterFrame){
			this.finishTest();
		}
		if (this.frames[this.frames.length - 1].messages.length > 0) {
			this.frames.push({
				messages: [],
				frameIdx: this.frameIdx,
			});
		}
		else {
			this.frames[this.frames.length - 1].frameIdx = this.frameIdx;
		}

		if (this.config.mode == TEST_MODE.TESTING && this.config.loadedFrames.length < this.frames.length) {
			this.finishTest();
		}
	}

	public checkIfFinished() {
		if (this.config.frames) {
			if (this.config.frames.length < this.frames.length) {
				// more test frames than recordet frames. test is complete (and propably failed)
				this.finishTest();
				return;
			}
			let currentRecordetFrame: number = -1;
			for (let i = 0; i < this.config.frames.length; i++) {
				if (this.config.frames[i].frameIdx == this.frames[this.frames.length - 1].frameIdx) {
					currentRecordetFrame = i;
				}
			}
			if (currentRecordetFrame == -1) {
				// no recordet frame found for this frameIdx. test is complete (and propably failed)
				this.finishTest();
				return;
			}
			if (currentRecordetFrame == this.config.frames.length - 1) {
				// last of the recordet frames, if test frame has same number of messages, test is complete
				let len1 = this.config.frames[currentRecordetFrame].messages.length;
				let len2 = this.frames[this.frames.length - 1].messages.length;
				if (len2 >= len1) {
					this.finishTest();
				}
			}
		}
	}
	public finishTest() {
		if (this._finished)
			return;
		this._finished = true;
		this.closeBrowserTab();
	}
	
	public finishAndUploadTest() {
		if (this.frames[this.frames.length - 1].messages.length == 0) {
			this.frames.pop();
		}
		let myThis=this;
		var path = window.location.pathname;
		var page = path.split("/").pop().replace(".html", "");
		const data = {
			player: "awayflplayer",
			duration: Date.now() - this.config.startRecTime,
			date: new Date().toLocaleString(),
			url: page,
			swf: this.config.swfPath,
			swfInfos: this.swfInfo,
			settings: this.config,
			frames: this.frames,
			seed: this.config.seed,
		}
		const json = JSON.stringify(data);
		const formData = new FormData();
		const blob = new Blob([json], { type: "text/xml" });
		if (this.config.recordtest) {
			var fileName = this.config.swfPath.replace(/\\/g, "/");
			formData.append("file", blob, fileName);
			formData.append("record", "true");
		}
		else {
			var fileName = this.config.swfPath.replace(/\\/g, "/") + "/" + this.config.testPath;
			formData.append("file", blob, fileName);
		}
		const request = new XMLHttpRequest();
		request.onreadystatechange = function (oEvent) {
			if (request.readyState == 4) {
				if (request.status == 200 || request.status == 0) {
					console.log("AWAYFLTEST END");
					window.close();
					//console.log(request.responseText)
				} else {
					serverError(request.statusText + "-" + request.readyState + "-" + request.responseText + "-" + request.status);
				}
			}
		};
		request.onerror = function (e) {
			serverError(request.statusText + "-" + request.readyState + "-" + request.responseText + "-" + request.status);
		};
		try {
			request.open("POST", "http://localhost:" + this.config.port + "/upload", true);
			request.send(formData);
		}
		catch (e) {
			serverError("Could not save json on server. The Server.js is probably not running. Error: " + e);
		}
	}



}
export interface IAVMTestConfig {
	loadedFrames: IAVMTestFrame[];
	seed: string;
	port: string;
	throwOnFail: boolean;
	mode: TEST_MODE;
	swf: string;
	swfPath: string;
	[key: string]: any;
}
export interface ISWFTestInfo {
	frameRate: number;
	width: number;
	height: number;
	asVersion: number;
	swfVersion: number;
}
export interface IAVMTestFrame {
	messages: string[];
	frameIdx: number;
}