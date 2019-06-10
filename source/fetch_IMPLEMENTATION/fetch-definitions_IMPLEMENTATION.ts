import axios from "axios"

import { delay } from '../core/async';

/**
 * This will be generated!
 */
export const exampleFetchDefinitions = {
    getName: async (fetchParams: { name: string }) => {
        // throw new Error(`Error fetching: ${name}`)
        const response = await axios({ url: "https://randomuser.me/api/", method: "GET" })

        await delay(2000)

        return response.data as any as { results: {}[] }
    }
}