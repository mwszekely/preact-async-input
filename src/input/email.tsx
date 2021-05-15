import { h } from "preact";
import { forwardRef } from "preact/compat";
import { Ref } from "preact/hooks";
import { EmailInputAttributes, InputPropsForAnyType } from "../prop-types";
import { Input } from "./base";


export interface InputEmailProps extends InputPropsForAnyType<string, HTMLInputElement, EmailInputAttributes> {
}



function convertEmail({ target }: Event) {
    return (target as HTMLInputElement).value ?? "";
}

function InputEmailWF(p: InputEmailProps, ref: Ref<HTMLInputElement>) {
    return <Input convert={convertEmail} type="email" {...p} value={p.value ?? ""} />
}

export const InputEmail = forwardRef(InputEmailWF) as typeof InputEmailWF;

