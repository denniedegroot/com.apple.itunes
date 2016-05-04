'use strict';

// Mocks the global Homey object.
require('./lib/mock-homey.js');

// Rewire gives access to private variables of app.js and lets us change anything we need to run locally.
var rewire = require('rewire');

// Set your iTunes paircode here, host is optional (default is localhost)
// Mock will automaticly start pairing if no paircode is set here
Homey.manager('settings').set('settings', {
    paircode: 'yourpaircodehere',
    host: ''
});

function myTestCode() {
    // Your test code here will excecute when session is established with iTunes
    media.action_say_currentrating(function () {
    }, null);
}

// Get any private member from app.js we want to use
var app = rewire('./app.js');
var settings = app.__get__('settings');
var media = app.__get__('media');
var controls = app.__get__('controls');
var session = app.__get__('session');
var speech = app.__get__('speech');
var triggers = app.__get__('triggers');
var conditions = app.__get__('conditions');
var actions = app.__get__('actions');
var daap = app.__get__('daap');

var wiredSession = rewire('./lib/session.js');

overrideCloseSessionIfNeeded();
app.init();
triggerPairingIfNoPaircode();
runTestCodeOnSessionEstablished();

// Overrides close_session if no paircode is set in settings.
function overrideCloseSessionIfNeeded() {
    var paircode = Homey.manager('settings').get('settings').paircode;

    if (paircode == '' || paircode == 'yourpaircodehere') {
        wiredSession.__set__('close_session', close_session);
        wiredSession.__set__('close_session', close_session);
        app.__set__('session', wiredSession);
    }
}

// Override close_session function with a lower reconnect timeout
// Only needed when no pairing code is set on startup.
function close_session() {
    // Inject required session members
    var open_session = wiredSession.__get__('open_session');
    var session = wiredSession.__get__('session');

    daap.logout(session.id, function (error, response) {
        if (error) {
            Homey.log(error);
        }
    });

    // pair.discoverserver();

    setTimeout(function () {
        open_session();
    }, 3000);

    session.id = 0;
}

/* Start pairing if no paircode is set, otherwise run test code */
function triggerPairingIfNoPaircode() {
    var config = Homey.manager('settings').get('settings');

    config.pairstart = config.paircode == '' || config.paircode == 'yourpaircodehere';

    if (config.pairstart) {
        // Will trigger settings_changed and start pairing
        var defaultSettings = {
            pairstart: true
        };

        Homey.manager('settings').set('settings', defaultSettings);
        Homey.manager('api').realtime('settings_changed', defaultSettings);
    }
}

// Waits till a valid session is established with iTunes
// then executes test code once.
function runTestCodeOnSessionEstablished() {
    var timer = setInterval(function () {
        var session = wiredSession.__get__('session');

        if (session && session.id != 0) {
            clearTimeout(timer);
            console.log('paircode = ' + daap.paircode);
            myTestCode();
        }
    }, 2000);
}
