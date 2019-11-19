//
// C:\Users\80prozent\AppData\Local\FlashDevelop\Apps\flexairsdk\4.6.0+25.0.0\frameworks\libs\player\18.0\playerglobal.swc\flash\media\Sound
//

import {EventDispatcher} from "../events/EventDispatcher";
import {URLRequest} from "../net/URLRequest";
import { SoundLoaderContext } from "./SoundLoaderContext";
import { SoundChannel } from "./SoundChannel";
import { SoundTransform } from "./SoundTransform";
import {ByteArray} from "../utils/ByteArray";
import { ID3Info } from "./ID3Info";
import { WaveAudio } from "@awayjs/core";
import { ActiveLoaderContext } from '../../avm2/run/axConstruct';

/**
 * Dispatched when data is received as a load operation progresses.
 * @eventType	flash.events.ProgressEvent.PROGRESS
 [Event(name="progress", type="flash.events.Progress [EventEvent")]
 
 * Dispatched when a load operation starts.
 * @eventType	flash.events.Event.OPEN
 [Event(name="open", type="flash.events. [EventEvent")]
 
 * Dispatched when an input/output error occurs that causes a load operation to fail.
 * @eventType	flash.events.IOErrorEvent.IO_ERROR
 [Event(name="ioError", type="flash.events.IOError [EventEvent")]
 
 * Dispatched by a Sound object when ID3 data is available for an MP3 sound.
 * @eventType	flash.events.Event.ID3
 [Event(name="id3", type="flash.events. [EventEvent")]
 
 * Dispatched when data has loaded successfully.
 * @eventType	flash.events.Event.COMPLETE
 [Event(name="complete", type="flash.events. [EventEvent")]
 
 * Dispatched when the runtime requests new audio data.
 * @eventType	flash.events.SampleDataEvent.SAMPLE_DATA
 [Event(name="sampleData", type="flash.events.SampleData [EventEvent")]
 
 * The Sound class lets you work with sound in an application. The Sound class
 * lets you create a Sound object, load and play an external MP3 file into that object,
 * close the sound stream, and access
 * data about the sound, such as information about the number of bytes in the stream and
 * ID3 metadata. More detailed control of the sound is performed through the sound source —
 * the SoundChannel or Microphone object for the sound — and through the properties
 * in the SoundTransform class that control the output of the sound to the computer's speakers.
 *
 *   <p class="- topic/p ">In Flash Player 10 and later and AIR 1.5 and later, you can also use this
 * class to work with sound that is generated dynamically.
 * In this case, the Sound object uses the function you assign to a <codeph class="+ topic/ph pr-d/codeph ">sampleData</codeph> event handler to
 * poll for sound data. The sound is played as it is retrieved from a ByteArray object that
 * you populate with sound data. You can use <codeph class="+ topic/ph pr-d/codeph ">Sound.extract()</codeph> to extract sound data from a
 * Sound object,
 * after which you can manipulate it before writing it back to the stream for playback.</p><p class="- topic/p ">To control sounds that are embedded in a SWF file, use the properties in the SoundMixer class.</p><p class="- topic/p "><b class="+ topic/ph hi-d/b ">Note</b>: The ActionScript 3.0 Sound API differs from ActionScript 2.0.
 * In ActionScript 3.0, you cannot take sound objects and arrange them in a hierarchy
 * to control their properties.</p><p class="- topic/p ">When you use this class, consider the following security model: </p><ul class="- topic/ul "><li class="- topic/li ">Loading and playing a sound is not allowed if the calling file is in a network sandbox
 * and the sound file to be loaded is local.</li><li class="- topic/li ">By default, loading and playing a sound is not allowed if the calling file is local and
 * tries to load and play a remote sound. A user must grant explicit permission to allow this type of access.</li><li class="- topic/li ">Certain operations dealing with sound are restricted. The data in a loaded sound cannot
 * be accessed by a file in a different domain unless you implement a cross-domain policy file.
 * Sound-related APIs that fall under this restriction are <codeph class="+ topic/ph pr-d/codeph ">Sound.id3</codeph>,
 * <codeph class="+ topic/ph pr-d/codeph ">SoundMixer.computeSpectrum()</codeph>, <codeph class="+ topic/ph pr-d/codeph ">SoundMixer.bufferTime</codeph>,
 * and the <codeph class="+ topic/ph pr-d/codeph ">SoundTransform</codeph> class.</li></ul><p class="- topic/p ">However, in Adobe AIR, content in the <codeph class="+ topic/ph pr-d/codeph ">application</codeph> security sandbox (content
 * installed with the AIR application) are not restricted by these security limitations.</p><p class="- topic/p ">For more information related to security, see the Flash Player Developer Center Topic:
 * <xref href="http://www.adobe.com/go/devnet_security_en" scope="external" class="- topic/xref ">Security</xref>.</p>
 */
