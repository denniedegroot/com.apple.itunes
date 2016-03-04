"use strict";

var daap = {};

/* Actions functions */
function action_say_nowplaying(callback, args) {
    daap.login(function(error, response) {
        var session = response['dmap.loginresponse']['dmap.sessionid'];

        daap.playStatusUpdate(session, function(error, response) {
            if (error)
                callback(error, false);

            var song = response['dmcp.playstatus']['dacp.nowplayingname'];
            var artist = response['dmcp.playstatus']['dacp.nowplayingartist'];
            var say = __('actions.say_nowplaying').replace('${song}', song).replace('${artist}', artist);

            Homey.manager('speech-output').say(say);
            callback(null, true);
        });
    });
}

/* Init */
exports.init = function(_daap) {
    daap = _daap;

    Homey.manager('flow').on('action.say_nowplaying', action_say_nowplaying);
}
