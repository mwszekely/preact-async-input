import { h, Ref } from "preact";
import { forwardElementRef } from "../forward-element-ref";
import { usePendingMode } from "../pending-mode";
import { InputPropsForAnyType, TextareaAttributes } from "../prop-types";
import { ProvideId, useProvidedId } from "../provide-id";
import { ProvideAsyncHandlerInfo, useAsyncEventHandler } from "../use-async-event-handler";
import { useHasFocus } from "../use-has-focus";
import { useLostFocusWhilePending } from "./base";


export interface TextAreaProps extends InputPropsForAnyType<string, HTMLTextAreaElement, TextareaAttributes> {

}


export const TextArea = forwardElementRef(function TextArea(p: TextAreaProps, ref: Ref<HTMLTextAreaElement>) {
    let { id, value, onInput: userOnInput, disabled, readOnly, childrenPost, childrenPre, hasFocus, ...props } = useHasFocus(p);


    // const { enteredValueIsValid, handler: parsedUserOnInput, valueAsEntered } = useParsedEvent(t => `${t.target.value}`, value ?? "", hasFocus, userOnInput);
    const { pending, syncHandler: onInput, fulfilled, error, startedTime, latestConvertedValue } = useAsyncEventHandler<string, Event>({ convertEvent, asyncHandler: userOnInput });
    const lostFocusWhilePending = useLostFocusWhilePending({ pending, hasFocus });
    const pendingMode = usePendingMode();

    if (lostFocusWhilePending) {
        if (pendingMode == "disabled")
            disabled = true;
        else if (pendingMode == "readOnly")
            readOnly = true;
    }

    if (pendingMode == "disabled")
        disabled ||= (pending && !hasFocus);
    else if (pendingMode == "readOnly")
        readOnly ||= (pending && !hasFocus);


    const randomId = useProvidedId();
    id ??= randomId;

    return (
        <ProvideId id={id}>
            <ProvideAsyncHandlerInfo pending={pending} error={error} latestConvertedValue={latestConvertedValue} fulfilled={fulfilled} startedTime={startedTime}>
                {childrenPre}
                <textarea {...props} id={id} ref={ref} disabled={disabled} readOnly={readOnly} value={(pending ? (latestConvertedValue) : value) ?? ""} onInput={onInput} />
                {childrenPost}
            </ProvideAsyncHandlerInfo>
        </ProvideId>
    )
});

function convertEvent({ target }: Event) {
    const value = (target as HTMLInputElement).value;
    return value ?? "";
}
