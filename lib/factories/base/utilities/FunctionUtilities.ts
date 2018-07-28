
export function makeForwardingGetter(target: string): () => any {
	return <() => any> new Function("return this[\"" + target + "\"]//# sourceURL=fwd-get-" +
		target + ".as");
}

export function makeForwardingSetter(target: string): (any) => void {
	return <(any) => void> new Function("value", "this[\"" + target + "\"] = value;" +
		"//# sourceURL=fwd-set-" + target + ".as");
}

export let FunctionUtilities={
	makeForwardingGetter:makeForwardingGetter,
	makeForwardingSetter:makeForwardingSetter
};
