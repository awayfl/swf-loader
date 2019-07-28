import { release } from "../../base/utilities/Debug";

/**
 * Returns |true| if the symbol is available in debug or release modes. Only symbols
 * followed by the  "!" suffix are available in release builds.
 */
export function containsSymbol(symbols: string [], name: string) {
    for (var i = 0; i < symbols.length; i++) {
      var symbol = symbols[i];
      if (symbol.indexOf(name) >= 0) {
        var releaseSymbol = symbol[symbol.length - 1] === "!";
        if (releaseSymbol) {
          symbol = symbol.slice(0, symbol.length - 1);
        }
        if (name !== symbol) {
          continue;
        }
        if (release) {
          return releaseSymbol;
        }
        return true;
      }
    }
    return false;
  }