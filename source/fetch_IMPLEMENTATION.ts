import { delay } from "./core/async";
import { getFetchReducer, getFetchHooks } from './core/fetch';
import { hux } from './hux_IMPLEMENTATION';
import { store, Store, State } from './store_IMPLEMENTATION';
import { ValueOf, NotNulled } from './core/types';

/**
 * This will be generated!
 */
const exampleFetchDefinitions = {
    getName: async (fetchParams: { name: string }) => {
        await delay(5000)
        return "Duckless Carswell"
    }
}

export const exampleFetchReducer = getFetchReducer<
    Parameters<ValueOf<typeof exampleFetchDefinitions>>[0],
    typeof exampleFetchDefinitions
>(exampleFetchDefinitions);

export const exampleFetchHooks = getFetchHooks<
    Parameters<ValueOf<typeof exampleFetchDefinitions>>[0],
    typeof exampleFetchDefinitions
>(exampleFetchDefinitions, store, hux.useHuxSelector)