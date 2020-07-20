'use strict';
const assert = require('assert');

const { Duplex } = require('./lib/Duplex.js');
const { DuplexPair } = require('./lib/DuplexPair.js');
// const { BufferQueue } = require('./lib/BufferQueue.js');
const { ReadableSide, WritableSide, Readable, Writable, SimplexPair } = require('./lib/Simplex.js');
const { Transform } = require('./lib/Transform.js');
const { Source, Sink } = require('./lib/interfaces.js');


module.exports.Source = Source;
module.exports.Sink = Sink;
module.exports.Duplex = Duplex;
module.exports.ReadableSide = ReadableSide;
module.exports.WritableSide = WritableSide;
module.exports.Readable = Readable;
module.exports.Writable = Writable;
module.exports.SimplexPair = SimplexPair;
module.exports.DuplexPair = DuplexPair;
module.exports.Transform = Transform;
