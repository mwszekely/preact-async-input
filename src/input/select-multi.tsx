import { createContext, Fragment, h, RenderableProps } from "preact";
import { forwardRef } from "preact/compat";
import { Ref, useCallback, useState } from "preact/hooks";
import { InputPropsForAnyType, MultiOptionInputAttributes, MultiSelectInputAttributes } from "../prop-types";
import { ProvideId, useProvidedId } from "../provide-id";
import { ProvideAsyncHandlerInfo, useAsyncEventHandler, useIsPending, useLatestValue } from "../use-async-event-handler";
import { useHasFocus } from "../use-has-focus";



export interface SelectMultiProps extends Omit<InputPropsForAnyType<string, HTMLSelectElement, MultiSelectInputAttributes>, "onInput" | "value"> {
    size: number;
    onChange(selectedValues: Set<string>, e: Event): void | Promise<void>;
}

export interface OptionMultiProps extends Omit<InputPropsForAnyType<string, HTMLOptionElement, MultiOptionInputAttributes>, "onInput" | "name" | "childrenPre" | "childrenPost"> {
    value: string;
    selected: boolean;
    //onChange(selected: boolean): (void | Promise<void>)
}

/*function convertEventForSelect(e: Event) {
    const target = e.target as HTMLSelectElement;

    let allValues: string[] = Array.from(target.selectedOptions).map(option => option.value);

    return allValues;
}*/

function eqSet<T>(as: Set<T>, bs: Set<T>): boolean {
    if (as.size !== bs.size) return false;
    for (var a of as) if (!bs.has(a)) return false;
    return true;
}


const SelectedValues = createContext("");

function SelectMultiWF(p: RenderableProps<SelectMultiProps>, ref: Ref<HTMLSelectElement>) {
    let { id, childrenPost, childrenPre, disabled, size, children, hasFocus, onChange: userOnChange, ...props } = useHasFocus(p);

    //const ssotSelectedValuesRef = useRef<Map<string, boolean | null>>(new Map());
    //const optionsOnInputs = useRef<Map<string, (selectedValues: Set<string>, event: Event) => (void | Promise<void>)>>(new Map());




    const convertEventForSelect = useCallback((e: Event) => {
        const target = e.target as HTMLSelectElement;
        return new Set(Array.from(target.selectedOptions).map(option => option.value));
    }, [])

    const { syncHandler: onChange, pending, fulfilled, startedTime, error, latestConvertedValue } = useAsyncEventHandler<Set<string>, Event>({
        convertEvent: convertEventForSelect,
        asyncHandler: userOnChange
    });

    const randomId = useProvidedId();
    id ??= randomId;

    const [k, setK] = useState(0);


    return (
        //<ProvideSelectWithOptionOnChange.Provider value={useCallback((value, onChange) => { onChange == null ? optionsOnInputs.current.delete(value) : optionsOnInputs.current.set(value, onChange) }, [optionsOnInputs])}>

        <ProvideId id={id}>
            <ProvideAsyncHandlerInfo pending={pending} error={error} latestConvertedValue={latestConvertedValue} fulfilled={fulfilled} startedTime={startedTime}>
                <div>{pending.toString()}</div>
                <div className="test">{Array.from(latestConvertedValue ?? []).join(";")}</div>
                {/*childrenPre*/}
                <select {...props} ref={ref} size={size} multiple={true} onInput={onChange} disabled={disabled}>
                    {children}
                </select>
                {childrenPost}
            </ProvideAsyncHandlerInfo>
        </ProvideId>
        //</ProvideSelectWithOptionOnChange.Provider>
    )
}

//const ProvideSelectWithOptionOnChange = createContext<(value: string, onChange: null | ((selectedValues: string[], e: Event) => (void | Promise<void>))) => void>(null!);


function OptionMultiWF(p: RenderableProps<OptionMultiProps>, ref: Ref<HTMLOptionElement>) {
    let { value, disabled, selected, ...props } = p;

    //const [selectionOverride, setSelectionOverride] = useState<null | boolean>(null);


    //const {pending, latestConvertedValue  } = useAsyncEventHandlerInfo<Set<string>>()!;
    const pending = useIsPending();
    const latestConvertedValue = useLatestValue<Set<string>>();

    const pendingSelected = (pending ? latestConvertedValue?.has(value) : undefined);

    props.children = `${value}:${pending ? "PENDING" : ""} ${(pendingSelected ?? "null").toString()} ?? ${selected.toString()}`

    return <option ref={ref} selected={pendingSelected ?? selected} value={value} disabled={disabled} {...props} />;
}

function makeConvertEvent(value: string) {
    return function convertEvent(e: Event) {
        const target = (e.target as HTMLSelectElement);
        const options = target.selectedOptions;
        for (let option of options) {
            if (option.value == value) {
                return true;
            }
        }
        return false;
    }
}

export const SelectMulti = forwardRef(SelectMultiWF) as typeof SelectMultiWF;
export const OptionMulti = forwardRef(OptionMultiWF) as typeof OptionMultiWF;
