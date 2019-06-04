import { combineReducers, Reducer, createStore, applyMiddleware, Middleware } from "redux"
import { globalErrorsReducer } from './core/global-errors'
import { logoutReducerFactory } from "./core/logout"
import { exampleFetchReducer } from './fetch_IMPLEMENTATION'
import { listenerMiddleware } from './core/listen'
import { localStorageCachingMiddleware } from './local-storage_IMPLEMENTATION'

const subReducer = combineReducers({
    fetch: exampleFetchReducer,
    globalErrors: globalErrorsReducer
})

const reducer = logoutReducerFactory(subReducer)
export type State = ReturnType<typeof reducer>

const middlewares: Middleware[] = [
    localStorageCachingMiddleware,
    listenerMiddleware
]

export const store = createStore(reducer, applyMiddleware(...middlewares))
export type Store = typeof store