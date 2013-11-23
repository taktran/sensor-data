/*global Primus*/
(function (){
  'use strict';

  function log() {
    console.log(arguments);
  }

  $(function() {

    // ----------------------------------------
    // Web sockets server
    // ----------------------------------------

    var PRIMUS_URL = 'http://localhost:9999/',
        primus = Primus.connect(PRIMUS_URL);

    primus.on('open', function open() {
      log('Connection open');

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
      log('Reconnect attempt started');
    });

    primus.on('reconnecting', function (opts) {
      log('Reconnecting in %d ms', opts.timeout);
      log('This is attempt %d out of %d', opts.attempt, opts.retries);
    });

    primus.on('end', function () {
      log('Connection closed');
    });

    primus.on('data', function message(rawData) {
      log(rawData);
      if (rawData) {
        var accel = rawData["accelerometer"];
        if (accel) {
          log(accel);
        }
      }
    });

    // ----------------------------------------
    // Debugging
    // ----------------------------------------

    window.app = {
      log: log
    };
  });

})();