"use strict";

var url = require('url');
var http = require('http');
var parser = require('./daap-decoder.js');

function http_get(host, port, path, callback) {
    http.get({
        host: host,
        port: port,
        path: path,
        headers: {'Viewer-Only-Client': '1'},
        agent: false
    }, function(response) {
        var data = [];

        response.on('data', function(chunk) {
            data.push(chunk);
        });

        response.on('end', function() {
            try {
                var ret = parser.decode(Buffer.concat(data), true);
                callback(null, ret);
            } catch (error) {
                callback(error);
            }
        });

        response.on('error', function(error) {
            callback(error);
        });
    });
}

daap.prototype.serverInfo = function(callback) {
    var path = 'server-info';
    http_get(this.host, this.port, path, callback);
}

daap.prototype.login = function(callback) {
    var path = 'login?pairing-guid=' + this.pairingCode;
    http_get(this.host, this.port, path, callback);
}

daap.prototype.databases = function(sessionId, callback) {
    var path = 'databases?session-id=' + sessionId;
    http_get(this.host, this.port, path, callback);
}

daap.prototype.play = function(sessionId, songId, callback) {
    var href = url.parse('ctrl-int/1/playqueue-edit?'
                + 'command=add&query=\'dmap.itemid:' + songId + '\''
                + '&sort=name&mode=1&session-id=' + sessionId);

    var path = decodeurlComponent(href.path);
    http_get(this.host, this.port, path, callback);
}

daap.prototype.pause = function(sessionId, callback) {
    var path = 'ctrl-int/1/pause?session-id=' + sessionId;
    http_get(this.host, this.port, path, callback);
}

daap.prototype.playPause = function(sessionId, callback) {
    var path = 'ctrl-int/1/playpause?session-id=' + sessionId;
    http_get(this.host, this.port, path, callback);
}

daap.prototype.playStatusUpdate = function(sessionId, callback) {
    var path = 'ctrl-int/1/playstatusupdate?session-id=' + sessionId;
    http_get(this.host, this.port, path, callback);
}

daap.prototype.next = function(sessionId, callback) {
    var path = 'ctrl-int/1/nextitem?session-id=' + sessionId;
    http_get(this.host, this.port, path, callback);
}

daap.prototype.previous = function(sessionId, callback) {
    var path = 'ctrl-int/1/previtem?session-id=' + sessionId;
    http_get(this.host, this.port, path, callback);
}

daap.prototype.getProperty = function(sessionId, properties, callback) {
    var path = 'ctrl-int/1/getproperty?properties='
                + properties.join() + '&session-id=' + sessionId;
    http_get(this.host, this.port, path, callback);
}

daap.prototype.setProperty = function(sessionId, properties, callback) {
    var parameters = '';

    for (var key in properties)
        parameters += key + '=' + properties[key] + '&';

    var path = 'ctrl-int/1/setproperty?' + parameters + 'session-id=' + sessionId;
    http_get(this.host, this.port, path, callback);
}

daap.prototype.containers = function(sessionId, databaseId, callback) {
    var path = 'databases/' + databaseId
                + '/containers?session-id=' + sessionId;
    http_get(this.host, this.port, path, callback);
}

daap.prototype.items = function(sessionId, databaseId, containerId, callback, meta) {
    meta = (meta == null) ?
                'dmap.itemname,dmap.itemid,daap.songartist,daap.songalbumartist,'
                + 'daap.songalbum,daap.songtime,daap.songartistid' : meta.join();

    var path = 'databases/' + databaseId + '/containers/'
                + containerId + '/items?session-id=' + sessionId
                + '&meta=' + meta;

    http_get(this.host, this.port, path, callback);
}

function parse_opt(opts, name, defaultvalue) {
    return opts && opts[name] !== undefined ? opts[name] : defaultvalue;
}

function daap(opts) {
    this.host = parse_opt(opts, 'host', '127.0.0.1');
    this.port = parse_opt(opts, 'port', 3689);
    this.paircode = parse_opt(opts, 'paircode', null);
}

module.exports = daap;
