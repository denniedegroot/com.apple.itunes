'use strict';

var daap = {};
var session = {};
var cache = {};
var cache_timeout = 3600 * 1000;

cache.songs = {};
cache.artists = {};
cache.songsid = [];
cache.artistsid = [];

/* Local functions */
function cache_items(type, dbid, itemid, callback) {
    var artists = [];
    var songs = [];

    var i;
    var len;
    var objects = {};
    var config = Homey.manager('settings').get('settings');

    daap.items(session.id, dbid, itemid, function (error, response) {
        if (error) {
            return callback(error, null);
        }

        if ('daap.playlistsongs' in response &&
            'dmap.listing' in response['daap.playlistsongs']) {
            if (!(response['daap.playlistsongs']['dmap.listing'] instanceof Array)) {
                var array = [];

                array.push(response['daap.playlistsongs']['dmap.listing']);
                response['daap.playlistsongs']['dmap.listing'] = array;
            }

            response['daap.playlistsongs']['dmap.listing'].forEach(function (object) {
                if ('dmap.listingitem' in object &&
                    'daap.songartist' in object['dmap.listingitem']) {
                    var name = object['dmap.listingitem']['daap.songartist'];

                    artists.push({
                        itemname: name,
                        songartistid: object['dmap.listingitem']['daap.songartistid'],
                        databaseplaylistsid: [itemid]
                    });

                    songs.push({
                        itemname: object['dmap.listingitem']['dmap.itemname'],
                        songartist: object['dmap.listingitem']['daap.songartist'],
                        songartistid: object['dmap.listingitem']['daap.songartistid'],
                        itemid: object['dmap.listingitem']['dmap.itemid'],
                        databaseplaylistsid: [itemid]
                    });
                }
            });

            if (config.cache_enabled) {
                for (i = 0, len = artists.length; i < len; i++) {
                    if (!(cache.artists[artists[i]['itemname']])) {
                        cache.artists[artists[i]['itemname']] = artists[i];
                    } else {
                        if (!(cache.artists[artists[i]['itemname']].databaseplaylistsid.indexOf(itemid) > -1)) {
                            cache.artists[artists[i]['itemname']].databaseplaylistsid.push(itemid);
                        }
                    }

                    if (!(cache.songs[songs[i]['itemname']])) {
                        cache.songs[songs[i]['itemname']] = songs[i];
                    } else {
                        if (!(cache.songs[songs[i]['itemname']].databaseplaylistsid.indexOf(itemid) > -1)) {
                            cache.songs[songs[i]['itemname']].databaseplaylistsid.push(itemid);
                        }
                    }
                }

                if (!(cache.artistsid.indexOf(itemid) > -1)) {
                    cache.artistsid.push(itemid);
                }

                if (!(cache.songsid.indexOf(itemid) > -1)) {
                    cache.songsid.push(itemid);
                }
            }

            for (i = 0, len = artists.length; i < len; i++) {
                if (type == 'artists') {
                    objects[artists[i]['itemname']] = artists[i];
                } else if (type == 'songs') {
                    objects[songs[i]['itemname']] = songs[i];
                } else {
                    break;
                }
            }

            return callback(null, objects);
        } else {
            return callback('undefined properties', null);
        }
    });
}

function filter_artists(artists, args, callback) {
    var items = [];

    for (var object in artists) {
        if (artists[object].itemname.toLowerCase().indexOf(args.query.toLowerCase()) > -1 &&
            artists[object].databaseplaylistsid.indexOf(Number(args.library.itemid)) > -1) {
            items.push({
                name: artists[object].itemname,
                songartistid: artists[object].songartistid
            });
        }
    }

    return callback(items);
}

function filter_songs(songs, args, callback) {
    var items = [];

    for (var object in songs) {
        var name = songs[object].itemname;

        if (!args.artist.songartistid && songs[object].songartist) {
            name = songs[object].songartist + ' - ' + songs[object].itemname;
        }

        if (name.toLowerCase().indexOf(args.query.toLowerCase()) > -1 &&
            songs[object].databaseplaylistsid.indexOf(Number(args.library.itemid)) > -1) {
            if (args.artist.songartistid && Number(args.artist.songartistid) != songs[object].songartistid) {
                continue;
            }

            items.push({
                name: name,
                itemname: songs[object].itemname,
                songartist: songs[object].songartist,
                itemid: songs[object].itemid
            });
        }
    }

    callback(items);
}

