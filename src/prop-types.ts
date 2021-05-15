import { h, ComponentChildren } from "preact";
import { Ref } from "preact/hooks";

/**
 * In general this is used to make sure we only show relevant properties for autocomplete
 * All properties are forwareded, but these are the ones that cover most cases
 */

export type VeryCommonHTMLAttributes = "id" | "className" | "class" | "style" | "tabIndex" | "role" | "draggable" | "accessKey" | "onFocus" | "onBlur";
export type VeryCommonInputAttributes = "name" | "disabled" | "autoFocus" | "list" | "required" | "value";
export type CheckboxInputAttributes = Exclude<VeryCommonInputAttributes, "value"> | "checked";
export type RadioGroupInputAttributes = Exclude<VeryCommonInputAttributes, "value"> | "name" | "value";
export type RadioInputAttributes = Exclude<VeryCommonInputAttributes, "value" | "checked">;
export type InputInputAttributes = VeryCommonInputAttributes | "alt" | "height" | "width" | "src";
export type FileInputAttributes = VeryCommonInputAttributes | "accept" | "files";
export type TextInputAttributes = VeryCommonInputAttributes | "autoComplete" | "maxLength" | "minLength" | "pattern" | "placeholder" | "readOnly" | "inputMode";
export type NumberAndDateInputAttributes = TextInputAttributes | "max" | "min" | "step";
export type EmailInputAttributes = TextInputAttributes | "multiple";
export type SingleSelectInputAttributes = VeryCommonInputAttributes;
export type SingleOptionInputAttributes = VeryCommonHTMLAttributes | "disabled" | "value";
export type MultiSelectInputAttributes = Exclude<VeryCommonInputAttributes, "value">;
export type MultiOptionInputAttributes = VeryCommonInputAttributes | "selected";
export type TextareaAttributes = VeryCommonInputAttributes | "rows" | "cols" | "readOnly";




// TODO: This is a type that's basically just "HTML element props but just the relevant ones + ones you pick"
// but it and all the various types derived from it are messy.
// They work, but they're all messy.
export type SimpleProps<E extends HTMLElement, I extends keyof h.JSX.HTMLAttributes<E>> = Pick<h.JSX.HTMLAttributes<E>, VeryCommonHTMLAttributes | I>;



export type InputPropsForAnyType<T, E extends HTMLElement, Attributes extends keyof h.JSX.HTMLAttributes<E>> = Omit<SimpleProps<E, Attributes>, "onInput" | "value" | "type"> & {
    value: T | null;
    onInput(value: T, staleEvent: Event): void | Promise<void>;
    childrenPre?: ComponentChildren;
    childrenPost?: ComponentChildren;
    ref?: Ref<HTMLInputElement>;
}
