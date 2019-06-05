"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var async_1 = require("./core/async");
var fetch_1 = require("./core/fetch");
var hux_IMPLEMENTATION_1 = require("./hux_IMPLEMENTATION");
var store_IMPLEMENTATION_1 = require("./store_IMPLEMENTATION");
var exampleFetchDefinitions = {
    getName: function (fetchParams) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, async_1.delay(5000)];
                case 1:
                    _a.sent();
                    return [2, "Duckless Carswell"];
            }
        });
    }); }
};
exports.exampleFetchReducer = fetch_1.getFetchReducer(exampleFetchDefinitions);
exports.exampleFetchHooks = fetch_1.getFetchHooks(exampleFetchDefinitions, store_IMPLEMENTATION_1.store, hux_IMPLEMENTATION_1.hux.useHuxSelector);
