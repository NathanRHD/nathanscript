"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var async_1 = require("./async");
var logout_1 = require("./logout");
var actions_1 = require("./actions");
var config_1 = require("./config");
exports.defaultKey = "__DEFAULT";
exports.getFetchReducer = function (fetchDefinitions) {
    var initialState = Object.keys(fetchDefinitions).reduce(function (initialState, fetchKey) {
        var _a;
        return tslib_1.__assign({}, initialState, (_a = {}, _a[fetchKey] = {}, _a));
    }, {});
    return function (state, action) {
        var _a, _b, _c;
        if (state === void 0) { state = initialState; }
        switch (action.type) {
            case "setGlobalFetch": {
                var fetchKey = action.fetchKey, paramKey = action.paramKey, paramValue = action.paramValue, data = action.data, error = action.error, isPending = action.isPending;
                return tslib_1.__assign({}, state, (_a = {}, _a[fetchKey] = tslib_1.__assign({}, state.fetch[fetchKey], (_b = {}, _b[paramKey] = (_c = {},
                    _c[paramValue] = { data: data, error: error, isPending: isPending },
                    _c), _b)), _a));
            }
            default: {
                return state;
            }
        }
    };
};
var getFetcher = function (store, fetchKey, fetcher) {
    var dispatch = store.dispatch;
    return function (params, config) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var data, cachingPolicy, paramKey, paramValue, getFragment, error_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cachingPolicy = config.cachingPolicy, paramKey = config.paramKey;
                    paramValue = paramKey === exports.defaultKey ? exports.defaultKey : params[paramKey];
                    getFragment = function (state) { return state && state.fetch[fetchKey][paramKey][paramValue]; };
                    if (cachingPolicy === "cache-first" && !!getFragment(store.getState()).data) {
                        return [2, getFragment(store.getState()).data];
                    }
                    dispatch(actions_1.coreActionCreators.setGlobalFetch({
                        fetchKey: fetchKey,
                        paramKey: paramKey,
                        paramValue: paramValue,
                        data: cachingPolicy === "network-only" ?
                            null
                            :
                                getFragment(store.getState()).data,
                        error: cachingPolicy === "network-only" ?
                            null
                            :
                                getFragment(store.getState()).error,
                        isPending: true
                    }));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4, fetcher(params)];
                case 2:
                    data = _a.sent();
                    dispatch(actions_1.coreActionCreators.setGlobalFetch({ fetchKey: fetchKey, paramKey: paramKey, paramValue: paramValue, data: data, error: null, isPending: false }));
                    return [2, data];
                case 3:
                    error_1 = _a.sent();
                    dispatch(actions_1.coreActionCreators.setGlobalFetch({ fetchKey: fetchKey, paramKey: paramKey, paramValue: paramValue, data: null, error: error_1, isPending: false }));
                    if (cachingPolicy === "network-only") {
                        throw error_1;
                    }
                    return [3, 5];
                case 4: return [2, data];
                case 5: return [2];
            }
        });
    }); };
};
exports.getFetchHooks = function (fetchDefinitions, store, useHuxSelector) {
    var fetchers = Object.keys(fetchDefinitions).reduce(function (fetchers, fetchKey) {
        var _a;
        var fetcherDefinition = fetchDefinitions[fetchKey];
        var fetcher = getFetcher(store, fetchKey, fetcherDefinition);
        var useFetcher = function (config, initialParams) {
            var _a = React.useState(0), fetchCount = _a[0], setFetchCount = _a[1];
            var _b = React.useState(), finalParams = _b[0], setFinalParams = _b[1];
            var promise = React.useRef(Promise.resolve());
            var globalConfig = config_1.getGlobalConfig();
            config = config ? tslib_1.__assign({}, globalConfig.fetch, config) : globalConfig.fetch;
            var paramKey = config.paramKey || exports.defaultKey;
            var paramValue = finalParams && config.paramKey ? finalParams[config.paramKey] : null;
            var asyncMiddlewares = React.useMemo(function () { return (config.middlewares || []).concat([
                logout_1.throwOnLogout
            ]); }, [config.middlewares]);
            var runMiddlewares = React.useCallback(function (initialPromise) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var prev, _i, asyncMiddlewares_1, middleware;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            prev = initialPromise;
                            _i = 0, asyncMiddlewares_1 = asyncMiddlewares;
                            _a.label = 1;
                        case 1:
                            if (!(_i < asyncMiddlewares_1.length)) return [3, 4];
                            middleware = asyncMiddlewares_1[_i];
                            return [4, middleware(prev)];
                        case 2:
                            prev = _a.sent();
                            _a.label = 3;
                        case 3:
                            _i++;
                            return [3, 1];
                        case 4: return [2, prev];
                    }
                });
            }); }, [asyncMiddlewares]);
            var fetch = React.useCallback(function (fetchParams) {
                setFinalParams(fetchParams);
                setFetchCount(fetchCount + 1);
                return promise.current;
            }, [setFetchCount, fetchCount, promise]);
            React.useEffect(function () {
                setFinalParams(initialParams);
            }, [initialParams]);
            React.useEffect(function () {
                if ((fetchCount !== 0 || (fetchCount === 0 && config.autoFetch)) && finalParams) {
                    promise.current = fetcher(finalParams, config);
                    promise.current = runMiddlewares(promise.current);
                }
            }, [finalParams]);
            async_1.usePromiseCleanUp(promise.current);
            var state = useHuxSelector(function (state) { return ((paramKey === exports.defaultKey) || !paramValue) ?
                state && state.fetch[fetchKey][paramKey].__DEFAULT
                :
                    state && state.fetch[fetchKey][paramKey][paramValue]; });
            return tslib_1.__assign({}, state, { status: state ?
                    (state.data ? "success" : state.error ? "error" : "pending")
                    :
                        null, fetchCount: fetchCount,
                fetch: fetch });
        };
        return tslib_1.__assign({}, fetchers, (_a = {}, _a[fetchKey] = useFetcher, _a));
    }, {});
    return fetchers;
};
