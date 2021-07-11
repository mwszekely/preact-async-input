import { Ref, RefCallback } from "preact";
import { useRefElement } from "./use-ref-element";

export function useRefBackup<E extends HTMLElement>(givenRef?: Ref<E>): RefCallback<E> {
    return useRefBackupProps({ ref: givenRef }).ref;
}

export function useRefBackupProps<P extends { ref?: Ref<any> }>(p: P) {
    return useRefElement<P extends { ref?: Ref<infer T> }? T : HTMLElement>().useRefElementProps(p);
}