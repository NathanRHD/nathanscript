import * as React from "react";

import { DefaultKey, FetchParamsBase, EntityDefinitionsBase, defaultKey } from '../index';
import { FetchStateFragment, FetchStateBase } from './fetch-reducer';
import { Store, AnyAction } from 'redux';
import { coreActionCreators } from '../../actions';
import { NotNulled, ValueOf } from '../../types';
import { getGlobalConfig } from '../../config';
import { HuxSelectorHook } from '../../hux';
type CachingPolicy =
    // if the request has already been made, don't remake a network request
    "cache-first" |

    /**
     * @todo comment later
     */
    "network-first" |

    // don't use the cached data whilst pending, don't put the result of the network request into the cache
    "network-only"

// Promise can't be typed with data, as it goes through async middleware
type AsyncMiddleware = (promise: Promise<any>) => Promise<any>

export type FetchConfig<Params extends {}, Data> = {
    paramKey: keyof Params | DefaultKey
    autoFetch: boolean,
    poll?: { ms: number, condition: (data: Data) => boolean },
    cachingPolicy: CachingPolicy,
    middlewares?: AsyncMiddleware[]
}

type FetchHookResult<Params extends {}, Data> = FetchStateFragment<Data> & {
    // write documentation on using isPending vs status

    fetchCount: number

    // Promise returned from AsyncMiddleware
    fetch: (params: Params) => Promise<any>
}

type FetchHook<Params extends {}, Data> = (
    config: FetchConfig<Params, Data>,
    initialParams?: Params
) => FetchHookResult<Params, Data>

/**
 * all other effects related to asynchronous flow should be handled in hooks that consume global fetch! (this will
 * effectively replace sagas, and provide a similar experience to using graphql!)
 * @param store
 * @param entityKey
 * @param fetch
 */
export const getFetch = <
    FetchParams extends FetchParamsBase,
    EntityDefinitions extends EntityDefinitionsBase<FetchParams>,
    FetchState extends FetchStateBase<FetchParams, EntityDefinitions>,
    FetchStore extends Store<FetchState, AnyAction>,
    Data
>(
    store: FetchStore,
    entityKey: keyof EntityDefinitions,
    fetch: (fetchParams: FetchParams) => Promise<Data>
) => {
    const { dispatch } = store

    // this is not a hook and so cannot use useHux to get the state and dispatcher!
    return async (params: FetchParams, config: FetchConfig<FetchParams, Data>) => {
        let data

        const { cachingPolicy, paramKey } = config

        const paramValue = paramKey === defaultKey ? defaultKey : params[paramKey]

        const getFragment = (state: FetchState) => state &&
            state.fetch[entityKey] &&
            state.fetch[entityKey][paramKey] &&
            state.fetch[entityKey][paramKey][paramValue]

        // return data immediately if present and using "cache-first" policy
        if (cachingPolicy === "cache-first" && !!getFragment(store.getState()).data) {
            return getFragment(store.getState()).data
        }

        // refactor logic _into_ reducer!
        dispatch(coreActionCreators.setGlobalFetch({
            entityKey,
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
            data = await fetch(params)
            dispatch(coreActionCreators.setGlobalFetch({ entityKey, paramKey, paramValue, data, error: null, isPending: false }))

            return data
        }

        catch (error) {
            dispatch(coreActionCreators.setGlobalFetch({ entityKey, paramKey, paramValue, data: null, error, isPending: false }))

            if (cachingPolicy === "network-only") {
                throw error
            }
        }

        finally {
            return data
        }
    }
}

export const getUseFetch = <
    FetchParams extends FetchParamsBase,
    EntityDefinitions extends EntityDefinitionsBase<FetchParams>,
    FetchState extends FetchStateBase<FetchParams, EntityDefinitions>,
    FetchStore extends Store<FetchState>,
    Data,
    >(
        store: FetchStore,
        entityKey: keyof EntityDefinitions,
        entityDefinition: ValueOf<EntityDefinitions>,
        useHuxSelector: HuxSelectorHook<FetchState>
    ): FetchHook<FetchParams, Data> => {

    const fetch = getFetch<FetchParams, EntityDefinitions, FetchState, FetchStore, Data>(store, entityKey, entityDefinition)

    /**
     * @param config any config values provided here will override the fetchHook config provided globally
     * @param initialParams
     * @returns SCREAMS :O !!!
     */
    return (config: FetchConfig<FetchParams, Data>, initialParams?: FetchParams) => {
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
            ...(config.middlewares || [])
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

        const fetchCallback = React.useCallback((fetchParams: FetchParams) => {
            setFinalParams(fetchParams)
            setFetchCount(fetchCount + 1)
            return promise.current
        }, [setFetchCount, fetchCount, promise])

        React.useEffect(() => {
            if (fetchCount === 0 && config.autoFetch) {
                // if autoFetch, initialParams won't be null
                fetchCallback(initialParams as NotNulled<typeof initialParams>)
            }
        }, [])

        React.useEffect(() => {
            if (fetchCount !== 0 && finalParams) {
                promise.current = fetch(finalParams, config)
                // promise.current = runMiddlewares(promise.current)
            }
        }, [fetchCount])

        // usePromiseCleanUp(promise.current)
        console.log("OUTER!!", "FETCHKEY", entityKey, "PARAMKEY", paramKey, "PARAMVALUE", paramValue)

        /**
         * @todo fix this problem...
         */
        const selector = React.useCallback(() => (state: FetchState) => {
            console.log("INNER!!", "FETCHKEY", entityKey, "PARAMKEY", paramKey, "PARAMVALUE", paramValue)
            console.log("CONDITION", ((paramKey === defaultKey) || !paramValue))

            return ((paramKey === defaultKey) || !paramValue) ?
                (state &&
                    state.fetch &&
                    state.fetch[entityKey] &&
                    state.fetch[entityKey][defaultKey] &&
                    state.fetch[entityKey][defaultKey][defaultKey])
                :
                (state &&
                    state.fetch &&
                    state.fetch[entityKey] &&
                    state.fetch[entityKey][paramKey] &&
                    state.fetch[entityKey][paramKey][paramValue])
        }, [entityKey, paramKey, paramValue])

        const state = useHuxSelector(selector)

        return {
            ...state,
            fetchCount,
            fetch: fetchCallback
        } as FetchHookResult<FetchParams, Data>
    }
}