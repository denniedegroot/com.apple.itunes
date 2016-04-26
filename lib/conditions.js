'use strict';

var controls = require('./controls.js');
var media = require('./media.js');

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
            return callback('undefined properties', false);
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
            return callback('undefined properties', false);
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

function current_song(callback, args) {
    daap.playStatusUpdate(session.id, 1, function (error, response) {
        if (error) {
            return callback(error, false);
        }

        if ('dmcp.playstatus'in response &&
            'dacp.nowplayingids' in response['dmcp.playstatus']) {
            if (response['dmcp.playstatus']['dacp.nowplayingids'].trackId == Number(args.song.itemid)) {
                return callback(null, true);
            }

            return callback(null, false);
        } else {
            return callback('undefined properties', false);
        }
    });
}

function current_artist(callback, args) {
    daap.playStatusUpdate(session.id, 1, function (error, response) {
        if (error) {
            return callback(error, false);
        }

        if ('dmcp.playstatus'in response &&
            'dacp.nowplayingartist' in response['dmcp.playstatus']) {
            if (response['dmcp.playstatus']['dacp.nowplayingartist'] == args.artist.name) {
                return callback(null, true);
            }

            return callback(null, false);
        } else {
            return callback('undefined properties', false);
        }
    });
}

function current_stars(callback, args) {
    daap.playStatusUpdate(session.id, 1, function (error, response) {
        if (error) {
            return callback(error, false);
        }

        if ('dmcp.playstatus' in response &&
            'dacp.nowplayingids' in response['dmcp.playstatus']) {
            var nowplaying = response['dmcp.playstatus']['dacp.nowplayingids'];
            var meta = ['daap.songuserrating'];

            daap.item(session.id, nowplaying.databaseId, nowplaying.trackId, function (error, response) {
                if (error) {
                    return callback(error, false);
                }

                if ('daap.databasesongs'in response &&
                    'dmap.listing' in response['daap.databasesongs'] &&
                    'dmap.listingitem'in response['daap.databasesongs']['dmap.listing'] &&
                    'daap.songuserrating' in response['daap.databasesongs']['dmap.listing']['dmap.listingitem']) {
                    var userRating = response['daap.databasesongs']['dmap.listing']['dmap.listingitem']['daap.songuserrating'];
                    var stars = Math.round(userRating / 20);

                    if (stars == Number(args.stars)) {
                        return callback(null, true);
                    }

                    return callback(null, false);
                } else {
                    return callback('undefined properties', false);
                }
            }, meta);
        } else {
            return callback('undefined properties', false);
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
    Homey.manager('flow').on('condition.current_stars', current_stars);
    Homey.manager('flow').on('condition.current_artist', current_artist);
    Homey.manager('flow').on('condition.current_song', current_song);

    Homey.manager('flow').on('condition.current_artist.library.autocomplete', media.get_libraries);
    Homey.manager('flow').on('condition.current_artist.artist.autocomplete', media.get_artists);
    Homey.manager('flow').on('condition.current_song.library.autocomplete', media.get_libraries);
    Homey.manager('flow').on('condition.current_song.artist.autocomplete', media.get_artists);
    Homey.manager('flow').on('condition.current_song.song.autocomplete', media.get_songs);
};
