const EventEmitter = require('events');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const State = require('./State');

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
      parser = new Readline({ delimiter: '\r\n' });

      port.pipe(parser);

      port.on('error', error => eventEmitter.emit('error', error));
      port.on('disconnect', () => eventEmitter.emit('disconnect'));
      port.on('close', () => eventEmitter.emit('close'));
      port.on('open', onPortOpen);

      parser.on('data', (data) => {
        try {
          const parsedData = JSON.parse(data);

          if (parsedData.status === 'ready') {
            return resolve();
          }

          eventEmitter.emit('data', parsedData);
        } catch(error) {}
      });
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
          port.write([0xA6, 0x10]);
          break;
        case State.LINE:
          port.write(['0xA6', '0x15', pan, tilt, led]);
          break;
        case State.BLOCKS:
          port.write(['0xA6', '0x20', pan, tilt, led]);
          break;
      }

      state = newState;

      resolve();
    });
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
  };
};

module.exports = Pixy2;
