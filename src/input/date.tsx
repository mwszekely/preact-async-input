import { h } from "preact";
import { Ref } from "preact/hooks";
import { Temporal } from "proposal-temporal";
import { forwardElementRef } from "../forward-element-ref";
import { InputPropsForAnyType, NumberAndDateInputAttributes } from "../prop-types";
import { Input } from "./base";




export interface InputDateProps extends Omit<InputPropsForAnyType<Temporal.PlainDate | null, HTMLInputElement, NumberAndDateInputAttributes>, "min" | "max"> {
    min?: Temporal.PlainDate;
    max?: Temporal.PlainDate;
    step?: number;
}

function dateToString(date: Temporal.PlainDate | null | undefined) {
    return !date ? undefined : `${date.year.toString().padStart(4, "0")}-${date.month.toString().padStart(2, "0")}-${date.day.toString().padStart(2, "0")}`
}

function convertDate({ target }: InputEvent) {
    const value = (target as HTMLInputElement).value;

    if (value == "" || value == null)
        return null;

    return Temporal.PlainDate.from(value);
}

export const InputDate = forwardElementRef(function InputDate(p: InputDateProps, ref: Ref<HTMLInputElement>) {
    return <Input ref={ref} convert={convertDate} type="date" {...(p)} value={dateToString(p.value) ?? ""} max={dateToString(p.max)} min={dateToString(p.min)} />
})



