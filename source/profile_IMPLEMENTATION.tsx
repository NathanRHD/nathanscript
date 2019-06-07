import * as React from "react"
import { exampleFetchHooks } from "./fetch_IMPLEMENTATION/fetch-hooks_IMPLEMENTATION"
import { FetchConfig } from './core/fetch';

/**
 * This is, perhaps, a little unfortunate...
 */
const { getName: useGetNameFetcher } = exampleFetchHooks

export const Profile: React.FC<{}> = ({ }) => {

    const { data, status, fetch, fetchCount } = useGetNameFetcher({
        autoFetch: true,
        poll: false,
        cachingPolicy: "network-only",
        paramKey: "name"
    }, { name: "Duckless" })

    switch (status) {
        case "error": {
            return <div className="profile">
                <h2>Error</h2>
                <p>Your profile could not be fetched.</p>
                <p>We have attempted to fetch it {fetchCount} times.</p>
                <button onClick={() => fetch({ name: "Duckless" })}>Try again</button>
            </div>
        }
        case "pending": {
            return <div className="profile">
                <h2>Pending</h2>
                <p>Your profile is being fetched.</p>
            </div>
        }
        case "success": {
            return <div className="profile">
                <h2>{data}</h2>
            </div>
        }
        default: {
            return <div className="profile">
                <h2>Whoops!</h2>
            </div>
        }
    }
}