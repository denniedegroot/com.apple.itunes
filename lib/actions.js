'use strict';

var controls = require('./controls.js');
var media = require('./media.js');

var daap = {};
var session = {};

/* Init */
exports.init = function (_daap, _session) {
    daap = _daap;
    session = _session;

    Homey.manager('flow').on('action.play', controls.action_play);
    Homey.manager('flow').on('action.pause', controls.action_pause);
    Homey.manager('flow').on('action.playpause', controls.action_playpause);
    Homey.manager('flow').on('action.previous', controls.action_previous);
    Homey.manager('flow').on('action.next', controls.action_next);
    Homey.manager('flow').on('action.volume', controls.action_volume);
    Homey.manager('flow').on('action.volume_down', controls.action_volume_down);
    Homey.manager('flow').on('action.volume_up', controls.action_volume_up);
    Homey.manager('flow').on('action.repeat', controls.action_repeat);
    Homey.manager('flow').on('action.shuffle', controls.action_shuffle);
    Homey.manager('flow').on('action.say_nowplaying', media.action_say_nowplaying);
    Homey.manager('flow').on('action.say_currentrating', media.action_say_currentrating);
    Homey.manager('flow').on('action.play_artist', media.action_play_artist);
    Homey.manager('flow').on('action.play_song', media.action_play_song);
    Homey.manager('flow').on('action.play_playlist', media.action_play_playlist);

    Homey.manager('flow').on('action.play_artist.library.autocomplete', media.get_libraries);
    Homey.manager('flow').on('action.play_artist.artist.autocomplete', media.get_artists);
    Homey.manager('flow').on('action.play_song.library.autocomplete', media.get_libraries);
    Homey.manager('flow').on('action.play_song.artist.autocomplete', media.get_artists);
    Homey.manager('flow').on('action.play_song.song.autocomplete', media.get_songs);
    Homey.manager('flow').on('action.play_playlist.playlist.autocomplete', media.get_libraries);
};
