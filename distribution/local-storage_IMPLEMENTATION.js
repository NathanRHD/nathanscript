"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cache_1 = require("./core/cache");
var REDUX_STATE_LOCAL_STORAGE_KEY = "REDUX_STATE";
exports.localStorageCachingMiddleware = cache_1.getCachingMiddleware(function (json) {
    localStorage.setItem(REDUX_STATE_LOCAL_STORAGE_KEY, JSON.stringify(json));
});
