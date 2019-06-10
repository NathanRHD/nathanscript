import { FetchParamsBase, EntityDefinitionsBase, DefaultKey, FetchError } from '../index';
import { ValueOf, ThenParameters, NotNulled } from '../../types';
import { Reducer } from 'redux';
import { CoreActionUnion } from '../../actions';
export type FetchStateFragment<Data> = {
    data: Data | null
    error: FetchError | null
    isPending: boolean
}

export type FetchStateBase<
    FetchParams extends FetchParamsBase,
    EntityDefinitions extends EntityDefinitionsBase<FetchParams>
    > = {
        fetch: {
            [FetchKey in keyof EntityDefinitions]: {
                [ParamKey in keyof FetchParams | DefaultKey]: {
                    [ParamValue in ValueOf<FetchParams> | DefaultKey]: FetchStateFragment<ThenParameters<ReturnType<EntityDefinitions[FetchKey]>>>
                }
            }
        }
    } | undefined

/**
 * @todo convert to getFetchDuck, and include action generation
 */
export const getFetchReducer = <
    FetchParams extends FetchParamsBase,
    EntityDefinitions extends EntityDefinitionsBase<FetchParams>
>(entityDefinitions: EntityDefinitions): Reducer => {

    const initialState = Object.keys(entityDefinitions).reduce((initialState, entityKey) => {
        return {
            ...initialState,
            [entityKey]: {}
        }
    }, {}) as NotNulled<FetchStateBase<FetchParams, EntityDefinitions>>["fetch"]

    return (state: NotNulled<FetchStateBase<FetchParams, EntityDefinitions>>["fetch"] = initialState, action: CoreActionUnion) => {
        console.log("ACTION", action)
        switch (action.type) {
            case "setGlobalFetch": {
                const { entityKey, paramKey, paramValue, data, error, isPending } = action
                return {
                    ...(state || {}),
                    [entityKey]: {
                        // this is unfortunate
                        ...(
                            (state &&
                                state.fetch &&
                                state.fetch[entityKey as string])
                            ||
                            {}
                        ),
                        [paramKey]: {
                            [paramValue]: { data, error, isPending }
                        }
                    }
                }
            }
            default: {
                return state
            }
        }
    }
}