export class Sound extends EventDispatcher
{
	private _adaptee:WaveAudio;
	/**
	 * Creates a new Sound object. If you pass a valid URLRequest object to the
	 * Sound constructor, the constructor automatically calls the load() function
	 * for the Sound object.
	 * If you do not pass a valid URLRequest object to the Sound constructor,
	 * you must call the load() function for the Sound object yourself,
	 * or the stream will not load.
	 *
	 *   Once load() is called on a Sound object, you can't later load
	 * a different sound file into that Sound object. To load a different sound file,
	 * create a new Sound object.
	 *
	 *   In Flash Player 10 and later and AIR 1.5 and later, instead of using load(),
	 * you can use the sampleData event handler to load sound dynamically into the Sound object.
	 * @param	stream	The URL that points to an external MP3 file.
	 * @param	context	An optional SoundLoader context object, which can define the buffer time
	 *   (the minimum number of milliseconds of MP3 data to hold in the Sound object's
	 *   buffer) and can specify whether the application should check for a cross-domain
	 *   policy file prior to loading the sound.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 * @refpath
	 */
	constructor (stream:URLRequest=null, context:SoundLoaderContext=null){
		super();
		if(ActiveLoaderContext.waveAudioForSoundConstructor){
			this._adaptee=ActiveLoaderContext.waveAudioForSoundConstructor;
			ActiveLoaderContext.waveAudioForSoundConstructor=null;
		}
		//console.log("sound is not implemented yet in flash/Sound");
	}

	public get adaptee():WaveAudio {
		return (<WaveAudio>this._adaptee);
	}
	public set adaptee(adaptee:WaveAudio) {
		this._adaptee=adaptee;
	}

	/**
	 * Returns the currently available number of bytes in this sound object. This property is
	 * usually useful only for externally loaded files.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 * @refpath
	 */
	public get bytesLoaded () : number{
		console.log("bytesLoaded not implemented yet in flash/Sound");
		return 0;
	}

	/**
	 * Returns the total number of bytes in this sound object.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 * @refpath
	 */
	public get bytesTotal () : number{
		console.log("bytesTotal not implemented yet in flash/Sound");
		return 0;
	}

