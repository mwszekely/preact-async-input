
import { useImperativeHandle, useRef } from "preact/hooks"

/**
 * Alternate version of useCallback that's better equipped to deal with complex dependencies. The tradeoff is that it can't be used in useLayoutEffect().
 * 
 * Use this when you need to pass a (stable) function that depends on (potentially unstable) use input props. 
 * See: https://github.com/facebook/react/issues/14099#issuecomment-659298422
 * 
 * WARNING: Returned callback should not be called from useLayoutEffect(). https://github.com/facebook/react/issues/14099#issuecomment-569044797
 * @param fn 
 * @returns 
 */
export function useStableCallback<T extends (...args: any[]) => any>(fn: T): T {
    const ref = useRef<T>()
    useImperativeHandle(ref, () => fn) // Assign fn to ref.current (currentFunc) in async-safe way

    return useRef(((...args: any[]) => {
        const currentFunc = ref.current
        if (!currentFunc) {
            return undefined;
            //throw new Error('Callback retrieved from useStableCallback() cannot be called from useLayoutEffect().')
        }
        return currentFunc(...args)
    }) as T).current
}
