"use strict";

require('./lib/mock-homey.js'); // Mocks the global Homey object.

var daapPairCode = 'yourpaircode'; // Change to your itunes paircode
function test() {
    setTimeout(function() {
        // Your test code here
        
    }, 2000);
}

// Start of original app.js content >>
"use strict";

var DAAP = require('./lib/daap.js');

var controls = require('./lib/controls.js');
var media = require('./lib/media.js');
var settings = require('./lib/settings.js');
var session = require('./lib/session.js');
var speech = require('./lib/speech-input.js');
var triggers = require('./lib/triggers.js');

var config = {};
var daap = new DAAP();
var sessioninfo = {};

function init() {
    settings.init(daap, config, function() {
        setPairingSettings(daap); // << ==== Changed from original
        session.init(daap, sessioninfo);

        media.init(daap, sessioninfo);
        controls.init(daap, sessioninfo);
        triggers.init(daap, sessioninfo);
        speech.init();
    });
}

module.exports.init = init;
// << END of original app.js content

init();
test();

function setPairingSettings(daap) {
    daap.pairingCode = daapPairCode;
    doPairIfNeeded(daap);
}

/* Start pairing when no paircode is set */
function doPairIfNeeded(daap) {
    if (daap.pairingCode == 'yourpaircode' || daap.pairingCode == '') {
        var pairing = require('./lib/pairing.js');

        Homey.log('Starting pairing process');
        pairing.code(function(data) {
            console.log(data);
            daap.host = data.host;
            daap.pairingCode = data.paircode;
            Homey.log('Pairing process done');
        });
    }
}
