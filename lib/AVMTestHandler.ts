import {IInputRecorder} from "@awayjs/scene";
var hasshownServerError: boolean = false;
function serverError(error: any) {
    if (hasshownServerError)
        return;
    hasshownServerError = true;
    alert("Can not connect to Server. Is Server.js running ?");

}
export enum TEST_MODE{
	TESTING="TESTING",
	RECORDING="RECORDING"
}
export class AVMTestHandler implements IInputRecorder{
	public frames:IAVMTestFrame[];
	public config:IAVMTestConfig;
	private _finished:boolean;

	constructor(config:IAVMTestConfig){
		this.config=config;
		this.frames=[{
			messages:[],
			events:[],
			snapshots:[]
		}];
		this._finished=false;

		//if(this.config.mode==TEST_MODE.RECORDING){
			//	if recording, we must have a way to stop the recording,
			//	so we listen for a keyboard sortcut here on window
			window.addEventListener("keydown", (event)=>{
				if(event.ctrlKey && event.keyCode==69){
					this.finishTest();
				}
			});
		//}
	}
	/**
	 * called from trace-function, to collect all traces for a frame
	 * @param message 
	 */
	public addMessage(message:string){
		if(this.config.mode==TEST_MODE.TESTING && this.config.throwOnFail){
			if(this.config.loadedFrames.length<this.frames.length)
				throw("ERROR IN AVMTEST.addMessage");
			if(this.config.loadedFrames[this.frames.length-1].messages.length<this.frames[this.frames.length-1].messages.length)
				throw("ERROR IN AVMTEST.addMessage");
			if(this.config.loadedFrames[this.frames.length-1].messages[this.frames[this.frames.length-1].messages.length-1]!=message)
				throw("ERROR IN AVMTEST.addMessage");
		}
		this.frames[this.frames.length-1].messages.push(message);
		this.checkIfFinished();
	}

	public recordEvent(){
	}

	/**
	 * called from onEnter on stage
	 */
	public nextFrame(){
		if(this.frames[this.frames.length-1].messages.length || 
			this.frames[this.frames.length-1].events.length || 
			this.frames[this.frames.length-1].snapshots.length){
			this.frames.push({
				messages:[],
				events:[],
				snapshots:[]
			});
		}
		if(this.config.mode==TEST_MODE.TESTING && this.config.loadedFrames.length<this.frames.length){
			this.finishTest();
		}
	}

	public checkIfFinished() {
		if(this.config.frames){
			if (!this.config.frames[this.frames.length - 1]) {
				this.finishTest();
				return;
			}
			let len1 = this.config.frames[this.frames.length - 1].messages.length;
			let len2 = this.frames[this.frames.length - 1].messages.length;
			if(len2>=len1){
				this.finishTest();
			}
		}
	}
	public finishTest(){
		if(this._finished)
			return;
		this._finished=true;
		const finalFrames={};
		for(let i=0; i<this.frames.length; i++){
			if(this.frames[i].messages.length || this.frames[i].events.length || this.frames[i].snapshots.length){
				finalFrames[i]=this.frames[i];
			}
		}
		var path = window.location.pathname;
		var page = path.split("/").pop().replace(".html", "");
		const data = {		
			player:"awayflplayer",
			duration: Date.now()-this.config.startRecTime,
			date : new Date().toLocaleString(),
			url:page,
			swf: this.config.swfPath,
			//settings: this.config,
			frames: finalFrames,
			seed: this.config.seed,	
		}
		const json = JSON.stringify(data);
		const formData = new FormData();
		const blob = new Blob([json], { type: "text/xml" });
		if(this.config.recordtest){
			var fileName=this.config.swfPath.replace(/\\/g, "/");
			formData.append("file", blob, fileName);
			formData.append("record", "true");
		}
		else{
			var fileName=this.config.swfPath.replace(/\\/g, "/")+"/"+this.config.testPath;
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
export interface IAVMTestConfig{
	loadedFrames:IAVMTestFrame[];
	seed:string;
	port:string;
	throwOnFail:boolean;
	mode:TEST_MODE;
	swf:string;
	swfPath:string;
	[key:string]:any;
}
export interface IAVMTestFrame{
	messages:string[];
	events:string[];
	snapshots:string[];
}