import { combineReducers, createStore, applyMiddleware, Middleware, compose } from "redux"
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

const middleware = applyMiddleware(...middlewares)

const devTools = window && (window as any)["devToolsExtension"]


export const store = createStore(reducer, compose(middleware, devTools()))
export type Store = typeof store