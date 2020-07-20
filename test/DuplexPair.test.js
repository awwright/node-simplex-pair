"use strict";

const assert = require('assert');
const lib = require('../index.js');
const { DuplexPair } = lib;
const stream = require('stream');
const common = require('./common');

describe('DuplexPair', function(){
	it('DuplexPair', function(){
		const pair = new DuplexPair;
		assert(pair[0] instanceof lib.Duplex);
		assert(pair[1] instanceof lib.Duplex);
	});
	describePermutations('data flow tests', function(Pair){
		before(function(){
			// Make sure the factory works before testing it
			Pair();
		});
		it('on("readable")', function(done){
			const [ clientSide, serverSide ] = Pair();
			var data = '';
			clientSide.write('foo');
			clientSide.write('baz');
			clientSide.end();
			serverSide.on('readable', function(){
				for(var segment; segment = serverSide.read();)
					data += segment;
			});
			serverSide.once('end', function(){
				assert(data.length===6);
				assert(data==='foobaz');
				done();
			});
		});
		it.skip('asyncIterator', async function(){
			const [ clientSide, serverSide ] = Pair();
			var data = '';
			clientSide.write('foo');
			clientSide.write('baz');
			clientSide.end();
			for await (const chunk of serverSide) {
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
		describe('D0.writableSide -> D1.readableSide', function(){ body.call(this, function(options){
			const pair = new DuplexPair(options);
			return [pair[0].writableSide, pair[1].readableSide];
		}); });
		describe('D0.writableSide -> D1.duplex', function(){ body.call(this, function(options){
			const pair = new DuplexPair(options);
			return [pair[0].writableSide, pair[1]];
		}); });
		describe('D0.duplex -> D1.readableSide', function(){ body.call(this, function(options){
			const pair = new DuplexPair(options);
			return [pair[0], pair[1].readableSide];
		}); });
		describe('D0.duplex -> D1.duplex', function(){ body.call(this, function(options){
			const pair = new DuplexPair(options);
			return [pair[0], pair[1]];
		}); });
		describe('D1.writableSide -> D0.readableSide', function(){ body.call(this, function(options){
			const pair = new DuplexPair(options);
			return [pair[1].writableSide, pair[0].readableSide];
		}); });
		describe('D1.writableSide -> D0.duplex', function(){ body.call(this, function(options){
			const pair = new DuplexPair(options);
			return [pair[1].writableSide, pair[0]];
		}); });
		describe('D1.duplex -> D0.readableSide', function(){ body.call(this, function(options){
			const pair = new DuplexPair(options);
			return [pair[1], pair[0].readableSide];
		}); });
		describe('D1.duplex -> D0.duplex', function(){ body.call(this, function(options){
			const pair = new DuplexPair(options);
			return [pair[1], pair[0]];
		}); });
		// describe('DuplexPair[0] -> DuplexPair[1]', function(){ body.call(this, function(options){
		// 	const pair = new stream.DuplexPair(options);
		// 	return [pair[0], pair[1]];
		// }); });
		// describe('DuplexPair[1] -> DuplexPair[0]', function(){ body.call(this, function(options){
		// 	const pair = new stream.DuplexPair(options);
		// 	return [pair[1], pair[0]];
		// }); });
	});
}
