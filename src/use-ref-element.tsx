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
 * Returns both a ref and the element it contains
 * (unlike useRef the component is re-rendered when we have the ref)
 */
export function useRefElement<T>(givenRef?: Ref<T> | undefined) {
    const [element, setElement] = useState<T | null>(null);
    const ref = mergeRefs(givenRef, useCallback((e: T | null) => { setElement(() => e) }, []));

    return {
        ref,
        element
    }
}

