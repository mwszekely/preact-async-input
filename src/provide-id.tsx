
import { ComponentChildren, createContext, h } from "preact";
import { useContext, useMemo, useRef, useState } from "preact/hooks"

const HexDigits = "0123456789ABCDEF".split("")
function G() { return HexDigits[Math.floor(Math.random() * 15)]; }

// Good Enough (TM)
function fakeUuid() {
    return `uuid-${G()}${G()}${G()}${G()}${G()}${G()}${G()}${G()}_${G()}${G()}${G()}${G()}_${G()}${G()}${G()}${G()}_${G()}${G()}${G()}${G()}_${G()}${G()}${G()}${G()}${G()}${G()}${G()}${G()}${G()}${G()}${G()}${G()}`
}

// Returns a randomly generated ID.
export function useRandomId() {
    return useMemo(() => fakeUuid(), []);
}


// If inside a component that provides a random ID, returns that ID that can be used for, say, a <label>.
// If outside, generates a random ID that can then be used for a context for the above.
export function useProvidedId(idFromProp: string | undefined | null, allowBackup: "backup" | "no-backup"): string | undefined {
    let idFromContext = useContext(RandomIdContext);
    let backupId = useRandomId();
    return idFromProp || idFromContext || (allowBackup == "backup" ? backupId : undefined);
}

const RandomIdContext = createContext("");

export function ProvideId({ children, id }: { children: ComponentChildren; id?: string }) {
    const backupId = useRandomId();
    return <RandomIdContext.Provider value={id || backupId}>{children}</RandomIdContext.Provider>
}
