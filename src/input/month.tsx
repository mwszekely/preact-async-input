import { h } from "preact";
import { forwardRef } from "preact/compat";
import { Ref } from "preact/hooks";
import { Temporal } from "proposal-temporal";
import { InputPropsForAnyType, NumberAndDateInputAttributes } from "../prop-types";
import { Input } from "./base";



export interface InputMonthProps extends Omit<InputPropsForAnyType<Temporal.PlainYearMonth | null, HTMLInputElement, NumberAndDateInputAttributes>, "min" | "max"> {
    min?: Temporal.PlainYearMonth;
    max?: Temporal.PlainYearMonth;
    step?: number;
}

function dateToString(date: Temporal.PlainYearMonth | null | undefined) {
    return !date ? null : `${date.year.toString().padStart(4, "0")}-${date.month.toString().padStart(2, "0")}`
}

function convertMonth(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    if (value == "" || value == null)
        return null;
    try {
        let valueAsDate = Temporal.PlainYearMonth.from(value);
        return valueAsDate;
    }
    catch (ex) {
        return undefined;
    }
}

function InputMonthWF(p: InputMonthProps, ref: Ref<HTMLInputElement>) {
    const { value, max, min, ...props } = p;
    return <Input ref={ref} convert={convertMonth} type="month" {...(props)} value={dateToString(p.value) ?? undefined} max={dateToString(p.max) ?? undefined} min={dateToString(p.min) ?? undefined} />
}

export const InputMonth = forwardRef(InputMonthWF) as typeof InputMonthWF;
