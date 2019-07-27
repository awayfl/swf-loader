

export interface IExternalInterfaceService {
	enabled: boolean;
	initJS(callback: (functionName: string, args: any[]) => any);
	registerCallback(functionName: string);
	unregisterCallback(functionName: string);
	eval(expression): any;
	call(request): any;
	getId(): string;
}

export var ExternalInterfaceService: IExternalInterfaceService = {
	enabled: false,
	initJS(callback: (functionName: string, args: any[]) => any) {
		// ...
	},
	registerCallback(functionName: string) {
		// ...
	},
	unregisterCallback(functionName: string) {
		// ...
	},
	eval(expression: string): any {
		// ...
	},
	call(request: string): any {
		// ...
	},
	getId(): string { return null; }
};