/* Media functions */
exports.get_libraries = function (callback, args) {
    var items = [];

    daap.databases(session.id, function (error, response) {
        if (error) {
            return callback(null, []);
        }

        if ('daap.serverdatabases' in response &&
            'dmap.listing' in response['daap.serverdatabases'] &&
            'dmap.listingitem' in response['daap.serverdatabases']['dmap.listing'] &&
            'dmap.itemid' in response['daap.serverdatabases']['dmap.listing']['dmap.listingitem']) {
            var dbid = response['daap.serverdatabases']['dmap.listing']['dmap.listingitem']['dmap.itemid'];

            daap.containers(session.id, dbid, function (error, response) {
                if (error) {
                    return callback(null, []);
                }

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
                    return callback(null, []);
                }
            });
        } else {
            return callback(null, []);
        }
    });
};

exports.get_artists = function (callback, args) {
    if (!(args.library.itemid && args.library.databaseid)) {
        return callback(__('library_error'), null);
    }

    var dbid = Number(args.library.databaseid);
    var itemid = Number(args.library.itemid);
    var config = Homey.manager('settings').get('settings');

    if (config.cache_enabled && cache.artistsid.indexOf(itemid) > -1) {
        filter_artists(cache.artists, args, function (items) {
            return callback(null, items);
        });
    } else {
        cache_items('artists', dbid, itemid, function (error, items) {
            if (error) {
                return callback(null, []);
            }

            filter_artists(items, args, function (items) {
                return callback(null, items);
            });
        });
    }
};

exports.get_songs = function (callback, args) {
    if (!(args.library.itemid && args.library.databaseid)) {
        return callback(__('library_error'), null);
    }

    var itemid = Number(args.library.itemid);
    var dbid = Number(args.library.databaseid);
    var config = Homey.manager('settings').get('settings');

    if (config.cache_enabled && cache.songsid.indexOf(itemid) > -1) {
        filter_songs(cache.songs, args, function (items) {
            return callback(null, items);
        });
    } else {
        cache_items('songs', dbid, itemid, function (error, items) {
            if (error) {
                return callback(null, []);
            }

            filter_songs(items, args, function (items) {
                return callback(null, items);
            });
        });
    }
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
            var say = __('actions.say_nowplaying', { song: song, artist: artist });

            Homey.manager('speech-output').say(say);
            return callback(null, true);
        } else {
            return callback('undefined properties', false);
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
                    var say = __('actions.say_stars', { stars: stars });

                    Homey.manager('speech-output').say(say);
                    return callback(null, true);
                } else {
                    return callback('undefined properties', false);
                }
            }, meta);
        } else {
            return callback('undefined properties', false);
        }
    });
};

exports.action_play_artist = function (callback, args) {
    if (!args.artist.name) {
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

exports.action_play_playlist = function (callback, args) {
    if (!args.playlist.itemid) {
        return callback('Playlist itemid is unknown', false);
    }
    var playlistId = args.playlist.itemid;

    daap.playPlaylist(session.id, playlistId, function (error, result) {
        if (error) {
            Homey.log(error);
        }

        callback(null, true);
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

exports.refresh_cache = function () {
    var args = {};
    var config = Homey.manager('settings').get('settings');

    setTimeout(function () {
        cache.songs = {};
        cache.artists = {};
        cache.songsid = [];
        cache.artistsid = [];
        exports.refresh_cache();
    }, cache_timeout);

    if (!config.cache_enabled) {
        return;
    }

    args.query = '';

    exports.get_libraries(function (error, items) {
        if (error) {
            return Homey.log(error);
        }

        items.forEach(function (object) {
            cache_items(null, object.databaseid, object.itemid, function () {});
        });
    }, args);
};

/* Init */
exports.init = function (_daap, _session) {
    daap = _daap;
    session = _session;
};
