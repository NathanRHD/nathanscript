import { Middleware } from 'redux';
import { JSONValue } from './types';

/**
 * A helper to return redux middleware for caching state
 * @param saveJson 
 */
export const getCachingMiddleware = (saveJson: (json: JSONValue) => void): Middleware => {
    /**
     * A redux middleware for saving state to a configurable cache after each action has been dispatched.
     * @see Redux Middleware
     * @see setCacheConfig
     */
    return api => next => action => {
        const { getState } = api

        const result = next(action)

        saveJson(getState())

        return result
    }
}