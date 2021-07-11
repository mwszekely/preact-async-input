import { Ref, h } from "preact";
import { Temporal } from "proposal-temporal";
import { forwardElementRef } from "./util/forward-element-ref";
import { InputPropsForAnyType, NumberAndDateInputAttributes } from "./prop-types";
import { Input } from "./input-base";



export interface InputTimeProps extends Omit<InputPropsForAnyType<Temporal.PlainTime | null, HTMLInputElement, NumberAndDateInputAttributes>, "min" | "max"> {
    min?: Temporal.PlainTime;
    max?: Temporal.PlainTime;
    step?: number;
}

function timeToString(time: Temporal.PlainTime | null | undefined) {
    return !time ? null : `${time.hour.toString().padStart(2, "0")}-${time.minute.toString().padStart(2, "0")}-${time.second.toString().padStart(2, "0")}`
}

function convertTime(value: string, e: Event) {
    if (value == "" || value == null)
        return null;
    try {
        let valueAsDate = Temporal.PlainDate.from(value);
        return valueAsDate;
    }
    catch (ex) {
        return undefined;
    }
}

export const InputTime = forwardElementRef(function InputTime(p: InputTimeProps) {
    return <Input convert={convertTime} type="time" {...(p as any)} value={timeToString(p.value)} max={timeToString(p.max)} min={timeToString(p.min)} />
})


