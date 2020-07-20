"use strict";

const { BufferQueue } = require('./BufferQueue.js');
const { Duplex } = require('./Duplex.js');
const { WritableSide, ReadableSide } = require('./Simplex.js');

class DuplexPair extends Array {
	constructor(options) {
		super();
		const buf0 = new BufferQueue;
		const buf1 = new BufferQueue;
		// The ReadableSide reads out of the opposite side's buffer
		const w0 = new WritableSide(options, buf0);
		const r0 = new ReadableSide(options, buf1);
		this[0] = new Duplex(w0, r0);
		const w1 = new WritableSide(options, buf1);
		const r1 = new ReadableSide(options, buf0);
		this[1] = new Duplex(w1, r1);
	}
}

module.exports.DuplexPair = DuplexPair;
