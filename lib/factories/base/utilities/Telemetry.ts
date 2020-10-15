
export const enum Feature {
	EXTERNAL_INTERFACE_FEATURE = 1,
	CLIPBOARD_FEATURE = 2,
	SHAREDOBJECT_FEATURE = 3,
	VIDEO_FEATURE = 4,
	SOUND_FEATURE = 5,
	NETCONNECTION_FEATURE = 6
}

export const enum ErrorTypes {
	AVM1_ERROR = 1,
	AVM2_ERROR = 2
}

export const enum LoadResource {
	LoadSource = 0,
	LoadWhitelistAllowed = 1,
	LoadWhitelistDenied = 2,
	StreamAllowed = 3,
	StreamDenied = 4,
	StreamCrossdomain = 5
}

export interface ITelemetryService {
	reportTelemetry(data: any);
}

export var instance: ITelemetryService;

export const Telemetry = {
	instance:instance
};
