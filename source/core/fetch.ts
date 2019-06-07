import * as React from "react"

import { usePromiseCleanUp } from './async'
import { ThenParameters, ValueOf, NotNulled } from './types';
import { throwOnLogout } from './logout'
import { CoreActionUnion, coreActionCreators } from './actions'
import { Store, Middleware, AnyAction, Reducer } from 'redux'
import { getGlobalConfig } from './config';

type FetchStatus = "pending" | "success" | "error"

export const defaultKey = "__DEFAULT"
type DefaultKey = typeof defaultKey

type FetchError = {}

type CachingPolicy =
    // if the request has already been made, don't remake a network request
    "cache-first" |

    /**
     * @todo comment later
     */
    "network-first" |

    // don't use the cached data whilst pending, don't put the result of the network request into the cache
    "network-only"

export type FetchStateFragment<Data> = {
    data: Data | null
    error: FetchError | null
    isPending: boolean
}

type FetchParamsBase = { [paramKey: string]: string }

type FetchDefinitionsBase<FetchParams extends FetchParamsBase> = { [fetchKey: string]: (fetchParams: FetchParams) => Promise<any> }

type FetchStateBase<
    FetchParams extends FetchParamsBase,
    FetchDefinitions extends FetchDefinitionsBase<FetchParams>
    > = {
        fetch: {
            [FetchKey in keyof FetchDefinitions]: {
                [ParamKey in keyof FetchParams | DefaultKey]: {
                    [ParamValue in ValueOf<FetchParams> | DefaultKey]: FetchStateFragment<ThenParameters<ReturnType<FetchDefinitions[FetchKey]>>>
                }
            }
        }
    } | undefined

export const getFetchReducer = <
    FetchParams extends FetchParamsBase,
    FetchDefinitions extends FetchDefinitionsBase<FetchParams>
>(fetchDefinitions: FetchDefinitions): Reducer => {

    const initialState = Object.keys(fetchDefinitions).reduce((initialState, fetchKey) => {
        return {
            ...initialState,
            [fetchKey]: {}
        }
    }, {}) as NotNulled<FetchStateBase<FetchParams, FetchDefinitions>>["fetch"]

    return (state: NotNulled<FetchStateBase<FetchParams, FetchDefinitions>>["fetch"] = initialState, action: CoreActionUnion) => {
        switch (action.type) {
            case "setGlobalFetch": {
                const { fetchKey, paramKey, paramValue, data, error, isPending } = action
                return {
                    ...(state || {}),
                    [fetchKey]: {
                        // this is unfortunate
                        ...(
                            (state &&
                                state.fetch &&
                                state.fetch[fetchKey as string])
                            ||
                            {}
                        ),
                        [paramKey]: {
                            [paramValue]: { data, error, isPending }
                        }
                    }
                }
            }
            default: {
                return state
            }
        }
    }
}

/**
 * all other effects related to asynchronous flow should be handled in hooks that consume global fetch! (this will
 * effectively replace sagas, and provide a similar experience to using graphql!)
 * @param store
 * @param fetchKey
 * @param fetcher 
 */
const getFetcher = <
    FetchParams extends FetchParamsBase,
    FetchDefinitions extends FetchDefinitionsBase<FetchParams>,
    FetchState extends FetchStateBase<FetchParams, FetchDefinitions>,
    FetchStore extends Store<FetchState, AnyAction>,
    Data
>(store: FetchStore, fetchKey: keyof FetchDefinitions, fetcher: (fetchParams: FetchParams) => Promise<Data>) => {
    const { dispatch } = store

    // this is not a hook and so cannot use useHux to get the state and dispatcher!
    return async (params: FetchParams, config: FetchConfig<FetchParams>) => {
        let data

        const { cachingPolicy, paramKey } = config

        const paramValue = paramKey === defaultKey ? defaultKey : params[paramKey]

        const getFragment = (state: FetchState) => state &&
            state.fetch[fetchKey] &&
            state.fetch[fetchKey][paramKey] &&
            state.fetch[fetchKey][paramKey][paramValue]

        // return data immediately if present and using "cache-first" policy
        if (cachingPolicy === "cache-first" && !!getFragment(store.getState()).data) {
            return getFragment(store.getState()).data
        }

        // refactor logic _into_ reducer!
        dispatch(coreActionCreators.setGlobalFetch({
            fetchKey,
            paramKey,
            paramValue,

            // reset cached data if cache isn't used
            // arguably this should be kept in the store regardless but not returned from the hook!
            data: cachingPolicy === "network-only" ?
                null
                :
                getFragment(store.getState()).data,

            error: cachingPolicy === "network-only" ?
                null
                :
                getFragment(store.getState()).error,

            isPending: true
        }))

        try {
            data = await fetcher(params)
            dispatch(coreActionCreators.setGlobalFetch({ fetchKey, paramKey, paramValue, data, error: null, isPending: false }))

            return data
        }

        catch (error) {
            dispatch(coreActionCreators.setGlobalFetch({ fetchKey, paramKey, paramValue, data: null, error, isPending: false }))

            if (cachingPolicy === "network-only") {
                throw error
            }
        }

        finally {
            return data
        }
    }
}

// Promise can't be typed with data, as it goes through async middleware
type AsyncMiddleware = (promise: Promise<any>) => Promise<any>

export type FetchConfig<Params extends {}> = {
    paramKey: keyof Params | DefaultKey
    autoFetch: boolean,
    poll: boolean,
    cachingPolicy: CachingPolicy,
    middlewares?: AsyncMiddleware[]
}

