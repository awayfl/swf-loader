

export interface IExternalInterfaceService {
	enabled: boolean;
	initJS(callback: (functionName: string, args: any[]) => any);
	registerCallback(functionName: string);
	unregisterCallback(functionName: string);
	eval(expression): any;
	call(request): any;
	getId(): string;
	callback:(functionName: string, args: any[]) => any;
}

export var ExternalInterfaceService: IExternalInterfaceService = {
	enabled: true,
	callback:null,
	initJS(callback: (functionName: string, args: any[]) => any) {
		this.callback=callback;
		// ...
	},
	registerCallback(functionName: string) {
		if(!window["flash"]){
			window["flash"]={};
		}
		window["flash"][functionName]=(args)=>{
			this.callback(functionName, args);
		}
	},
	unregisterCallback(functionName: string) {
		if(!window["flash"]){
			window["flash"]={};
		}
		delete window["flash"][functionName];
	},
	eval(expression: string): any {
		return window.eval(expression);
	},
	call(request: string): any {
		// ...
	},
	getId(): string { return null; }
};
