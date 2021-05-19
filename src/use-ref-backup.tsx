import { Ref } from "preact";
import { useRefElement } from "./use-ref-element";

export function useRefBackup<E extends HTMLElement>(givenRef?: Ref<E>) {
    return useRefBackupProps({ ref: givenRef }).ref;
}

export function useRefBackupProps<P extends { ref?: Ref<any> }>(p: P) {
    return useRefElement<P>().useRefElementProps(p);
}