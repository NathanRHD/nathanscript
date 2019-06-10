import * as React from "react"
import { exampleFetchHooks } from "./fetch_IMPLEMENTATION/fetch-hooks_IMPLEMENTATION"
import { FetchConfig } from './core/fetch';
import { hux } from './hux_IMPLEMENTATION';

/**
 * This is, perhaps, a little unfortunate...
 */
const { getName: useGetNameFetcher } = exampleFetchHooks

export const Profile: React.FC<{}> = ({ }) => {

    const { data, error, isPending, fetch, fetchCount } = useGetNameFetcher({
        autoFetch: true,
        poll: false,
        cachingPolicy: "network-only",
        paramKey: "name"
    }, { name: "Duckless" })

    if (error) {
        return <div className="profile">
            <h2>Error</h2>
            <p>Your profile could not be fetched.</p>
            <p>We have attempted to fetch it {fetchCount} times.</p>
            <button onClick={() => fetch({ name: "Duckless" })}>Try again</button>
        </div>
    }
    if (isPending) {
        return <div className="profile">
            <h2>Pending</h2>
            <p>Your profile is being fetched.</p>
        </div>
    }
    if (data) {
        return <div className="profile">
            <h2>Results</h2>
            {data && data.results.map(result => <p>{JSON.stringify(result)}</p>)}
        </div>
    }
    return <div className="profile">
        <h2>Whoops!</h2>
    </div>
}