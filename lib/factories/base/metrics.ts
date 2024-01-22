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

import { getTicks, IndentingWriter } from './utilities';

export class Timer {
	private static _base: Timer = new Timer(null, 'Total');
	private static _top: Timer = Timer._base;
	private static _flat: Timer = new Timer(null, 'Flat');
	private static _flatStack: Timer[] = [];

	private _begin: number = 0;
	private _last: number = 0;
	private _total: number = 0;
	private _count: number = 0;
	private _timers: Record<string, Timer> = {};

	constructor(
		private _parent: Timer | null,
		private _name: string
	) {}

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
		const parent = Timer._top._parent;

		if (parent) {
			Timer._top = parent;
			Timer._flatStack.pop()?.stop();
		}
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

	private _counts: Record<string, number> = {};
	private _times: Record<string, number> = {};

	public get counts(): Record<string, number> {
		return this._counts;
	}

	constructor(
		private _enabled: boolean
	) {}

	public setEnabled(enabled: boolean) {
		this._enabled = enabled;
	}

	public clear() {
		this._counts = {};
		this._times = {};
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

	private _pairToString(times: Record<string, number>, pair: [string, number]): string {
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
		const times = this._times;
		const pairs: [string, number][] = [];
		for (const name in this._counts) {
			pairs.push([name, this._counts[name]]);
		}
		pairs.sort(function (a, b) {
			return b[1] - a[1];
		});
		return (pairs.map(pair => this._pairToString(times, pair)).join(', '));
	}

	public traceSorted(writer: IndentingWriter, inline = false) {
		const times = this._times;
		const pairs: [string, number][] = [];
		for (const name in this._counts) {
			pairs.push([name, this._counts[name]]);
		}
		pairs.sort((a, b) => b[1] - a[1]);
		if (inline) {
			writer.writeLn(pairs.map(pair => this._pairToString(times, pair)).join(', '));
		} else {
			pairs.forEach(pair => writer.writeLn(this._pairToString(times, pair)));
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
