'use strict';

var daap = {};
var session = {};

/* Actions functions */
exports.get_volume = function (callback) {
    daap.getProperty(session.id, ['dmcp.volume'], function (error, response) {
        if (error) {
            return callback(error);
        }

        callback(null, response['dmcp.getpropertyresponse']['dmcp.volume']);
    });
};

exports.set_volume = function (volume, callback) {
    if (volume < 0) {
        volume = 0;
    } else if (volume > 100) {
        volume = 100;
    }

    daap.setProperty(session.id, {'dmcp.volume': volume}, function (error, response) {
        if (error) {
            return callback(error, false);
        }

        callback(null, true);
    });
};

exports.action_play = function (callback, args) {
    daap.playStatusUpdate(session.id, 1, function (error, response) {
        if (error) {
            return callback(error, false);
        }

        if ('dmcp.playstatus' in response &&
            'dacp.playerstate' in response['dmcp.playstatus']) {
            if (response['dmcp.playstatus']['dacp.playerstate'] != 4) {
                daap.playPause(session.id, function (error, response) {
                    if (error) {
                        return callback(error, false);
                    }

                    callback(null, true);
                });
            } else {
                return callback(null, true);
            }
        } else {
            return callback('undefined properties', false);
        }
    });
};

exports.action_pause = function (callback, args) {
    daap.playStatusUpdate(session.id, 1, function (error, response) {
        if (error) {
            return callback(error, false);
        }

        if ('dmcp.playstatus' in response &&
            'dacp.playerstate' in response['dmcp.playstatus']) {
            if (response['dmcp.playstatus']['dacp.playerstate'] == 4) {
                daap.playPause(session.id, function (error, response) {
                    if (error) {
                        return callback(error, false);
                    }

                    callback(null, true);
                });
            } else {
                return callback(null, true);
            }
        } else {
            return callback('undefined properties', false);
        }
    });
};

exports.action_playpause = function (callback, args) {
    daap.playPause(session.id, function (error, response) {
        if (error) {
            return callback(error, false);
        }

        callback(null, true);
    });
};

exports.action_previous = function (callback, args) {
    daap.previous(session.id, function (error, response) {
        if (error) {
            return callback(error, false);
        }

        callback(null, true);
    });
};

exports.action_next = function (callback, args) {
    daap.next(session.id, function (error, response) {
        if (error) {
            return callback(error, false);
        }

        callback(null, true);
    });
};

exports.action_volume = function (callback, args) {
    exports.set_volume(args.volume_percent, callback);
};

exports.action_volume_down = function (callback, args) {
    exports.get_volume(function (error, volume) {
        if (error) {
            return callback(error, false);
        }

        volume -= args.volume_down;
        exports.set_volume(volume, callback);
    });
};

exports.action_volume_up = function (callback, args) {
    exports.get_volume(function (error, volume) {
        if (error) {
            return callback(error, false);
        }

        volume += args.volume_up;
        exports.set_volume(volume, callback);
    });
};

exports.action_repeat = function (callback, args) {
    daap.setProperty(session.id, {'dacp.repeatstate': parseInt(args.repeat)}, function (error, response) {
        if (error) {
            return callback(error, false);
        }

        callback(null, true);
    });
};

exports.action_shuffle = function (callback, args) {
    daap.setProperty(session.id, {'dacp.shufflestate': parseInt(args.shuffle)}, function (error, response) {
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
