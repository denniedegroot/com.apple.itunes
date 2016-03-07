"use strict";

var extend = require('util')._extend;
var triggers = require('./triggers.js');

var daap = {};
var session = {};

/* Local functions */
function open_session() {
    daap.login(function(error, response) {
        if (error) {
            Homey.log(error);
            close_session();
            return;
        }

        session.id = response['dmap.loginresponse']['dmap.sessionid'];

        if (session.info == undefined) {
            daap.playStatusUpdate(session.id, 1, function(error, response) {
                session.info = extend({}, response);
                session.previnfo = extend({}, session.info);
            });
        }

        subscribe_session();
    });
}

function close_session() {
    daap.logout(session.id, function(error, response) {
        if (error)
            Homey.log(error);
    });

    setTimeout(function() {
        open_session();
    }, 10000);

    session.id = 0;
}

function subscribe_session() {
    daap.playStatusUpdate(session.id, 1, function(error, response) {
        if (error) {
            Homey.log(error);
            close_session();

            return;
        }

        var revision = response['dmcp.playstatus']['dmcp.serverrevision'];
        daap.playStatusUpdate(session.id, revision, function(error, response) {
            if (error) {
                Homey.log(error);
                close_session();
            } else {
                update_session();
                subscribe_session();
            }
        });
    });
}

function update_session() {
    daap.playStatusUpdate(session.id, 1, function(error, response) {
        if (error) {
            Homey.log(error)
        } else {
            extend(session.previnfo, session.info);
            extend(session.info, response);

            triggers.process(session.info, session.previnfo);
        }
    });
}

/* Init */
exports.init = function(_daap, _session) {
    daap = _daap;
    session = _session;

    open_session();
}
