'use strict';

var daap = {};
var session = {};

/* Media functions */
exports.get_libraries = function (callback, args) {
    var items = [];

    daap.databases(session.id, function (error, response) {
        if ('daap.serverdatabases' in response &&
            'dmap.listing' in response['daap.serverdatabases'] &&
            'dmap.listingitem' in response['daap.serverdatabases']['dmap.listing'] &&
            'dmap.itemid' in response['daap.serverdatabases']['dmap.listing']['dmap.listingitem']) {
            var dbid = response['daap.serverdatabases']['dmap.listing']['dmap.listingitem']['dmap.itemid'];

            daap.containers(session.id, dbid, function (error, response) {
                if ('daap.databaseplaylists' in response &&
                    'dmap.listing' in response['daap.databaseplaylists']) {
                    response['daap.databaseplaylists']['dmap.listing'].forEach(function (object) {
                        if ('dmap.listingitem' in object) {
                            var name = object['dmap.listingitem']['dmap.itemname'];

                            if (name.toLowerCase().indexOf(args.query.toLowerCase()) > -1) {
                                items.push({
                                    name: name,
                                    itemid: object['dmap.listingitem']['dmap.itemid'],
                                    itemcount: object['dmap.listingitem']['dmap.itemcount'],
                                    databaseid: dbid
                                });
                            }
                        }
                    });

                    return callback(null, items);
                } else {
                    return callback(__('communication_error'), null);
                }
            });
        } else {
            return callback(__('communication_error'), null);
        }
    });
};

exports.get_artists = function (callback, args) {
    var items = [];

    if (!(args.library.itemid && args.library.databaseid)) {
        return callback(__('library_error'), null);
    }

    var itemid = args.library.itemid;
    var dbid = args.library.databaseid;

    daap.items(session.id, dbid, itemid, function (error, response) {
        if ('daap.playlistsongs' in response &&
            'dmap.listing' in response['daap.playlistsongs']) {
            response['daap.playlistsongs']['dmap.listing'].forEach(function (object) {
                if ('dmap.listingitem' in object) {
                    var name = object['dmap.listingitem']['daap.songartist'];

                    if (name.toLowerCase().indexOf(args.query.toLowerCase()) > -1) {
                        items.push({
                            name: name,
                            id: object['dmap.listingitem']['daap.songartistid']
                        });
                    }
                }
            });

            var arr = {};

            for (var i = 0, len = items.length; i < len; i++) {
                arr[items[i]['name']] = items[i];
            }

            items = [];

            for (var key in arr) {
                items.push(arr[key]);
            }

            return callback(null, items);
        } else {
            return callback(__('communication_error'), null);
        }
    });
};

exports.get_songs = function (callback, args) {
    var items = [];

    if (!(args.library.itemid && args.library.databaseid)) {
        return callback(__('library_error'), null);
    }

    var itemid = args.library.itemid;
    var dbid = args.library.databaseid;

    daap.items(session.id, dbid, itemid, function (error, response) {
        if ('daap.playlistsongs' in response &&
            'dmap.listing' in response['daap.playlistsongs']) {
            response['daap.playlistsongs']['dmap.listing'].forEach(function (object) {
                if ('dmap.listingitem' in object) {
                    var name = object['dmap.listingitem']['daap.songartist'] + ' - ' + object['dmap.listingitem']['dmap.itemname'];

                    if (args.artist.id) {
                        name = object['dmap.listingitem']['dmap.itemname'];
                    }

                    if (name.toLowerCase().indexOf(args.query.toLowerCase()) > -1) {
                        if (args.artist.id && args.artist.id != object['dmap.listingitem']['daap.songartistid']) {
                            return;
                        }

                        items.push({
                            name: name,
                            itemname: object['dmap.listingitem']['dmap.itemname'],
                            itemartist: object['dmap.listingitem']['daap.songartist'],
                            itemid: object['dmap.listingitem']['dmap.itemid']
                        });
                    }
                }
            });

            return callback(null, items);
        } else {
            return callback(__('communication_error'), null);
        }
    });
};

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
            return callback(__('communication_error'), false);
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
                    return callback(__('communication_error'), false);
                }
            }, meta);
        } else {
            return callback(__('communication_error'), false);
        }
    });
};

exports.action_play_artist = function (callback, args) {
    if (!args.artist.name){
        return callback(__('library_error'), null);
    }

    var artist = args.artist.name;

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

exports.action_play_song = function (callback, args) {
    if (!args.song.itemid) {
        return callback('Song itemid is unknown', false);
    }

    daap.play(session.id, args.song.itemid, function (error, response) {
        if (error) {
            return callback(error, false);
        }

        callback(null, true);
    });
};

/* Init */
exports.init = function (_daap, _session) {
    daap = _daap;
    session = _session;
};
