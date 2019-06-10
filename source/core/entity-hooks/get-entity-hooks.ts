import { FetchParamsBase, EntityDefinitionsBase } from './index';
import { FetchStateBase } from './use-fetch/fetch-reducer';
import { Store, AnyAction } from 'redux';
import { ThenParameters } from '../types';
/**
 * this will wrap your network request fetcher so that the status/response is recorded in the global reducer this state
 * is available through context across the entire application so it can inform logic around when/ if to refetch data,
 * show loading spinners, etc. this is seperate from the actual asynchronous flow, which should be based on the promises
 * themselves!
 * 
 * @param entityDefinitions 
 * @param store
 * @param useHuxSelector
 * 
 * @see getHux
 * 
 * @todo add named dictionary of hooks to parameters, (for useFetch, usePoll, usePage, etc.)
 * @todo simplify generics?
 * @todo check how strict these typings actually are
 * @todo look into using opaque types for strings
 */
export const getEntityHooks = <
    FetchParams extends FetchParamsBase,
    EntityDefinitions extends EntityDefinitionsBase<FetchParams>
>(
    fetchDefinitions: EntityDefinitions,
    store: Store<FetchStateBase<FetchParams, EntityDefinitions>, AnyAction>,
    useHuxSelector: <SelectedState>(selector: (state: FetchStateBase<FetchParams, EntityDefinitions>) => SelectedState) => SelectedState
) => {
    type EntityHooks = {
        [EntityKey in keyof EntityDefinitions]: EntityHook<Parameters<EntityDefinitions[EntityKey]>[0], ThenParameters<ReturnType<EntityDefinitions[EntityKey]>>>
    }

    type FetchState = FetchStateBase<FetchParams, EntityDefinitions>
    type FetchStore = Store<FetchState, AnyAction>

    const entityHooks = (Object.keys(fetchDefinitions) as (keyof EntityDefinitions)[]).reduce<EntityHooks>((fetchers, fetchKey) => {
        const fetcherDefinition = fetchDefinitions[fetchKey]

        type Data = ThenParameters<ReturnType<typeof fetcherDefinition>>


        return {
            ...fetchers,
            [fetchKey]: { /** spread hooks */ }
        }

    }, {} as EntityHooks)

    return entityHooks
}