"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
exports.getHux = function (store) {
    var HuxContext = React.createContext(null);
    var useHuxSelector = function (selector) {
        var huxContext = React.useContext(HuxContext);
        var subscribe = huxContext.subscribe, getState = huxContext.getState;
        var select = function () { return selector(getState()); };
        var initial = select();
        var _a = React.useState(initial), value = _a[0], update = _a[1];
        var listener = function () {
            var next = select();
            if (next !== value) {
                update(next);
            }
        };
        React.useEffect(function () { return subscribe(listener); });
        return value;
    };
    var Provider = function (_a) {
        var children = _a.children;
        return React.createElement(HuxContext.Provider, { value: store }, children);
    };
    return {
        Provider: Provider,
        useHuxSelector: useHuxSelector
    };
};
