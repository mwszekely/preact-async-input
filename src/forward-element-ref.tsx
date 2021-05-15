
import { VNode } from "preact";
import { forwardRef, Ref } from "preact/compat";

type ForwardedFunctionalComponentProps<P, E> = Omit<P, "ref"> & { ref?: Ref<E> }
type ForwardedFunctionalComponent<P, E> = (p: ForwardedFunctionalComponentProps<P, E>) => VNode<ForwardedFunctionalComponentProps<P, E>>

/**
 * Shortcut for preact/comat's forwardRef that auto-assumes some things that are useful for forwarding refs to HTMLElements specifically.
 * Also doesn't gunk up the type system which happens sometimes with forwardRef.
 * 
 */
export function forwardElementRef<P, E>(component: (p: P, ref: Ref<E>) => (VNode<any> | null)) {

    return forwardRef(component) as ForwardedFunctionalComponent<P, E>;
}
