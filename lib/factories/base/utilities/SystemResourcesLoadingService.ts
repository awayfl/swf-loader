

export const enum SystemResourceId {
	BuiltinAbc = 0,
	PlayerglobalAbcs = 1,
	PlayerglobalManifest = 2,
	ShellAbc = 3
}

export interface ISystemResourcesLoadingService {
	load(id: SystemResourceId): Promise<any>;
}

export var instance: ISystemResourcesLoadingService;


export let SystemResourcesLoadingService={
	//SystemResourceId:SystemResourceId,
	//ISystemResourcesLoadingService:ISystemResourcesLoadingService
};