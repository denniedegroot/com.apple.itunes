"use strict";

var daap = {};
var session = {};

/* Actions functions */
exports.action_say_nowplaying = function(callback, args) {
    daap.playStatusUpdate(session.id, 1, function(error, response) {
        if (error)
            callback(error, false);

        var song = response['dmcp.playstatus']['dacp.nowplayingname'];
        var artist = response['dmcp.playstatus']['dacp.nowplayingartist'];
        var say = __('actions.say_nowplaying').replace('${song}', song).replace('${artist}', artist);

        Homey.manager('speech-output').say(say);
        callback(null, true);
    });
}

exports.action_say_currentrating = function(callback, args) {
    daap.playStatusUpdate(session.id, 1, function(error, response) {
        var nowplaying = response['dmcp.playstatus']['dacp.nowplayingids'];
        var meta = ['daap.songuserrating'];

        daap.item(session.id, nowplaying.databaseId, nowplaying.trackId, function(error, response) {
            var userRating = response['daap.databasesongs']['dmap.listing']['dmap.listingitem']['daap.songuserrating'];
            var stars = Math.round(userRating / 20);
            var say = __('actions.say_stars').replace('${stars}', stars);

            Homey.manager('speech-output').say(say);
            callback(null, true);
        }, meta);
    });
}

/* Init */
exports.init = function(_daap, _session) {
    daap = _daap;
    session = _session;

    Homey.manager('flow').on('action.say_nowplaying', exports.action_say_nowplaying);
    Homey.manager('flow').on('action.say_currentrating', exports.action_say_currentrating);
}
