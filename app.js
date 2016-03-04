"use strict";

var pair = require('./lib/pairing.js');
var DAAP = require('./lib/daap.js');

var daap = new DAAP();
var settings = {};

Homey.manager('flow').on('action.play', function(callback, args) {
    daap.login(function(error, response) {
        var session = response['dmap.loginresponse']['dmap.sessionid'];
        daap.playStatusUpdate(session, function (error, response) {
            if (response['dmcp.playstatus']['dacp.playerstate'] != 4) {
                daap.playPause(session, function(error, response) {
                    if (error)
                        callback(error, false);

                    callback(null, true);
                });
            } else {
                callback(null, true);
            }
        });
    });
});

Homey.manager('flow').on('action.pause', function(callback, args) {
    daap.login(function(error, response) {
        var session = response['dmap.loginresponse']['dmap.sessionid'];
        daap.playStatusUpdate(session, function (error, response) {
            if (response['dmcp.playstatus']['dacp.playerstate'] == 4) {
                daap.playPause(session, function(error, response) {
                    if (error)
                        callback(error, false);

                    callback(null, true);
                });
            } else {
                callback(null, true);
            }
        });
    });
});

Homey.manager('flow').on('action.playpause', function(callback, args) {
    daap.login(function(error, response) {
        var session = response['dmap.loginresponse']['dmap.sessionid'];
        daap.playPause(session, function(error, response) {
            if (error)
                callback(error, false);

            callback(null, true);
        });
    });
});

Homey.manager('flow').on('action.previous', function(callback, args) {
    daap.login(function(error, response) {
        var session = response['dmap.loginresponse']['dmap.sessionid'];
        daap.previous(session, function(error, response) {
            if (error)
                callback(error, false);

            callback(null, true);
        });
    });
});

Homey.manager('flow').on('action.next', function(callback, args) {
    daap.login(function(error, response) {
        var session = response['dmap.loginresponse']['dmap.sessionid'];
        daap.next(session, function(error, response) {
            if (error)
                callback(error, false);

            callback(null, true);
        });
    });
});

function init() {
    settings = Homey.manager('settings').get('settings');

    if (settings != undefined) {
        daap.host = settings.host;
        daap.pairingCode = settings.paircode;
    }

    Homey.manager('api').realtime('settings_changed', settings);

    Homey.manager('settings').on('set', function(name) {
        if (name == 'settings') {
            settings = Homey.manager('settings').get(name);

            if (Object.keys(settings).length) {
                daap.host = settings.host;
                daap.pairingCode = settings.paircode;
            } else {
                Homey.log('Starting pairing process');
                pair.code(function(data) {
                    Homey.manager('settings').set('settings', data);
                    Homey.manager('api').realtime('settings_changed', settings);
                    Homey.log('Pairing process done');
                });
            }
        }
    });
}

module.exports.init = init;
