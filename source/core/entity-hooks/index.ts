export const defaultKey = "__DEFAULT"
export type DefaultKey = typeof defaultKey

export type FetchError = {}

export type FetchParamsBase = { [paramKey: string]: any }

export type EntityDefinitionsBase<FetchParams extends FetchParamsBase> = { [entityKey: string]: (fetchParams: FetchParams) => Promise<any> }