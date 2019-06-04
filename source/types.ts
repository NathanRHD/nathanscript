export type ThenParameters<T> = T extends Promise<infer U> ? U : T
export type ValueOf<T> = T[keyof T]
export type ObjectKey = string | number | symbol
export type NotNulled<T> = Exclude<T, null | undefined>;

export const never = (arg: never) => {
    throw new Error(`Invalid arg: ${arg}`)
}

export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export type JSONObject = { [member: string]: JSONValue };
export interface JSONArray extends Array<JSONValue> { }