import { Ref, createContext, Fragment, h, RenderableProps } from "preact";
import { useCallback, useState } from "preact/hooks";
import { forwardElementRef } from "./util/forward-element-ref";
import { InputPropsForAnyType, MultiOptionInputAttributes, MultiSelectInputAttributes } from "./prop-types";
import { ProvideId, useProvidedId } from "./provide-id";
import { ProvideAsyncHandlerInfo, useAsyncEventHandler, useIsPending, useLatestValue } from "./use-async-event-handler";
import { useHasFocus } from "./util/use-has-focus";



export interface SelectMultiProps extends Omit<InputPropsForAnyType<string, HTMLSelectElement, MultiSelectInputAttributes>, "onInput" | "value"> {
    size: number;
    onChange(selectedValues: Set<string>, e: Event): void | Promise<void>;
}

export interface OptionMultiProps extends Omit<InputPropsForAnyType<string, HTMLOptionElement, MultiOptionInputAttributes>, "onInput" | "name" | "childrenPre" | "childrenPost"> {
    value: string;
    selected: boolean;
}

export const SelectMulti = forwardElementRef(function SelectMulti(p: RenderableProps<SelectMultiProps>, ref: Ref<HTMLSelectElement>) {
    let { id, childrenPost, childrenPre, disabled, size, children, hasFocus, onChange: userOnChange, ...props } = useHasFocus(p);

    const convertEventForSelect = useCallback((e: Event) => {
        const target = e.target as HTMLSelectElement;
        return new Set(Array.from(target.selectedOptions).map(option => option.value));
    }, [])

    const { syncHandler: onChange, pending, fulfilled, startedTime, error, latestConvertedValue } = useAsyncEventHandler<Set<string>, Event>({
        convertEvent: convertEventForSelect,
        asyncHandler: userOnChange
    });

    id = useProvidedId(id, "backup");


    return (
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
    )
})


export const OptionMulti = forwardElementRef(function OptionMulti(p: RenderableProps<OptionMultiProps>, ref: Ref<HTMLOptionElement>) {
    let { value, disabled, selected, ...props } = p;

    //const [selectionOverride, setSelectionOverride] = useState<null | boolean>(null);


    //const {pending, latestConvertedValue  } = useAsyncEventHandlerInfo<Set<string>>()!;
    const pending = useIsPending();
    const latestConvertedValue = useLatestValue<Set<string>>();

    const pendingSelected = (pending ? latestConvertedValue?.has(value) : undefined);

    props.children = `${value}:${pending ? "PENDING" : ""} ${(pendingSelected ?? "null").toString()} ?? ${selected.toString()}`

    return <option ref={ref} selected={pendingSelected ?? selected} value={value} disabled={disabled} {...props} />;
})

