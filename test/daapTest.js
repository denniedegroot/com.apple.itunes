// Test daap stability when passing null parameters

var DAAP = require('../lib/daap.js');
var daap = new DAAP({host: '0.0.0.0'});

var UTIL = require('./util.js');
var util = new UTIL(daap, 'daap');

exports.serverInfo = function (test) {
    util.nullTest('serverInfo', 0, test);
};

exports.items1 = function (test) {
    util.nullTest('items', 3, test);
};

exports.setProperty = function (test) {
    util.nullTest('setProperty', 2, test);
};

exports.playStatusUpdate = function (test) {
    util.nullTest('playStatusUpdate', 2, test);
};
