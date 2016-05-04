'use strict';

var controls = require('./controls.js');
var media = require('./media.js');

/* Local functions */
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
            return found = true;
        }
    });

    return found;
}

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
            if (speechContainsAny(speech, [__('common.disable'), __('common.off'), __('common.stop')])) {
                controls.action_repeat(function (error, response) {
                    if (error) {
                        return callback(true, null);
                    }

                    callback(null, true);
                }, {repeat: '0'});
            } else if (speechContainsAny(speech, [__('common.track'), __('common.song')])) {
                controls.action_repeat(function (error, response) {
                    if (error) {
                        return callback(true, null);
                    }

                    callback(null, true);
                }, {repeat: '1'});
            } else {
                controls.action_repeat(function (error, response) {
                    if (error) {
                        return callback(true, null);
                    }

                    callback(null, true);
                }, {repeat: '2'});
            }
        } else if (trigger.id == 'shuffle') {
            if (speechContainsAny(speech, [__('common.disable'), __('common.off'), __('common.stop')])) {
                controls.action_shuffle(function (error, response) {
                    if (error) {
                        return callback(true, null);
                    }

                    callback(null, true);
                }, {shuffle: '0'});
            } else {
                controls.action_shuffle(function (error, response) {
                    if (error) {
                        return callback(true, null);
                    }

                    callback(null, true);
                }, {shuffle: '1'});
            }
        } else {
            return callback(true, null);
        }
    });
}

/* Init */
exports.init = function () {
    Homey.manager('speech-input').on('speech', process_speech);
};
