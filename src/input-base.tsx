import { h, Ref } from "preact";
import { useEffect, useState } from "preact/hooks";
import { ProvideId, useProvidedId } from "./provide-id";
import { usePendingMode } from "./pending-mode";
import { InputPropsForAnyType } from "./prop-types";
import { AsyncConvertError, ProvideAsyncHandlerInfo, useAsyncEventHandler } from "./use-async-event-handler";
import { useHasFocus } from "./util/use-has-focus";
import { forwardElementRef } from "./util/forward-element-ref";

export interface InputProps<T> extends Omit<InputPropsForAnyType<T, HTMLInputElement, keyof h.JSX.HTMLAttributes<HTMLInputElement>>, "value" | "onInput"> {
    type: "color" | "date" | "datetime-local" | "email" | "month" | "number" | "password" | "search" | "tel" | "text" | "time" | "url" | "week" | "checkbox" | "radio" | "range",
    convert?(e: Event): T | typeof AsyncConvertError;

    value: string | undefined;
    checked?: boolean | undefined;

    onInput(value: T, staleEvent: InputEvent): (void | Promise<void>);
}
/**
 * A hook used by the base input component (but also other components that don't use the base input component)
 * that allows for an easy way to detect when an async input should be disabled because it's pending.
 * If true is returned, the input component should be marked as disabled because 
 * its event handler is pending and the user is no longer actively editing its contents.
 * @returns Whether the input component should be in its "disabled because it's waiting on a pending event handler and the user isn't actively editing it" state.
 */
export function useLostFocusWhilePending({ pending, hasFocus }: { pending: boolean, hasFocus: boolean }) {
    const [lostFocusWhilePending, setLostFocusWhilePending] = useState(false);

    useEffect(() => {
        console.log("InputBase.useEffect");
        if (pending) {
            if (!hasFocus) {
                console.log("InputBase.setLostFocusWhilePending(true)");
                setLostFocusWhilePending(true);
            }
        }
        if (!pending) {
            console.log("InputBase.setLostFocusWhilePending(false)");
            setLostFocusWhilePending(false);
        }
    }, [pending, hasFocus]);

    return lostFocusWhilePending;
}


/**
 * An <input> element that automatically handles an async onInput function.
 * @param p The props to pass to the underlying <input> component. 
 * All given props are either forwarded directly or modified and then forwarded .
 * (For example, onFocus and onBlur, if given, are called after some custom code that also needs that event information.
 * Or disabled is whatever is given as a prop, unless the component is pending, in which case it's forced to true).
 */
export const Input = forwardElementRef(function Input<T = string>(p: InputProps<T>, ref: Ref<HTMLInputElement>) {
    let { id, value, checked, convert, type, onInput: userOnInput, disabled, readOnly, childrenPost, childrenPre, hasFocus, ...props } = useHasFocus(p);

    // For checkboxes, we pretend we never have focus so that they're always immediately disabled when changed.
    // (In contrast to, say, text inputs, where the user can type freely until focus is lost)
    if (["radio", "checkbox"].includes(type))
        hasFocus = false;

    // These controls don't support the readonly attribute
    let pendingMode = usePendingMode();
    if (["radio", "checkbox", "range"].includes(type) && pendingMode == "readOnly")
        pendingMode = "disabled";

    const prop = ["radio", "checkbox"].includes(type) ? "checked" : "value";
    const valueOrChecked = (prop == "value" ? value : checked);

    const { pending, syncHandler: onInput, fulfilled, startedTime, error, latestConvertedValue } = useAsyncEventHandler<T, Event>({ asyncHandler: userOnInput as any, convertEvent: (convert ?? defaultConvert) });

    const lostFocusWhilePending = useLostFocusWhilePending({ pending, hasFocus });

    if (lostFocusWhilePending) {
        if (pendingMode == "disabled")
            disabled = true;
        else if (pendingMode == "readOnly")
            readOnly = true;
    }

    id = useProvidedId(id, "backup");

    return (
        <ProvideAsyncHandlerInfo pending={pending} error={error} latestConvertedValue={latestConvertedValue} fulfilled={fulfilled} startedTime={startedTime}>
            <ProvideId id={id}>
                {childrenPre}
                <input {...props} id={id} ref={ref} type={type} readOnly={readOnly} disabled={disabled} {...{ [prop]: pending ? (latestConvertedValue ?? valueOrChecked) : valueOrChecked }} onInput={onInput} />
                {childrenPost}
            </ProvideId>
        </ProvideAsyncHandlerInfo>
    )
});


function defaultConvert({ target }: Event): any {
    const value = (target as HTMLInputElement).value;
    return value ?? "";
}
