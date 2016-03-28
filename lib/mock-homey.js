"use strict";

var Homey = {};

var manager = {};
manager.set = function(){};
manager.get = function(){};
manager.on = function(){};
manager.trigger = function(){};

manager.realtime = function(arg1, arg2) {
};
manager.say = function(text) {
    console.log("Homey says '" + text + "'");
};
Homey.manager = function(arg1) {
    return manager;
};

Homey.log = function(arg) {
    console.log(arg);
};

global.Homey = Homey;

global.__ = function(arg) {
    return 'mocked locale text'
};