const EventEmitter = require('events');
const cobs = require('cobs');
const SerialPort = require('serialport');
const Parser = require('./Parser');
const State = require('./State');

/**
 * Pixy2
 * @param {String} path
 * @return {Object}
 */
const Pixy2 = (path) => {
  const eventEmitter = new EventEmitter();

  let state = State.IDLE;
  let parser;
  let port;

  /**
   * Constructor
   */
  function constructor() {}

  /**
   * Init
   * @return {Promise}
   */
  function init() {
    return new Promise((resolve, reject) => {
      if (port) {
        setTimeout(reject, 0);
      }

      port = new SerialPort(path, { baudRate: 115200 });
      parser = new Parser();

      port.pipe(parser);

      port.on('error', error => eventEmitter.emit('error', error));
      port.on('disconnect', () => eventEmitter.emit('disconnect'));
      port.on('close', () => eventEmitter.emit('close'));
      port.on('open', onPortOpen);

      parser.on('ready', resolve);
      parser.on('line', data => eventEmitter.emit('line', data));
      parser.on('blocks', data => eventEmitter.emit('blocks', data));
      parser.on('stateChange', data => eventEmitter.emit('stateChange', data));
    });
  }

  /**
   * 
   * @param {String} newState
   * @param {Object} args
   */
  function setState(newState, args = {}) {
    const pan = numberToHex(args.pan || 127);
    const tilt = numberToHex(args.tilt || 0);
    const led = numberToHex(args.led || 0);

    return new Promise((resolve) => {
      switch (newState) {
        case State.IDLE:
          writeToSerialPort([0xA6, 0x10, pan, tilt, led]);
          break;

        case State.LINE:
          writeToSerialPort([0xA6, 0x15, pan, tilt, led]);
          break;

        case State.BLOCKS:
          writeToSerialPort([0xA6, 0x20, pan, tilt, led]);
          break;
      }

      state = newState;

      resolve();
    });
  }

  /**
   * 
   * @param {Array} buffer
   */
  function writeToSerialPort(buffer) {
    port.write(cobs.encode(Buffer.from(buffer), true));
  }

  /**
   * Returns a hex value based on the given number
   * @param {Number} value
   * @return {String}
   */
  function numberToHex(value) {
    return `0x${('00' + value.toString(16)).substr(-2).toUpperCase()}`;
  }

  /**
   * Port open event handler
   */
  function onPortOpen() {
    port.flush(error => {
      if (error) {
        eventEmitter.emit('error', error);
      }

      state = State.IDLE;
    });
  }

  constructor();

  return {
    init,
    setState,
    on: eventEmitter.on.bind(eventEmitter),
    off: eventEmitter.off.bind(eventEmitter),
  };
};

module.exports = Pixy2;
