"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var fetch_hooks_IMPLEMENTATION_1 = require("./fetch_IMPLEMENTATION/fetch-hooks_IMPLEMENTATION");
var useGetNameFetcher = fetch_hooks_IMPLEMENTATION_1.exampleFetchHooks.getName;
exports.Profile = function (_a) {
    var _b = useGetNameFetcher({
        autoFetch: true,
        poll: false,
        cachingPolicy: "network-only",
        paramKey: "name"
    }, { name: "Duckless" }), data = _b.data, error = _b.error, isPending = _b.isPending, fetch = _b.fetch, fetchCount = _b.fetchCount;
    if (error) {
        return React.createElement("div", { className: "profile" },
            React.createElement("h2", null, "Error"),
            React.createElement("p", null, "Your profile could not be fetched."),
            React.createElement("p", null,
                "We have attempted to fetch it ",
                fetchCount,
                " times."),
            React.createElement("button", { onClick: function () { return fetch({ name: "Duckless" }); } }, "Try again"));
    }
    if (isPending) {
        return React.createElement("div", { className: "profile" },
            React.createElement("h2", null, "Pending"),
            React.createElement("p", null, "Your profile is being fetched."));
    }
    if (data) {
        return React.createElement("div", { className: "profile" },
            React.createElement("h2", null, "Results"),
            data && data.results.map(function (result) { return React.createElement("p", null, JSON.stringify(result)); }));
    }
    return React.createElement("div", { className: "profile" },
        React.createElement("h2", null, "Whoops!"));
};
