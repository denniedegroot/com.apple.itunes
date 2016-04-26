'use strict';

var DAAP = require('./lib/daap.js');

var controls = require('./lib/controls.js');
var media = require('./lib/media.js');
var settings = require('./lib/settings.js');
var session = require('./lib/session.js');
var speech = require('./lib/speech-input.js');

var triggers = require('./lib/triggers.js');
var conditions = require('./lib/conditions.js');
var actions = require('./lib/actions.js');

var daap = new DAAP();
var sessioninfo = {};

function init() {
    settings.init(daap, function () {
        session.init(daap, sessioninfo);
        //console.log(daap);

        media.init(daap, sessioninfo);
        controls.init(daap, sessioninfo);

        triggers.init(daap, sessioninfo);
        conditions.init(daap, sessioninfo);
        actions.init(daap, sessioninfo);

        speech.init();
    });
}

module.exports.init = init;
