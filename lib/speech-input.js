'use strict';

var controls = require('./controls.js');
var media = require('./media.js');

/* Speech functions */
function process_speech(speech, callback) {
    speech.triggers.forEach(function (trigger) {
        if (trigger.id == 'pause') {
            controls.action_pause(function (error, response) {
                if (error) {
                    return callback(true, null);
                }

                callback(null, true);
            });
        } else if (trigger.id == 'play') {
            controls.action_play(function (error, response) {
                if (error) {
                    return callback(true, null);
                }

                callback(null, true);
            });
        } else if (trigger.id == 'previous') {
            controls.action_previous(function (error, response) {
                if (error) {
                    return callback(true, null);
                }

                callback(null, true);
            });
        } else if (trigger.id == 'next') {
            controls.action_next(function(error, response) {
                if (error) {
                    return callback(true, null);
                }

                callback(null, true);
            });
        } else if (trigger.id == 'volume') {
            var volume = {};

            volume.volume_percent = Number(speech.transcript.replace(/^\D+|\D+$/g, ''));

            controls.action_volume(function (error, response) {
                if (error) {
                    return callback(true, null);
                }

                callback(null, true);
            }, volume);
        } else if (trigger.id == 'nowplaying') {
            media.action_say_nowplaying(function (error, response) {
                if (error) {
                    return callback(true, null);
                }

                callback(null, true);
            });
        } else {
            return callback(true, null);
        }
    });
}

/* Init */
exports.init = function () {
    Homey.manager('speech-input').on('speech', process_speech);
};
