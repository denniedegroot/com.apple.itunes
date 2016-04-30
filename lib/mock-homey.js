'use strict';

var Homey = {};
var manager = {};

manager.set = function () {
};
manager.get = function () {
};
manager.on = function () {
};
manager.trigger = function () {
};

manager.say = function (text) {
    console.log('Homey says: "' + text + '"');
};

Homey._settings = {};
Homey._events = {};
Homey.manager = function (arg) {
    switch (arg) {
    case 'settings':
        return {
            get: function (settingname) {
                return Homey._settings[settingname];
            },
            set: function (settingname, value) {
                Homey._settings[settingname] = value;
                if (Homey._events['set']) {
                    Homey._events['set'](value);
                }
            },
            on: function (eventName, func) {
                Homey._events[eventName] = func;
            }
        };
    case 'api':
        return {
            realtime: function (eventName, object) {
                if (Homey._events[eventName]) {
                    Homey._events[eventName](object);
                }
            }
        };
    }
    return manager;
};

Homey.log = function (arg) {
    console.log(arg);
};

global.Homey = Homey;

// Functioning english locale
var _ENlocale = require('../locales/en.json');

global.__ = function (arg, replaceWith) {
    if (_ENlocale) {
        var path = arg.split('.');
        var result;

        path.forEach(function (name) {
            if (!result) {
                result = _ENlocale[path[0]];
            } else {
                result = result[name];
            }
        });
        if (replaceWith) {
            for (var key in replaceWith) {
                if (!replaceWith.hasOwnProperty(key)) {
                    continue;
                }
                // skip prototype properties
                result = result.replace(/__[^_]*__/ig, replaceWith[key]);
            }
        }
        return result;
    } else {
        return arg;
    }
};
