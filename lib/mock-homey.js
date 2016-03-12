"use strict";

var nodemock = require("nodemock");

var Homey = {};

var manager = nodemock.ignore('set');
manager.ignore('get');
manager.ignore('on');
manager.realtime = function(arg1,arg2){
};
manager.say = function(text){
  console.log("Homey says '" + text + "'");
};

Homey.manager = function(arg1){
  return manager;
};
Homey.log = function(arg){
  console.log(arg);
};

global.Homey = Homey;