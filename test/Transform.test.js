"use strict";

const assert = require('assert');
const stream = require('stream');
const { Transform } = require('..');
const { callbackify } = require('util');

describe('Transform', function(){
	describe('interface', function(){
		describe.skip('function with async iterator', body(function factory(){
			return new Transform(async function(input, output){
				for await(var segment of input){
					output.write(segment.toString().toUpperCase());
				}
				output.end();
			});
		}));
		describe('function with readable/end', body(function factory(){
			return new Transform(async function(input, output){
				input.on('readable', function(){
					for(var segment; (segment = input.read()) !== null;){
						output.write(segment.toString().toUpperCase());
					}
				});
				input.on('end', function(){
					output.end();
				});
			});
		}));
		describe.skip('makeDuplex', body(function factory(){
			return new Transform(async function(){
				const inner = this.makeDuplex();
				for await(var segment of inner){
					inner.write(segment.toString().toUpperCase());
				}
				inner.end();
			});
		}));
		describe.skip('class extends', body(function factory(){
			class ToUpperCase extends Transform {
				super() {
					const inner = this.initInnerSide();
					inner.once('readable', async function(){
						for await(var chunk of input){
							inner.write(chunk.toString().toUpperCase());
						}
						inner.end();
					});
				}
			}
			return new ToUpperCase;
		}));
		describe('Node.js native', body(function factory(){
			return new stream.Transform({
				transform: function(chunk, encoding, callback){
					this.push(chunk.toString().toUpperCase());
					callback();
				},
			});
		}));
	});
	function body(factory){
		return function(){
			before(function(){
				// Make sure the factory works before testing it
				factory();
			});
			it('write readable end', function(done){
				const t = factory();
				t.write('foo');
				t.end('\r\n');
				var data = '';
				t.on('readable', function(){
					for(var segment; (segment = t.read()) !== null;){
						data += segment;
					}
				});
				t.on('end', function(){
					assert.strictEqual(data, 'FOO\r\n');
					done();
				});
			});
			it('destroy', function(done){
				const t = factory();
				t.destroy(new Error('Boom'));
				var data = '';
				t.on('error', function(err){
					assert(err instanceof Error);
					assert.strictEqual(err.message, 'Boom');
					done();
				});
				t.on('end', function(){
					assert.fail();
				});
			});
		};
	}
});
