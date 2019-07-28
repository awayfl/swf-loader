import { ABCFile } from "./ABCFile";

export class MetadataInfo {
    constructor(
      public abc: ABCFile,
      public name: String | number,
      public keys: Uint32Array,
      public values: Uint32Array
    ) {
      // ...
    }
  
    getName(): string {
      if (typeof this.name === "number") {
        this.name = this.abc.getString(<number>this.name);
      }
      return <string>this.name;
    }
  
    getKeyAt(i: number): string {
      return this.abc.getString(this.keys[i]);
    }
  
    getValueAt(i: number): string {
      return this.abc.getString(this.values[i]);
    }
  
    getValue(key: string): string {
      for (var i = 0; i < this.keys.length; i++) {
        if (this.abc.getString(this.keys[i]) === key) {
          return this.abc.getString(this.values[i]);
        }
      }
      return null;
    }
  }