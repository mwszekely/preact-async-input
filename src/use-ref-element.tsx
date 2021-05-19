import { Ref, RefCallback, RefObject } from "preact";
import { useCallback, useState } from "preact/hooks";

function mergeRefs<T>(...refs: (RefCallback<T> | RefObject<T> | null | undefined)[]): RefCallback<T> {
    return (value: T | null) => {
        refs.forEach(ref => {
            if (typeof ref === 'function') {
                ref(value)
            } else if (ref != null) {
                ref.current = value
            }
        })
    }
}

/**
 * Allows accessing the element a ref references as soon as it references it.
 * This hook returns a hook--useRefElementProps modifies the props that you were going to pass to an HTMLElement, 
 * adding a RefCallback and merging it with any existing ref that existed on the props.
 */
export function useRefElement<T>() {
    const [element, setElement] = useState<T | null>(null);
    const myRef = useCallback((e: T | null) => { if (e) setElement(() => e) }, []);

    return {
        useRefElementProps: useCallback(<P extends { ref?: Ref<T> }>({ ref, ...rest }: P) => ({ ...rest, ref: mergeRefs(ref, myRef) }), [myRef]),
        element
    }
}


