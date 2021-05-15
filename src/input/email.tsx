import { h } from "preact";
import { Ref } from "preact/hooks";
import { forwardElementRef } from "../forward-element-ref";
import { EmailInputAttributes, InputPropsForAnyType } from "../prop-types";
import { Input } from "./base";


export interface InputEmailProps extends InputPropsForAnyType<string, HTMLInputElement, EmailInputAttributes> {
}



function convertEmail({ target }: Event) {
    return (target as HTMLInputElement).value ?? "";
}

export const InputEmail = forwardElementRef(function InputEmail(p: InputEmailProps, ref: Ref<HTMLInputElement>) {
    return <Input convert={convertEmail} type="email" {...p} value={p.value ?? ""} ref={ref} />
})


