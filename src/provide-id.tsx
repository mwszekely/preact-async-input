
import { ComponentChildren, createContext, h } from "preact";
import { useContext, useRef, useState } from "preact/hooks"

const HexDigits = "0123456789ABCDEF".split("")
function G() { return HexDigits[Math.floor(Math.random() * 15)]; }

// Good Enough (TM)
function fakeUuid() {
    return `uuid-${G()}${G()}${G()}${G()}${G()}${G()}${G()}${G()}_${G()}${G()}${G()}${G()}_${G()}${G()}${G()}${G()}_${G()}${G()}${G()}${G()}_${G()}${G()}${G()}${G()}${G()}${G()}${G()}${G()}${G()}${G()}${G()}${G()}`
}

// If inside a component that provides a random ID, returns that ID that can be used for, say, a <label>.
// If outside, generates a random ID that can then be used for a context for the above.
export function useRandomId() {
    const [uuid, _] = useState(() => fakeUuid());
    return uuid;
}

export function useProvidedId(allowBackup: "backup" | "no-backup", idFromProp: string | undefined | null): string | undefined {
    let idFromContext = useContext(RandomIdContext);
    let backupId = useRandomId();
    return idFromProp || idFromContext || (allowBackup == "backup" ? backupId : undefined);
}

const RandomIdContext = createContext("");

export function ProvideId({ children, id }: { children: ComponentChildren; id?: string }) {
    const backupId = useRandomId();
    return <RandomIdContext.Provider value={id || backupId}>{children}</RandomIdContext.Provider>
}
