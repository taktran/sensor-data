/*global Primus, Rickshaw */
(function (){
  'use strict';

  $(function() {

    // ----------------------------------------
    // Set up graphs
    // ----------------------------------------

    var initGraph = function() {
      var seriesData = [ [], [], [], [], [], [], [], [], [] ];
      var random = new Rickshaw.Fixtures.RandomData(150);

      for (var i = 0; i < 150; i++) {
        random.addData(seriesData);
      }
      var palette = new Rickshaw.Color.Palette({
        scheme: 'classic9'
      });

      var graph = new Rickshaw.Graph({
        element: document.getElementById("graph"),
        width: 470,
        height: 300,
        renderer: 'line',
        stroke: true,
        preserve: true,
        series: [
          {
            color: palette.color(),
            data: seriesData[0],
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

      setInterval(function() {
        random.removeData(seriesData);
        random.addData(seriesData);
        graph.update();
      }, 500);
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