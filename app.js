"use strict";

var DAAP = require('./lib/daap.js');

var controls = require('./lib/controls.js');
var media = require('./lib/media.js');
var settings = require('./lib/settings.js');
var speech = require('./lib/speech-input.js');

var config = {};
var daap = new DAAP();

function init() {
    settings.init(daap, config);

    media.init(daap);
    controls.init(daap);
    speech.init();
}

module.exports.init = init;
