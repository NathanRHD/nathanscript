import * as React from "react"

import { usePromiseCleanUp, asyncForEach } from './async'
import { NotNulled, ThenParameters, ObjectKey, ValueOf } from './types';
import { throwOnLogout } from './logout'
import { CoreActionUnion, coreActionCreators } from './actions'
import { Store, Middleware } from 'redux'
import { getGlobalConfig } from './config';

type FetchStatus = "pending" | "success" | "error"

export const defaultParamKey = "__DEFAULT"
type DefaultParamKey = typeof defaultParamKey

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

/**
 * @todo generation - and bluebird up axios requests and implement proper request/ promise cancellation
 */

export type FetchStateFragment<Data> = {
    data: Data | null
    error: FetchError | null
    status: FetchStatus | null
}

export const getFetchReducer = <
    FetchDefinitions extends { [key: string]: () => Promise<any> },
    Params extends {}
>(fetchDefinitions: FetchDefinitions) => {
    type FetchReducerState = {
        [FetchKey in keyof FetchDefinitions]: {
            [ParamKey in keyof Params | DefaultParamKey]: FetchStateFragment<ThenParameters<ReturnType<FetchDefinitions[FetchKey]>>>
        }
    }

    const initialState = Object.keys(fetchDefinitions).reduce((initialState, fetchKey) => {
        return {
            ...initialState,
            [fetchKey]: {}
        }
    }, {}) as FetchReducerState

    return (state: FetchReducerState = initialState, action: CoreActionUnion) => {
        switch (action.type) {
            case "setGlobalFetch": {
                const { fetchKey, paramKey, data, error, status } = action
                return {
                    ...state,
                    [fetchKey]: {
                        ...state[fetchKey],
                        [paramKey || defaultParamKey]: { data, error, status }
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
 * @param fetchKey
 * @param fetcher 
 */
const getFetcher = <
    FetchDefinitions extends { [fetchKey: string]: () => Promise<any> },
    Params extends Parameters<ValueOf<FetchDefinitions>>,
    FetchState extends {
        fetch: {
            [FetchKey in keyof FetchDefinitions]: {
                [ParamKey in keyof Params | DefaultParamKey]: FetchStateFragment<ThenParameters<ReturnType<FetchDefinitions[FetchKey]>>>
            }
        }
    },
    FetchStore extends Store<FetchState>,
    Data
>(store: FetchStore, fetchKey: keyof FetchDefinitions, fetcher: (params: Params) => Promise<Data>) => {
    const { dispatch } = store

    // this is not a hook and so cannot use useHux to get the state and dispatcher!
    return async (params: Params, config: FetchConfig<Params>) => {
        let data

        const { cachingPolicy, paramKey } = config

        const getFragment = (state: FetchState) => state.fetch[fetchKey][paramKey || defaultParamKey]

        // return data immediately if present and using "cache-first" policy
        if (cachingPolicy === "cache-first" && !!getFragment(store.getState()).data) {
            return getFragment(store.getState()).data
        }

        // refactor logic _into_ reducer!
        dispatch(coreActionCreators.setGlobalFetch({
            key: fetchKey,

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

            status: "pending"
        }))

        try {
            data = await fetcher(params)
            dispatch(coreActionCreators.setGlobalFetch({ key: fetchKey, data, error: null, status: "success" }))

            return data
        }

        catch (error) {
            dispatch(coreActionCreators.setGlobalFetch({ key: fetchKey, data: null, error, status: "error" }))

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
    paramKey: keyof Params | DefaultParamKey
    autoFetch: boolean,
    poll: boolean,
    cachingPolicy: CachingPolicy,
    middlewares?: AsyncMiddleware[]
}

type FetchHookResult<Params extends {}, Data> = FetchStateFragment<Data> & {
    // write documentation on using isPending vs status
    isPending: boolean

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
 */
export const getFetchHooks = <
    FetchDefinitions extends { [key: string]: () => Promise<any> },

    Params extends {},

    FetchState extends {
        fetch: {
            [FetchKey in keyof FetchDefinitions]: {
                [ParamKey in keyof Params | DefaultParamKey]: FetchStateFragment<ThenParameters<ReturnType<FetchDefinitions[FetchKey]>>>
            }
        }
    },

    FetchStore extends Store<FetchState>
>(
    fetchDefinitions: FetchDefinitions,
    store: FetchStore,
    useHuxSelector: <SelectedState>(selector: (state: FetchState) => SelectedState) => SelectedState
) => {
    type FetchHooks = {
        [FetchKey in keyof FetchDefinitions]: FetchHook<Parameters<FetchDefinitions[FetchKey]>[0], ThenParameters<ReturnType<FetchDefinitions[FetchKey]>>>
    }

    const fetchers = (Object.keys(fetchDefinitions) as (keyof FetchDefinitions)[]).reduce<FetchHooks>((fetchers, fetchKey) => {
        const fetcherDefinition = fetchDefinitions[fetchKey]

        const fetcher = getFetcher(store, fetchKey, fetcherDefinition)

        type Params = Parameters<typeof fetcherDefinition>
        type Data = ThenParameters<ReturnType<typeof fetcherDefinition>>

        /**
         * @param config any config values provided here will override the fetchHook config provided globally
         * @param initialParams
         * @returns SCREAMS :O !!!
         */
        const useFetcher: FetchHook<Params, Data> = (config: FetchConfig<Params>, initialParams?: Params) => {
            const [fetchCount, setFetchCount] = React.useState(0);
            const [finalParams, setFinalParams] = React.useState<Params>();

            // should only be used to do synchronous things - or you must clean up manually!!
            // if autoFetch is false and refetch hasn't been called, this will be undefined!
            // I wonder if this automatically resolving is a problem? Would a promise that _never_ resolves be better?
            const promise = React.useRef<Promise<any>>(Promise.resolve());

            const globalConfig = getGlobalConfig()

            config = config ? { ...globalConfig.fetch, ...config } : globalConfig.fetch

            const paramKey = config.paramKey || defaultParamKey
            const paramValue = config.paramKey ? finalParams[config.paramKey] : null

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

            const fetch = React.useCallback((params: Params) => {
                setFinalParams(params)
                setFetchCount(fetchCount + 1)
                return promise.current as NotNulled<typeof promise.current>
            }, [setFetchCount, fetchCount])

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

            const state = useHuxSelector(state => paramKey === defaultParamKey ?
                state.fetch[paramKey]
                :
                state.fetch[fetchKey][paramKey][paramValue])

            return {
                ...state,
                isPending: state.status === "pending",
                fetchCount,
                fetch
            } as FetchHookResult<Params, Data>
        }

        return {
            ...fetchers,
            [fetchKey]: useFetcher
        }

    }, {} as FetchHooks)
    return fetchers
}