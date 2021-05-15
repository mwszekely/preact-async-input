
import { ComponentChildren, createContext, h } from "preact";
import { useContext, useRef, useState } from "preact/hooks"
//import { v4 as uuidv4 } from "uuid"

const HexDigits = "0123456789ABCDEF".split("")
function G() { return HexDigits[Math.floor(Math.random() * 15)]; }

// Good Enough (TM)
function fakeUuid() {
    return `${G()}${G()}${G()}${G()}${G()}${G()}${G()}${G()}_${G()}${G()}${G()}${G()}_${G()}${G()}${G()}${G()}_${G()}${G()}${G()}${G()}_${G()}${G()}${G()}${G()}${G()}${G()}${G()}${G()}${G()}${G()}${G()}${G()}`
}

// If inside a component that provides a random ID, returns that ID that can be used for, say, a <label>.
// If outside, generates a random ID that can then be used for a context for the above.
function useRandomId() {
    //const idFromContext = useContext(RandomIdContext);
    const [uuid, _] = useState(() => fakeUuid());

    //if (idFromContext)
    //    return idFromContext;

    return uuid;
}

export function useProvidedId() {
    return useContext(RandomIdContext);
}





const RandomIdContext = createContext("");

export function ProvideId({ children, id }: { children: ComponentChildren; id?: string }) {
    const backupId = useRandomId();
    return <RandomIdContext.Provider value={id ?? backupId}>{children}</RandomIdContext.Provider>
}
