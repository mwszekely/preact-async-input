import { ComponentChildren, h, Ref } from "preact";
import { forwardRef } from "preact/compat";
import { usePendingMode } from "../pending-mode";
import { VeryCommonHTMLAttributes } from "../prop-types";
import { ProvideId, useProvidedId } from "../provide-id";
import { ProvideAsyncHandlerInfo, useAsyncEventHandler } from "../use-async-event-handler";

export type ButtonProps = Omit<Pick<h.JSX.HTMLAttributes<HTMLButtonElement>, VeryCommonHTMLAttributes | "disabled" | "type">, "onInput" | "value"> & {
    onClick(unusedForConsistency: null, staleEvent: Event): void | Promise<void>;
    childrenPre?: ComponentChildren;
    childrenPost?: ComponentChildren;
    children?: ComponentChildren;
    ref?: Ref<HTMLButtonElement>;
}

function returnNull() { return null; }

function ButtonWF(p: ButtonProps, ref: Ref<HTMLButtonElement>) {
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
                <button {...props} id={id} ref={ref} type={type} disabled={disabled} onClick={onClick}>{children}</button>
                {childrenPost}
            </ProvideId>
        </ProvideAsyncHandlerInfo>
    )
}



export const Button = forwardRef(ButtonWF) as typeof ButtonWF;
