/**
 * The ID3Info class contains properties that reflect ID3 metadata. You can get additional
 * metadata for MP3 files by accessing the <codeph class="+ topic/ph pr-d/codeph ">id3</codeph>
 * property of the Sound class; for example, <codeph class="+ topic/ph pr-d/codeph ">mySound.id3.TIME</codeph>.
 * For more information, see the entry for <codeph class="+ topic/ph pr-d/codeph ">Sound.id3</codeph> and
 * the ID3 tag definitions at <xref href="http://www.id3.org" class="- topic/xref ">http://www.id3.org</xref>.
 */
export class ID3Info
{
	constructor (){

	}
	/**
	 * The name of the album; corresponds to the ID3 2.0 tag TALB.
	 * @langversion	AS3
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 */
	public album : string;

	/**
	 * The name of the artist; corresponds to the ID3 2.0 tag TPE1.
	 * @langversion	AS3
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 */
	public artist : string;

	/**
	 * A comment about the recording; corresponds to the ID3 2.0 tag COMM.
	 * @langversion	AS3
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 */
	public comment : string;

	/**
	 * The genre of the song; corresponds to the ID3 2.0 tag TCON.
	 * @langversion	AS3
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 */
	public genre : string;

	/**
	 * The name of the song; corresponds to the ID3 2.0 tag TIT2.
	 * @langversion	AS3
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 */
	public songName : string;

	/**
	 * The track number; corresponds to the ID3 2.0 tag TRCK.
	 * @langversion	AS3
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 */
	public track : string;

	/**
	 * The year of the recording; corresponds to the ID3 2.0 tag TYER.
	 * @langversion	AS3
	 * @playerversion	Flash 9
	 * @playerversion	Lite 4
	 */
	public year : string;

}

