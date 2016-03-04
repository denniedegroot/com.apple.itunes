"use strict";

var DAAP = require('./lib/daap.js');

var media = require('./lib/media.js');
var controls = require('./lib/controls.js');
var settings = require('./lib/settings.js');

var config = {};
var daap = new DAAP();

function init() {
    settings.init(daap, config);

    media.init(daap);
    controls.init(daap);
}

module.exports.init = init;
