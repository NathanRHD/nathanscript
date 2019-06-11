import { FetchParamsBase, EntityDefinitionsBase } from './index';
import { FetchStateBase } from './use-fetch/fetch-reducer';
import { Store } from 'redux';
import { ValueOf, NotNulled } from '../types';
import { HuxSelectorHook } from '../hux';
import { FetchConfig, getFetch } from './use-fetch/get-use-fetch';
import { delay } from '../async';

type PollConfig<Params extends FetchParamsBase, Data> = {
    fetch: FetchConfig<Params, Data>
    poll: { ms: number, condition: (data: Data) => boolean },
}

export const getPoll = <
    FetchParams extends FetchParamsBase,
    EntityDefinitions extends EntityDefinitionsBase<FetchParams>,
    FetchState extends FetchStateBase<FetchParams, EntityDefinitions>,
    FetchStore extends Store<FetchState>,
    Data
>(
    store: FetchStore,
    entityKey: keyof EntityDefinitions,
    entityDefinition: ValueOf<EntityDefinitions>,
    useHuxSelector: HuxSelectorHook<FetchState>
): (config: PollConfig<FetchParams, Data>, initialParams: FetchParams) => Promise<Data> => {

    const fetch = getFetch<
        FetchParams,
        EntityDefinitions,
        FetchState,
        FetchStore,
        Data
    >(
        store,
        entityKey,
        entityDefinition
    );

    return async (config: PollConfig<FetchParams, Data>, initialParams: FetchParams) => {
        let isPolling: boolean = false;
        let data: Data | null | undefined;

        while (isPolling) {
            data = await fetch(initialParams, config.fetch)

            isPolling = !(data && config.poll.condition(data))

            if (isPolling) {
                await delay(config.poll.ms)
            }
        }

        return data as NotNulled<typeof data>
    }
}