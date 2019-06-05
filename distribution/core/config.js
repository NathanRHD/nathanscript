"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fetch_1 = require("./fetch");
var globalConfig = {
    fetch: {
        paramKey: fetch_1.defaultKey,
        autoFetch: true,
        poll: false,
        cachingPolicy: "network-first"
    }
};
exports.setGlobalConfig = function (newConfig) {
    globalConfig = newConfig;
};
exports.getGlobalConfig = function () { return globalConfig; };
