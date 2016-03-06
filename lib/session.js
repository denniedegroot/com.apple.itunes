"use strict";

var extend = require('util')._extend;
var triggers = require('./triggers.js');

var daap = {};
var session = {};

/* Local functions */
function connect_itunes() {
    if (session.id == 0 || Object.keys(session).length == 0)
        open_session();

    setTimeout(function() {
        connect_itunes();
    }, 10000);
}

function open_session() {
    daap.login(function(error, response) {
        if (error) {
            Homey.log(error);
            return;
        }

        session.id = response['dmap.loginresponse']['dmap.sessionid'];
        subscribe_session();
    });
}

function close_session() {
    daap.logout(session.id, function(error, response) {
        if (error)
            Homey.log(error);
    });

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
                update_session(response);
                subscribe_session();
            }
        });
    });
}

function update_session(data) {
    if (session.info == undefined) {
        session.info = extend({}, data);
        session.previnfo = extend({}, session.info);
    }

    /* Sometimes we do not get all data we need back, so check if nowplayingids is present */
    if (data['dmcp.playstatus']['dacp.nowplayingids'] != undefined) {
        extend(session.previnfo, session.info);
        extend(session.info, data);

        triggers.process(session.info, session.previnfo);
    }
}

/* Init */
exports.init = function(_daap, _session) {
    daap = _daap;
    session = _session;

    connect_itunes();
}
