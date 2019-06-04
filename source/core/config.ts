import { FetchHookConfig } from "./fetch"

export interface GlobalConfig {
    fetchHook: FetchHookConfig
}

// I wonder if this getter/setter pattern is strictly necessary...

let globalConfig: GlobalConfig = {
    fetchHook: {
        autoFetch: true,
        poll: false,
        cachingPolicy: "network-first"
    }
}

export const setGlobalConfig = (newConfig: GlobalConfig) => {
    globalConfig = newConfig;
}

export const getGlobalConfig = () => globalConfig