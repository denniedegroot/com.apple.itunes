"use strict";

var DAAP = require('./lib/daap.js');
var controls = require('./lib/controls.js');
var settings = require('./lib/settings.js');

var config = {};
var daap = new DAAP();

function init() {
    settings.init(daap, config);
    controls.init(daap);
}

module.exports.init = init;
