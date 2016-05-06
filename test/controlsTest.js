// Mocks the global Homey object.
require('../lib/mock-homey.js');
var rewire = require('rewire');

var daap = rewire('../lib/daap.js');
var controls = rewire('../lib/controls.js');
var session = {id: 1};

var UTIL = require('./util.js');
var util = new UTIL(controls, 'controls');

// stub internal function daap.playStatusUpdate()
// Simulates return of empty data from iTunes but no error occured during GET.
// This happens when paircode is no longer valid, iTunes will return empty data.
daap.__set__('daap.prototype.getProperty', function (sessionId, properties, callback) {
    callback(null, {});
});

// Initialize with fixed daap
controls.init(new daap(), session);

/**
 * Basic tests, just calls internal functions and due to stub(s) expects an error and no result back.
 * This tests crash stability when empty data is returned.
 * @param test
 */
exports.get_volume = function (test) {
    util.nullTest('get_volume', 0, test);
};

// set_volume implementation in controls.js does not account for invalid volume values and tries to set the volume anyway.
// on wrong values or errors false is expected.
exportsset_volume = function (test) {
    util.nullTest('set_volume', 1, test, false);
};
