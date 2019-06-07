import { getFetchReducer } from '../core/fetch';
import { ValueOf } from '../core/types';
import { exampleFetchDefinitions } from './fetch-definitions_IMPLEMENTATION';

export const exampleFetchReducer = getFetchReducer<
    Parameters<ValueOf<typeof exampleFetchDefinitions>>[0],
    typeof exampleFetchDefinitions
>(exampleFetchDefinitions);