/*global Primus*/
(function (){
  'use strict';

  $(function() {

    // ----------------------------------------
    // Web sockets server
    // ----------------------------------------

    var PRIMUS_URL = 'http://localhost:9999/',
        primus = Primus.connect(PRIMUS_URL);

    primus.on('open', function open() {
      console.log('Connection open');

      // Set up color picker
      $('#color-picker').colorpicker()
        .on('changeColor', function(ev){
          var color = ev.color.toHex();
          primus.write(color);
        });

    });

    primus.on('error', function error(err) {
      console.error('Error:', err, err.message);
    });

    primus.on('reconnect', function () {
      console.log('Reconnect attempt started');
    });

    primus.on('reconnecting', function (opts) {
      console.log('Reconnecting in %d ms', opts.timeout);
      console.log('This is attempt %d out of %d', opts.attempt, opts.retries);
    });

    primus.on('end', function () {
      console.log('Connection closed');
    });

    primus.on('data', function message(rawData) {
      var data = JSON.parse(rawData);

      if (data) {
        var accel = data["accelerometer"];
        if (accel) {
          // console.table(accel);
        }

        var pressure = data["pressure"];
        if (pressure) {
          // console.log(pressure);
        }
      }
    });

    // ----------------------------------------
    // Debugging
    // ----------------------------------------

    window.app = {
    };
  });

})();