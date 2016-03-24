'use strict';

var daap = {};
var session = {};

/* Actions functions */
exports.action_say_nowplaying = function (callback, args) {
    daap.playStatusUpdate(session.id, 1, function (error, response) {
        if (error) {
            return callback(error, false);
        }

        if ('dmcp.playstatus' in response &&
            'dacp.nowplayingname' in response['dmcp.playstatus'] &&
            'dacp.nowplayingartist' in response['dmcp.playstatus']) {

            var song = response['dmcp.playstatus']['dacp.nowplayingname'];
            var artist = response['dmcp.playstatus']['dacp.nowplayingartist'];
            var say = __('actions.say_nowplaying').replace('${song}', song).replace('${artist}', artist);

            Homey.manager('speech-output').say(say);
            return callback(null, true);
        } else {
            return callback('properties undefined', false);
        }
    });
};

exports.action_say_currentrating = function (callback, args) {
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
                    var say = __('actions.say_stars').replace('${stars}', stars);

                    Homey.manager('speech-output').say(say);
                    return callback(null, true);
                } else {
                    return callback('properties undefined', false);
                }
            }, meta);
        } else {
            return callback('properties undefined', false);
        }
    });
};

exports.action_play_artist = function (callback, args) {
    var artist = args.artist;

    daap.clearQueue(session.id, function (error, response) {
        if (error) {
            return callback(error, false);
        }

        var query = '\'daap.songartist:' + encodeURIComponent(artist) + '\'';

        daap.addQueue(session.id, query, function (error, response) {
            if (error) {
                return callback(error, false);
            }

            daap.playQueue(session.id, function (error, response) {
                if (error) {
                    return callback(error, false);
                }

                callback(null, true);
            });
        });
    });
};

/* Init */
exports.init = function (_daap, _session) {
    daap = _daap;
    session = _session;
};