type FetchHookResult<Params extends {}, Data> = FetchStateFragment<Data> & {
    // write documentation on using isPending vs status
    status: FetchStatus

    fetchCount: number

    // Promise returned from AsyncMiddleware
    fetch: (params: Params) => Promise<any>
}

type FetchHook<Params extends {}, Data> = (
    config: FetchConfig<Params>,
    initialParams?: Params
) => FetchHookResult<Params, Data>

/**
 * this will wrap your network request fetcher so that the status/response is recorded in the global reducer this state
 * is available through context across the entire application so it can inform logic around when/ if to refetch data,
 * show loading spinners, etc. this is seperate from the actual asynchronous flow, which should be based on the promises
 * themselves!
 * 
 * @param fetchDefinitions 
 * @param store
 * @param useHuxSelector
 * 
 * @see getHux
 * 
 * @todo simplify generics?
 * @todo check how strict these typings actually are
 * @todo look into using opaque types for strings
 */
export const getFetchHooks = <
    FetchParams extends FetchParamsBase,
    FetchDefinitions extends FetchDefinitionsBase<FetchParams>
>(
    fetchDefinitions: FetchDefinitions,
    store: Store<FetchStateBase<FetchParams, FetchDefinitions>, AnyAction>,
    useHuxSelector: <SelectedState>(selector: (state: FetchStateBase<FetchParams, FetchDefinitions>) => SelectedState) => SelectedState
) => {
    type FetchHooks = {
        [FetchKey in keyof FetchDefinitions]: FetchHook<Parameters<FetchDefinitions[FetchKey]>[0], ThenParameters<ReturnType<FetchDefinitions[FetchKey]>>>
    }

    type FetchState = FetchStateBase<FetchParams, FetchDefinitions>
    type FetchStore = Store<FetchState, AnyAction>

    const fetchers = (Object.keys(fetchDefinitions) as (keyof FetchDefinitions)[]).reduce<FetchHooks>((fetchers, fetchKey) => {
        const fetcherDefinition = fetchDefinitions[fetchKey]

        type Data = ThenParameters<ReturnType<typeof fetcherDefinition>>

        const fetcher = getFetcher<FetchParams, FetchDefinitions, FetchState, FetchStore, Data>(store, fetchKey, fetcherDefinition)

        /**
         * @param config any config values provided here will override the fetchHook config provided globally
         * @param initialParams
         * @returns SCREAMS :O !!!
         */
        const useFetcher: FetchHook<FetchParams, Data> = (config: FetchConfig<FetchParams>, initialParams?: FetchParams) => {
            const [fetchCount, setFetchCount] = React.useState(0);

            // that typings a shame
            const [finalParams, setFinalParams] = React.useState<FetchParams | undefined>();

            // should only be used to do synchronous things - or you must clean up manually!!
            // if autoFetch is false and refetch hasn't been called, this will be undefined!
            // I wonder if this automatically resolving is a problem? Would a promise that _never_ resolves be better?
            const promise = React.useRef<Promise<any>>(Promise.resolve());

            const globalConfig = getGlobalConfig()

            config = config ? { ...globalConfig.fetch, ...config } : globalConfig.fetch

            const paramKey = config.paramKey || defaultKey
            const paramValue = finalParams && config.paramKey ? finalParams[config.paramKey] : null

            const asyncMiddlewares: AsyncMiddleware[] = React.useMemo(() => [
                ...(config.middlewares || []),
                throwOnLogout
            ], [config.middlewares])

            const runMiddlewares = React.useCallback(async (initialPromise: Promise<any>) => {
                let prev = initialPromise
                for (const middleware of asyncMiddlewares) {
                    prev = await middleware(prev)
                }
                return prev
            }, [asyncMiddlewares])

            /**
             * @todo close this horrible loop.
             */

            const fetch = React.useCallback((fetchParams: FetchParams) => {
                setFinalParams(fetchParams)
                setFetchCount(fetchCount + 1)
                return promise.current
            }, [setFetchCount, fetchCount, promise])

            React.useEffect(() => {
                setFinalParams(initialParams)
            }, [initialParams])

            React.useEffect(() => {
                if ((fetchCount !== 0 || (fetchCount === 0 && config.autoFetch)) && finalParams) {
                    promise.current = fetcher(finalParams, config)
                    promise.current = runMiddlewares(promise.current)
                }
            }, [finalParams])

            usePromiseCleanUp(promise.current)

            const state = useHuxSelector(state => ((paramKey === defaultKey) || !paramValue) ?
                state &&
                state.fetch &&
                state.fetch[fetchKey] &&
                state.fetch[fetchKey][paramKey] &&
                state.fetch[fetchKey][paramKey].__DEFAULT
                :
                state &&
                state.fetch &&
                state.fetch[fetchKey] &&
                state.fetch[fetchKey][paramKey] &&
                state.fetch[fetchKey][paramKey][paramValue]
            )

            console.log("fetchCount", fetchCount)
            console.log("data", state && state.data, "error", state && state.error, "isPending", state && state.isPending)

            return {
                ...state,
                // this works, which is worrying:
                // status: state.data ? "asdasd" : state.error ? "error" : "pending",
                status: state ?
                    (state.data ? "success" : state.error ? "error" : "pending")
                    :
                    null,
                fetchCount,
                fetch
            } as FetchHookResult<FetchParams, Data>
        }

        return {
            ...fetchers,
            [fetchKey]: useFetcher
        }

    }, {} as FetchHooks)
    return fetchers
}