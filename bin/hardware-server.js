// Server to connect to hardware

'use strict';

var NORMALIZED_MIN = 0,
    NORMALIZED_MAX = 1.0,

    LIGHT_SENSOR_MIN = 880,
    LIGHT_SENSOR_MAX = 1015,

    PRESSURE_SENSOR_MIN = 50,
    PRESSURE_SENSOR_MAX = 1023,

    ACCELEROMETER_THRESHOLD = 0.01;

var five = require("johnny-five");
var Sensor = require("./lib/Sensor");

function inRange(value, valueMin, valueMax, rangeMin, rangeMax) {
  var valueProportion = Math.abs(value - valueMin) / (valueMax - valueMin),
    valueMap = (
      (valueProportion * (rangeMax - rangeMin)) + rangeMin
    );

  if (valueMap >= rangeMax) {
    valueMap = rangeMax;
  }

  if (valueMap <= rangeMin) {
    valueMap = rangeMin;
  }

  return valueMap;
}

var board = five.Board({
  port: "/dev/cu.usbmodem621" // tmac top usb
  // port: "/dev/cu.usbmodem411" // tmac bottom usb
});

board.on("ready", function() {

  // --------------------------------------------
  // Hardware setup
  // --------------------------------------------

  // Light
  var rgb = new five.Led.RGB([ 9, 10, 11 ]);

  // Photo resister
  var photoResistor = new Sensor("A3", board);

  // Pressure sensor
  var pressureSensor = new Sensor("A4", board);

  // Accelerometer
  var accel = new five.Accelerometer({
    pins: ["A0", "A1", "A2"],
    freq: 100,
    threshold: ACCELEROMETER_THRESHOLD
  });

  // --------------------------------------------
  // Real time connection
  // --------------------------------------------

  var Primus = require('primus'),
      http = require('http');

  var server = http.createServer(),
    primus = new Primus(server, {
      transformer: 'sockjs'
    });

  primus.on('connection', function(spark) {
    console.log('connection:\t', spark.id);

    spark.on('data', function(data) {
      console.log(data);

      rgb.color(data);
    });

    // Send light data
    // photoResistor.on("read", function(value) {
    //   var normVal = inRange(value, LIGHT_SENSOR_MIN, LIGHT_SENSOR_MAX, NORMALIZED_MIN, NORMALIZED_MAX);
    //   var data = {
    //     lightVal: normVal
    //   };

    //   // console.log("light:", normVal, "(", value, ")");
    //   if (normVal < 0.5) {
    //     data.lowLight = true;
    //   } else {
    //     data.lowLight = false;
    //   }

    //   spark.write(JSON.stringify(data));
    // });

    // Send pressue sensor data
    pressureSensor.on("read", function(value) {
      var normVal = inRange(value, PRESSURE_SENSOR_MIN, PRESSURE_SENSOR_MAX, NORMALIZED_MIN, NORMALIZED_MAX);

      var data = {
        pressure: {
          value: normVal
        }

      };

      //
      if (normVal < 0.3) {
        data.pressure.hardPress = true;
      } else {
        data.pressure.hardPress = false;
      }

      spark.write(JSON.stringify(data));
    });

    // Send accelerometer data
    accel.on("axischange", function(err, data) {
      var output = {
        accelerometer: data.smooth
      };
      console.log(output);
      spark.write(JSON.stringify(output));
    });
  });

  primus.on('disconnection', function(spark) {
    console.log('disconnection:\t', spark.id);
  });

  console.log(' [*] Listening on 0.0.0.0:9999' );
  server.listen(9999, '0.0.0.0');

});
