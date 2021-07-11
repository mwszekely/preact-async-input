import { Ref, RefCallback, RefObject } from "preact";
import { useCallback } from "preact/hooks";


function processRef<T>(instance: T | null, ref: Ref<T> | null | undefined) {
    if (typeof ref === "function") {
        ref(instance);
    } else if (ref != null) {
        (ref as RefObject<T | null>).current = instance;
    }
}

export function useMergedRefs<T>(lhs: Ref<T> | undefined, rhs: Ref<T> | undefined): RefCallback<T> {
    return useCallback((current: T | null) => {
        processRef(current, lhs);
        processRef(current, rhs);
    }, [lhs, rhs]);
}