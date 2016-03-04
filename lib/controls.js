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
function action_play(callback, args) {
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

function action_pause(callback, args) {
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

function action_playpause(callback, args) {
    daap.login(function(error, response) {
        var session = response['dmap.loginresponse']['dmap.sessionid'];
        daap.playPause(session, function(error, response) {
            if (error)
                callback(error, false);

            callback(null, true);
        });
    });
}

function action_previous(callback, args) {
    daap.login(function(error, response) {
        var session = response['dmap.loginresponse']['dmap.sessionid'];
        daap.previous(session, function(error, response) {
            if (error)
                callback(error, false);

            callback(null, true);
        });
    });
}

function action_next(callback, args) {
    daap.login(function(error, response) {
        var session = response['dmap.loginresponse']['dmap.sessionid'];
        daap.next(session, function(error, response) {
            if (error)
                callback(error, false);

            callback(null, true);
        });
    });
}

function action_volume(callback, args) {
    set_volume(args.volume_percent, callback);
}

function action_volume_down(callback, args) {
    get_volume(function(error, volume) {
        volume -= args.volume_down

        if (volume < 0)
            volume = 0;

        set_volume(volume, callback);
    });
}

function action_volume_up(callback, args) {
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

    Homey.manager('flow').on('action.play', action_play);
    Homey.manager('flow').on('action.pause', action_pause);
    Homey.manager('flow').on('action.playpause', action_playpause);
    Homey.manager('flow').on('action.previous', action_previous);
    Homey.manager('flow').on('action.next', action_next);
    Homey.manager('flow').on('action.volume', action_volume);
    Homey.manager('flow').on('action.volume_down', action_volume_down);
    Homey.manager('flow').on('action.volume_up', action_volume_up);
}
