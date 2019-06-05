"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCachingMiddleware = function (saveJson) {
    return function (api) { return function (next) { return function (action) {
        var getState = api.getState;
        var result = next(action);
        saveJson(getState());
        return result;
    }; }; };
};
