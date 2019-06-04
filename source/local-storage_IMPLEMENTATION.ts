import { getCachingMiddleware } from './core/cache'

const REDUX_STATE_LOCAL_STORAGE_KEY = "REDUX_STATE"

export const localStorageCachingMiddleware = getCachingMiddleware(json => {
    localStorage.setItem(REDUX_STATE_LOCAL_STORAGE_KEY, JSON.stringify(json))
})