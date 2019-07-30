export class Endian{

	/**
	 * Indicates the most significant byte of the multibyte number appears first in the sequence of bytes.
	 * The hexadecimal number 0x12345678 has 4 bytes (2 hexadecimal digits per byte).
	 */
	public static BIG_ENDIAN : string = "bigEndian";

	/**
	 * Indicates the least significant byte of the multibyte number appears first in the sequence of bytes.
	 * The hexadecimal number 0x12345678 has 4 bytes (2 hexadecimal digits per byte).
	 */
	public static LITTLE_ENDIAN:string = "littleEndian";


}