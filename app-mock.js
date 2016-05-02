'use strict';

// Mocks the global Homey object.
require('./lib/mock-homey.js');

// Set your itunes paircode here, host is optional (default is localhost)
// Mock will automaticly start pairing if no paircode is set here
Homey.manager('settings').set('settings', {
    paircode: '0x4D642AE26714194F',
    host: ''
});

function test() {
    setTimeout(function () {
        // Your test code here
        media.action_say_currentrating(function () {
        }, null);
    }, 2000);
}

// Start of original app.js content >>
'use strict';

var DAAP = require('./lib/daap.js');

var controls = require('./lib/controls.js');
var media = require('./lib/media.js');
var settings = require('./lib/settings.js');
var session = require('./lib/session.js');
var speech = require('./lib/speech-input.js');

var triggers = require('./lib/triggers.js');
var conditions = require('./lib/conditions.js');
var actions = require('./lib/actions.js');

var daap = new DAAP();
var sessioninfo = {};

function init() {
    settings.init(daap, function () {
        session.init(daap, sessioninfo);

        media.init(daap, sessioninfo);
        controls.init(daap, sessioninfo);

        triggers.init(daap, sessioninfo);
        conditions.init(daap, sessioninfo);
        actions.init(daap, sessioninfo);

        speech.init();
    });
}

module.exports.init = init;
// << END of original app.js content

// Required variables for settings_changed()
var config;
var pair = require('./lib/pairing.js');

// Slightly modified version of settings.settings_changed(name) content >>
function settings_changed(name, callback) {
    if (name == 'settings') {
        config = Homey.manager('settings').get(name);

        if (config.pairstart == false) {
            daap.host = config.host;
            daap.paircode = config.paircode;
        } else {
            Homey.log('Starting pairing process');
            pair.code(function (error, data) {
                if (error) {
                    return Homey.log(error);
                }

                config.host = data.host;
                config.paircode = data.paircode;
                config.pairstart = false;

                // pair.discoverserver();

                Homey.manager('settings').set('settings', config);
                Homey.manager('api').realtime('settings_changed', config);
                Homey.log('Pairing process done');
                if (callback) {
                    return callback(data);
                }
            });
        }
    }
}
// << END of settings.settings_changed(name)

pairIfNoPaircode();

/* Start pairing if no paircode is set, otherwise run test code */
function pairIfNoPaircode() {
    var config = Homey.manager('settings').get('settings');

    config.pairstart = config.paircode == '' || config.paircode == 'yourpaircodehere';

    if (config.pairstart == true) {
        settings_changed('settings', function (pairData) {
            Homey.log(pairData);
            Homey.log('Enter the paircode uptop in the app-mock.js file and restart the app to run your test code');
            process.exit();
        });
    } else {
        init();
        test();
    }
}
