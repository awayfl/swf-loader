export class Mouse{
	private static _cursor:string;
	/*
	 The name of the native cursor.
	 */
	public static get cursor():string
	{
		return Mouse._cursor;
	}
	public static set cursor(value:string)
	{
		Mouse._cursor=value;
	}

	/*
	 [read-only] Indicates whether the computer or device displays a persistent cursor.
	 */
	public static  get supportsCursor():boolean
	{
		return true;
	}
	/*
	 [read-only] Indicates whether the current configuration supports native cursors.
	 */
	public static  get 	supportsNativeCursor():boolean
	{
		return true;
	}

	/*
	 Hides the pointer.
	 */
	public static hide()
	{
	}
	/*
	 Displays the pointer.
	 */
	public static show()
	{
	}
	/*
	 Registers a native cursor under the given name, with the given data.
	 */
	public static registerCursor(name:string, cursor:any)//todo MouseCursorData
	{
	}
	/*
	 Unregisters a native cursor under the given name, with the given data.
	 */
	public static unregisterCursor(name:string)
	{
	}
}