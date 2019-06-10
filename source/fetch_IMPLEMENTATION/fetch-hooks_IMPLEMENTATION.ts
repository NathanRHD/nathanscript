import { ValueOf } from '../core/types';
import { store } from '../store_IMPLEMENTATION';
import { hux } from '../hux_IMPLEMENTATION';
import { exampleFetchDefinitions } from './fetch-definitions_IMPLEMENTATION';
import { getEntityHooks } from '../core/entity-hooks/get-entity-hooks';

export const exampleFetchHooks = getEntityHooks<
    Parameters<ValueOf<typeof exampleFetchDefinitions>>[0],
    typeof exampleFetchDefinitions
>(exampleFetchDefinitions, store, hux.useHuxSelector)