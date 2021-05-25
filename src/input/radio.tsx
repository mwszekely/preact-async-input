import { Ref, createContext, h, RenderableProps } from "preact";
import { useContext } from "preact/hooks";
import { forwardElementRef } from "../forward-element-ref";
import { InputPropsForAnyType } from "../prop-types";
import { ProvideId, useProvidedId } from "../provide-id";
import { ProvideAsyncHandlerInfo, useAsyncEventHandler } from "../use-async-event-handler";


export interface InputRadioGroupProps extends Pick<h.JSX.HTMLAttributes<HTMLInputElement>, "disabled" | "value" | "name" | "children"> {
    value: string;
    name: string;
    onInput: (value: string, e: Event) => (void | Promise<void>);
}

export interface InputRadioProps extends Omit<InputPropsForAnyType<string, HTMLInputElement, "disabled" | "name" | "value">, "checked" | "onInput" | "name"> {
    value: string;
}

function convertEvent(e: InputEvent) {
    const target = (e.target as HTMLInputElement);
    return target.value;
}

export function InputRadioGroup(p: RenderableProps<InputRadioGroupProps>) {
    const { disabled, value, name, children, onInput: userOnInput, ...props } = p;

    //const { enteredValueIsValid, handler: parsedUserOnInput, valueAsEntered } = useParsedEvent(convert, value, false, userOnInput);
    const { pending, syncHandler: onInput, latestConvertedValue, fulfilled, startedTime, error } = useAsyncEventHandler<string, Event>({ asyncHandler: userOnInput, convertEvent });

    return (
        <SelectedValueContext.Provider value={(pending? latestConvertedValue : value) ?? ""}>
            <RadioGroupDisabledContext.Provider value={pending || disabled || false}>
                <RadioGroupNameContext.Provider value={name}>
                    <OnInputContext.Provider value={onInput}>



                        <ProvideAsyncHandlerInfo pending={pending} error={error} latestConvertedValue={latestConvertedValue} fulfilled={fulfilled} startedTime={startedTime}>
                            {children}
                        </ProvideAsyncHandlerInfo>


                    </OnInputContext.Provider>
                </RadioGroupNameContext.Provider>
            </RadioGroupDisabledContext.Provider>
        </SelectedValueContext.Provider>)
}

const SelectedValueContext = createContext("");
const RadioGroupDisabledContext = createContext(false);
const RadioGroupNameContext = createContext("");
const OnInputContext = createContext<((e: Event) => void) | undefined>(undefined);
export const InputRadio = forwardElementRef(function InputRadio(p: InputRadioProps, ref: Ref<HTMLInputElement>) {
    let { id, childrenPost, childrenPre, value, disabled, ...props } = p;

    const name = useContext(RadioGroupNameContext);
    const selectedValue = useRadioSelectedValue();

    const onInput = useContext(OnInputContext);

    id = useProvidedId("backup", id);

    return (
        <ProvideId id={id}>
            {childrenPre}
            <input id={id} ref={ref} type="radio" checked={selectedValue == value} name={name} value={value} onInput={onInput} disabled={useContext(RadioGroupDisabledContext) || disabled} {...props} />
            {childrenPost}
        </ProvideId>)
});

export function useRadioSelectedValue() {
    return useContext(SelectedValueContext);
}

