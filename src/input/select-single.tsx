import { createContext, h, RenderableProps } from "preact";
import { Ref, useContext } from "preact/hooks";
import { forwardElementRef } from "../forward-element-ref";
import { usePendingMode } from "../pending-mode";
import { InputPropsForAnyType, SingleOptionInputAttributes, SingleSelectInputAttributes } from "../prop-types";
import { ProvideId, useProvidedId } from "../provide-id";
import { ProvideAsyncHandlerInfo, useAsyncEventHandler } from "../use-async-event-handler";
import { useHasFocus } from "../use-has-focus";
import { useLostFocusWhilePending } from "./base";

export interface SelectSingleProps extends Omit<InputPropsForAnyType<string, HTMLSelectElement, SingleSelectInputAttributes>, "onInput"> {
    value: string;
    onInput(value: string, e: Event): (void | Promise<void>);
    size?: number;
}

export interface OptionSingleProps extends Omit<InputPropsForAnyType<string, HTMLOptionElement, SingleOptionInputAttributes>, "onInput" | "name"> {
    value: string;
}

function convertEvent(e: Event) {
    const target = e.target as HTMLSelectElement;
    return target.value;
}

export const SelectSingle = forwardElementRef(function SelectSingle(p: RenderableProps<SelectSingleProps>, ref: Ref<HTMLSelectElement>) {
    let { id, disabled, value, children, size, onInput: userOnInput, hasFocus, ...props } = useHasFocus(p);

    //    const { enteredValueIsValid, handler: parsedUserOnInput, valueAsEntered } = useParsedEvent(convert, value, hasFocus, userOnInput);
    const { pending, syncHandler: onInput, latestConvertedValue, fulfilled, error, startedTime } = useAsyncEventHandler({ convertEvent, asyncHandler: userOnInput });
    const lostFocusWhilePending = useLostFocusWhilePending({ pending, hasFocus });
    const pendingMode = usePendingMode();

    if (lostFocusWhilePending) {
        if (pendingMode == "disabled" || pendingMode == "readOnly")
            disabled = true;
    }

    id = useProvidedId("backup", id);

    return (
        <SelectedValueContext.Provider value={pending ? (latestConvertedValue ?? value) : value ?? ""}>
            <ProvideId id={id}>
                <ProvideAsyncHandlerInfo pending={pending} error={error} latestConvertedValue={latestConvertedValue} fulfilled={fulfilled} startedTime={startedTime}>
                    {hasFocus.toString()}
                    <select {...props} id={id} ref={ref} size={size} multiple={false} onChange={onInput} disabled={disabled || (pending && !hasFocus)}>
                        {children}
                    </select>
                </ProvideAsyncHandlerInfo>

            </ProvideId>
        </SelectedValueContext.Provider>
    )
})

const SelectedValueContext = createContext("");
//const OnInputContext = createContext<((e: Event) => void) | undefined>(undefined);
export const OptionSingle = forwardElementRef(function OptionSingle(p: RenderableProps<OptionSingleProps>, ref: Ref<HTMLOptionElement>) {
    const { value, disabled, ...props } = p;

    const selectedValue = useContext(SelectedValueContext);

    //const onInput = useContext(OnInputContext)

    return <option ref={ref} selected={selectedValue == value} multiple={false} value={value} disabled={disabled} {...props} />
})
