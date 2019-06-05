"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var fetch_IMPLEMENTATION_1 = require("./fetch_IMPLEMENTATION");
var useGetNameFetcher = fetch_IMPLEMENTATION_1.exampleFetchHooks.getName;
exports.Profile = function () {
    var _a = useGetNameFetcher({
        autoFetch: true,
        poll: false,
        cachingPolicy: "network-only",
        paramKey: "name"
    }), data = _a.data, status = _a.status, fetch = _a.fetch, fetchCount = _a.fetchCount;
    if (status === "error") {
        return React.createElement("div", { className: "profile" },
            React.createElement("h2", null, "Error"),
            React.createElement("p", null, "Your profile could not be fetched."),
            React.createElement("p", null,
                "We have attempted to fetch it ",
                fetchCount,
                " times."),
            React.createElement("button", { onClick: function () { return fetch({ name: "Duckless" }); } }, "Try again"));
    }
    if (status === "pending") {
        return React.createElement("div", { className: "profile" },
            React.createElement("h2", null, "Pending"),
            React.createElement("p", null, "Your profile is being fetched."));
    }
    if (status === "success") {
        return React.createElement("div", { className: "profile" },
            React.createElement("h2", null, data));
    }
};
