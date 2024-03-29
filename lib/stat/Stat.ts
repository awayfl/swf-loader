
const enum RECORD_STATE {
	NONE, BEGIN, END, DROP
}
export class Record {
	private _records: {[key: string]: Record} = {};
	private _startTime: number = 0;
	private _endTime: number = 0;
	private _subs: Record[] = [];
	private _state: RECORD_STATE = RECORD_STATE.NONE;

	constructor(public name: string, private _subrecord = false) {}

	public rec(name: string, subrecrod = false): Record {
		if (this._subrecord) {
			throw 'Suprecord can\'t support nested records!';
		}
		let sub = this._subs[this._subs.length - 1];
		if (!(sub && sub._state === RECORD_STATE.BEGIN)) {
			sub = this;
		}

		return sub._records[name] || (sub._records[name] = new Record(name, subrecrod));
	}

	public begin() {
		if (this._state !== RECORD_STATE.NONE) {
			return;
		}

		if (!this._subrecord) {

			if (this._subs[this._subs.length - 1]) {
				this._subs[this._subs.length - 1].end();
			}

			const sub = this.rec(this.name + '_' + this._subs.length, true);
			this._subs.push(sub);

			return sub.begin();
		}

		this._state = RECORD_STATE.BEGIN;
		return this._startTime = performance.now();
	}

	public end() {

		for (const key in this._records) {
			this._records[key].end();
		}

		if (this._state !== RECORD_STATE.BEGIN) {
			return;
		}

		if (!this._subrecord) {
			return this._subs[this._subs.length - 1].end();
		}

		this._state = RECORD_STATE.END;
		this._endTime = performance.now();

		return this._endTime - this._startTime;
	}

	public drop() {
		this.end();

		if (!this._subrecord) {
			return this._subs[this._subs.length - 1].drop();
		}

		this._state = RECORD_STATE.DROP;
		this._startTime = this._endTime = 0;
	}

	get startTime(): number {
		if (this._state == RECORD_STATE.DROP) {
			return 0;
		}

		let startTime = this._startTime || Number.MAX_VALUE;

		for (const key in this._records) {
			const r = this._records[key];
			startTime = Math.min(startTime, r.startTime);
		}

		return startTime;
	}

	get endTime(): number {
		if (this._state == RECORD_STATE.DROP) {
			return 0;
		}

		let endTime = this._endTime || -Number.MAX_VALUE;

		for (const key in this._records) {
			const r = this._records[key];
			endTime = Math.max(endTime, r.endTime);
		}

		return endTime;
	}

	get duration(): number {
		if (this._state == RECORD_STATE.DROP) {
			return 0;
		}

		const len = Object.keys(this._records).length;

		if (!len) {
			return this._endTime - this._startTime;
		}

		let duration = 0;

		for (const key in this._records) {
			duration += this._records[key].duration;
		}

		return duration;
	}

	get selfDuration() {
		const len = Object.keys(this._records).length;

		if (!len) {
			return this._endTime - this._startTime;
		}

		return this.endTime - this.startTime;
	}

	get density() {
		if (this._state == RECORD_STATE.DROP) {
			return 0;
		}

		return this.duration / this.selfDuration;
	}

	toString() {
		const selfDuration = this.selfDuration;
		return `Name: ${this.name}, duration: ${this.duration.toFixed(2)}ms, self: ${selfDuration.toFixed(2)}ms, density:${(this.density * 100).toFixed(0)}%`;
	}

	toTable(ident: number = 0, filter: (r: Record) => boolean) {
		let r = '  '.repeat(ident) + this.toString() + '\n';

		if (this._subs.length === 1 && Object.keys(this._records).length === 1) {
			return r;
		}

		for (const key in this._records) {
			const rec = this._records[key];

			if (rec._state === RECORD_STATE.DROP) {
				continue;
			}

			if (filter && filter(rec)) {
				continue;
			}

			r += rec.toTable(ident + 1, filter);
		}

		return r;
	}
}

export class Stat extends Record {
	private static _instance: Stat;
	constructor() {
		super('ROOT');
		//@ts-ignore
		window.AWAY_ROOT_STAT = this;
	}

	static rec(name: string) {
		if (!this._instance) {
			this._instance = new Stat();
		}

		return this._instance.rec(name);
	}
}