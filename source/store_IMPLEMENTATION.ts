import { combineReducers, createStore, applyMiddleware, Middleware } from "redux"
import { logoutReducerFactory } from "./core/logout"
import { exampleFetchReducer } from './fetch_IMPLEMENTATION/fetch-reducer_IMPLEMENTATION'
import { listenerMiddleware } from './core/listen'
import { localStorageCachingMiddleware } from './local-storage_IMPLEMENTATION'

const subReducer = combineReducers({
    fetch: exampleFetchReducer
})

const reducer = logoutReducerFactory(subReducer)
export type State = ReturnType<typeof reducer>

const middlewares: Middleware[] = [
    localStorageCachingMiddleware,
    listenerMiddleware
]

export const store = createStore(reducer, applyMiddleware(...middlewares))
export type Store = typeof store