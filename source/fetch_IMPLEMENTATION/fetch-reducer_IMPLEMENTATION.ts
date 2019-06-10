import { ValueOf } from '../core/types';
import { exampleFetchDefinitions } from './fetch-definitions_IMPLEMENTATION';
import { getFetchReducer } from '../core/entity-hooks/use-fetch/fetch-reducer';

export const exampleFetchReducer = getFetchReducer<
    Parameters<ValueOf<typeof exampleFetchDefinitions>>[0],
    typeof exampleFetchDefinitions
>(exampleFetchDefinitions);