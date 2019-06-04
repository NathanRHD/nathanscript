import * as React from "react"

import { usePromiseCleanUp, asyncForEach } from './async'
import { NotNulled, ThenParameters, ObjectKey } from '../types';
import { throwOnLogout } from './logout'
import { CoreActionUnion, coreActionCreators } from './actions'
import { Store, Middleware } from 'redux'

type FetchStatus = "pending" | "success" | "error"

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

export const getFetchReducer = <FetchDefinitions extends { [key: string]: () => Promise<any> }>(fetchDefinitions: FetchDefinitions) => {
    type FetchReducerState = { [Key in keyof FetchDefinitions]: FetchStateFragment<ThenParameters<ReturnType<FetchDefinitions[Key]>>> }

    const initialState = Object.keys(fetchDefinitions).reduce((initialState, key) => {
        return { ...initialState, [key]: { data: null, error: null, status: null } }
    }, {}) as FetchReducerState

    return (state: FetchReducerState = initialState, action: CoreActionUnion) => {
        switch (action.type) {
            case "setGlobalFetch": {
                const { key, data, error, status } = action
                return {
                    ...state,
                    [key]: { data, error, status }
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
 * @param key
 * @param fetcher 
 */
const getFetcher = <
    FetchDefinitions extends { [key: string]: () => Promise<any> },
    FetcherStore extends Store<{
        fetch: {
            [Key in keyof FetchDefinitions]: FetchStateFragment<ThenParameters<ReturnType<FetchDefinitions[Key]>>>
        }
    }>,
    Params extends {},
    Data
>(store: FetcherStore, key: keyof FetchDefinitions, fetcher: (params: Params) => Promise<Data>) => {
    const { dispatch } = store

    // this is not a hook and so cannot use useHux to get the state and dispatcher!
    return async (params: Params, cachingPolicy: CachingPolicy) => {
        let data

        // return data immediately if present and using "cache-first" policy
        const fetchState = store.getState().fetch[key]
        if (cachingPolicy === "cache-first" && !!fetchState.data) {
            return fetchState.data
        }

        dispatch(coreActionCreators.setGlobalFetch({
            key,

            // reset cached data if cache isn't used
            // arguably this should be kept in the store regardless but not returned from the hook!
            data: cachingPolicy === "network-only" ?
                null
                :
                store.getState().fetch[key].data,

            error: cachingPolicy === "network-only" ?
                null
                :
                store.getState().fetch[key].error,

            status: "pending"
        }))

        try {
            data = await fetcher(params)
            dispatch(coreActionCreators.setGlobalFetch({ key, data, error: null, status: "success" }))

            return data
        }

        catch (error) {
            dispatch(coreActionCreators.setGlobalFetch({ key, data: null, error, status: "error" }))

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

type FetchHookConfig = {
    autoFetch: boolean,
    poll: boolean,
    cachingPolicy: CachingPolicy,
    middlewares?: AsyncMiddleware[]
}

type FetchHookResult<Params extends {} | undefined, Data> = FetchStateFragment<Data> & {
    // write documentation on using isPending vs status
    isPending: boolean

    fetchCount: number

    // Promise returned from AsyncMiddleware
    fetch: (params: Params) => Promise<any>
}

type FetchHook<Params extends {} | undefined, Data> = (
    config: FetchHookConfig,
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

    FetchState extends {
        fetch: {
            [Key in keyof FetchDefinitions]: FetchStateFragment<ThenParameters<ReturnType<FetchDefinitions[Key]>>>
        }
    },

    FetchStore extends Store<FetchState>
>(
    fetchDefinitions: FetchDefinitions,
    store: FetchStore,
    useHuxSelector: <SelectedState>(selector: (state: FetchState) => SelectedState) => SelectedState
) => {
    type FetchHooks = {
        [Key in keyof FetchDefinitions]: FetchHook<Parameters<FetchDefinitions[Key]>[0], ThenParameters<ReturnType<FetchDefinitions[Key]>>>
    }

    const fetchers = (Object.keys(fetchDefinitions) as (keyof FetchDefinitions)[]).reduce<FetchHooks>((fetchers, key) => {
        const fetcherDefinition = fetchDefinitions[key]

        const fetcher = getFetcher(store, key, fetcherDefinition)

        type Params = Parameters<typeof fetcherDefinition>
        type Data = ThenParameters<ReturnType<typeof fetcherDefinition>>

        /**
         * @todo make all of this work...
         * @param initialParams
         * @param config { autoFetch, poll, cachingPolicy, middlewares }
         * @returns SCREAMS :O !!!
         */
        const useFetcher: FetchHook<Params, Data> = (config: { autoFetch: boolean, poll: boolean, cachingPolicy: CachingPolicy, middlewares?: AsyncMiddleware[] }, initialParams?: Params) => {
            const [fetchCount, setFetchCount] = React.useState(0);
            const [finalParams, setFinalParams] = React.useState();

            // should only be used to do synchronous things - or you must clean up manually!!
            // if autoFetch is false and refetch hasn't been called, this will be undefined!
            const promise = React.useRef<Promise<any>>();

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
                setFinalParams(params);
                setFetchCount(fetchCount + 1)
                return promise.current as NotNulled<typeof promise.current>
            }, [setFetchCount, fetchCount]);

            React.useEffect(() => {
                setFinalParams(initialParams);
            }, [initialParams])

            React.useEffect(() => {
                if ((fetchCount !== 0 || (fetchCount === 0 && config.autoFetch)) && finalParams) {
                    promise.current = fetcher(finalParams, config.cachingPolicy)
                    promise.current = runMiddlewares(promise.current)
                }
            }, [finalParams]);

            usePromiseCleanUp(promise.current)

            // that typing is unfortunate
            const state = useHuxSelector(state => state.fetch[key as string]);

            return {
                ...state,
                isPending: state.status === "pending",
                fetchCount,
                fetch
            } as FetchHookResult<Params, Data>
        }

        return {
            ...fetchers,
            [`useFetcher_${key}`]: useFetcher
        }

    }, {} as FetchHooks)
    return fetchers
}