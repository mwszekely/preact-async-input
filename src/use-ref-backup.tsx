import {  } from "preact";
import { useRef, Ref } from "preact/hooks";

export function useRefBackup<T>(givenRef?: Ref<T> | undefined) {
    const backupRef = useRef<T>(givenRef?.current!) as Ref<T>;
    return givenRef ?? backupRef;
}
