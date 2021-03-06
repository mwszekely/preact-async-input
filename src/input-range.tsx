import { Ref, h } from "preact";
import { forwardElementRef } from "./util/forward-element-ref";
import { InputPropsForAnyType, NumberAndDateInputAttributes } from "./prop-types";
import { Input } from "./input-base";

type RangeExcluded = "accept" | "alt" | "checked" | "dirname" | "formaction" | "formenctype" | "formmethod" | "formnovalidate" | "formtarget" | "height" | "maxlength" | "minlength" | "multiple" | "pattern" | "placeholder" | "readonly" | "required" | "size" | "src" | "width";


export interface InputRangeProps extends Exclude<InputPropsForAnyType<number | null, HTMLInputElement, NumberAndDateInputAttributes>, RangeExcluded> {
    min: number;
    max: number;
    step?: number;
}

function convertRange({ target }: Event) {
    const value = (target as HTMLInputElement).value;
    if (value == "" || value == null)
        return null;
    let valueAsRange = Number(value.trim());
    if (isFinite(valueAsRange))
        return valueAsRange;
    return undefined;
}

export const InputRange = forwardElementRef(function InputRange(p: InputRangeProps, ref: Ref<HTMLInputElement>) {
    return <Input ref={ref} convert={convertRange} type="range" {...p} value={p.value?.toString() ?? ""} max={(p.max.toString())} min={p.min.toString()} />
})


