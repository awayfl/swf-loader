import { FrameScriptManager, MovieClip } from '@awayjs/scene';

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
    if(this._symbol && this._symbol.timeline){
      var newMC=new MovieClip(this._symbol.timeline);
      newMC.timelineMC=true;
      //newMC.reset();
      MovieClip.mcForConstructor=newMC;
    }
    //FrameScriptManager.execute_queue();
    object.axInitializer.apply(object, argArray);
    return object;
  }
  