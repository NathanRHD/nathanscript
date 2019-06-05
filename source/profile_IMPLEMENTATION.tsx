import * as React from "react"
import { exampleFetchHooks } from "./fetch_IMPLEMENTATION"

/**
 * This is, perhaps, a little unfortunate...
 */
const { getName: useGetNameFetcher } = exampleFetchHooks

const defaultIshConfig = {
    autoFetch: true,
    poll: false,
    cachingPolicy: "network-only"
}

export const Profile = () => {
    const { data, status, fetch, fetchCount } = useGetNameFetcher(defaultIshConfig)

    if (status === "error") {
        return <div className="profile">
            <h2>Error</h2>
            <p>Your profile could not be fetched.</p>
            <p>We have attempted to fetch it {fetchCount} times.</p>
            <button onClick={fetch}>Try again</button>
        </div>
    }
    if (status === "pending") {
        return <div className="profile">
            <h2>Pending</h2>
            <p>Your profile is being fetched.</p>
        </div>
    }

    if (status === "success") {
        return <div className="profile">
            <h2>{data}</h2>
        </div>
    }
}