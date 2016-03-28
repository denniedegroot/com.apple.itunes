'use strict';

var net = require('net');
var mdns = require('mdns-js');
var port = 50508;

Buffer.prototype.random = function (min, max) {
    return Math.floor((Math.random() * max) + min);
};

Buffer.prototype.toHexadecimal = function () {
    var result = '';
    var len = this.length;

    for (var i = 0; i < len; i++) {
        var byte = this.readUInt8(i).toString(16).toUpperCase();

        result += (byte.length < 2) ? '0' + byte : byte;
    }

    return result;
};

Buffer.prototype.nextBytes = function () {
    var len = this.length;

    for (var i = 0; i < len; i++) {
        this.writeUInt8(this.random(1, 255), i);
    }
};

Buffer.prototype.arraycopy = function (srcBuffer, srcPos, destPos, length) {
    srcBuffer.copy(this, destPos, srcPos, length);
};

var pairingBytes = new Buffer(
    [0x63, 0x6d, 0x70, 0x61, 0x00, 0x00, 0x00, 0x3a, 0x63, 0x6d, 0x70,
     0x67, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
     0x00, 0x01, 0x63, 0x6d, 0x6e, 0x6d, 0x00, 0x00, 0x00, 0x16, 0x41,
     0x64, 0x6d, 0x69, 0x6e, 0x69, 0x73, 0x74, 0x72, 0x61, 0x74, 0x6f,
     0x72, 0xe2, 0x80, 0x99, 0x73, 0x20, 0x69, 0x50, 0x6f, 0x64, 0x63,
     0x6d, 0x74, 0x79, 0x00, 0x00, 0x00, 0x04, 0x69, 0x50, 0x6f, 0x64]
);

var pair = {
    code: function (callback) {
        mdns.excludeInterface('0.0.0.0');
        var service = mdns.createAdvertisement(mdns.tcp('_touch-remote'), port, {
            name: 'Homey',
            txt: {
                'DvNm': 'Homey',
                'RemV': '10000',
                'DvTy': 'iPod',
                'RemN': 'Remote',
                'txtvers': '1',
                'Pair': 'D34DB33FD34DB33F'
            }
        });

        service.start();

        var server = net.createServer(function (socket) {
            socket.on('data', function (data) {
                var code = new Buffer(8);

                code.nextBytes();
                pairingBytes.arraycopy(code, 0, 16, 8);

                var header = new Buffer('HTTP/1.1 200 OK\r\nContent-Length: ' + pairingBytes.length + '\r\n\r\n');
                var reply = new Buffer(header.length + pairingBytes.length);

                reply.arraycopy(header, 0, 0, header.length);
                reply.arraycopy(pairingBytes, 0, header.length, pairingBytes.length);

                socket.write(reply);
                server.close();

                var ip = socket.remoteAddress;
                var indexOfColon = socket.remoteAddress.lastIndexOf(':');

                ip = ip.substring(indexOfColon + 1, ip.length);
                code = '0x' + code.toHexadecimal();

                setTimeout(function () {
                    service.stop();
                    callback(null, {'host': ip, 'paircode': code});
                }, 1000);
            });

            socket.on('error', function (error) {
                service.stop();
                callback(error);
            });
        }).listen(port);

        server.on('error', function (error) {
            service.stop();
            callback(error);
        });
    },

    discoverserver: function () {
        mdns.excludeInterface('0.0.0.0');

        var foundServers = [];
        var browser = mdns.createBrowser(mdns.tcp('_touch-able'));

        browser.on('ready', function onReady() {
            browser.discover();
        });

        browser.on('update', function onUpdate(data) {
            if (data.addresses && data.txt) {
                var db = {};

                for (var key in data.txt) {
                    if (data.txt[key].indexOf('DbId=') > -1) {
                        db.dbid = data.txt[key].replace('DbId=', '');
                    } else if (data.txt[key].indexOf('CtlN=') > -1) {
                        db.dbname = data.txt[key].replace('CtlN=', '');
                    }
                }

                db.host = data.addresses[0];
                foundServers.push(db);
            }
        });

        setTimeout(function onTimeout() {
            var host_online = false;
            var save_config = false;
            var config = Homey.manager('settings').get('settings');

            if (config == undefined) {
                browser.stop();
                return;
            }

            foundServers.forEach(function (object) {
                if (config.host && config.host == object.host) {
                    if (config.dbid != object.dbid) {
                        config.dbid = object.dbid;
                        save_config = true;
                    }

                    config.dbname = object.dbname;
                    host_online = true;
                } else if ((config.dbid && config.dbid == object.dbid) &&
                    config.host != object.host && !host_online) {
                    config.host = object.host;
                    config.dbname = object.dbname;
                    save_config = true;
                }
            });

            if (save_config) {
                Homey.manager('settings').set('settings', config);
            }

            browser.stop();
        }, 2500);
    }
};

module.exports = pair;
