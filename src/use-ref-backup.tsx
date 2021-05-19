import { Ref } from "preact";
import { useRefElement } from "./use-ref-element";

export function useRefBackup<T>(givenRef?: Ref<T> | undefined) {
    return useRefElement(givenRef).ref;
}