"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getListen = function () {
    return function (pattern) {
        return new Promise(function (res) {
            listeners.push({ pattern: pattern, trigger: res });
        });
    };
};
var listeners = [];
exports.listenerMiddleware = function (api) { return function (next) { return function (action) {
    listeners.forEach(function (listener, i) {
        var pattern = typeof listener.pattern === "function" ? listener.pattern(action) : listener.pattern;
        if (listener.pattern === action.type) {
            listener.trigger(action);
            listeners.splice(i, 1);
        }
    });
    return next(action);
}; }; };
exports.coreListen = exports.getListen();
