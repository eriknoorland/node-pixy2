# node-pixy2-serial-json
A Node module to communicate with the Pixy2 camera through an Arduino (see https://github.com/eriknoorland/pixy2-serial-json).

## installation
```
npm install node-pixy2
```

## states
| State  |
|--------|
| idle   |
| line   |
| blocks |

## usage
```javascript
const Pixy2 = require('node-pixy2');
const pixy2 = Pixy2('/dev/tty.usbserial-A9ITLJ7V');

pixy2.on('data', (data) => {
  console.log(data);
});

pixy2
  .init()
  .setState('line');
```
