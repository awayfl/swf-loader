
/**
 * AS3 has a bug when converting a certain character range to lower case.
 */
export function as3ToLowerCase(value: string) {
    var chars: string [] = null;
    for (var i = 0; i < value.length; i++) {
      var charCode = value.charCodeAt(i);
      if (charCode >= 0x10A0 && charCode <= 0x10C5) {
        if (!chars) {
          chars = new Array(value.length);
        }
        chars[i] = String.fromCharCode(charCode + 48);
      }
    }
    if (chars) {
      // Fill in remaining chars if the bug needs to be emulated.
      for (var i = 0; i < chars.length; i++) {
        var char = chars[i];
        if (!char) {
          chars[i] = value.charAt(i).toLocaleString();
        }
      }
      return chars.join("");
    }
    return value.toLowerCase();
  }
  