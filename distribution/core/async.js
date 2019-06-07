"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
exports.delay = function (ms) {
    return new Promise(function (res) { return setTimeout(res, ms); });
};
exports.usePromiseCleanUp = function (promise) {
    var _a = React.useMemo(function () {
        var resolveCleanUp = null;
        var cleanUpPromise = new Promise(function (res) {
            resolveCleanUp = res;
        });
        return {
            resolveCleanUp: resolveCleanUp,
            cleanUpPromise: cleanUpPromise
        };
    }, []), cleanUpPromise = _a.cleanUpPromise, resolveCleanUp = _a.resolveCleanUp;
    React.useEffect(function () { return function () {
        promise && promise.cancel();
        resolveCleanUp();
    }; }, []);
    return cleanUpPromise;
};
function asyncForEach(array, callback) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var index;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    index = 0;
                    _a.label = 1;
                case 1:
                    if (!(index < array.length)) return [3, 4];
                    return [4, callback(array[index], index, array)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    index++;
                    return [3, 1];
                case 4: return [2];
            }
        });
    });
}
exports.asyncForEach = asyncForEach;
