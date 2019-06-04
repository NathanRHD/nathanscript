import {
    ActionDictionary,
    ActionUnion,
    BaseActionCreators
} from './actions';
import { AnyAction, Middleware } from 'redux';
import { CoreActionCreators } from './actions';

interface Listener<ActionCreators extends BaseActionCreators> {
    pattern: ActionUnion<ActionCreators>["type"] | ((action: ActionUnion<ActionCreators>) => boolean)
    trigger: (action: ActionUnion<ActionCreators>) => void
}

export const getListen = <ActionCreators extends BaseActionCreators>() => {
    type ScopedActionDictionary = ActionDictionary<ActionCreators>

    return <Type extends keyof ScopedActionDictionary>(pattern: Type) => {
        return new Promise<ScopedActionDictionary[Type]>(res => {
            listeners.push({ pattern, trigger: res })
        })
    }
}

const listeners: Listener<any>[] = []

/**
 * A redux middleware for calling the trigger method of a registered Listener if the incoming action matches its pattern.
 * @see Redux Middleware
 * @see Listener
 */
export const listenerMiddleware: Middleware = api => next => action => {
    listeners.forEach((listener, i) => {
        const pattern = typeof listener.pattern === "function" ? listener.pattern(action) : listener.pattern;
        if (listener.pattern === action.type) {
            listener.trigger(action)
            listeners.splice(i, 1)
        }
    })

    return next(action)
}


export const coreListen = getListen<CoreActionCreators>()