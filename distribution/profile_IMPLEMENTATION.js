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
    }, { name: "Duckless" }), data = _b.data, status = _b.status, fetch = _b.fetch, fetchCount = _b.fetchCount;
    switch (status) {
        case "error": {
            return React.createElement("div", { className: "profile" },
                React.createElement("h2", null, "Error"),
                React.createElement("p", null, "Your profile could not be fetched."),
                React.createElement("p", null,
                    "We have attempted to fetch it ",
                    fetchCount,
                    " times."),
                React.createElement("button", { onClick: function () { return fetch({ name: "Duckless" }); } }, "Try again"));
        }
        case "pending": {
            return React.createElement("div", { className: "profile" },
                React.createElement("h2", null, "Pending"),
                React.createElement("p", null, "Your profile is being fetched."));
        }
        case "success": {
            return React.createElement("div", { className: "profile" },
                React.createElement("h2", null, data));
        }
        default: {
            return React.createElement("div", { className: "profile" },
                React.createElement("h2", null, "Whoops!"));
        }
    }
};
