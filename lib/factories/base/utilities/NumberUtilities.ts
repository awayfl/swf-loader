
export function pow2(exponent: number): number {
	if (exponent === (exponent | 0)) {
		if (exponent < 0) {
			return 1 / (1 << -exponent);
		}
		return 1 << exponent;
	}
	return Math.pow(2, exponent);
}

export function clamp(value: number, min: number, max: number) {
	return Math.max(min, Math.min(max, value));
}

/**
 * Rounds *.5 to the nearest even number.
 * See https://en.wikipedia.org/wiki/Rounding#Round_half_to_even for details.
 */
export function roundHalfEven(value: number): number {
	if (Math.abs(value % 1) === 0.5) {
		var floor = Math.floor(value);
		return floor % 2 === 0 ? floor : Math.ceil(value);
	}
	return Math.round(value);
}

/**
 * Rounds *.5 up on even occurrences, down on odd occurrences.
 * See https://en.wikipedia.org/wiki/Rounding#Alternating_tie-breaking for details.
 */
export function altTieBreakRound(value: number, even: boolean): number {
	if (Math.abs(value % 1) === 0.5 && !even) {
		return value | 0;
	}
	return Math.round(value);
}

export function epsilonEquals(value: number, other: number): boolean {
	return Math.abs(value - other) < 0.0000001;
}

export let NumberUtilities={
	pow2:pow2,
	clamp:clamp,
	roundHalfEven:roundHalfEven,
	altTieBreakRound:altTieBreakRound,
	epsilonEquals:epsilonEquals
};

