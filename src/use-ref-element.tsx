import { Ref } from "preact";
import { useCallback, useState } from "preact/hooks";
import { useMergedRefs } from "./use-merged-refs";

/**
 * Allows accessing the element a ref references as soon as it references it.
 * This hook returns a hook--useRefElementProps modifies the props that you were going to pass to an HTMLElement, 
 * adding a RefCallback and merging it with any existing ref that existed on the props.
 */
export function useRefElement<T>() {
    const [element, setElement] = useState<T | null>(null);
    const myRef = useCallback((e: T | null) => { if (e) setElement(() => e) }, []);

    return {
        useRefElementProps: useCallback(<P extends { ref?: Ref<T> }>({ ref, ...rest }: P) => ({ ...rest, ref: useMergedRefs(ref, myRef) }), [myRef]),
        element
    }
}


