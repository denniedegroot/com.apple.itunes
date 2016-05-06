var rewire = require('rewire');
var UTIL = require('./util.js');
var DAAP = require('../lib/daap.js');

var session = {id: 1};
var media = rewire('../lib/media.js');
var util = new UTIL(media, 'media');

// Initialize with fixed daap
media.init(new DAAP({host: '0.0.0.0'}), session);

// function cache_items(type, dbid, itemid, callback) {

exports.cache_items = function (test) {
    util.nullTest('cache_items', 3, test);
};

/**
 * Sets caching to false and calls refresh_cache function, its expected to not crash or do anything in this case.
 * HOWEVER in the current implementation it still calls the next code snippet:
 *     setTimeout(function () {
 *       cache.songs = {};
 *       cache.artists = {};
 *       cache.songsid = [];
 *       cache.artistsid = [];
 *       exports.refresh_cache();
 *     }, cache_timeout);
 *
 * Firstly it exports the result of of fresh_cache() wich does not return anything. typo?
 * Second if caching is disabled, should it really start a timer?
 * @param test
 */
exports.refresh_cache = function (test) {
    Homey.manager('settings').set('settings', {cache_enabled: false});
    media.refresh_cache();
    test.fail('caching is disabled but it still starts a timeout function');
    test.done();
};

exports.filter_artists = function (test) {
    util.nullTest('filter_artists', 2, test);
};

exports.filter_songs = function (test) {
    util.nullTest('filter_songs', 2, test);
};

exports.get_libraries = function (test) {
    util.nullTest('get_libraries', 0, test);
};

/**
 * Runs get_artists and gives fixed arguments with an empty array as parameter 1
 * Not sure if Homey will ever pass an empty array to get_artists function. If not this test may need to be changed.
 * @param test
 */
exports.get_artists = function (test) {
    util.nullTest('get_artists', 0, test, null, {'1': []});
};

exports.get_songs = function (test) {
    util.nullTest('get_songs', 0, test, null, {'1': []});
};

// Actions i think always get an array from Homey atleast, so in the worst case an empty []

exports.action_say_nowplaying = function (test) {
    util.nullTest('action_say_nowplaying', 0, test, null, {'1': []});
};

exports.action_say_currentrating = function (test) {
    util.nullTest('action_say_currentrating', 0, test, null, {'1': []});
};

exports.action_play_artist = function (test) {
    util.nullTest('action_play_artist', 0, test, null, {'1': []});
};

exports.action_play_playlist = function (test) {
    util.nullTest('action_play_playlist', 0, test, null, {'1': []});
};

exports.action_play_song = function (test) {
    util.nullTest('action_play_song', 0, test, null, {'1': []});
};
