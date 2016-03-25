'use strict';

var pair = require('./pairing.js');

var daap = {};
var config = {};

/* Local functions */
function process_config(callback) {
    var save_config = false;

    config = Homey.manager('settings').get('settings');

    if (config == undefined) {
        config = {};
    }

    /* Init DAAP with config */
    if ('host' in config && config.host != undefined) {
        daap.host = config.host;
    }

    if ('paircode' in config && config.paircode != undefined) {
        daap.paircode = config.paircode;
    }

    /* Default settings */
    if (!('host' in config)) {
        config.host = undefined;
        save_config = true;
    }

    if (!('paircode' in config)) {
        config.paircode = undefined;
        save_config = true;
    }

    if (!('pairstart' in config)) {
        config.pairstart = false;
        save_config = true;
    }

    if (!('speech_enabled' in config)) {
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

    process_config(function () {
        Homey.manager('api').realtime('settings_changed', config);
        Homey.manager('settings').on('set', settings_changed);

        callback();
    });
};
