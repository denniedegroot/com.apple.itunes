'use strict';

var controls = require('./controls.js');

var daap = {};
var session = {};

/* Local functions */
function song_playing(callback, args) {
    daap.playStatusUpdate(session.id, 1, function (error, response) {
        if (error) {
            return callback(error, false);
        }

        if ('dmcp.playstatus' in response &&
            'dacp.playerstate' in response['dmcp.playstatus']) {
            if (response['dmcp.playstatus']['dacp.playerstate'] == 4) {
                return callback(null, true);
            } else {
                return callback(null, false);
            }
        } else {
            return callback('properties undefined', false);
        }
    });
}

function song_paused(callback, args) {
    daap.playStatusUpdate(session.id, 1, function (error, response) {
        if (error) {
            return callback(error, false);
        }

        if ('dmcp.playstatus' in response &&
            'dacp.playerstate' in response['dmcp.playstatus']) {
            if (response['dmcp.playstatus']['dacp.playerstate'] != 4) {
                return callback(null, true);
            } else {
                return callback(null, false);
            }
        } else {
            return callback('properties undefined', false);
        }
    });
}

function volume(callback, args) {
    controls.get_volume(function (error, volume) {
        if (error) {
            return callback(error, false);
        }

        if (args.volume_percent == volume) {
            return callback(null, true);
        } else {
            return callback(null, false);
        }
    });
}

/* Init */
exports.init = function (_daap, _session) {
    daap = _daap;
    session = _session;

    Homey.manager('flow').on('condition.song_playing', song_playing);
    Homey.manager('flow').on('condition.song_paused', song_paused);
    Homey.manager('flow').on('condition.volume', volume);
};
