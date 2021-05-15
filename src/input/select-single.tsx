import { createContext, h, RenderableProps } from "preact";
import { forwardRef } from "preact/compat";
import { Ref, useContext } from "preact/hooks";
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

function SelectSingleWF(p: RenderableProps<SelectSingleProps>, ref: Ref<HTMLSelectElement>) {
    let { id, disabled, value, children, size, onInput: userOnInput, hasFocus, ...props } = useHasFocus(p);

    //    const { enteredValueIsValid, handler: parsedUserOnInput, valueAsEntered } = useParsedEvent(convert, value, hasFocus, userOnInput);
    const { pending, syncHandler: onInput, latestConvertedValue, fulfilled, error, startedTime } = useAsyncEventHandler({ convertEvent, asyncHandler: userOnInput });
    const lostFocusWhilePending = useLostFocusWhilePending({ pending, hasFocus });
    const pendingMode = usePendingMode();

    if (lostFocusWhilePending) {
        if (pendingMode == "disabled" || pendingMode == "readOnly")
            disabled = true;
    }

    const randomId = useProvidedId();
    id ??= randomId;



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
}

const SelectedValueContext = createContext("");
//const OnInputContext = createContext<((e: Event) => void) | undefined>(undefined);
function OptionSingleWF(p: RenderableProps<OptionSingleProps>, ref: Ref<HTMLOptionElement>) {
    const { value, disabled, ...props } = p;

    const selectedValue = useContext(SelectedValueContext);

    //const onInput = useContext(OnInputContext)

    return <option ref={ref} selected={selectedValue == value} multiple={false} value={value} disabled={disabled} {...props} />
}

export const SelectSingle = forwardRef(SelectSingleWF) as typeof SelectSingleWF;
export const OptionSingle = forwardRef(OptionSingleWF) as typeof OptionSingleWF;