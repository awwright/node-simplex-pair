"use strict";

const { Duplex } = require('./Duplex.js');
const { ReadableSide, WritableSide, SimplexPair } = require('./Simplex.js');

// Transform is just a special case of DuplexPair where one of the sides is the intance,
// and the other side is a private property held by that instance.

class Transform extends Duplex {
	#input = null;
	#output = null;
	#duplex = null;
	#init = 0;

	constructor(options) {
		super();
		const input = new SimplexPair;
		const output = new SimplexPair;
		this.writableSide = input.writableSide;
		this.#input = input.readableSide;
		this.#output = output.writableSide;
		this.readableSide = output.readableSide;
		if(typeof options === 'function'){
			this.#init++;
			options.call(this, this.#input, this.#output);
		}
	}

	get clientReadableSide() {
		return this.readableSide;
	}

	get serverWritableSide() {
		return this.writableSide;
	}

	ReadableSide = ReadableSide;
	WritableSide = WritableSide;

	makePair() {
		if(this.#init++) throw new Error('Already initialized innerSide');
		return [ this.#input, this.#output ];
	}
	makeDuplex() {
		if(this.#duplex) throw new Error('Already initialized duplex inner side');
		this.#duplex = new Duplex(this.#output, this.#input);
		return this.#duplex;
	}

	// Readable implementor API
	push(...args) {
		return this.readableSide.push(...args);
	}
}

module.exports.Transform = Transform;
