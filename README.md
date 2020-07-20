# Node.js Simplex Pair Proposal

This is a proposal for improving the modularity and simplicity of streams. It intends to be not-incompatible with previous stream interfaces.

There are multiple goals, many of which may be implemented independent of the others:

* Publish `SimplexPair` and `DuplexPair` utilities, which allow streams to be created with a symmetric API
* reduce the number of locations where data is buffered, for performance and to avoid "bufferbloat" situations
* create a symmetrical interface for producing or consuming streaming data (e.g. use `write` calls instead of `push`)
* standardizing the order of events, to make evaluation order more predictable
* to expose some events as promises, to provide better guarentees about runtime order

## Interface Source

```
interface Source {
	Event: "readable"
	Event: "end"
	Event: "error"
	boolean readable;
	function read([n]);
	function close();
	function pipe(dst);
	Promise final;
	static function [Symbol.hasInstance]();
	function [Symbol.asyncIterator]();
}
```

This is the basic interface by which data on a stream is consumed.

The data that is read typically comes from one of two sources:

* The data is generated as it is read, as fast as the application can read it.
* The data is read from a buffer, which is filled from a separate Sink interface (see `SimplexPair` below).

Several different mechanisms may be used to work with the available data:

* `Source#on("readable")` and `Source#read()`
* `Source#pipe(dst)`
* `for await (const segment of source){ ... }` via the async iterator,
* `Source#on("data")` or `Source#resume()`, if the Flowing API is implemented


### Source#on("readable")

The "readable" event signals that there is data on the stream, which may be read using `Source#read`


### Source#pipe(dst)

Any data that becomes available is immediately written to the Sink `dst`.


### Source#readable

True if `Source#read` will return data if called. This is set to `true` when "readable" is emitted, and `false` if `Source#read()` returns `null`.


### Source#read([n])

Returns up to _n_ units of data from the stream. If there is no additional data to be read, this will return `null`, and no more data will be available until the next "readable" event.


### Source#close()

Indicates the application does not intend to consume any more data; this signals the Sink side to stop writing.


### Source#on("error")

The "error" event signals an error


### Source#on("end")

The "end" event signals an EOF event, that no more data will be available.


### Source#final

A Promise that resolves when the stream will have no more data available (an EOF), or rejects when no more data will be available due to an error event.

Reading this property will add an "error" listener, or otherwise turn off fatal errors when no listeners are attached to "error".


### `Source[Symbol.hasInstance] ()`

Returns `true` for `Source` or `Duplex`, to implement `new Duplex instanceof Source`.

### `Source#[Symbol.asyncIterator]()`

Implements the async iterator pattern, that allows for the following:

```javascript
async function print(readable) {
  readable.setEncoding('utf8');
  let data = '';
  for await (const chunk of readable) {
    data += chunk;
  }
  console.log(data);
}
```


### Flowing API

`Source#pause`, `Source#resume`, `Source#isPaused`, and `Source#on("data")` may also be implemented for backwards compatibility with Streams 1. In this case, the stream starts "paused".


## Interface Sink

```
interface Sink {
	Event: "drain"
	Event: "close"
	function write(segment)
	function end(segment)
	function cork()
	function uncork()
	static function [Symbol.hasInstance]();
}
```

This is the primary interface by which data is written to a stream. The data is typically stored in a buffer to be available for reading via a Source interface, or delivered to the operating system kernel.


### Sink#write(segment)

This call writes data to the stream.

If this function returns `false`, it indicates the stream has become congested and the application should stop writing to it. If the writes are processed from an upstream source, the application should stop reading from that source too. This is the primary mechanism used to control how fast data is sent through the stream.


### Sink#end([segment])

This call writes the given segment to the stream, if provided; then closes the stream.


### Sink#on("drain")

This event indicates that all the buffered data has been read, and the application should resume writing, if it has paused.


### Sink#on("close")

Indicates that the Source side has stopped reading the stream, and will not read any more data. Any further data written will create an error.


### Sink#cork([fn])

Data written to the Sink will be buffered, and not become readable until `Sink#uncork()` is called.

This feature is typically used for optimizations, so that Sink#write may be called in succession with lots of small pieces of data, without being sent as separate packets over the network.

If `fn` is provided, it will be called in-line, and the stream automatically uncork when the function returns, or if it returns a Promise, when the promise resolves.


### `Sink[Symbol.hasInstance]()`

Returns `true` for `Sink` or `Duplex`, to implement `new Duplex instanceof Sink`.


## Interface Duplex

A Duplex is a stream that is both readable and writable: You can write data to it, and/or read data from it.

```
interface Duplex implements Source, Sink {
	Source readableSide;
	Sink writableSide;
}
```

It has two properties `readableSide` and `writableSide` which exposes only that "half" of the Duplex stream.

Two properties `readableSide` and `writableSide` are exposed, which allows you to pass only a Source or Sink stream to another part of the application. This feature allows you to create encapsulated streams, so that a pointer to a readable stream does not grant write access; and vice-versa.

There are primarily two types of Duplex streams: a PassThrough/SimplexPair, and each side of a DuplexPair.

ECMAScript does not have a concept of multiple inheritance, so the prototypes are copied in, and `instanceof` support is implemented via `Sink[Symbol.hasInstance]` and `Source[Symbol.hasInstance]`.


