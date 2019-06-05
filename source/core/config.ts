import { FetchConfig, defaultParamKey } from "./fetch"

export interface GlobalConfig {
    fetch: FetchConfig<{}>
}

// I wonder if this getter/setter pattern is strictly necessary...

let globalConfig: GlobalConfig = {
    fetch: {
        paramKey: defaultParamKey,
        autoFetch: true,
        poll: false,
        cachingPolicy: "network-first"
    }
}

export const setGlobalConfig = (newConfig: GlobalConfig) => {
    globalConfig = newConfig;
}

export const getGlobalConfig = () => globalConfig