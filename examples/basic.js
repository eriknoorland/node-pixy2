const Pixy2 = require('../src/Pixy2');
const pixy2 = Pixy2('/dev/tty.usbserial-1420');

pixy2.on('data', (data) => {
  console.log(data);
});

pixy2
  .init()
  .then(() => {
    pixy2.setState('line');
  });
