import { ComponentChildren, createContext, RenderableProps, h } from "preact";
import { StateUpdater, useCallback, useContext, useLayoutEffect, useRef, useState } from "preact/hooks";
import { useStableCallback } from "./use-stable-callback";

export const AsyncConvertError = Symbol("AsyncConvertError");

export interface AsyncEventHandlerInfo<E extends Event, T> {
    convertEvent(e: E): T | typeof AsyncConvertError;                       // The primary result of the event (is the control checked, or what value is typed in, etc.). If a conversion isn't possible, either return AsyncConvertError or throw (anything, it's discarded).  We need to associate an event with a primary "value" because the DOM events don't and expect you to just reference the element, but in an async environment referencing a live element is bad news, so we need to keep a copy of it around.
    asyncHandler?: undefined | ((value: T, originalStaleEvent: E) => (void | Promise<void>));  // The actual event handler. Receives the result of convertedEvent above as its first argument, and a STALE reference to the original event. You MUST NOT use, e.g., event.target.value, as that value references the LIVE element and that value isn't the one you'd want.  It's here in case you need, e.g. the mouse coordinate properties on an event, which are NOT live and perfectly safe to grab.                                                  
}


export interface SyncEventHandlerInfo<E extends Event, T> {
    syncHandler(e: E): void;            // This is the sync handler that can be passed to an HTML element and be handled correctly

    error?: unknown;                    // The most recently rejected promise, if any. The next time the callback resolves successfully, this will be removed.
    pending: boolean;                   // True between the time the callback begins and the promise is resolved/rejected
    fulfilled: boolean;                 // True if the callback has resolved successfully, false otherwise.

    startedTime: number;                // The timestamp of the most recent call to syncHandler, which can be used for showing delayed spinners and such.

    setPending: StateUpdater<boolean>;
    setError: StateUpdater<unknown | undefined>;
    setFulfilled: StateUpdater<boolean>;

    latestConvertedValue: T | undefined;    // The most recent value entered by the user. It's *strongly* recommended to use this as the value instead of the parent-provided value while pending.
}



export function useAsyncEventHandler<T, E extends Event = Event>({ convertEvent, asyncHandler }: AsyncEventHandlerInfo<E, T>) {

    const forceUpdate = useForceUpdate();

    // This is used to keep track of whatever handler was called most recently if there's one that's already running.
    // Until the current handler finishes, any new requests will just overwrite this over and over.
    // Only when the current handler has returned will whatever's currently in here be called.
    const pendingPromiseFuncRef = useRef<[NonNullable<AsyncEventHandlerInfo<E, T>["asyncHandler"]>, T, E] | null>(null);

    // This is used in order to always show the most recently entered value to the user 
    // while there's a handler running (and probably overwriting any parent value props right before a new one runs)
    const latestCapturedEventRef = useRef<T | undefined>(undefined);

    // Standard async management stuff
    const [fulfilled, setFulfilled] = useState(false);
    const [error, setError] = useState<unknown | undefined>(undefined);
    const [pending, setPending] = useState(false);

    // Used for children to be able to display spinners on a delay and such
    const [startedTime, setStartedTime] = useState(0);


    const syncHandler = useStableCallback((e: E) => {

        // This may or may not be a (function that returns a) promise, depending on the handler that was passed in.
        // Thus the lightly wonky syntax here and there--we need to preserve async when async and sync when sync.
        let selfPromiseFunc = ((info: T, staleEvent: E) => {
            setStartedTime(+(new Date()));
            forceUpdate();

            
            try { 
               let probablyAPromise = asyncHandler?.(info, staleEvent);

                if (probablyAPromise && "then" in probablyAPromise) {
                    setPending(true);
    
                    return probablyAPromise.then(_ => {
                        setError(undefined);
                        setFulfilled(true);
                    }).catch(ex => {
                        setError(ex === undefined ? new Error() : ex);
                        setFulfilled(false);
                    }).finally(() => {
                        //debugger;
                        if (pendingPromiseFuncRef.current) {
                            pendingPromiseFuncRef.current[0](pendingPromiseFuncRef.current[1], pendingPromiseFuncRef.current[2]);
                            pendingPromiseFuncRef.current = null;
                        }
                        else {
                            setPending(false);
                        }
                    });
    
                }
                else {
                    setFulfilled(true);
                    setError(undefined);
                }
            }
            catch (ex) {
                setError(ex);
                setFulfilled(false);
            }
        });

        // Convert the event to a form that can be referenced later.
        // We can't simply save the event itself, because the most useful part of an event
        // is the "value" prop of the element it references, which is live and not useful in an async environment.
        // Thus we need to capture all the useful information from the event and/or convert its data
        let selfPromiseFuncObj: typeof AsyncConvertError | T;

        try { selfPromiseFuncObj = convertEvent(e); }
        catch (ex) { selfPromiseFuncObj = AsyncConvertError; }

        if (!(selfPromiseFuncObj instanceof Symbol) || selfPromiseFuncObj != AsyncConvertError) {
            latestCapturedEventRef.current = selfPromiseFuncObj as T;
            if (pending)
                pendingPromiseFuncRef.current = [selfPromiseFunc, selfPromiseFuncObj as T, e];
            else
                selfPromiseFunc(selfPromiseFuncObj as T, e);
        }

    });


    const ret: SyncEventHandlerInfo<E, T> = {
        syncHandler,
        pending,
        fulfilled,
        error,
        startedTime,
        setError,
        setFulfilled,
        setPending,
        latestConvertedValue: latestCapturedEventRef.current,
        //ContextProvider: null as any as typeof ContextProvider
    }

    const infoRef = useRef<SyncEventHandlerInfo<E, T>>(ret);
    useLayoutEffect(() => { infoRef.current = ret; });


    return ret;
}

function useForceUpdate() {
    const [i, setI] = useState(0);
    return useCallback(() => { setI(i => ++i) }, []);
}

const Contexts = {
    Pending: createContext(false),
    Fulfilled: createContext(false),
    Error: createContext<unknown | undefined>(undefined),
    StartedTime: createContext<number | undefined>(undefined),
    LatestValue: createContext<unknown | undefined>(undefined)
}

export function useIsPending() { return useContext(Contexts.Pending); }
export function useIsFulfilled() { return useContext(Contexts.Fulfilled); }
export function useError() { return useContext(Contexts.Error); }
export function useStartedTime() { return useContext(Contexts.StartedTime); }
export function useLatestValue<T>() { return useContext(Contexts.LatestValue) as T; }


export function ProvideAsyncHandlerInfo<E extends Event, T>({ children, pending, fulfilled, error, startedTime, latestConvertedValue }: { children: ComponentChildren } & Pick<SyncEventHandlerInfo<E, T>, "pending" | "fulfilled" | "error" | "startedTime" | "latestConvertedValue">) {
    return (

        <Contexts.Pending.Provider value={pending}>
            <Contexts.Fulfilled.Provider value={fulfilled}>
                <Contexts.Error.Provider value={error}>
                    <Contexts.StartedTime.Provider value={startedTime}>
                        <Contexts.LatestValue.Provider value={latestConvertedValue}>
                            {children}
                        </Contexts.LatestValue.Provider>
                    </Contexts.StartedTime.Provider>
                </Contexts.Error.Provider>
            </Contexts.Fulfilled.Provider>
        </Contexts.Pending.Provider>
    )
}
