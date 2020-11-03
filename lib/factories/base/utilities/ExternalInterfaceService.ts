const __flash__toXML = function __flash__toXML(obj) {
	let xml;
	switch (typeof obj) {
		case 'boolean':
			return obj ? '<true/>' : '<false/>';
		case 'number':
			return '<number>' + obj + '</number>';
		case 'object':
			if (obj === null) {
				return '<null/>';
			}
			if ('hasOwnProperty' in obj && obj.hasOwnProperty('length')) {
				// array
				xml = '<array>';
				for (let i = 0; i < obj.length; i++) {
					xml += '<property id="' + i + '">' + __flash__toXML(obj[i]) + '</property>';
				}
				return xml + '</array>';
			}
			xml = '<object>';
			for (const key in obj) {
				xml += '<property id="' + key + '">' + __flash__toXML(obj[key]) + '</property>';
			}
			return xml + '</object>';
		case 'string':
			return '<string>'
					+ obj.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
					+ '</string>';
		case 'undefined':
			return '<undefined/>';
	}
};
export class ExternalInterfaceService {

	public static enabled: boolean = true;
	private static _interfaceID: string = 'flash';
	public static callback: (functionName: string, args: any[]) => any;

	public static get interfaceID(): string {
		return ExternalInterfaceService._interfaceID;
	}

	public static set interfaceID(value: string) {
		ExternalInterfaceService._interfaceID = value;
	}

	public static ensureInit() {
		if (!window[ExternalInterfaceService._interfaceID])
			window[ExternalInterfaceService._interfaceID] = {};
		window[ExternalInterfaceService._interfaceID]['__flash__toXML'] = __flash__toXML;
	}

	public static initJS(callback: (functionName: string, args: any[]) => any) {
		ExternalInterfaceService.callback = callback;
	}

	public static registerCallback(functionName: string) {
		ExternalInterfaceService.ensureInit();
		window[ExternalInterfaceService._interfaceID][functionName] = (...args)=>{
			return ExternalInterfaceService.callback(functionName, args);
		};
	}

	public static unregisterCallback(functionName: string) {
		ExternalInterfaceService.ensureInit();
		delete window[ExternalInterfaceService._interfaceID][functionName];
	}

	public static eval(expression: string): any {
		return window.eval(expression);
	}

	public static call(request: string): any {
		// ...
	}

	public static getId(): string { return null; }

}
