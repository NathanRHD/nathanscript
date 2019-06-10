import { FetchConfig } from './entity-hooks/use-fetch/get-use-fetch';
import { defaultKey } from './entity-hooks';

export interface GlobalConfig {
    fetch: FetchConfig<{}, {}>
}

// I wonder if this getter/setter pattern is strictly necessary...

let globalConfig: GlobalConfig = {
    fetch: {
        paramKey: defaultKey,
        autoFetch: true,
        cachingPolicy: "network-first"
    }
}

export const setGlobalConfig = (newConfig: GlobalConfig) => {
    globalConfig = newConfig;
}

export const getGlobalConfig = () => globalConfig