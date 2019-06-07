"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var redux_1 = require("redux");
var logout_1 = require("./core/logout");
var fetch_reducer_IMPLEMENTATION_1 = require("./fetch_IMPLEMENTATION/fetch-reducer_IMPLEMENTATION");
var listen_1 = require("./core/listen");
var local_storage_IMPLEMENTATION_1 = require("./local-storage_IMPLEMENTATION");
var subReducer = redux_1.combineReducers({
    fetch: fetch_reducer_IMPLEMENTATION_1.exampleFetchReducer
});
var reducer = logout_1.logoutReducerFactory(subReducer);
var middlewares = [
    local_storage_IMPLEMENTATION_1.localStorageCachingMiddleware,
    listen_1.listenerMiddleware
];
exports.store = redux_1.createStore(reducer, redux_1.applyMiddleware.apply(void 0, middlewares));
