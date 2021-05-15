import { ComponentChildren, h, Ref } from "preact";
import { forwardElementRef } from "../forward-element-ref";
import { usePendingMode } from "../pending-mode";
import { VeryCommonHTMLAttributes } from "../prop-types";
import { ProvideId, useProvidedId } from "../provide-id";
import { ProvideAsyncHandlerInfo, useAsyncEventHandler } from "../use-async-event-handler";

export type ButtonProps<E extends HTMLElement = HTMLButtonElement> = Omit<Pick<h.JSX.HTMLAttributes<E>, VeryCommonHTMLAttributes | "disabled" | "type">, "onInput" | "value"> & {
    onClick?(unusedForConsistency: null, staleEvent: Event): void | Promise<void>;
    childrenPre?: ComponentChildren;
    childrenPost?: ComponentChildren;
    children?: ComponentChildren;
    ref?: Ref<HTMLButtonElement>;
}

function returnNull() { return null; }

export const Button = forwardElementRef(<P extends ButtonProps>(p: P, ref: Ref<P extends ButtonProps<infer E>? E : HTMLElement>) => {
    let { id, type, onClick: userOnClick, disabled, children, childrenPost, childrenPre, ...props } = p;


    // Buttons can't be readonly
    let pendingMode = usePendingMode();
    if (pendingMode == "readOnly")
        pendingMode = "disabled";


    const { pending, syncHandler: onClick, fulfilled, startedTime, error, latestConvertedValue } = useAsyncEventHandler<null, Event>({ asyncHandler: userOnClick, convertEvent: returnNull });

    const randomId = useProvidedId();
    id ??= randomId;

    if (pending && pendingMode == "disabled")
        disabled = true;

    return (
        <ProvideAsyncHandlerInfo pending={pending} error={error} latestConvertedValue={latestConvertedValue} fulfilled={fulfilled} startedTime={startedTime}>
            <ProvideId id={id}>
                {childrenPre}
                <button {...props} id={id} ref={ref} type={type ?? "button"} disabled={disabled} onClick={onClick}>{children}</button>
                {childrenPost}
            </ProvideId>
        </ProvideAsyncHandlerInfo>
    )
});

