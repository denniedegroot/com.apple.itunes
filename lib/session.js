'use strict';

var extend = require('extend');
var triggers = require('./triggers.js');
var media = require('./media.js');

var daap = {};
var session = {};

/* Local functions */
function open_session() {
    daap.login(function (error, response) {
        if (error) {
            Homey.log(error);
            close_session();
            return;
        }

        if ('dmap.loginresponse'in response &&
            'dmap.sessionid' in response['dmap.loginresponse']) {
            session.id = response['dmap.loginresponse']['dmap.sessionid'];

            if (session.info == undefined) {
                daap.playStatusUpdate(session.id, 1, function (error, response) {
                    session.info = extend({}, response);
                    session.previnfo = extend({}, session.info);
                });

                media.refresh_cache();
            }

            subscribe_session();
        } else {
            close_session();
        }
    });
}

function close_session() {
    daap.logout(session.id, function (error, response) {
        if (error) {
            Homey.log(error);
        }
    });

    setTimeout(function () {
        open_session();
    }, 10000);

    session.id = 0;
}

function subscribe_session() {
    daap.playStatusUpdate(session.id, 1, function (error, response) {
        if (error) {
            Homey.log(error);
            close_session();

            return;
        }

        if ('dmcp.playstatus'in response &&
            'dmcp.serverrevision' in response['dmcp.playstatus']) {
            var revision = response['dmcp.playstatus']['dmcp.serverrevision'];

            daap.playStatusUpdate(session.id, revision, function (error, response) {
                if (error) {
                    Homey.log(error);
                    close_session();
                } else {
                    subscribe_session();

                    setTimeout(function () {
                        update_session();
                    }, 50);
                }
            });
        } else {
            close_session();
        }
    });
}

function update_session() {
    daap.playStatusUpdate(session.id, 1, function (error, response) {
        if (error) {
            Homey.log(error);
            return;
        }

        var merged_info = {};
        var merged_previnfo = {};

        extend(true, merged_previnfo, session.previnfo, session.info);
        extend(true, merged_info, session.info, response);

        extend(session.previnfo, merged_previnfo);
        extend(session.info, merged_info);

        triggers.process(session.info, session.previnfo);
    });
}

/* Init */
exports.init = function (_daap, _session) {
    daap = _daap;
    session = _session;

    open_session();
};
