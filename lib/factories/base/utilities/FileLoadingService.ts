
export interface FileLoadingRequest {
	url: string;
	data: any;
}

export interface FileLoadingProgress {
	bytesLoaded: number;
	bytesTotal: number;
}

export interface FileLoadingSession {
	onopen?: () => void;
	onclose?: () => void;
	onprogress?: (data: any, progressStatus: FileLoadingProgress) => void;
	onhttpstatus?: (location: string, httpStatus: number, httpHeaders: any) => void;
	onerror?: (e) => void;
	open(request: FileLoadingRequest);
	close: () => void;
}

export interface IFileLoadingService {
	createSession(): FileLoadingSession;
	resolveUrl(url: string): string;
	navigateTo(url: string, target: string);
}

export var FileLoadingService: IFileLoadingService;
