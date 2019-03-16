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

      port = new SerialPort(path, { baudRate: 115200 }); // /dev/tty.usbserial-A9ITLJ7V
      parser = new Readline({ delimiter: '\r\n' });

      port.pipe(parser);

      port.on('error', error => eventEmitter.emit('error', error));
      port.on('disconnect', () => eventEmitter.emit('disconnect'));
      port.on('close', () => eventEmitter.emit('close'));
      port.on('open', onPortOpen.bind(null, resolve));

      parser.on('data', (data) => {
        try {
          eventEmitter.emit('data', data);
        } catch(error) {}
      });
    });
  }

  /**
   * 
   * @param {String} newState
   */
  function setState(newState) {
    return new Promise((resolve) => {
      switch (newState) {
        case State.IDLE:
          port.write('s0');
          break;
        case State.LINE:
          port.write('s1');
          break;
        case State.BLOCKS:
          port.write('s2');
          break;
      }

      state = newState;

      resolve();
    });
  }

  /**
   * Port open event handler
   * @param {Function} resolve
   */
  function onPortOpen(resolve) {
    port.flush(error => {
      if (error) {
        eventEmitter.emit('error', error);
      }

      state = State.IDLE;
      resolve();
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
