import { h } from "preact";
import { forwardRef } from "preact/compat";
import { Ref } from "preact/hooks";
import { Temporal } from "proposal-temporal";
import { InputPropsForAnyType, NumberAndDateInputAttributes } from "../prop-types";
import { Input } from "./base";

const { PlainDate } = Temporal;
type PlainDate = InstanceType<typeof PlainDate>;


export interface InputDateProps extends Omit<InputPropsForAnyType<PlainDate | null, HTMLInputElement, NumberAndDateInputAttributes>, "min" | "max"> {
    min?: PlainDate;
    max?: PlainDate;
    step?: number;
}

function dateToString(date: PlainDate | null | undefined) {
    return !date ? undefined : `${date.year.toString().padStart(4, "0")}-${date.month.toString().padStart(2, "0")}-${date.day.toString().padStart(2, "0")}`
}

function convertDate({ target }: InputEvent) {
    const value = (target as HTMLInputElement).value;

    if (value == "" || value == null)
        return null;

    return PlainDate.from(value);
}

function InputDateWF(p: InputDateProps, ref: Ref<HTMLInputElement>) {
    return <Input ref={ref} convert={convertDate} type="date" {...(p)} value={dateToString(p.value) ?? ""} max={dateToString(p.max)} min={dateToString(p.min)} />
}


export const InputDate = forwardRef(InputDateWF) as typeof InputDateWF;

