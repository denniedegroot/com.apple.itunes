"use strict";

require('./lib/mock-homey.js'); // Mocks the global Homey object.

var daapPairCode = '0x0FDFF6D433D55A65'; // Change to your itunes paircode
function test() {
    setTimeout(function() {
        // Your test code here
        media.action_say_currentrating(function(){},null);
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

setPairingSettings(daap);
init();

function setPairingSettings(daap) {
    daap.paircode = daapPairCode;
    doPairIfNeeded(daap);
}

/* Start pairing when no paircode is set */
function doPairIfNeeded(daap) {
    if (daap.paircode == 'yourpaircode' || daap.paircode == '') {
        var pair = require('./lib/pairing.js');

        Homey.log('Starting pairing process');
        pair.code(function (error, data) {
            if (error) {
                return Homey.log(error);
            }
            console.log(data);

            var config = {};
            config.host = data.host;
            config.paircode = data.paircode;
            config.pairstart = false;

            daap.paircode = data.paircode;
            // pair.discoverserver();

            Homey.manager('settings').set('settings', config);
            Homey.manager('api').realtime('settings_changed', config);
            Homey.log('Pairing process done, put the paircode in the mock daapPairCode variable to use it next time.');
            test();
        });
    } else {
        test();
    }
}
