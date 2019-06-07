import { getFetchHooks } from '../core/fetch';
import { ValueOf } from '../core/types';
import { store } from '../store_IMPLEMENTATION';
import { hux } from '../hux_IMPLEMENTATION';
import { exampleFetchDefinitions } from './fetch-definitions_IMPLEMENTATION';

export const exampleFetchHooks = getFetchHooks<
    Parameters<ValueOf<typeof exampleFetchDefinitions>>[0],
    typeof exampleFetchDefinitions
>(exampleFetchDefinitions, store, hux.useHuxSelector)