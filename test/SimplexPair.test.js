"use strict";

const assert = require('assert');
const lib = require('../index.js');
const { SimplexPair } = lib;
const stream = require('stream');

describe('SimplexPair', function(){
	it('SimplexPair#readableSide', function(){
		const pair = new SimplexPair;
		assert(pair.readableSide instanceof lib.ReadableSide);
	});
	it('SimplexPair#writableSide', function(){
		const pair = new SimplexPair;
		assert(pair.writableSide instanceof lib.WritableSide);
	});
	describePermutations('data flow tests', function(Pair){
		it('Null', function(){
		});
		it('on("readable")', function(done){
			const [ writableSide, readableSide ] = Pair();
			var data = '';
			writableSide.write('foo');
			writableSide.write('baz');
			writableSide.end();
			readableSide.on('readable', function(){
				for(var segment; segment = readableSide.read();){
					data += segment;
				}
			});
			readableSide.once('end', function(){
				assert.strictEqual(data.length, 6);
				assert.strictEqual(data, 'foobaz');
				done();
			});
		});
		it.skip('asyncIterator', async function(){
			const [ writableSide, readableSide ] = Pair();
			var data = '';
			writableSide.write('foo');
			writableSide.write('baz');
			writableSide.end();
			for await (const chunk of readableSide) {
				data += chunk;
			}
			assert(data.length===6);
			assert(data==='foobaz');
			return;
		});
	});
});

function describePermutations(title, body){
	describe(title, function(){
		describe('PassThrough -> PassThrough (Node.js native)', function(){ body.call(this, function(options){
			const pair = new stream.PassThrough(options);
			return [pair, pair];
		}); });
		describe('writableSide -> readableSide', function(){ body.call(this, function(options){
			const pair = new SimplexPair(options);
			return [pair.writableSide, pair.readableSide];
		}); });
		describe('writableSide -> duplex', function(){ body.call(this, function(options){
			const pair = new SimplexPair(options);
			return [pair.writableSide, pair];
		}); });
		describe('duplex -> readableSide', function(){ body.call(this, function(options){
			const pair = new SimplexPair(options);
			return [pair, pair.readableSide];
		}); });
		describe('duplex -> duplex', function(){ body.call(this, function(options){
			const pair = new SimplexPair(options);
			return [pair, pair];
		}); });
	});
}
