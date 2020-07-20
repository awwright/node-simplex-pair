"use strict";

const assert = require('assert');
const lib = require('../index.js');

describe('export', function(){
	it('Source', function(){
		assert(lib.Source);
	});
	it('Sink', function(){
		assert(lib.Sink);
	});
	it('ReadableSide', function(){
		assert(lib.ReadableSide);
	});
	it('WritableSide', function(){
		assert(lib.WritableSide);
	});
	it('SimplexPair', function(){
		assert(lib.SimplexPair);
	});
	it('DuplexPair', function(){
		assert(lib.DuplexPair);
	});
	it('Readable', function(){
		assert(lib.Readable);
	});
	it('Writable', function(){
		assert(lib.Writable);
	});
	it('Transform', function(){
		assert(lib.Transform);
	});
});