## Class SimplexPair (a.k.a. PassThrough)

`SimplexPair` is one of the two primary ways that an application can make data available for reading on a Source interface. It is a special type of Duplex that keeps a modest buffer, which is filled through the Sink interface, and is drained from the Source interface.

It is essentially the same as a Node.js PassThrough, but with the addition of `writableSide` and `readableSide` properties inherited from the Duplex interface.

```
interface SimplexPair : Duplex {
	function _read(n);
}
```

By using the `readableSide` and `writableSide` properties, these two functions operate the same way:

```javascript
function a(){
	const { writableSide, readableSide } = new SimplexPair();
	process.nextTick(() => writableSide.end("foo\r\n"));
	return readableSide;
}
function b(){
	const pair = new SimplexPair();
	process.nextTick(() => pair.end("foo\r\n"));
	return pair.readableSide;
}
```

`SimplexPair` forms the basis of how virtually all `Source` and `Sink` streams are created in userland.


### SimplexPair#_read(n)

This is an optimization around creating a Source stream that does not depend on data becoming available, but instead can be generated as fast as the receiving end can read it.

Whenever the application calls `SimplexPair#read`, and there is insufficient data in the buffer, this will trigger a call to the user-implemented function `_read`; at this time the user may generate the requested number of bytes, and either return them, or make equivalent (but probably suboptimal) calls using `write`, `end`, and/or `destroy` (either directly on the `SimplexPair` instance, or on the `writableSide` property).

By default, this function will not write or return anything; and so cause the `read()` call to return `null`.

The `size` argument will always be provided; and will often be some large value like 0x10000. The function does not have to generate this much data, but should not generate more than that.

Example function that generates a sequence of bytes, increasing from 00 to FF then repeating:

```javascript
const a = new SimplexPair();
var counter = 0;
a._read = function(size){
	const buf = new Uint8Array(size);
	for(var i=0; i<size; i++) buf[i] = (counter++)%0xFF;
	return buf;
}
```


## Class DuplexPair

```
interface DuplexPair : Array {
	0: Duplex;
	1: Duplex;
}
```

A DuplexPair is created when an application needs to return a Duplex stream; in this case, it creates a related pair of Duplex streams. What is written to the local side will become readable to the remote side; and vice-versa.

Most Duplex streams will be one side of a DuplexPair. The streams are created identically, and one or the other may be used without any difference in behavior.


## Transforming streams with DuplexPair

Creating a Transform type stream with DuplexPair is trivial:

```javascript
function ROT13(){
	const [ inside, outside ] = new DuplexPair;
	outside.on('readable', function(){
		for(var buf; buf = inside.read();){
			inside.write(buf.toString().replace(/[a-zA-Z]/g, function(c){
				const d = c.charCodeAt(0) + 13;
				return String.fromCharCode( ((c<="Z")?90:122)>=d ? d : d-26 );
			}));
		}
	});
	return outside;
}
process.stdin.pipe(ROT13()).pipe(process.stdout);
```

This forms the basis for the `Transform#initInnerSide` method below.


## Migration

0. Expose the existing `DuplexPair` class
0. Reimplement `Duplex` as a `Source` and `Sink`
0. Reimplement `Readable`, `Writable`, and `Transform` as ancestors of `Source` and `Sink` (see below)
0. Implement `Source#final` property
0. Implement `Source#close`
0. Implement `SimplexPair`


## Readable

```
interface Readable : Source {
	Writable initWritableSide();
	function _read();
	function _destroy();
}
```

Uses `_read`, `_destroy` user-provided methods for compatibility with Streams 2.

It provides an `initWritableSide` call that allows the subclass constructor to acquire a Writable reference that fills the buffer, drained by the instance of this class.


## Writable

```
interface Writable : Sink {
	Readable initReadableSide();
	function _write(chunk, encoding, callback);
	function _writev(chunks, callback);
	function _destroy(err, callback);
	function _final(callback);
}
```

Uses `_write`, `_writev`, `_destroy`, and `_final` user-provided methods for compatibility with Streams 2.

It provides an `initReadableSide` call that allows the subclass constructor to acquire a Readable reference that drains the buffer, filled by the instance of this class.


## Transform

```
interface Transform : Duplex {
	Readable initInputSide();
	Writable initOutputSide();
	Duplex initInnerSide();
	function _transform(chunk, encoding, callback);
	function _flush(callback);
}
```

Uses `_transform` and `_flush` user-provided methods for compatibility with Streams 2.

It provides an `initInnerSide` call that allows the subclass constructor to acquire a private reference to the "inner" Duplex side that reads input and writes output. It may be set to a local variable, a private class property, or a public class property, as the needs of the application demand; once initialized and returned, the reference cannot be re-acquired. For example:


```javascript
class ROT13 extends Transform {
	#inside;
	constructor() {
		super();
		const inside = this.#inside = this.initInnerSide();
		inside.on('readable', function(){
			for(var buf; buf = inside.read();){
				inside.write(buf.toString().replace(/[a-zA-Z]/g, function(c){
					const d = c.charCodeAt(0) + 13;
					return String.fromCharCode( ((c<="Z")?90:122)>=d ? d : d-26 );
				}));
			}
		});
	}
}
process.stdin.pipe(new ROT13()).pipe(process.stdout);
```
