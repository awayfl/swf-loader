import { Event } from "./Event";
import {ByteArray} from "../utils/ByteArray";


/**
 /// @eventType	flash.events.SampleDataEvent.SAMPLE_DATA
 [Event(name="sampleData", type="flash.events.SampleDataEvent")]
 * Dispatched when a Sound object requests new audio data or when a Microphone object
 * has new audio data to provide.
 *
 *   <p class="- topic/p ">This event has two uses:</p><ul class="- topic/ul "><li class="- topic/li ">To provide dynamically generated audio data for a Sound object</li><li class="- topic/li ">To get audio data for a Microphone object</li></ul><p class="- topic/p "><b class="+ topic/ph hi-d/b ">Dynamically generating audio using the Sound object</b> Use the
 * <codeph class="+ topic/ph pr-d/codeph ">sampleData</codeph> event to play dynamically generated audio. In this environment,
 * the Sound object doesn't actually contain sound data. Instead, it acts as a socket for
 * sound data that is being streamed to it through the use of the function
 * you assign as the handler for the <codeph class="+ topic/ph pr-d/codeph ">sampleData</codeph> event. </p><p class="- topic/p ">In your function, you use the <codeph class="+ topic/ph pr-d/codeph ">ByteArray.writeFloat()</codeph> method to write to
 * the event's <codeph class="+ topic/ph pr-d/codeph ">data</codeph>) property, which contains the sampled data you
 * want to play.</p><p class="- topic/p ">If a Sound object has not loaded an MP3 file, when you call its <codeph class="+ topic/ph pr-d/codeph ">play()</codeph> method
 * the object starts dispatching <codeph class="+ topic/ph pr-d/codeph ">sampleData</codeph> events, requesting sound samples.
 * The Sound object continues to send events as the sound plays back until you stop providing data,
 * or until the <codeph class="+ topic/ph pr-d/codeph ">stop()</codeph> method of the SoundChannel object is called.</p><p class="- topic/p ">Thes latency of the event varies from platform to platform, and it could change in future
 * versions of <ph class="- topic/ph ">Flash Player or </ph>AIR. Don't depend on a specific latency.
 * Instead calculate it using <codeph class="+ topic/ph pr-d/codeph ">((SampleDataEvent.position/44.1) - SoundChannelObject.position)</codeph>.</p><p class="- topic/p ">Provide between 2048 and 8192 samples to the <codeph class="+ topic/ph pr-d/codeph ">data</codeph> property of
 * the SampleDataEvent object. For best performance, provide as many samples as possible.
 * The fewer samples you provide, the more likely it is
 * that clicks and pops will occur during playback. This behavior can differ on various platforms
 * and can occur in various situations - for example, when resizing the browser.
 * You might write code that works on one platform when you provide only 2048 samples, but that same code
 * might not work as well when run on a different platform. If you require the lowest latency possible,
 * consider making the amount of data user-selectable.</p><p class="- topic/p ">If you provide fewer than 2048 samples, tha Sound object plays the remaining samples
 * and then stops the sound as if the end of a sound file was reached, generating
 * a <codeph class="+ topic/ph pr-d/codeph ">complete</codeph> event.</p><p class="- topic/p ">You can use the <codeph class="+ topic/ph pr-d/codeph ">extract()</codeph> method of a Sound object to extract its sound data,
 * which you can then write to the dynamic stream for playback.</p><p class="- topic/p ">When you use the <codeph class="+ topic/ph pr-d/codeph ">sampleData</codeph> event with a Sound object, the only Sound methods that
 * are enabled are <codeph class="+ topic/ph pr-d/codeph ">extract()</codeph> and <codeph class="+ topic/ph pr-d/codeph ">play()</codeph>. Calling any other methods or properties
 * results in an "invalid call" exception. All methods and properties of the SoundChannel object
 * are still enabled.</p><p class="- topic/p "><b class="+ topic/ph hi-d/b ">Capturing Microphone audio</b> Use the <codeph class="+ topic/ph pr-d/codeph ">sampleData</codeph> event
 * to capture audio data from a microphone. When you add an event listener for the
 * <codeph class="+ topic/ph pr-d/codeph ">sampleData</codeph> event, the Microphone dispatches the event as audio samples
 * become available.</p><p class="- topic/p ">In the event handler function, use the <codeph class="+ topic/ph pr-d/codeph ">ByteArray.readFloat()</codeph> method to read
 * the event's <codeph class="+ topic/ph pr-d/codeph ">data</codeph>) property, which contains the sampled data. The event will contain
 * multiple samples, so you should use a <codeph class="+ topic/ph pr-d/codeph ">while</codeph> loop to read the available data:</p><codeblock xml:space="preserve" class="+ topic/pre pr-d/codeblock ">var soundBytes:ByteArray = new ByteArray();
 * while(event.data.bytesAvailable)
 * {
	 * var sample:Number = event.data.readFloat();
	 * soundBytes.writeFloat(sample);
	 * }</codeblock>
 */
export class SampleDataEvent extends Event
{
	/**
	 * Defines the value of the type property of a SampleDataEvent event object.
	 * This event has the following properties:PropertyValuebubblesfalsecancelablefalse; there is no default behavior to cancel.positionThe point from which audio data is provided.
	 */
	public static SAMPLE_DATA : string = "sampleData";

	/**
	 * The data in the audio stream.
	 */
	public get data () : ByteArray{
		console.log("data not implemented yet in flash/SampleDataEvent");
		return null;

	}
	public set data (thedata:ByteArray){
		console.log("data not implemented yet in flash/SampleDataEvent");

	}

	/**
	 * The position of the data in the audio stream.
	 */
	public get position () : number{
		console.log("position not implemented yet in flash/SampleDataEvent");
		return 0;

	}
	public set position (theposition:number){
		console.log("position not implemented yet in flash/SampleDataEvent");

	}


	/**
	 * Creates an event object that contains information about audio data events.
	 * Event objects are passed as parameters to event listeners.
	 * @param	type	The type of the event. This value is:Event.SAMPLE_DATA.
	 * @param	bubbles	Determines whether the Event object participates in the bubbling stage of the event flow.
	 * @param	cancelable	Determines whether the Event object can be canceled.
	 * @param	theposition	The position of the data in the audio stream.
	 * @param	thedata	A byte array of data.
	 */
	constructor (type:string, bubbles:boolean=false, cancelable:boolean=false, theposition:number=0, thedata:ByteArray=null){
		super(type, bubbles, cancelable);
	}

	/**
	 * Creates a copy of the SampleDataEvent object and sets each property's value to match that of the original.
	 * @return	A new SampleDataEvent object with property values that match those of the original.
	 */
	public clone () : Event{
		console.log("clone not implemented yet in flash/SampleDataEvent");
		return null;

	}
	/**
	 * Returns a string that contains all the properties of the SampleDataEvent object. The string is in the following format:
	 * [SampleDataEvent type=value bubbles=value cancelable=value theposition=value thedata=value]
	 * @return	A string that contains all the properties of the SampleDataEvent object.
	 */
	public toString () : string{
		console.log("toString not implemented yet in flash/SampleDataEvent");
		return "";

	}
}

