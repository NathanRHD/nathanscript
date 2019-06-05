"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
exports.getActionCreators = function (actionDefinitions) {
    var actionCreators = Object.keys(actionDefinitions).reduce(function (actionCreators, key) {
        var _a;
        return tslib_1.__assign({}, actionCreators, (_a = {}, _a[key] = function (body) { return (tslib_1.__assign({ type: key }, body)); }, _a));
    }, {});
    return actionCreators;
};
exports.coreActionCreators = exports.getActionCreators({
    shiftGlobalError: {},
    setGlobalFetch: {},
    logout: {}
});
