

// Used in _hashNamespace so we don't need to allocate a new buffer each time.
export var namespaceHashingBuffer = new Uint8Array(100);