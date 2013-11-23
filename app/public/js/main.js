/*global Primus, Rickshaw */
(function (){
  'use strict';

  var PRESSURE_SENSOR_THRESHOLD = 100;

  $(function() {
    var sensorData = {
      pressure: []
    };
    var timeCounter = 0;
    var graph;

    // ----------------------------------------
    // Set up graphs
    // ----------------------------------------

    var initSensorData = function() {
      for (var i = 0; i <= PRESSURE_SENSOR_THRESHOLD; i++) {
        sensorData["pressure"].push({
          x: timeCounter++,
          y: 1
        });
      }
    };

    var initGraph = function() {
      initSensorData();

      var palette = new Rickshaw.Color.Palette({
        scheme: 'colorwheel'
      });

      graph = new Rickshaw.Graph({
        element: document.getElementById("graph"),
        width: 470,
        height: 300,
        renderer: 'line',
        stroke: true,
        preserve: true,
        series: [
          {
            color: palette.color(),
            data: sensorData["pressure"],
            name: 'x-axis'
          }
        ]
      });

      graph.render();

      var ticksTreatment = 'glow';

      var xAxis = new Rickshaw.Graph.Axis.Time({
        graph: graph,
        ticksTreatment: ticksTreatment,
        timeFixture: new Rickshaw.Fixtures.Time.Local()
      });

      xAxis.render();

      var yAxis = new Rickshaw.Graph.Axis.Y({
        graph: graph,
        tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
        ticksTreatment: ticksTreatment
      });

      yAxis.render();
    };

    initGraph();

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
          var pressureData = sensorData["pressure"];

          pressureData.push({
            x: timeCounter++,
            y: pressure.value
          });

          if (pressureData.length > PRESSURE_SENSOR_THRESHOLD) {
            pressureData.shift();
          }

          graph.update();
        }
      }
    });

    // ----------------------------------------
    // Debugging
    // ----------------------------------------

    window.app = {
      sensorData: sensorData
    };
  });

})();