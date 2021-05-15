import { h } from "preact";
import { useCallback, useState } from "preact/hooks";

/**
 * Given a set of props, returns a new set of props that allows you to keep track of 
 * whether or not the HTML element you pass the props to currently has focus.
 */
export function useHasFocus<P extends { onFocus?: (e: h.JSX.TargetedFocusEvent<any>) => void, onBlur?: (e: h.JSX.TargetedFocusEvent<any>) => void }>(p: P): P & { hasFocus: boolean } {

    const { onFocus: userOnFocus, onBlur: userOnBlur, ...props } = p;


    const [hasFocus, setHasFocus] = useState(false);

    const onFocus = useCallback((e: h.JSX.TargetedFocusEvent<HTMLInputElement>) => {
        userOnFocus?.bind(e.target as HTMLInputElement, e);
        setHasFocus(true);
    }, [userOnFocus]);

    const onBlur = useCallback((e: h.JSX.TargetedFocusEvent<HTMLInputElement>) => {
        userOnBlur?.bind(e.target as HTMLInputElement, e);
        setHasFocus(false);
    }, [userOnBlur]);

    return {
        onFocus,
        onBlur,
        hasFocus,
        ...props
    } as P & { hasFocus: boolean; }

}
