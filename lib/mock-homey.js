"use strict";

var Homey = {};

var manager = {};
manager.set = function(){};
manager.get = function(){};
manager.on = function(){};
manager.trigger = function(){};

//var manager = nodemock.ignore('set');
//manager.ignore('get');
//manager.ignore('on');
//manager.ignore('trigger');
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