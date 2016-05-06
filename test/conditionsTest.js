// Mocks the global Homey object.
require('../lib/mock-homey.js');
var rewire = require('rewire');
var DAAP = rewire('../lib/daap.js');

var controls = rewire('../lib/controls.js');
var conditions = rewire('../lib/conditions.js');
var UTIL = require('./util.js');
var util = new UTIL(conditions, 'conditions');

// Initialize with fixed daap
var session = {id: 1};

conditions.init(new DAAP(), session);
controls.init(new DAAP(), session);

// stub internal function daap.playStatusUpdate()
// Simulates return of empty data from iTunes but no error occured during GET.
DAAP.__set__('daap.prototype.playStatusUpdate', function (sessionId, revisionId, callback) {
    callback(null, {});
});

/**
 * Basic tests, just calls internal functions and due to stub(s) expects an error and no result back.
 * This tests crash stability when empty data is returned.
 * @param test
 */
exports.song_playing = function (test) {
    util.nullTest('song_playing', 0, test);
};

exports.song_paused = function (test) {
    util.nullTest('song_paused', 0, test);
};

exports.current_song = function (test) {
    util.nullTest('current_song', 0, test);
};

exports.current_artist = function (test) {
    util.nullTest('current_artist', 0, test);
};

exports.current_stars = function (test) {
    util.nullTest('current_stars', 0, test);
};

/**
 * Simulates get_volume returning empty {} object from iTunes without GET error.
 * This happens when the paircode gets invalidated (when user makes iTunes 'forget' all remotes) during a session and volume() gets called.
 * @param test
 */
exports.volume = function (test) {
    conditions.__set__('controls', controls);
    controls.__set__('exports.get_volume', function (callback) {
        // error, volume
        callback(null, {});
    });

    var volume = conditions.__get__('volume');

    volume(function (error, response) {
        test.ok(error);
        test.ok(!response);
        test.done();
    }, null);
};
