import { FrameScriptManager, MovieClip } from '@awayjs/scene';
import { AssetLibrary, AssetBase, WaveAudio } from '@awayjs/core';
import { Sound } from '../../as3webFlash/media/Sound';

export class ActiveLoaderContext {
    public static loaderContext: any;
    public static soundForConstructor: WaveAudio;
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
    // find the timline that shoiuld be used for this MC. might be on superclass...
    while(classToCheck && !timeline){
        symbol=classToCheck._symbol;
        if(symbol && symbol.timeline)
            timeline=symbol.timeline;
        classToCheck=classToCheck.superClass;
    }
    if (timeline) {
        var newMC = new MovieClip(timeline);
        //console.log("create mc via axConstruct");
        newMC.timelineMC = true;
        object.noReset=true;
        
        MovieClip.mcForConstructor = newMC;
    }
    if (this.superClass && this.superClass.classInfo && this.superClass.classInfo.instanceInfo && this.superClass.classInfo.instanceInfo.name.name == "Sound") {
        //console.log("find sound for name", this.classInfo.instanceInfo.name.name)
        if (ActiveLoaderContext.loaderContext) {

            var asset = ActiveLoaderContext.loaderContext.applicationDomain.getAwayJSAudio(this.classInfo.instanceInfo.name.name);
            if (asset && (<AssetBase>asset).isAsset(WaveAudio)) {
                ActiveLoaderContext.soundForConstructor = <WaveAudio>asset;
            }
            else {
                console.log("error: could not find audio for class", this.classInfo.instanceInfo.name.name, asset)
            }
        }
        else {
            console.log("error: ActiveLoaderContext.loaderContext not set. can not rerieve Sound");
        }
    }
    //FrameScriptManager.execute_queue();
    object.axInitializer.apply(object, argArray);
    return object;
}
