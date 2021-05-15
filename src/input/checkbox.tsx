import { h } from "preact";
import { Ref, useEffect } from "preact/hooks";
import { forwardElementRef } from "../forward-element-ref";
import { CheckboxInputAttributes, InputPropsForAnyType } from "../prop-types";
import { useRefBackup } from "../use-ref-backup";
import { Input } from "./base";

export interface InputCheckboxProps extends Omit<InputPropsForAnyType<boolean | "indeterminate", HTMLInputElement, CheckboxInputAttributes>, "checked" | "onInput" | "value"> {
    checked: boolean | "indeterminate";
    onInput(value: boolean, staleEvent: InputEvent): (void | Promise<void>)
}

function convertEvent(e: Event) {
    const target = e.target as HTMLInputElement;
    return target.checked;
}

export const InputCheckbox = forwardElementRef(function InputCheckbox(p: InputCheckboxProps, ref: Ref<HTMLInputElement>) {
    const { checked: checkedOrIndeterminate, ...props } = p;

    ref = useRefBackup(ref);

    const checked = (checkedOrIndeterminate === true);
    const indeterminate = (checkedOrIndeterminate === "indeterminate");

    useEffect(() => {
        if (ref.current)
            ref.current.indeterminate = indeterminate;
    }, [indeterminate]);


    return <Input ref={ref} value={undefined} type="checkbox" convert={convertEvent} {...props} checked={checked} />;
})



