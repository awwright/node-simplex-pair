"use strict";

const assert = require('assert');

// Construct a stream that's both Readable and Writable from two streams, one of each

class Duplex {
	constructor(writableSide, readableSide) {
		this.writableSide = writableSide;
		this.readableSide = readableSide;
	}

	// Writable Events
	// Event: 'close'
	// Event: 'drain'
	// Event: 'error'
	// Event: 'finish'
	// Event: 'pipe'
	// Event: 'unpipe'

	// Readable events
	// Event: 'close'
	// Event: 'data'
	// Event: 'end'
	// Event: 'error'
	// Event: 'pause'
	// Event: 'readable'
	// Event: 'resume'
	// [Symbol.asyncIterator]

	on(event, listener) {
		switch (event) {
			case 'close':
			case 'drain':
			case 'finish':
			case 'pipe':
			case 'unpipe':
				return this.writableSide.on(event, listener);
			case 'error':
			case 'data':
			case 'end':
			case 'pause':
			case 'readable':
			case 'resume':
				return this.readableSide.on(event, listener);
		}
	}

	off(event, listener) {
		switch (event) {
			case 'close':
			case 'drain':
			case 'finish':
			case 'pipe':
			case 'unpipe':
				return this.writableSide.off(event, listener);
			case 'error':
			case 'data':
			case 'end':
			case 'pause':
			case 'readable':
			case 'resume':
				return this.readableSide.off(event, listener);
		}
	}

	once(event, listener) {
		switch (event) {
			case 'close':
			case 'drain':
			case 'finish':
			case 'pipe':
			case 'unpipe':
				return this.writableSide.once(event, listener);
			case 'error':
			case 'data':
			case 'end':
			case 'pause':
			case 'readable':
			case 'resume':
				return this.readableSide.once(event, listener);
		}
	}

	addListener(event, listener) {
		switch (event) {
			case 'close':
			case 'drain':
			case 'finish':
			case 'pipe':
			case 'unpipe':
				return this.writableSide.addListener(event, listener);
			case 'error':
			case 'data':
			case 'end':
			case 'pause':
			case 'readable':
			case 'resume':
				return this.readableSide.addListener(event, listener);
		}
	}
	
	removeListener(event, listener) {
		switch (event) {
			case 'close':
			case 'drain':
			case 'finish':
			case 'pipe':
			case 'unpipe':
				return this.writableSide.removeListener(event, listener);
			case 'error':
			case 'data':
			case 'end':
			case 'pause':
			case 'readable':
			case 'resume':
				return this.readableSide.removeListener(event, listener);
		}
	}
	
	emit(event, listener) {
		switch (event) {
			case 'close':
			case 'drain':
			case 'finish':
			case 'pipe':
			case 'unpipe':
				return this.writableSide.emit(event, listener);
			case 'error':
			case 'data':
			case 'end':
			case 'pause':
			case 'readable':
			case 'resume':
				return this.readableSide.emit(event, listener);
		}
	}
		
	listenerCount(event) {
		switch (event) {
			case 'close':
			case 'drain':
			case 'finish':
			case 'pipe':
			case 'unpipe':
				return this.writableSide.listenerCount(event);
			case 'error':
			case 'data':
			case 'end':
			case 'pause':
			case 'readable':
			case 'resume':
				return this.readableSide.listenerCount(event);
		}
		return 0;
	}

	// Both APIs
	// writable.destroy([error])
	// readable.destroy([error])
	destroy(...args) {
		this.writableSide.destroy();
		this.readableSide.destroy(...args);
		return this;
	}
	// writable.destroyed
	// readable.destroyed
	get destroyed() {
		return this.writableSide.destroyed && this.readableSide.destroyed;
	}
	set destroyed(val) {
		this.writableSide.destroyed = val;
		this.readableSide.destroyed = val;
	}

	// Writable API
	// writable.cork()
	cork(...args) {
		return this.writableSide.cork(...args);
	}
	// writable.end([chunk[, encoding]][, callback])
	end(...args) {
		this.writableSide.end(...args);
		return this;
	}
	// writable.setDefaultEncoding(encoding)
	setDefaultEncoding(...args) {
		this.writableSide.setDefaultEncoding(...args);
		return this;
	}
	// writable.uncork()
	uncork(...args) {
		return this.writableSide.uncork(...args);
	}
	// writable.writable
	get writable() {
		return this.writableSide.writable;
	}
	// writable.writableEnded
	get writableEnded() {
		return this.writableSide.writableEnded;
	}
	// writable.writableCorked
	get writableCorked() {
		return this.writableSide.writableCorked;
	}
	// writable.writableFinished
	get writableFinished() {
		return this.writableSide.writableFinished;
	}
	// writable.writableHighWaterMark
	get writableHighWaterMark() {
		return this.writableSide.writableHighWaterMark;
	}
	// writable.writableLength
	get writableLength() {
		return this.writableSide.writableLength;
	}
	// writable.writableObjectMode
	get writableObjectMode() {
		return this.writableSide.writableObjectMode;
	}
	// writable.write(chunk[, encoding][, callback])
	write(...args) {
		return this.writableSide.write(...args);
	}

	// Readable API

	// readable.isPaused()
	isPaused(...args) {
		return this.readableSide.isPaused(...args);
	}
	// readable.pause()
	pause(...args) {
		this.readableSide.pause(...args);
		return this;
	}
	// readable.pipe(destination[, options])
	pipe(...args) {
		return this.readableSide.pipe(...args);
	}
	// readable.read([size])
	read(...args) {
		return this.readableSide.read(...args);
	}
	// readable.readable
	get readable() {
		return this.readableSide.readable;
	}
	set readable(val) {
		this.readableSide.readable = val;
	}
	// readable.readableEncoding
	get readableEncoding() {
		return this.readableSide.readableEncoding;
	}
	// readable.readableEnded
	get readableEnded() {
		return this.readableSide.readableEnded;
	}
	// readable.readableFlowing
	get readableFlowing() {
		return this.readableSide.readableFlowing;
	}
	// readable.readableHighWaterMark
	get readableHighWaterMark() {
		return this.readableSide.readableHighWaterMark;
	}
	// readable.readableLength
	get readableLength() {
		return this.readableSide.readableLength;
	}
	// readable.readableObjectMode
	get readableObjectMode() {
		return this.readableSide.readableObjectMode;
	}
	// readable.resume()
	resume(...args) {
		this.readableSide.resume(...args);
		return this;
	}
	// readable.setEncoding(encoding)
	setEncoding(...args) {
		this.readableSide.setEncoding(...args);
		return this;
	}
	// readable.unpipe([destination])
	unpipe(...args) {
		this.readableSide.unpipe(...args);
		return this;
	}
	// readable.unshift(chunk[, encoding])
	unshift(...args) {
		return this.readableSide.unshift(...args);
	}
	// readable.wrap(stream)
	wrap(...args) {
		this.readableSide.wrap(...args);
		return this;
	}

	// readable[Symbol.asyncIterator]()
	[Symbol.asyncIterator](...args) {
		return this.readableSide[Symbol.asyncIterator](...args);
	}

	// Hidden Readable API
	get allowHalfOpen() {
		return this.readableSide.allowHalfOpen;
	}
	set allowHalfOpen(val) {
		this.readableSide.allowHalfOpen = val;
	}
	get _readableState() {
		return this.readableSide._readableState;
	}
	get _writableState() {
		return this.writableSide._writableState;
	}

	// Readable implementor API
	push(...args) {
		return this.readableSide.push(...args);
	}
}

module.exports.Duplex = Duplex;
