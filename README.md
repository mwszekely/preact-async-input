
# Preact Async Input

**Note: this library uses the [experimental (stage 3) Temporal proposal](https://github.com/tc39/proposal-temporal), so it's not production-ready!**
<p>(It also isn't production-ready because it's not heavily tested)</p>

## The problem

We'd like to be able to do something like this:

````typescript
<input type="checkbox" checked={checked} onInput={onInput} />
// Where onInput is an async function, maybe one that syncs
// with a boolean value on an external server or something
async function onInput(checked: boolean) { 
    // Maybe send the result to an external server.
    // This might take a random amount of time
    // and it might throw
    // and this onInput handler might be called, like, 10 times in a second!
    await sendData(..., checked);
    setChecked(checked);
}
````

There's nothing in the rules that says you can't have an event handler that is asynchronous, but there are eventually going to be problems when that handler is called, then called again before the first one has finished running.  While it's reasonable sometimes to simply disable the input while an event handler is running to block this from ever happening in the first place, this is really only feasible for e.g. checkboxes and maybe select menus, but definitely not a text box, range slider, etc.  Waiting for the async handler to finish every time you type a character would be very slow and frustrating!

## The solution
This library includes a set of components that simply wrap around an ``<input>`` (or ``<textarea>``, ``<select>``, etc.), forwarding any props you pass in, and provides a few modifications, like ``onInput`` being allowed to return a ``Promise`` instead of just ``void``.

If an event handler is called multiple times in quick succession (for example, when typing in a ``<textarea>``), the first call always happens immediately.  Any subsequent calls to the handler are temporarily ignored until the current handler is finished, at which point just the most recently requested handler is run (with all other request in between being entirely discarded).

If the user's focus leaves the input, it is (by default) disabled to indicate that its value is pending. The ``childrenPre`` and ``childrenPost`` properties on the various inputs allow you to place something directly before/after the ``<input>`` element that can call hooks like ``useIsPending()`` to read the current state of the handler (how long it's been pending for, if there's been an error, etc.) and display more detailed information than just "disabled because it's pending".

### Of note (aka why are the event handler parameters different)
A handler for an ``<InputCheckbox>`` component would look like this:
````typescript
const onInput = useCallback((checked: boolean, staleEvent: InputEvent) => {
    await sendData(..., checked);
    setChecked(checked);
}, [sendData, setChecked]);
````

Normally an event handler is simply ``(e: Event) => void`` and when it's called, you determine the result of the event using ``e.target.value`` or whatever.  The problem is that's a **live value**, and some of these event handlers are called on a fairly significant delay.  The value of ``e.target.value`` is almost certainly going to have changed by then (probably by whatever event handler is causing this one to wait!), meaning it can't be used anymore as "the result of the event".

Because of this, these components **save the most significant information of the event and present it as the first argument in the callback**.  The original event is still provided, since it might have other useful non-stale data (like the cursor position or something), but using its target's data will probably result in unexpected behavior. 

(Incidentally one bonus of this is that now functions the setter function of a ``useState`` call can be used directly as an event handler).


## Usage

The following components are available. Once again, these are just wrappers around native ``<input>`` elements, and except for any slightly adjusted props, everything (including refs) is forwarded to the ``<input>`` as-is.  

Component | Event Type | Details
--------- | ---- | ------
``<Input type="x"/>`` | ``string`` |  The base of most other input types. Doesn't do any conversion beyond just literally grabbing the element's ``value`` unless you pass in a ``convert`` prop, but in that case might as well just use one of the components below.
``<InputNumber />`` | ``number`` | The first argument of the event handler is the parsed number entered. When an invalid number is entered, no new onInput events are fired until a valid number is entered (which is the same as the regular ``<input>`` behavior).  If you are dealing with extremely large or precise numbers that can't fit into a ``Number``, you can disable the auto-parsing behavior in the component (and most others) by using ``<Input type="number" />`` instead.
``<InputCheckbox />`` | ``boolean`` | A good ol' checkbox.  Unlike other components, this one is disabled as soon as its state changes by default for clarity.
``<InputRadioGroup>`` &amp; ``<InputRadio />`` | ``string`` | Radio buttons are treated more as a select menu here. Provide the parent with the ``name`` of the currently selected radio button and its ``onInput`` will be fired with the ``name`` of the new radio button. Put together it looks like ``<InputRadioGroup value="A" onInput={...}><InputRadio name="A" /><InputRadio  name="B" /></InputRadioGroup>``.  (Note that ``InputRadioGroup`` **does not** insert any additional DOM elements--it's more or less just a context provider)
``<InputDate />`` | ``PlainDate`` | Like ``<InputNumber>``, but with a date represented by a ``PlainDate`` from the (currently Proposal 3) ``Temporal`` namespace.  A ``PlainDate`` is like a regular Javascript ``Date`` but with way clearer semantics for approximately everything.
``<InputTime />`` | ``PlainTime`` | Like an ``<InputDate>``, but for a time in the day. A major advantage of using ``Temporal.PlainTime`` over a ``Date`` is that it's clear that the date component doesn't exist.
``<InputDateTime />`` | ``PlainDateTime`` | Browser support ain't great for this one, but it's conceptially pretty similar to InputDate otherwise.  Still, maybe prefer ``InputDate`` + ``InputTime``. (Uses ``type="datetime-local"`` even though it's called ``<InputDateTime />`` for the record)
``<InputMonth />`` | ``PlainYearMonth`` | Like an ``<InputDate>``, but for selecting an entire month. Again, browser support isn't great. 
``<InputColor />`` | ``string`` (``r``, ``g``, and ``b`` are also passed as numbers) | You can pass in both a ``value`` prop in the form of `` `#${string}` ``, or you can pass in ``valueR``, ``valueG``, and ``valueB`` numbers between 0 and 255 as props. In addition, the ``onInput`` callback will provide both a ``value`` and the ``r``, ``g``, and ``b`` components as paraments.
``<InputEmail />`` | ``string`` | The ``multiple`` prop doesn't change whether the value is a string or an array of strings--if you'd like an array you can split/join the string on `","` and ``.trim()`` the string.
``<InputRange />`` | ``number`` | Only thing to note here is that sliders do not support the ``readonly`` attribute, so if the default setting is to make components read-only while pending instead of disabled, an ``<InputRange`` component will be disabled instead, because there's no alternative.
``<SelectSingle> & <OptionSingle />`` | ``string`` | When used with ``OptionSingle``, works about how you'd expect with a standard ``<select>`` element.  The ``onChange`` input handler is called with the ``value`` of the selected option.  The ``size`` attribute, as usual, controls if it's a dropdown select or a listbox where multiple options are visible at once.
``<SelectMulti /> & <OptionMulti />`` | ``boolean`` | Like a mix between an ``InputRadioGroup`` and just a bunch of ``InputCheckbox``es, the parent ``<SelectMulti>`` will have the ``onInput`` event with the first argument being a ``Set<string>`` containing all selected values.  Each ``OptionMulti`` has its own individual ``selected`` prop that you should modify according to the ``<SelectMulti>``'s ``onInput``.
``<TextArea />`` | ``string`` | By this point in the table there's nothing unique to say about the ``<TextArea>`` component really.

Note that other types, like ``week`` or ``password``, don't have dedicated components either because they're just text fields (or have poor browser support and degrade to text fields) that can be edited with ``<Input type="password" />`` or somesuch.

## Options
By default, if an input loses focus while there's a pending handler running it will mark itself as disabled for clarity. You can control this behavior by wrapping your entire program (or just specific parts) with ``<SetPendingMode mode="readOnly">`` or ``<SetPendingMode mode={null}">``

## Hooks

### Reading async state
Using an input component's ``childrenPre`` and ``childrenPost`` props, you can pass in a component that can be used to show, for example, a spinner if the input has been pending for long enough.


* ``useIsPending``
* ``useIsFulfilled``
* ``useError``
* ``useLatestValue``
* ``useStartedTime``

These hooks all return the same simple values provided by ``useAsyncEventHandler``, detailed below.

### Roll your own

You can also just use the included hook that handles most of the gruntwork.  ``useAsyncEventHandler`` takes an async event handler and a conversion function (detailed above, but it's to avoid stale event target data) and returns all the current information needed about the current operation, and the synchronous handler you need for your plain ``<input>`` element or whatever.

Note that if you use this hook, you must then also use ``<ProvideAsyncHandlerInfo>`` so that children can have access to its information as well.
````typescript
const {

    // This is the synchronous event handler that can be passed
    // to a plain old HTML element.
    syncHandler,

    // True if there's currently an event handler running, false otherwise.
    // This is not set to true if the event handler is not async.
    pending,

    // True if the most recent event handler completed successfully.
    // Not mutually exclusive with pending, but is with error.
    fulfilled,

    // If the most recent event handler threw an error, this is the error.
    // Not mutually exclusive with pending, but is with fulfilled.
    error,

    // A number representing the time the most recent event handler ran (via +new Date() when it starts).
    startedTime,

    // The value most recently entered by the user. In general, when pending
    // is true, you should pass this in as your value prop to the <input> component
    // instead of the value prop you were given that's, at least for the moment, out of date.
    latestConvertedValue
} = useAsyncEventHandler<T>({
    convertEvent: (e: Event) => { /* Return something that won't go stale when the thread yields */ },
    asyncHandler: async (convertedValue: T) => { /* (Do some stuff, call the user handler, etc.) */ }
})

````

### Other hooks

Might be useful, I dunno.

Hook | Details
-|-
``usePendingMode()`` | Accesses the current pending mode for when an input is pending and loses focus (see below)
``useRefBackup(ref)`` | For when you need a ref, but as a component that forwards any refs its given you might also just be okay with using that one. Returns the ref you pass in if it's non-null, otherwise, returns a backup. (This is only used by the ``<InputCheckbox>`` component, and *only* because there's no indeterminate attribute, just a property, so this is the only instance where we really need a ref...)
``useHasFocus(props)`` | Allows you to know if the element these props are passed to currently has focus.  Pass in the props you were *originally* going to pass to the element, and this hook will return a *new* copy of those props, modified to include ``hasFocus`` and adjusted ``onFocus`` and ``onBlur`` handlers (that call any handlers in props too but also manage the necessary state). 
``useStableCallback(f)`` | Like useCallback, but doesn't itself change in response to dependency changes. Useful in scenarios where the function being stable between renders is important, but **cannot be called during ``useLayoutEffect``** (or earlier)!  See https://github.com/facebook/react/issues/14099#issuecomment-659298422

## Auto-ID
Only tangentially related to anything else up until this point, but labels are important and making IDs for their inputs so they can be referenced is unfortunately really annoying.

``<ProvideId>`` (which is used by every component) allows children to use ``useProvidedId()``.  You can provide an id as ``<ProvideId id={id}>`` if you have one, but otherwise a random one is generated for you.  If you want to use the ID via the hook without creating a whole new child component, you can create a component inline like this:

````typescript
// Ignoring props like checked, onInput, etc.
<InputCheckbox childrenPre={h(() => <label htmlFor={useProvidedId()}>Checkbox label</label>, {})} />
````
## Testing

Actual tests are TODO. Run ``npm run watch``, then ``npx serve ./dist`` to build and run a simple demo page. 
