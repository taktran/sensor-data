// Example file to demo an rgb LED
var five = require("johnny-five");

five.Board({
  port: "/dev/cu.usbmodem621" // tmac top usb
  // port: "/dev/cu.usbmodem411" // tmac bottom usb
}).on("ready", function() {
  "use strict";

  var rgb, rainbow, index;

  rgb = new five.Led.RGB([ 9, 10, 11 ]);

  rainbow = [ [0, 0, 0], [10, 0, 0], [0, 10, 0], [0, 0, 10], [10, 10, 10] ];
  index = 0;

  setInterval(function() {
    if ( index + 1 === rainbow.length ) {
      index = 0;
    }
    rgb.color( rainbow[ index++ ] );
  }, 500);
});