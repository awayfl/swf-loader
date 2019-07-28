import { NamespaceType, getNamespaceTypeName } from './NamespaceType';
import { assert } from '@awayjs/graphics';
import { release } from '../../../base/utilities/Debug';
import { StringUtilities } from '../../../base/utilities/StringUtilities';
import { HashUtilities } from '../../../base/utilities/HashUtilities';
import { namespaceHashingBuffer } from './namespaceHashingBuffer';

export class Namespace {
    public mangledName: string = null;
    constructor(public type: NamespaceType, public uri: string, public prefix: string) {
      assert (type !== undefined);
      this.mangleName();
      if (!release) {
        Object.freeze(this);
      }
    }
  
    toString() {
      return getNamespaceTypeName(this.type) + (this.uri !== "" ? ":" + this.uri : "");
    }
  
    private static _knownNames = [
      ""
    ];
  
    private static _hashNamespace(type: NamespaceType, uri: string, prefix: string) {
      uri = uri + '';
      prefix = prefix + '';
      var index = Namespace._knownNames.indexOf(uri);
      if (index >= 0) {
        return type << 2 | index;
      }
      var length = 1 + uri.length + prefix.length;
      var data:Uint8Array = length < 101 ? namespaceHashingBuffer : new Uint8Array(length);
      var j = 0;
      data[j++] = type;
      for (var i = 0; i < uri.length; i++) {
        data[j++] = uri.charCodeAt(i);
      }
      for (var i = 0; i < prefix.length; i++) {
        data[j++] = prefix.charCodeAt(i);
      }
      return HashUtilities.hashBytesTo32BitsMD5(data, 0, j);
    }
  
    private mangleName() {
      if (this.type === NamespaceType.Public && this.uri === '') {
        this.mangledName = 'Bg';
        return;
      }
      var nsHash = Namespace._hashNamespace(this.type, this.uri, this.prefix);
      this.mangledName = StringUtilities.variableLengthEncodeInt32(nsHash);
    }
  
    public isPublic(): boolean {
      return this.type === NamespaceType.Public;
    }
  
    public get reflectedURI() {
      // For public names without a URI, Tamarin uses `null`, we use `""`.
      // Hence: special-casing for reflection.
      return this.uri || (this.type === NamespaceType.Public ? null : this.uri);
    }
  
    public static PUBLIC: Namespace;
  }