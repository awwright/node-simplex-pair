"use strict";

const { Source, Sink } = require('./interfaces.js');
const { BufferQueue } = require('./BufferQueue.js');
const { Duplex } = require('./Duplex.js');

class ReadableSide extends Source {
	#buffer = null;
	constructor(options, buffer) {
		super(options);
		this.#buffer = buffer;
		buffer.onReadable = (() => { process.nextTick(this.emit.bind(this, 'readable')); });
		buffer.onEnd = (() => { process.nextTick(this.emit.bind(this, 'end')); });
	}
	read(n) {
		return this.#buffer.shift() || null;
	}
	destroy(err) {
		this.destroyed = true;
		if(err){
			process.nextTick(this.emit.bind(this, 'error', err));
		}
	}
	[Symbol.asyncIterator]() {
		return new ReadableAsyncIterator(this);
	}
}

class ReadableAsyncIterator {
	stream = null;
	constructor(stream){
		this.stream = stream;
	}
	next() {
		const stream = this.stream;
		return new Promise((resolve, reject) => {
			stream.once('readable', resolve);
			stream.once('error', reject);
		});
	}
}

class WritableSide extends Sink {
	#buffer = null;
	constructor(options, buffer) {
		super(options);
		this.#buffer = buffer;
	}
	write(chunk, encoding, callback) {
		const buffer = this.#buffer;
		const empty = !buffer.length;
		buffer.push(chunk);
		if(empty) buffer.onReadable();
		return (buffer.length < 1024);
	}
	end(chunk, encoding, callback) {
		if(chunk) this.write(chunk, encoding);
		this.#buffer.onEnd();
		process.nextTick(this.emit.bind(this, 'finish'));
	}
	destroy(err) {
		this.destroyed = true;
	}
}


class SimplexPair extends Duplex {
	constructor(options) {
		const buffer = new BufferQueue;
		const w = new WritableSide(options, buffer);
		const r = new ReadableSide(options, buffer);
		super(w, r);
	}
}

class Writable extends WritableSide {
	#readableSide = null;
	#init = 0;
	constructor(options) {
		super();
		const buffer = new BufferQueue;
		this.#readableSide = new this.ReadableSide(options, buffer);
		this._readableSide = this.#readableSide;
	}

	ReadableSide = ReadableSide;

	makeReadableSide() {
		if(this.#init++) throw new Error('Already initialized readableSide');
		return this.#readableSide;
	}
}

class Readable extends ReadableSide {
	#writableSide = null;
	#init = 0;

	constructor(options) {
		super();
		const buffer = new BufferQueue;
		this.#writableSide = new this.WritableSide(options, buffer);
	}

	WritableSide = WritableSide;

	makeWritableSide() {
		if(this.#init++) throw new Error('Already initialized writableSide');
		return this.#writableSide;
	}

	// Readable implementor API
	push(...args) {
		return this.push(...args);
	}
}

module.exports.SimplexPair = SimplexPair;
module.exports.WritableSide = WritableSide;
module.exports.ReadableSide = ReadableSide;
module.exports.Writable = Writable;
module.exports.Readable = Readable;
