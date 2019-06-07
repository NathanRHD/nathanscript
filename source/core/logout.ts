import { Reducer } from 'redux'
import { CoreActionUnion } from './actions';
import { coreListen } from './listen';

/**
 * A reducer to clear all subState on logout
 * @param subReducer The reducer responsible for taking an incoming action and returning new state if it isn't a logout action
 * @see Reducer
 */
export const logoutReducerFactory = <State>(subReducer: Reducer<State>): Reducer<State, CoreActionUnion> => {
    return (state, action) => {
        if (action.type === "logout") {
            return subReducer(undefined, { type: "" })
        }

        return subReducer(state, action)
    }
}

export const listenForLogout = () => coreListen("logout")

interface RaceResponse<T = any> {
    kind: "logout" | "exec"
    value: T
}

/**
 * @param executorPromise A promise for the process you want to interrupt when logged out.
 */
export const throwOnLogout = async (executor: Promise<any>) => {
    const logoutPromise = listenForLogout()

    const e1: Promise<RaceResponse> = executor.then(x => ({ kind: "exec", value: x }))

    const e2: Promise<RaceResponse> = logoutPromise.then(x => ({ kind: "logout", value: x }))

    const logoutRace = await Promise.race([e1, e2])

    if (logoutRace.kind === "logout") {
        executor.cancel()
        throw new Error("Logged out!")
    }
}