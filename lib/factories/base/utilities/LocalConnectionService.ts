
export const enum LocalConnectionConnectResult {
	InvalidCallback = -3,
	AlreadyTaken = -2,
	InvalidName = -1,
	Success = 0
}

export const enum LocalConnectionCloseResult {
	NotConnected = -1,
	Success = 0
}

export interface ILocalConnectionReceiver {
	handleMessage(methodName: string, argsBuffer: ArrayBuffer): void;
}

export interface ILocalConnectionSender {
	dispatchEvent(event): void;
	hasEventListener(type: string): boolean;
	sec: any;
}

export interface ILocalConnectionService {
	createConnection(connectionName: string,
					 receiver: ILocalConnectionReceiver): LocalConnectionConnectResult;
	closeConnection(connectionName: string,
		receiver: ILocalConnectionReceiver): LocalConnectionCloseResult;
	send(connectionName: string, methodName: string, args: ArrayBuffer,
		 sender: ILocalConnectionSender, senderDomain: string, senderIsSecure: boolean): void;
	allowDomains(connectionName: string, receiver: ILocalConnectionReceiver, domains: string[],
				 secure: boolean);
}

export var LocalConnectionService: ILocalConnectionService;
