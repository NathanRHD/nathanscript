import { delay } from "./core/async";
import { getFetchReducer, getFetchHooks } from './core/fetch';
import { hux } from './hux_IMPLEMENTATION';
import { store } from './store_IMPLEMENTATION';

/**
 * This will be generated!
 * 
 * There is a question with regards to how things will be stored/ accessed in terms of parameters (however, this is much
 * simpler with GraphQL than with REST.)
 */
const exampleFetchDefinitions = {
    getName: async () => {
        await delay(5000)
        return "Duckless Carswell"
    }
}

export const exampleFetchReducer = getFetchReducer(exampleFetchDefinitions);
export const exampleFetchHooks = getFetchHooks(exampleFetchDefinitions, store, hux.useHuxSelector)

