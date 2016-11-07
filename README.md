# Sensor data

Visualisation of sensor data in the browser.

Hack for the the Insanity Hack day 23/11/2013 at East Poultry Ave.

A website built using [generator-starttter](https://github.com/taktran/generator-starttter).

## Development

Install modules

    npm install

Start the server

    grunt

View the site at [http://localhost:7770](http://localhost:7770), or your local (internal) ip address (useful for testing on other devices). You can also run

    grunt open

To run the site on another port, use the `port` flag eg,

    grunt --port=3000

To run the site using a different livereload port (default is `35729`), use the `lrp` flag (prevents this error: `Fatal error: Port 35729 is already in use by another process.`) eg,

    grunt --lrp=35720

## Hardware

To enable the hardware features

1. Set up the arduino (TODO)
2. Find your arduino port, and update the port in `bin/hardware-server.js` (some machines don't require it though):

        five.Board({
          port: "port name from"
        });

3. Start the hardware server

        node bin/hardware-server.js

### Test scripts

To start the RGB lights demo

    node bin/rbg-lights.js

To start the accelerometer demo

    node bin/accelerometer.js

## Testing

Uses [karma](http://karma-runner.github.io/) and [jasmine](https://jasmine.github.io/).

Karma is run automatically when `grunt` is called. To run it manually

    karma start config/karma.conf.js

For continuous integration, run

    grunt ci:test

    # Or,

    npm test