	/**
	 * Provides access to the metadata that is part of an MP3 file.
	 *
	 *   MP3 sound files can contain ID3 tags, which provide metadata about the
	 * file. If an MP3 sound that you load using the Sound.load()
	 * method contains ID3 tags, you can query these properties. Only ID3 tags
	 * that use the UTF-8 character set are supported.Flash Player 9 and later and AIR support
	 * ID3 2.0 tags,
	 * specifically 2.3 and 2.4. The following tables list the standard ID3 2.0 tags
	 * and the type of content the tags represent. The Sound.id3 property provides
	 * access to these tags through the format
	 * my_sound.id3.COMM, my_sound.id3.TIME, and so on. The first
	 * table describes tags that can be accessed either through the ID3 2.0 property name or
	 * the ActionScript property name. The second table describes ID3 tags that are supported but do not have
	 * predefined properties in ActionScript. ID3 2.0 tagCorresponding Sound class propertyCOMMSound.id3.commentTALBSound.id3.album TCONSound.id3.genreTIT2Sound.id3.songName TPE1Sound.id3.artistTRCKSound.id3.track TYERSound.id3.year The following table describes ID3 tags that are supported but do not have
	 * predefined properties in the Sound class. You access them by calling
	 * mySound.id3.TFLT, mySound.id3.TIME, and so on. NOTE: None of
	 * these tags are supported in Flash Lite 4.PropertyDescriptionTFLTFile typeTIMETimeTIT1Content group descriptionTIT2Title/song name/content descriptionTIT3Subtitle/description refinementTKEYInitial keyTLANLanguagesTLENLengthTMEDMedia typeTOALOriginal album/movie/show titleTOFNOriginal filenameTOLYOriginal lyricists/text writersTOPEOriginal artists/performersTORYOriginal release yearTOWNFile owner/licenseeTPE1Lead performers/soloistsTPE2Band/orchestra/accompanimentTPE3Conductor/performer refinementTPE4Interpreted, remixed, or otherwise modified byTPOSPart of a setTPUBPublisherTRCKTrack number/position in setTRDARecording datesTRSNInternet radio station nameTRSOInternet radio station ownerTSIZSizeTSRCISRC (international standard recording code)TSSESoftware/hardware and settings used for encodingTYERYearWXXXURL link frameWhen using this property, consider the Flash Player security model:The id3 property of a Sound object is always permitted for SWF files
	 * that are in the same security sandbox as the sound file. For files in other sandboxes, there
	 * are security checks.When you load the sound, using the load() method of the Sound class, you can
	 * specify a context parameter, which is a SoundLoaderContext object. If you set the
	 * checkPolicyFile  property of the SoundLoaderContext object to true, Flash Player
	 * checks for a URL policy file on the server from which the sound is loaded. If a
	 * policy file exists and permits access from the domain of the loading SWF file, then the file is allowed
	 * to access the id3 property of the Sound object; otherwise it is not.However, in Adobe AIR, content in the application security sandbox (content
	 * installed with the AIR application) are not restricted by these security limitations.For more information related to security, see the Flash Player Developer Center Topic:
	 * Security.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 */
	public get id3 () : ID3Info{
		console.log("id3 not implemented yet in flash/Sound");
		return null;
	}

	/**
	 * Returns the buffering state of external MP3 files. If the value is true,
	 * any playback is
	 * currently suspended while the object waits for more data.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 * @refpath
	 */
	public get isBuffering () : boolean{
		console.log("isBuffering not implemented yet in flash/Sound");
		return false;
	}

	/**
	 * Indicates if the Sound.url property has been
	 * truncated. When the isURLInaccessible value is true the
	 * Sound.url value is only the domain of the final URL from which the sound loaded.
	 * For example, the property is truncated if the sound is loaded from http://www.adobe.com/assets/hello.mp3,
	 * and the Sound.url property has the value http://www.adobe.com.
	 * The isURLInaccessible value is true only when all of the following are also true:
	 *
	 *   An HTTP redirect occurred while loading the sound file.The SWF file calling Sound.load() is from a different domain than
	 * the sound file's final URL.The SWF file calling Sound.load() does not have permission to access
	 * the sound file.  Permission is granted to access the sound file the same way permission is granted
	 * for the Sound.id3 property: establish a policy file and use the SoundLoaderContext.checkPolicyFile
	 * property.Note: The isURLInaccessible property was added for Flash Player 10.1 and AIR 2.0.
	 * However, this property is made available to SWF files of all versions when the
	 * Flash runtime supports it. So, using some authoring tools in "strict mode" causes a compilation error. To work around the error
	 * use the indirect syntax mySound["isURLInaccessible"], or disable strict mode. If you are using Flash Professional CS5
	 * or Flex SDK 4.1, you can use and compile this API for runtimes released before Flash Player 10.1 and AIR 2.For application content in AIR, the value of this property is always false.
	 * @langversion	3.0
	 * @playerversion	Flash 10.1
	 * @playerversion	AIR 2
	 */
	public get isURLInaccessible () : boolean{
		console.log("isURLInaccessible not implemented yet in flash/Sound");
		return false;
	}

	/**
	 * The length of the current sound in milliseconds.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 */
	public get length () : number{
		console.log("length not implemented yet in flash/Sound");
		return 0;
	}

