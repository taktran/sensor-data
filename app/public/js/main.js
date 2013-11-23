/*global Primus, Rickshaw */
(function (){
  'use strict';

  var SENSOR_THRESHOLD = 100;
  var GRAPH_WIDTH = 300;
  var GRAPH_HEIGHT = 300;

  $(function() {
    var sensorData = {
      pressure: [],
      accelerometer: {
        x: [{x: 0, y: 0}],
        y: [{x: 0, y: 0}],
        z: [{x: 0, y: 0}]
      }
    };
    var pressureTimeCounter = 0;
    var pressureGraph;
    var accelerometerTimeCounter = 0;
    var accelerometerGraph;

    // ----------------------------------------
    // Set up graphs
    // ----------------------------------------

    var initPressureSensorData = function() {
      for (var i = 0; i <= SENSOR_THRESHOLD; i++) {
        sensorData["pressure"].push({
          x: pressureTimeCounter++,
          y: 1
        });
      }
    };

    var initPressureGraph = function() {
      initPressureSensorData();

      var palette = new Rickshaw.Color.Palette({
        scheme: 'colorwheel'
      });

      pressureGraph = new Rickshaw.Graph({
        element: document.getElementById("pressure-graph"),
        width: GRAPH_WIDTH,
        height: GRAPH_HEIGHT,
        renderer: 'line',
        stroke: true,
        preserve: true,
        series: [
          {
            color: palette.color(),
            data: sensorData["pressure"],
            name: 'pressure'
          }
        ]
      });

      pressureGraph.render();

      var ticksTreatment = 'glow';

      var xAxis = new Rickshaw.Graph.Axis.Time({
        graph: pressureGraph,
        ticksTreatment: ticksTreatment,
        timeFixture: new Rickshaw.Fixtures.Time.Local()
      });

      xAxis.render();

      var yAxis = new Rickshaw.Graph.Axis.Y({
        graph: pressureGraph,
        tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
        ticksTreatment: ticksTreatment
      });

      yAxis.render();
    };

    var initAccelerometerGraph = function() {

      var palette = new Rickshaw.Color.Palette({
        scheme: 'colorwheel'
      });

      accelerometerGraph = new Rickshaw.Graph({
        element: document.getElementById("accelerometer-graph"),
        width: GRAPH_WIDTH,
        height: GRAPH_HEIGHT,
        renderer: 'line',
        stroke: true,
        preserve: true,
        series: [
          {
            color: palette.color(),
            data: sensorData["accelerometer"]["x"],
            name: 'x-axis'
          },
          {
            color: palette.color(),
            data: sensorData["accelerometer"]["y"],
            name: 'y-axis'
          },
          {
            color: palette.color(),
            data: sensorData["accelerometer"]["z"],
            name: 'z-axis'
          }
        ]
      });

      accelerometerGraph.render();

      var ticksTreatment = 'glow';

      var xAxis = new Rickshaw.Graph.Axis.Time({
        graph: accelerometerGraph,
        ticksTreatment: ticksTreatment,
        timeFixture: new Rickshaw.Fixtures.Time.Local()
      });

      xAxis.render();

      var yAxis = new Rickshaw.Graph.Axis.Y({
        graph: accelerometerGraph,
        tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
        ticksTreatment: ticksTreatment
      });

      yAxis.render();
    };

    initPressureGraph();
    initAccelerometerGraph();

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
          var accelData = sensorData["accelerometer"];
          var newX = accelerometerTimeCounter++;

          // TODO: Figure out how to do it with native values (remove * -100)
          // TODO: Show both values of accel [0] and [1]
          accelData["x"].push({
            x: newX,
            y: accel["x"][0] * -100
          });

          accelData["y"].push({
            x: newX,
            y: accel["y"][0] * -100
          });

          accelData["z"].push({
            x: newX,
            y: accel["z"][0] * -100
          });

          if (accelData["x"].length > SENSOR_THRESHOLD) {
            accelData["x"].shift();
            accelData["y"].shift();
            accelData["z"].shift();
          }
          accelerometerGraph.update();
        }

        var pressure = data["pressure"];
        if (pressure) {
          var pressureData = sensorData["pressure"];

          pressureData.push({
            x: pressureTimeCounter++,
            y: pressure.value
          });

          if (pressureData.length > SENSOR_THRESHOLD) {
            pressureData.shift();
          }

          pressureGraph.update();
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