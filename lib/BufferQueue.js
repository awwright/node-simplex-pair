"use strict";

const { Stream } = require('stream');
const BufferList = new Stream.Readable()._readableState.buffer.constructor;

class BufferQueue extends BufferList {
	#readableSide = null;
	#writableSide = null;
	constructor() {
		super();
	}
	set _readableSide(v) {
		if(this.#readableSide) throw new Error('Already set _readableSide');
		this.#readableSide = v;
	}
	set _writableSide(v) {
		if(this.#writableSide) throw new Error('Already set _writableSide');
		this.#writableSide = v;
	}
}

module.exports.BufferQueue = BufferQueue;

