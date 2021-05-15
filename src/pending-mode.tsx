import { ComponentChildren, createContext, h } from "preact";
import { useContext } from "preact/hooks";

const PendingModeContext = createContext<"disabled" | "readOnly" | null>("disabled");

export function SetPendingMode(props: { mode: "disabled" | "readOnly" | null; children: ComponentChildren; }) {
    return <PendingModeContext.Provider value={props.mode} children={props.children} />;
}

export function usePendingMode() { return useContext(PendingModeContext); }
