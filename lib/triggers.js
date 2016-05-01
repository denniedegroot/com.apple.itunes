'use strict';

var daap = {};
var session = {};

/* Local functions */
function create_token(data, callback) {
    var token = {};

    token.name = data['dmcp.playstatus']['dacp.nowplayingname'];
    token.artist = data['dmcp.playstatus']['dacp.nowplayingartist'];
    token.album = data['dmcp.playstatus']['dacp.nowplayingalbum'];
    token.genre = data['dmcp.playstatus']['dacp.nowplayinggenre'];

    var meta = ['daap.songuserrating'];
    var nowplaying = data['dmcp.playstatus']['dacp.nowplayingids'];

    if (nowplaying.databaseId && nowplaying.trackId) {
        daap.item(session.id, nowplaying.databaseId, nowplaying.trackId, function (error, response) {
            if (error) {
                return callback(error);
            }

            if ('daap.databasesongs'in response &&
                'dmap.listing' in response['daap.databasesongs'] &&
                'dmap.listingitem'in response['daap.databasesongs']['dmap.listing'] &&
                'daap.songuserrating' in response['daap.databasesongs']['dmap.listing']['dmap.listingitem']) {
                var userRating = response['daap.databasesongs']['dmap.listing']['dmap.listingitem']['daap.songuserrating'];

                token.stars = Math.round(userRating / 20);
            } else {
                token.stars = 0;
            }

            callback(null, token);
        }, meta);
    } else {
        return callback(null, token);
    }
}

/* Trigger functions */
exports.process = function (data, prevdata) {
    if ('dmcp.playstatus'in data &&
        'dmcp.playstatus'in prevdata &&
        'dacp.nowplayingids' in data['dmcp.playstatus'] &&
        'dacp.nowplayingids' in prevdata['dmcp.playstatus']) {
        if (data['dmcp.playstatus']['dacp.nowplayingids'].trackId != prevdata['dmcp.playstatus']['dacp.nowplayingids'].trackId) {
            create_token(data, function (error, token) {
                if (error) {
                    Homey.log(error);
                    return;
                }

                Homey.manager('flow').trigger('song_changed', token);
            });
        }
    }

    if ('dmcp.playstatus'in data &&
        'dmcp.playstatus'in prevdata &&
        'dacp.playerstate' in data['dmcp.playstatus'] &&
        'dacp.playerstate' in prevdata['dmcp.playstatus']) {
        if (data['dmcp.playstatus']['dacp.playerstate'] != prevdata['dmcp.playstatus']['dacp.playerstate']) {
            if (data['dmcp.playstatus']['dacp.playerstate'] == 3) {
                create_token(data, function (error, token) {
                    if (error) {
                        Homey.log(error);
                        return;
                    }

                    Homey.manager('flow').trigger('song_paused', token);
                });
            } else if (data['dmcp.playstatus']['dacp.playerstate'] == 4) {
                create_token(data, function (error, token) {
                    if (error) {
                        Homey.log(error);
                        return;
                    }

                    Homey.manager('flow').trigger('song_resumed', token);
                });
            }
        }
    }
};

/* Init */
exports.init = function (_daap, _session) {
    daap = _daap;
    session = _session;
};
