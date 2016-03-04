"use strict";

var pair = require('./pairing.js');

var daap = {};
var config = {};

/* Settings functions */
function settings_changed(name) {
    if (name == 'settings') {
        config = Homey.manager('settings').get(name);

        if (Object.keys(config).length) {
            daap.host = config.host;
            daap.pairingCode = config.paircode;
        } else {
            Homey.log('Starting pairing process');
            pair.code(function(data) {
                Homey.manager('settings').set('settings', data);
                Homey.manager('api').realtime('settings_changed', config);
                Homey.log('Pairing process done');
            });
        }
    }
}

/* Init */
exports.init = function(_daap, _config) {
    daap = _daap;
    config = _config;

    config = Homey.manager('settings').get('settings');

    if (config != undefined) {
        daap.host = config.host;
        daap.pairingCode = config.paircode;
    }

    Homey.manager('api').realtime('settings_changed', config);
    Homey.manager('settings').on('set', settings_changed);
}
