import { Ref, h } from "preact";
import { useCallback } from "preact/hooks";
import { forwardElementRef } from "../forward-element-ref";
import { InputPropsForAnyType, TextInputAttributes } from "../prop-types";
import { Input } from "./base";



interface ColorInputProps1 extends Omit<InputPropsForAnyType<string, HTMLInputElement, TextInputAttributes>, "value" | "onInput"> {
    value?: never;

    valueR: number; // 0 - 255
    valueG: number; // 0 - 255
    valueB: number; // 0 - 255

    onInput: (value: `#${string}`, valueR: number, valueG: number, valueB: number, staleEvent: Event) => void | Promise<void>
}

interface ColorInputProps2 extends Omit<InputPropsForAnyType<string, HTMLInputElement, TextInputAttributes>, "value" | "onInput"> {
    value: `#${string}`;

    valueR?: never; // 0 - 255
    valueG?: never; // 0 - 255
    valueB?: never; // 0 - 255

    onInput: (value: `#${string}`, valueR: number, valueG: number, valueB: number, staleEvent: Event) => void | Promise<void>
}

export type InputColorProps = (ColorInputProps1 | ColorInputProps2);

function convertColor(e: Event) { return (e.target as HTMLInputElement).value as `#${string}`; }

export const InputColor = forwardElementRef(function InputColor(p: InputColorProps, ref: Ref<HTMLInputElement>) {

    const { onInput } = p;

    const modifiedOnInput = useCallback((color: `#${string}`, staleEvent: Event) => {
        const r = parseInt(color.substr(1 + (0 * 2), 2), 16);
        const g = parseInt(color.substr(1 + (1 * 2), 2), 16);
        const b = parseInt(color.substr(1 + (2 * 2), 2), 16);
        console.assert(color == `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`);
        onInput(color, r, g, b, staleEvent);
    }, [onInput]);

    if ("value" in p) {
        const { value, onInput: _unused, ...props } = p;
        return <Input ref={ref} convert={convertColor} type="color" {...props} onInput={modifiedOnInput} value={value} />
    }
    else {
        const { valueR, valueG, valueB, onInput: _unused, ...props } = p;
        const value = `#${p.valueR.toString(16).padStart(2, "0")}${p.valueG.toString(16).padStart(2, "0")}${p.valueB.toString(16).padStart(2, "0")}`;
        return <Input ref={ref} convert={convertColor} type="color" {...props} onInput={modifiedOnInput} value={value} />
    }
})



