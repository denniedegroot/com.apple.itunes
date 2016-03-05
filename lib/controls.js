"use strict";

var daap = {};

/* Local functions */
function get_volume(callback) {
    daap.login(function(error, response) {
        var session = response['dmap.loginresponse']['dmap.sessionid'];
        daap.getProperty(session, ['dmcp.volume'], function(error, response) {
            if (error)
                callback(error)

            callback(null, response['dmcp.getpropertyresponse']['dmcp.volume']);
        });
    });
}

function set_volume(volume, callback) {
    daap.login(function(error, response) {
        var session = response['dmap.loginresponse']['dmap.sessionid'];
        daap.setProperty(session, {'dmcp.volume': volume}, function(error, response) {
            if (error)
                callback(error, false);

            callback(null, true);
        });
    });
}

/* Actions functions */
exports.action_play = function(callback, args) {
    daap.login(function(error, response) {
        var session = response['dmap.loginresponse']['dmap.sessionid'];
        daap.playStatusUpdate(session, function(error, response) {
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
}

exports.action_pause = function(callback, args) {
    daap.login(function(error, response) {
        var session = response['dmap.loginresponse']['dmap.sessionid'];
        daap.playStatusUpdate(session, function(error, response) {
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
}

exports.action_playpause = function(callback, args) {
    daap.login(function(error, response) {
        var session = response['dmap.loginresponse']['dmap.sessionid'];
        daap.playPause(session, function(error, response) {
            if (error)
                callback(error, false);

            callback(null, true);
        });
    });
}

exports.action_previous = function(callback, args) {
    daap.login(function(error, response) {
        var session = response['dmap.loginresponse']['dmap.sessionid'];
        daap.previous(session, function(error, response) {
            if (error)
                callback(error, false);

            callback(null, true);
        });
    });
}

exports.action_next = function(callback, args) {
    daap.login(function(error, response) {
        var session = response['dmap.loginresponse']['dmap.sessionid'];
        daap.next(session, function(error, response) {
            if (error)
                callback(error, false);

            callback(null, true);
        });
    });
}

exports.action_volume = function(callback, args) {
    set_volume(args.volume_percent, callback);
}

exports.action_volume_down = function(callback, args) {
    get_volume(function(error, volume) {
        volume -= args.volume_down

        if (volume < 0)
            volume = 0;

        set_volume(volume, callback);
    });
}

exports.action_volume_up = function(callback, args) {
    get_volume(function(error, volume) {
        volume += args.volume_up

        if (volume > 100)
            volume = 100;

        set_volume(volume, callback);
    });
}

/* Init */
exports.init = function(_daap) {
    daap = _daap;

    Homey.manager('flow').on('action.play', exports.action_play);
    Homey.manager('flow').on('action.pause', exports.action_pause);
    Homey.manager('flow').on('action.playpause', exports.action_playpause);
    Homey.manager('flow').on('action.previous', exports.action_previous);
    Homey.manager('flow').on('action.next', exports.action_next);
    Homey.manager('flow').on('action.volume', exports.action_volume);
    Homey.manager('flow').on('action.volume_down', exports.action_volume_down);
    Homey.manager('flow').on('action.volume_up', exports.action_volume_up);
}
