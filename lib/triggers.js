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

    daap.item(session.id, nowplaying.databaseId, nowplaying.trackId, function (error, response) {
        var userRating = response['daap.databasesongs']['dmap.listing']['dmap.listingitem']['daap.songuserrating'];

        token.stars = Math.round(userRating / 20);

        callback(token);
    }, meta);
}

/* Trigger functions */
exports.process = function (data, prevdata) {
    if (data['dmcp.playstatus']['dacp.nowplayingids'].trackId != prevdata['dmcp.playstatus']['dacp.nowplayingids'].trackId) {
        create_token(data, function (token) {
            Homey.manager('flow').trigger('song_changed', token);
        });
    }

    if (data['dmcp.playstatus']['dacp.playerstate'] != prevdata['dmcp.playstatus']['dacp.playerstate']) {
        if (data['dmcp.playstatus']['dacp.playerstate'] == 3) {
            create_token(data, function (token) {
                Homey.manager('flow').trigger('song_paused', token);
            });
        } else if (data['dmcp.playstatus']['dacp.playerstate'] == 4) {
            create_token(data, function (token) {
                Homey.manager('flow').trigger('song_resumed', token);
            });
        }
    }
};

/* Init */
exports.init = function (_daap, _session) {
    daap = _daap;
    session = _session;
};
