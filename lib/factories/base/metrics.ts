/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { getTicks, IndentingWriter, MapObject } from './utilities';
import { createMap } from './utilities/ObjectUtilities';

export class Timer {
	private static _base: Timer = new Timer(null, 'Total');
	private static _top = Timer._base;
	private static _flat = new Timer(null, 'Flat');
	private static _flatStack = [];
	private _parent: Timer;
	private _name: string;
	private _begin: number;
	private _last: number;
	private _total: number;
	private _count: number;
	private _timers: MapObject<Timer>;
	constructor(parent: Timer, name: string) {
		this._parent = parent;
		this._timers = createMap<Timer>();
		this._name = name;
		this._begin = 0;
		this._last = 0;
		this._total = 0;
		this._count = 0;
	}

	public static time(name, fn: Function) {
		Timer.start(name);
		fn();
		Timer.stop();
	}

	public static start(name) {
		Timer._top = Timer._top._timers[name] || (Timer._top._timers[name] = new Timer(Timer._top, name));
		Timer._top.start();
		const tmp = Timer._flat._timers[name] || (Timer._flat._timers[name] = new Timer(Timer._flat, name));
		tmp.start();
		Timer._flatStack.push(tmp);
	}

	public static stop() {
		Timer._top.stop();
		Timer._top = Timer._top._parent;
		Timer._flatStack.pop().stop();
	}

	public static stopStart(name) {
		Timer.stop();
		Timer.start(name);
	}

	public start() {
		this._begin = getTicks();
	}

	public stop() {
		this._last = getTicks() - this._begin;
		this._total += this._last;
		this._count += 1;
	}

	public toJSON() {
		return { name: this._name, total: this._total, timers: this._timers };
	}

	public trace(writer: IndentingWriter) {
		writer.enter (
			this._name + ': ' + this._total.toFixed(2) + ' ms' +
			', count: ' + this._count +
			', average: ' + (this._total / this._count).toFixed(2) + ' ms'
		);
		for (const name in this._timers) {
			this._timers[name].trace(writer);
		}
		writer.outdent();
	}

	public static trace(writer: IndentingWriter) {
		Timer._base.trace(writer);
		Timer._flat.trace(writer);
	}
}

/**
 * Quick way to count named events.
 */
export class Counter {
	public static instance: Counter = new Counter(true);

	private _enabled: boolean;
	private _counts: MapObject<number>;
	private _times: MapObject<number>;
	get counts(): MapObject<number> {
		return this._counts;
	}

	constructor(enabled: boolean) {
		this._enabled = enabled;
		this.clear();
	}

	public setEnabled(enabled: boolean) {
		this._enabled = enabled;
	}

	public clear() {
		this._counts = createMap<number>();
		this._times = createMap<number>();
	}

	public toJSON() {
		return {
			counts: this._counts,
			times: this._times
		};
	}

	public count(name: string, increment: number = 1, time: number = 0) {
		if (!this._enabled) {
			return;
		}
		if (this._counts[name] === undefined) {
			this._counts[name] = 0;
			this._times[name] = 0;
		}
		this._counts[name] += increment;
		this._times[name] += time;
		return this._counts[name];
	}

	public trace(writer: IndentingWriter) {
		for (const name in this._counts) {
			writer.writeLn(name + ': ' + this._counts[name]);
		}
	}

	private _pairToString(times, pair): string {
		const name = pair[0];
		const count = pair[1];
		const time = times[name];
		let line = name + ': ' + count;
		if (time) {
			line += ', ' + time.toFixed(4);
			if (count > 1) {
				line += ' (' + (time / count).toFixed(4) + ')';
			}
		}
		return line;
	}

	public toStringSorted(): string {
		const self = this;
		const times = this._times;
		const pairs = [];
		for (const name in this._counts) {
			pairs.push([name, this._counts[name]]);
		}
		pairs.sort(function (a, b) {
			return b[1] - a[1];
		});
		return (pairs.map(function (pair) {
			return self._pairToString(times, pair);
		}).join(', '));
	}

	public traceSorted(writer: IndentingWriter, inline = false) {
		const self = this;
		const times = this._times;
		const pairs = [];
		for (const name in this._counts) {
			pairs.push([name, this._counts[name]]);
		}
		pairs.sort(function (a, b) {
			return b[1] - a[1];
		});
		if (inline) {
			writer.writeLn(pairs.map(function (pair) {
				return self._pairToString(times, pair);
			}).join(', '));
		} else {
			pairs.forEach(function (pair) {
				writer.writeLn(self._pairToString(times, pair));
			});
		}
	}
}

export class Average {
	private _samples: Float64Array;
	private _count: number;
	private _index: number;
	constructor(max) {
		this._samples = new Float64Array(max);
		this._count = 0;
		this._index = 0;
	}

	public push(sample: number) {
		if (this._count < this._samples.length) {
			this._count++;
		}
		this._index++;
		this._samples[this._index % this._samples.length] = sample;
	}

	public average(): number {
		let sum = 0;
		for (let i = 0; i < this._count; i++) {
			sum += this._samples[i];
		}
		return sum / this._count;
	}
}