	/**
	 * The URL from which this sound was loaded. This property is applicable only to Sound
	 * objects that were loaded using the Sound.load() method. For
	 * Sound objects that are associated with a sound asset from a SWF file's library, the
	 * value of the url property is null.
	 *
	 *   When you first call Sound.load(), the url property
	 * initially has a value of null, because the final URL is not yet known.
	 * The url property will have a non-null value as soon as an
	 * open event is dispatched from the Sound object.The url property contains the final, absolute URL from which a sound was
	 * loaded. The value of url is usually the same as the value passed to the
	 * stream parameter of Sound.load().
	 * However, if you passed a relative URL to Sound.load()
	 * the value of the url property represents the absolute URL.
	 * Additionally, if the original URL request is redirected by an HTTP server, the value
	 * of the url property reflects the final URL from which the sound file was actually
	 * downloaded.  This reporting of an absolute, final URL is equivalent to the behavior of
	 * LoaderInfo.url.In some cases, the value of the url property is truncated; see the
	 * isURLInaccessible property for details.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 */
	public get url () : string{
		console.log("url not implemented yet in flash/Sound");
		return "";
	}

	/**
	 * Closes the stream, causing any download of data to cease.
	 * No data may be read from the stream after the close()
	 * method is called.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 * @refpath
	 * @throws	IOError The stream could not be closed, or
	 *   the stream was not open.
	 */
	public close (){
		console.log("close not implemented yet in flash/Sound");
	}

	/**
	 * Extracts raw sound data from a Sound object.
	 *
	 *   This method is designed to be used when you are working
	 * with dynamically generated audio, using a function you assign
	 * to the sampleData event for a different Sound object.
	 * That is, you can use this method to extract sound data from a Sound object.
	 * Then you can write the data to the byte array that another Sound object is using
	 * to stream dynamic audio.The audio data is placed in the target byte array starting from the current position of the byte array.
	 * The audio data is always exposed as 44100 Hz Stereo. The sample type is a 32-bit floating-point value,
	 * which can be converted to a Number using ByteArray.readFloat().
	 * @param	target	A ByteArray object in which the extracted sound samples are placed.
	 * @param	length	The number of sound samples to extract.
	 *   A sample contains both the left and right channels — that is, two 32-bit floating-point values.
	 * @param	startPosition	The sample at which extraction begins.
	 *   If you don't specify a value, the first call to Sound.extract() starts at the beginning
	 *   of the sound; subsequent calls without a value for startPosition
	 *   progress sequentially through the file.
	 * @return	The number of samples written to the ByteArray specified in the target parameter.
	 * @langversion	3.0
	 * @playerversion	Flash 10
	 * @playerversion	AIR 1.5
	 * @refpath
	 */
	public extract (target:ByteArray, length:number, startPosition:number=-1) : number{
		console.log("extract not implemented yet in flash/Sound");
		return 0;
	}

	/**
	 * Initiates loading of an external MP3 file from the specified URL. If you provide
	 * a valid URLRequest object to the Sound constructor, the constructor calls
	 * Sound.load() for you. You only need to call Sound.load()
	 * yourself if you
	 * don't pass a valid URLRequest object to the Sound constructor or you pass a null
	 * value.
	 *
	 *   Once load() is called on a Sound object, you can't later load
	 * a different sound file into that Sound object. To load a different sound file,
	 * create a new Sound object.When using this method, consider the following security model:Calling Sound.load() is not allowed if the calling file is in the
	 * local-with-file-system sandbox and the sound is in a network sandbox.Access from the local-trusted or local-with-networking sandbox requires permission
	 * from a website through a URL policy file.You cannot connect to commonly reserved ports.
	 * For a complete list of blocked ports, see "Restricting Networking APIs" in the
	 * ActionScript 3.0 Developer's Guide.You can prevent a SWF file from using this method by setting the
	 * allowNetworking parameter of the object and embed
	 * tags in the HTML page that contains the SWF content. In Flash Player 10 and later, if you use a multipart Content-Type (for example "multipart/form-data")
	 * that contains an upload (indicated by a "filename" parameter in a "content-disposition" header within the POST body),
	 * the POST operation is subject to the security rules applied to uploads:The POST operation must be performed in response to a user-initiated action, such as a mouse click or key press.If the POST operation is cross-domain (the POST target is not on the same server as the SWF file
	 * that is sending the POST request),
	 * the target server must provide a URL policy file that permits cross-domain access.Also, for any multipart Content-Type, the syntax must be valid (according to the RFC2046 standards).
	 * If the syntax appears to be invalid, the POST operation is subject to the security rules applied to uploads.In Adobe AIR, content in the application security sandbox (content
	 * installed with the AIR application) are not restricted by these security limitations.For more information related to security, see the Flash Player Developer Center Topic:
	 * Security.
	 * @param	stream	A URL that points to an external MP3 file.
	 * @param	context	An optional SoundLoader context object, which can define the buffer time
	 *   (the minimum number of milliseconds of MP3 data to hold in the Sound object's
	 *   buffer) and can specify whether the application should check for a cross-domain
	 *   policy file prior to loading the sound.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 * @refpath
	 * @throws	IOError A network error caused the load to fail.
	 * @throws	SecurityError Local untrusted files may not communicate with
	 *   the Internet. You can work around this by reclassifying this file
	 *   as local-with-networking or trusted.
	 * @throws	SecurityError You cannot connect to commonly reserved ports.
	 *   For a complete list of blocked ports, see "Restricting Networking APIs" in the
	 *   ActionScript 3.0 Developer's Guide.
	 * @throws	IOError The digest property of the stream object is not
	 *   null. You should only set the digest property of a URLRequest object
	 *   when calling the URLLoader.load() method when loading a SWZ file (an Adobe
	 *   platform component).
	 */
	public load (stream:URLRequest, context:SoundLoaderContext=null) {
		console.log("load not implemented yet in flash/Sound");
	}

