import { h } from "preact";
import { Ref } from "preact/hooks";
import { Temporal } from "proposal-temporal";
import { forwardElementRef } from "../forward-element-ref";
import { InputPropsForAnyType, NumberAndDateInputAttributes } from "../prop-types";
import { Input } from "./base";

type DateTime = Temporal.PlainDateTime;


export interface InputDateTimeProps extends Omit<InputPropsForAnyType<DateTime | null, HTMLInputElement, NumberAndDateInputAttributes>, "min" | "max"> {
    min?: DateTime;
    max?: DateTime;
    step?: number;
}

function datetimeToString(datetime: DateTime | null | undefined) {
    return !datetime ? undefined : `${datetime.year.toString().padStart(4, "0")}-${datetime.month.toString().padStart(2, "0")}-${datetime.day.toString().padStart(2, "0")}`
}

function convertDateTime({ target }: InputEvent) {
    const value = (target as HTMLInputElement).value;

    if (value == "" || value == null)
        return null;

    return Temporal.PlainDateTime.from(value);
}

export const InputDateTime = forwardElementRef(function InputDateTime(p: InputDateTimeProps, ref: Ref<HTMLInputElement>) {
    return <Input ref={ref} convert={convertDateTime} type="datetime-local" {...(p)} value={datetimeToString(p.value) ?? ""} max={datetimeToString(p.max)} min={datetimeToString(p.min)} />
});
