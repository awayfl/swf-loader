import {assert, release} from "./Debug";

/**
 * An extremely naive cache with a maximum size.
 * TODO: LRU
 */
export class Cache {
	private _data;
	private _size: number;
	private _maxSize: number;
	constructor(maxSize: number) {
		this._data = Object.create(null);
		this._size = 0;
		this._maxSize = maxSize;
	}
	get(key) {
		return this._data[key];
	}
	set(key, value) {
		release || assert(!(key in this._data)); // Cannot mutate cache entries.
		if (this._size >= this._maxSize) {
			return false;
		}
		this._data[key] = value;
		this._size ++;
		return true;
	}
}