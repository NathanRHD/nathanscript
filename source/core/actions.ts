import { GlobalError } from "./global-errors"
import { ValueOf, ObjectKey } from "./types"
import { FetchStateFragment } from "./fetch";

export type BaseActionCreators = Record<string, (body: any) => any>

/**
 * @todo make a descision as to whether this is cleaner than the action creator factory used in NS 4.0
 * @param actionDefinitions the key of the actionDefinitions object will be the type of the action; the value will be the default body for the created action; the type of the value will be the type of the body argument of the action creator
 */
export const getActionCreators = <ActionDefinitions extends Record<string, any>>(actionDefinitions: ActionDefinitions) => {
    type ActionCreators = {
        [Key in keyof ActionDefinitions]: (body: ActionDefinitions[Key]) => ActionDefinitions[Key] & { type: Key }
    }

    const actionCreators = (Object.keys(actionDefinitions) as (keyof ActionCreators)[]).reduce<ActionCreators>((actionCreators, key) => {
        return {
            ...actionCreators,
            [key]: (body: ActionCreators[typeof key]) => ({
                type: key,
                ...body
            })
        }
    }, {} as any)

    return actionCreators
}

export type ActionDictionary<ActionCreators extends BaseActionCreators> = { [Key in keyof ActionCreators]: ReturnType<ActionCreators[Key]> }
export type ActionUnion<ActionCreators extends BaseActionCreators> = ReturnType<ValueOf<ActionCreators>>


/**
 * Actions/ types used within core nathanscript code.
 */

export const coreActionCreators = getActionCreators({
    pushGlobalError: {} as { error: GlobalError },
    shiftGlobalError: {},

    setGlobalFetch: {} as FetchStateFragment<any> & { key: ObjectKey },

    logout: {}
})

export type CoreActionCreators = typeof coreActionCreators

export type CoreActionDictionary = ActionDictionary<CoreActionCreators>
export type CoreActionUnion = ActionUnion<CoreActionCreators>