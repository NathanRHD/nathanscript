import * as React from "react"

export const delay = (ms: number) => {
    return new Promise(res => setTimeout(res, ms))
}

/**
 * This is useful for when you are doing things like setting component/ component-dependent state asynchronously from within a hook;
 * this will interrupt the asynchronous process if the component the hook is running in unmounts!
 * @param promises A number of promises you'd like to interrupt if component running this hook unmounts.
 */
export const usePromiseCleanUp = (promise?: Promise<any>) => {

    const { cleanUpPromise, resolveCleanUp } = React.useMemo(() => {
        let resolveCleanUp: (value?: any) => void = null as any;
        const cleanUpPromise = new Promise(res => {
            resolveCleanUp = res;
        })
        return {
            resolveCleanUp,
            cleanUpPromise
        };
    }, []);

    // "destruction only" effect
    React.useEffect(() => () => {
        promise && promise.cancel();
        resolveCleanUp()
    }, [promise])

    return cleanUpPromise
}

export async function asyncForEach<Item>(array: Item[], callback: (item: Item, index?: number, array?: Item[]) => void) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}