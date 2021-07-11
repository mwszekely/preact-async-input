import { Ref, h } from "preact";
import { forwardElementRef } from "./util/forward-element-ref";
import { InputPropsForAnyType, NumberAndDateInputAttributes } from "./prop-types";
import { Input } from "./input-base";


export interface InputNumberProps extends InputPropsForAnyType<number | null, HTMLInputElement, NumberAndDateInputAttributes> {
    min?: number;
    max?: number;
    step?: number;
}

function convertNumber({ target }: Event) {
    const value = (target as HTMLInputElement).value;
    if (value == "" || value == null)
        return null;
    let valueAsNumber = Number(value.trim());
    if (isFinite(valueAsNumber))
        return valueAsNumber;
    return undefined;
}

export const InputNumber = forwardElementRef(function InputNumber(p: InputNumberProps, ref: Ref<HTMLInputElement>) {
    return <Input ref={ref} convert={convertNumber} type="number" {...p} value={p.value?.toString() ?? ""} max={(p.max?.toString())} min={p.min?.toString()} />
})


