import { MovieClip, SceneImage2D, FrameScriptManager } from '@awayjs/scene';
import { AssetBase, WaveAudio } from '@awayjs/core';
import { BitmapImage2D } from '@awayjs/stage';
import { OrphanManager } from '../../as3webFlash/display/DisplayObject';


export class ActiveLoaderContext {
    public static loaderContext: any;
    public static waveAudioForSoundConstructor: WaveAudio;
    public static sceneImage2DForBitmapConstructor: SceneImage2D;
}

/**
 * Generic axConstruct method that lives on the AXClass prototype. This just
 * creates an empty object with the right prototype and then calls the
 * instance initializer.
 *
 * TODO: Flatten out the argArray, or create an alternate ax helper to
 * make object construction faster.
 */
export function axConstruct(argArray?: any[]) {
    var object = Object.create(this.tPrototype);
    var symbol=null;
    var timeline=null;
    var classToCheck=this;
    //  find the AwayJS-timline that should be used for this MC. might be on superclass...
    while(classToCheck && !timeline){
        symbol=classToCheck._symbol;
        if(symbol && symbol.timeline)
            timeline=symbol.timeline;
        classToCheck=classToCheck.superClass;
    }
    if (timeline) {
        var newMC = new MovieClip(timeline);
        //console.log("create mc via axConstruct");
        object.adaptee=newMC;
        newMC.timelineMC = true;
        newMC.reset();
        object.noReset=true;
		FrameScriptManager.execute_as3_constructors();
        //FrameScriptManager.execute_queue();
        //(<any>object).dispatchStaticEvent(Event.FRAME_CONSTRUCTED)
        OrphanManager.addOrphan(object);
    }
    if (this.superClass && this.superClass.classInfo && this.superClass.classInfo.instanceInfo && this.superClass.classInfo.instanceInfo.name.name == "Sound") {
        //console.log("find sound for name", this.classInfo.instanceInfo.name.name)
        if (ActiveLoaderContext.loaderContext) {

            var asset = ActiveLoaderContext.loaderContext.applicationDomain.getAwayJSAudio(this.classInfo.instanceInfo.name.name);
            if (asset && (<AssetBase>asset).isAsset(WaveAudio)) {
                //ActiveLoaderContext.waveAudioForSoundConstructor = <WaveAudio>asset;
                object.adaptee=asset;
            }
            else {
                console.log("error: could not find audio for class", this.classInfo.instanceInfo.name.name, asset)
            }
        }
        else {
            console.log("error: ActiveLoaderContext.loaderContext not set. can not rerieve Sound");
        }
    }
    else if (this.superClass && this.superClass.classInfo && this.superClass.classInfo.instanceInfo && this.superClass.classInfo.instanceInfo.name.name == "BitmapData") {
        //console.log("find sound for name", this.classInfo.instanceInfo.name.name)
        if (ActiveLoaderContext.loaderContext) {

            var asset = ActiveLoaderContext.loaderContext.applicationDomain.getDefinition(this.classInfo.instanceInfo.name.name);
            if (asset && (<AssetBase>asset).isAsset(SceneImage2D) || (<AssetBase>asset).isAsset(BitmapImage2D)) {
                //ActiveLoaderContext.sceneImage2DForBitmapConstructor = <SceneImage2D>asset;
                object.adaptee=asset;
            }
            else {
                console.log("error: could not find audio for class", this.classInfo.instanceInfo.name.name, asset)
            }
        }
        else {
            console.log("error: ActiveLoaderContext.loaderContext not set. can not rerieve Sound");
        }
    }
    object.noReset=true;
   
    if((<any>object).getQueuedEvents){
        var events=(<any>object).getQueuedEvents();
        object.axInitializer.apply(object, argArray);
        if(events){
            for(var i=0; i<events.length; i++){
                (<any>object).dispatchEvent(events[i]);
            }
        }
    }
    else{            
        object.axInitializer.apply(object, argArray);
    }
    return object;
}
