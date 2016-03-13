"use strict";

require('./lib/mock-homey.js'); // Mocks the global Homey object.
var daapPairCode = 'yourpaircode'; // Change to your itunes paircode

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
        setPairingSettings(daap);
        session.init(daap, sessioninfo);

        media.init(daap, sessioninfo);
        controls.init(daap, sessioninfo);
        triggers.init(daap, sessioninfo);
        speech.init();
    });
}

init();
test();

function test(){
    setTimeout(function(){
        var pair = require('./lib/pairing.js');
        // Your test code here

    }, 2000);
}

function setPairingSettings(daap){
    daap.pairingCode = daapPairCode;
    doPairIfNeeded(daap);
}

/* Start pairing when no ip or paircode where set */
function doPairIfNeeded(daap){
    if(daap.pairingCode == 'yourpaircode'){
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

module.exports.init = init;