	public loadCompressedDataFromByteArray (bytes:ByteArray, bytesLength:number) {
		console.log("loadCompressedDataFromByteArray not implemented yet in flash/Sound");
	}

	public loadPCMFromByteArray (bytes:ByteArray, samples:number, format:string="float", stereo:boolean=true, sampleRate:number=44100){
		console.log("loadPCMFromByteArray not implemented yet in flash/Sound");
	}

	private _onCompleteCallback:Function;
	private loopsToPlay:number=0;
	private soundCompleteInternal(){
		this.loopsToPlay--;
		if(this.loopsToPlay>0){
			this.stop();
			this.adaptee.play(0, false);
		}
		else{
			if(this._onCompleteCallback){
				this._onCompleteCallback();
			}
		}
	}
	/**
	 * Generates a new SoundChannel object to play back the sound. This method
	 * returns a SoundChannel object, which you access to stop the sound and to monitor volume.
	 * (To control the volume, panning, and balance, access the SoundTransform object assigned
	 * to the sound channel.)
	 * @param	startTime	The initial position in milliseconds at which playback should
	 *   start.
	 * @param	loops	Defines the number of times a sound loops back to the startTime value
	 *   before the sound channel stops playback.
	 * @param	sndTransform	The initial SoundTransform object assigned to the sound channel.
	 * @return	A SoundChannel object, which you use to control the sound.
	 *   This method returns null if you have no sound card
	 *   or if you run out of available sound channels. The maximum number of
	 *   sound channels available at once is 32.
	 * @langversion	3.0
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 * @refpath
	 */
	public play (startTime:number=0, loops:number=0, sndTransform:SoundTransform=null) : any{
		if(!this.adaptee){
			console.log("Sound.play : no adaptee exists!");
			return;
		}
		if(loops>1){
			//console.log("TODO: as3web/flash: loop property")
		}
		if(sndTransform){
			this.adaptee.volume=sndTransform.volume;
			this.adaptee.pan=sndTransform.pan;
		}
		
		loops = isNaN(loops) || loops < 1 ? 1 : Math.floor(loops);
		this.loopsToPlay=loops;
		this._adaptee.onSoundComplete=()=>this.soundCompleteInternal();
		this._adaptee.play(startTime, false);
		var newSoundChannel:SoundChannel= new this.sec.flash.media.SoundChannel();
		newSoundChannel._sound=this;
		if(!sndTransform){
			sndTransform=new this.sec.flash.media.SoundTransform();
		}
		newSoundChannel.soundTransform=sndTransform;
		//console.log("play not implemented yet in flash/Sound");

		// todo: should return a flash soundchannel
		return newSoundChannel;
	}
	public stop () : void{
		this._adaptee.stop();
	}

}

