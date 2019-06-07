import { delay } from '../core/async';

/**
 * This will be generated!
 */
export const exampleFetchDefinitions = {
    getName: async (fetchParams: { name: string }) => {
        await delay(5000)
        throw new Error(`Error fetching: ${name}`)
        return "Duckless Carswell"
    }
}