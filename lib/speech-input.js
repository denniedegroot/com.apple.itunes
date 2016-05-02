'use strict';

var controls = require('./controls.js');
var media = require('./media.js');

/* Speech functions */
function process_speech(speech, callback) {
    var config = Homey.manager('settings').get('settings');

    if (config.speech_enabled == false) {
        return callback(true, null);
    }

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
            controls.action_next(function (error, response) {
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
        } else if (trigger.id == 'repeat') {
            Homey.log(speech.transcript);
            if (speechContainsAny(speech, [__('common.disable'), __('common.off'), __('common.stop')])) {
                return setRepeat(callback, '0');
            } else if (speechContainsAny(speech, [__('common.track'), __('common.song')])) {
                return setRepeat(callback, '1');
            } else {
                return setRepeat(callback, '2');
            }
        } else if (trigger.id == 'shuffle') {
            Homey.log(speech.transcript);
            if (speechContainsAny(speech, [__('common.disable'), __('common.off'), __('common.stop')])) {
                return setShuffle(callback, '0');
            } else {
                return setShuffle(callback, '1');
            }
        } else {
            return callback(true, null);
        }
    });
}

function setRepeat(callback, textValue) {
    media.action_set_repeat(function (error, response) {
        if (error) {
            return callback(true, null);
        }

        callback(null, true);
    }, {repeat: textValue});
}

function setShuffle(callback, textValue) {
    media.action_set_shuffle(function (error, response) {
        if (error) {
            return callback(true, null);
        }

        callback(null, true);
    }, {shuffle: textValue});
}

function speechContains(speech, str) {
    var text = speech.transcript;
    var startIndex = text.indexOf(str);

    if (startIndex == -1) {
        return false;
    }
    var endIndex = startIndex + str.length;

    if (endIndex < text.length) {
        // Check after word for whitespace
        if (!/[^\S]/.test(text[endIndex])) {
            return false;
        }
    }

    if (startIndex != 0) {
        // Check in front of word for whitespace
        return /[^\S]/.test(text[startIndex - 1]);
    } else {
        return true;
    }
}

function speechContainsAny(speech, textArray) {
    var found = false;

    textArray.forEach(function (text) {
        if (speechContains(speech, text)) {
            found = true;
            return true;
        }
    });
    return found;
}

/* Init */
exports.init = function () {
    Homey.manager('speech-input').on('speech', process_speech);
};
