'use strict';

var pair = require('./pairing.js');

var daap = {};
var config = {};

/* Local functions */
function process_config(callback) {
    var save_config = false;

    /* Init DAAP with config */
    if (config.host != undefined) {
        daap.host = config.host;
    }

    if (config.paircode != undefined) {
        daap.pairingCode = config.paircode;
    }

    /* Default settings */
    if (config.pairstart == undefined) {
        config.pairstart = false;
        save_config = true;
    }

    if (config.speech_enabled == undefined) {
        config.speech_enabled = true;
        save_config = true;
    }

    if (save_config) {
        Homey.manager('settings').set('settings', config);
    }

    callback();
}

/* Settings functions */
function settings_changed(name) {
    if (name == 'settings') {
        config = Homey.manager('settings').get(name);

        if (config.pairstart == false) {
            daap.host = config.host;
            daap.pairingCode = config.paircode;
        } else {
            Homey.log('Starting pairing process');
            pair.code(function (data) {
                config.host = data.host;
                config.paircode = data.paircode;
                config.pairstart = false;

                Homey.manager('settings').set('settings', config);
                Homey.manager('api').realtime('settings_changed', config);
                Homey.log('Pairing process done');
            });
        }
    }
}

/* Init */
exports.init = function (_daap, callback) {
    daap = _daap;
    config = Homey.manager('settings').get('settings');

    process_config(function () {
        Homey.manager('api').realtime('settings_changed', config);
        Homey.manager('settings').on('set', settings_changed);

        callback();
    });
};
