"use strict";

require('./lib/mock-homey.js');

var app = require('./app.js');

function init(){
    app.init();
    // Test any code here
}
init();