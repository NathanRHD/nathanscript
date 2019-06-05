"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var listen_1 = require("./listen");
exports.logoutReducerFactory = function (subReducer) {
    return function (state, action) {
        if (action.type === "logout") {
            return;
        }
        return subReducer(state, action);
    };
};
exports.listenForLogout = function () { return listen_1.coreListen("logout"); };
exports.throwOnLogout = function (executor) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var logoutPromise, e1, e2, logoutRace;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logoutPromise = exports.listenForLogout();
                e1 = executor.then(function (x) { return ({ kind: "exec", value: x }); });
                e2 = logoutPromise.then(function (x) { return ({ kind: "logout", value: x }); });
                return [4, Promise.race([e1, e2])];
            case 1:
                logoutRace = _a.sent();
                if (logoutRace.kind === "logout") {
                    executor.cancel();
                    throw new Error("Logged out!");
                }
                return [2];
        }
    });
}); };
