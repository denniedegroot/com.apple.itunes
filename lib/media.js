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

exports.action_play_artist = function(callback, args) {
    var artist = args.artist;
    daap.clearQueue(session.id, function(error, response) {
        var query = "'daap.songartist:" + encodeURIComponent(artist) + "'";

        daap.addQueue(session.id, query, function(error, response) {
            daap.playQueue(session.id, function(error, response){
                callback(null, true);
            });
        });
    });
}

exports.action_play_playlist2 = function(callback, args) {
    var playlistName = args.playlist;
    daap.databases(session.id, function(error, response) {
        var databaseId = response['daap.serverdatabases']['dmap.listing']['dmap.listingitem']['dmap.itemid'];

        daap.containers(session.id, databaseId, function(error, response) {
            var playlist = response['daap.databaseplaylists']['dmap.listing'];
            if(Array.isArray(playlist)){
                // Use the first playlist found if multiple
                playlist = playlist[0];
            }
            var playlistId = playlist['dmap.listingitem']['dmap.itemid'];

            daap.clearQueue(session.id, function(error, response) {
                var query = "'dmap.containeritemid:" + playlistId + "'";

                daap.addQueue(session.id, query, function(error, response) {
                    console.log(response);
                    daap.playQueue(session.id, function(error, response){
                        callback(null, true);
                    });
                });
            });
        },'dmap.itemname:' + playlistName);
    });
}

exports.action_play_playlist = function(callback, args) {
    var playlistName = args.playlist;
    daap.databases(session.id, function(error, response) {
        var databaseId = response['daap.serverdatabases']['dmap.listing']['dmap.listingitem']['dmap.itemid'];

        daap.containers(session.id, databaseId, function(error, response) {
            var playlist = response['daap.databaseplaylists']['dmap.listing'];
            if(Array.isArray(playlist)){
                // Use the first playlist found if multiple
                playlist = playlist[0];
            }
            var playlistId = playlist['dmap.listingitem']['dmap.itemid'];

            daap.playContainer(session.id, databaseId, playlistId, function(error, response) {
                console.log(response);
            });
        },'dmap.itemname:' + playlistName);
    });
}

/* Init */
exports.init = function(_daap, _session) {
    daap = _daap;
    session = _session;

    Homey.manager('flow').on('action.say_nowplaying', exports.action_say_nowplaying);
    Homey.manager('flow').on('action.say_currentrating', exports.action_say_currentrating);
    Homey.manager('flow').on('action.play_artist', exports.action_play_artist);
}
