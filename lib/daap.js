'use strict';

var url = require('url');
var http = require('http');
var parser = require('./daap-decoder.js');

function http_get(host, port, path, callback, options) {
    options = {
        timeout: (typeof(options) == 'object' && options.timeout != undefined) ? options.timeout : 10000
    };

    var timeout = setTimeout(function () {
        request.abort();
    }, options.timeout);

    var request = http.get({
        host: host,
        port: port,
        path: path,
        headers: {'Viewer-Only-Client': '1'},
        agent: false
    }, function (response) {
        var data = [];

        response.on('data', function (chunk) {
            data.push(chunk);

            clearTimeout(timeout);
            timeout = setTimeout(function () {
                request.abort();
            }, 60000);
        });

        response.on('end', function () {
            var ret = {};
            var error = null;

            try {
                ret = parser.decode(Buffer.concat(data), true);
            } catch (e) {
                error = e;
            }

            clearTimeout(timeout);
            callback(error, ret);
        });

        response.on('error', function (error) {
            clearTimeout(timeout);
            callback(error);
        });
    });

    request.on('error', function (error) {
        clearTimeout(timeout);
        callback(error);
    });
}

daap.prototype.serverInfo = function (callback) {
    var path = '/server-info';

    http_get(this.host, this.port, path, callback);
};

daap.prototype.login = function (callback) {
    var path = '/login?pairing-guid=' + this.paircode;

    http_get(this.host, this.port, path, callback);
};

daap.prototype.logout = function (sessionId, callback) {
    var path = '/logout?session-id=' + sessionId;

    http_get(this.host, this.port, path, callback);
};

daap.prototype.databases = function (sessionId, callback) {
    var path = '/databases?session-id=' + sessionId;

    http_get(this.host, this.port, path, callback);
};

daap.prototype.play = function (sessionId, songId, callback) {
    var href = url.parse('/ctrl-int/1/playqueue-edit?'
                + 'command=add&query=\'dmap.itemid:' + songId + '\''
                + '&sort=name&mode=1&session-id=' + sessionId);
    var path = decodeURIComponent(href.path);

    http_get(this.host, this.port, path, callback);
};

daap.prototype.playPlaylist = function (sessionId, playlistItemId, callback) {
    var href = url.parse('/ctrl-int/1/playqueue-edit?'
                         + 'command=add&query=\'dmap.itemid:' + playlistItemId + '\''
                         // mode 1 starts playing right away
                         + '&mode=1'
                         + '&query-modifier=containers'
                         + '&session-id=' + sessionId);
    var path = decodeURIComponent(href.path);

    http_get(this.host, this.port, path, callback);
};

daap.prototype.playQueue = function (sessionId, callback) {
    var path = '/ctrl-int/1/playqueue-edit?command=playnow'
                + '&index=1&session-id=' + sessionId;

    http_get(this.host, this.port, path, callback);
};

daap.prototype.addQueue = function (sessionId, query, callback) {
    var path = '/ctrl-int/1/cue?command=add'
                + '&query=' + query
                + '&session-id=' + sessionId;

    http_get(this.host, this.port, path, callback);
};

daap.prototype.clearQueue = function (sessionId, callback) {
    var path = '/ctrl-int/1/cue?command=clear&session-id=' + sessionId;

    http_get(this.host, this.port, path, callback);
};

daap.prototype.pause = function (sessionId, callback) {
    var path = '/ctrl-int/1/pause?session-id=' + sessionId;

    http_get(this.host, this.port, path, callback);
};

daap.prototype.playPause = function (sessionId, callback) {
    var path = '/ctrl-int/1/playpause?session-id=' + sessionId;

    http_get(this.host, this.port, path, callback);
};

daap.prototype.playStatusUpdate = function (sessionId, revisionId, callback) {
    var options = {};
    var path = '/ctrl-int/1/playstatusupdate?revision-number=' + revisionId
                + '&session-id=' + sessionId;

    if (revisionId != 1) {
        options = {'timeout': this.timeout};
    }

    http_get(this.host, this.port, path, callback, options);
};

daap.prototype.next = function (sessionId, callback) {
    var path = '/ctrl-int/1/nextitem?session-id=' + sessionId;

    http_get(this.host, this.port, path, callback);
};

daap.prototype.previous = function (sessionId, callback) {
    var path = '/ctrl-int/1/previtem?session-id=' + sessionId;

    http_get(this.host, this.port, path, callback);
};

daap.prototype.getProperty = function (sessionId, properties, callback) {
    var path = '/ctrl-int/1/getproperty?properties='
                + properties.join() + '&session-id=' + sessionId;

    http_get(this.host, this.port, path, callback);
};

daap.prototype.setProperty = function (sessionId, properties, callback) {
    var parameters = '';

    for (var key in properties) {
        parameters += key + '=' + properties[key] + '&';
    }

    var path = '/ctrl-int/1/setproperty?' + parameters + 'session-id=' + sessionId;

    http_get(this.host, this.port, path, callback);
};

daap.prototype.containers = function (sessionId, databaseId, callback) {
    var path = '/databases/' + databaseId
                + '/containers?session-id=' + sessionId;

    http_get(this.host, this.port, path, callback);
};

daap.prototype.items = function (sessionId, databaseId, containerId, callback, meta) {
    meta = (meta == null) ?
                'dmap.itemname,dmap.itemid,daap.songartist,daap.songalbumartist,'
                + 'daap.songalbum,daap.songtime,daap.songartistid' : meta.join();

    var path = '/databases/' + databaseId + '/containers/'
                + containerId + '/items?session-id=' + sessionId
                + '&meta=' + meta;

    http_get(this.host, this.port, path, callback);
};

daap.prototype.item = function (sessionId, databaseId, trackID, callback, meta) {
    meta = (meta == null) ?
                'dmap.itemname,dmap.itemid,daap.songartist,daap.songalbumartist,'
                + 'daap.songalbum,daap.songtime,daap.songartistid' : meta.join();

    var path = '/databases/' + databaseId + '/items?session-id=' + sessionId
                + '&meta=' + meta + '&query=\'dmap.itemid:' + trackID + '\'';

    http_get(this.host, this.port, path, callback);
};

function parse_opt(opts, name, defaultvalue) {
    return opts && opts[name] !== undefined ? opts[name] : defaultvalue;
}

function daap(opts) {
    this.host = parse_opt(opts, 'host', '127.0.0.1');
    this.port = parse_opt(opts, 'port', 3689);
    this.timeout = parse_opt(opts, 'timeout', 1800000);
    this.paircode = parse_opt(opts, 'paircode', null);
}

module.exports = daap;
