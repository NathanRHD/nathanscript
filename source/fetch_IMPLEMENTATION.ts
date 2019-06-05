import { delay } from "./core/async";
import { getFetchReducer, getFetchHooks } from './core/fetch';
import { hux } from './hux_IMPLEMENTATION';
import { store } from './store_IMPLEMENTATION';
import { ValueOf } from './core/types';

/**
 * This will be generated!
 */
const exampleFetchDefinitions = {
    getName: async (fetchParams: { name: string }) => {
        await delay(5000)
        return "Duckless Carswell"
    }
}

export const exampleFetchReducer = getFetchReducer(exampleFetchDefinitions);

export const exampleFetchHooks = getFetchHooks(exampleFetchDefinitions, store, hux.useHuxSelector)