"use strict";

const { Stream } = require('stream');

class Sink extends Stream {
	static interface = Symbol('SinkInterface');
	constructor() {
		super();
	}
	write() {
		throw new Error('Implement');
	}
	end() {
		throw new Error('Implement');
	}
	// Disable the Stream#pipe ancestor for writable-only stream
	pipe = null;
}
module.exports.Sink = Sink;

class Source extends Stream {
	static interface = Symbol('SourceInterface');
	constructor() {
		super();
	}
	read() {
		throw new Error('Implement');
	}
}
module.exports.Source = Source;
