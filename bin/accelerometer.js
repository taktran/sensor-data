var five = require("johnny-five"),
    board, accel;

board = new five.Board();

board.on("ready", function() {
  "use strict";

  // Create a new `Accelerometer` hardware instance.
  //
  // five.Accelerometer([ x, y[, z] ]);
  //
  // five.Accelerometer({
  //   pins: [ x, y[, z] ]
  //   freq: ms
  // });
  //

  accel = new five.Accelerometer({
    pins: [ "A0", "A1", "A2" ],
    freq: 100,
    threshold: 0.01
  });

  // Accelerometer Event API

  // "acceleration"
  //
  // Fires once every N ms, equal to value of freg
  // Defaults to 500ms
  //
  accel.on("acceleration", function( err, data ) {
    // console.log( "acceleration", data.smooth );
  });

  // "axischange"
  //
  // Fires only when X, Y or Z has changed
  //
  accel.on("axischange", function( err, data ) {
    console.log( "axischange", data.smooth );
  });
});