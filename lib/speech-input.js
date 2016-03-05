"use strict";

var controls = require('./controls.js');
var media = require('./media.js');

/* Speech functions */
function process_speech(speech, callback) {
    Homey.log(speech);

    speech.triggers.forEach(function(trigger){
        if (trigger.id == 'pause') {
            controls.action_pause(function(error, response) {
                if (error)
                    callback(true, null);

                callback(null, true);
            });
        } else if (trigger.id == 'play') {
            controls.action_play(function(error, response) {
                if (error)
                    callback(true, null);

                callback(null, true);
            });
        } else if (trigger.id == 'nowplaying') {
            media.action_say_nowplaying(function(error, response) {
                if (error)
                    callback(true, null);

                callback(null, true);
            });
        } else {
            callback(true, null);
        }
    });
}

/* Init */
exports.init = function() {
    Homey.manager('speech-input').on('speech', process_speech);
}
