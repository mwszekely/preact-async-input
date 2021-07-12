import { h, render } from 'preact';
import { useCallback, useState } from 'preact/hooks';
import { useProvidedId, Button, Input, InputNumber, InputMonth, InputRange, InputCheckbox, InputColor, InputDate, InputDateTime, InputEmail, InputRadio, InputRadioGroup, OptionMulti, OptionSingle, ProvideId, SelectMulti, SelectSingle, SetPendingMode, TextArea } from "..";

import { Temporal } from "@js-temporal/polyfill"


let timeT = 2000;

function useAsyncState<T>(initialState: T): readonly [value: T, setValue: (newValue: T | ((prevState: T) => T)) => Promise<void>] {
    const [value, setValue] = useState<T>(initialState);

    const delayedSetState = useCallback((newValue: T | ((prevState: T) => T)) => {
        return new Promise<void>(resolve => {
            setTimeout(() => {
                setValue(newValue);
                resolve();
            }, timeT);
            timeT = 1000 + Math.random() * 1000
        });


    }, [setValue]);

    return [value, delayedSetState] as const
}



const SelectArray = [0, 1, 2, 3, 4, 5, 6] as const;

const App = () => {
    const [text, setText] = useAsyncState("");
    const [radio, setRadio] = useAsyncState("");
    const [checked, setChecked] = useAsyncState(false);
    const [value, setValue] = useAsyncState<number | null>(0);
    const [email, setEmail] = useAsyncState<string | null>("");
    const [date, setDate] = useAsyncState<Temporal.PlainDate | null>(null);
    const [datetime, setDatetime] = useAsyncState<Temporal.PlainDateTime | null>(null);
    const [r, setR] = useAsyncState<number>(0);
    const [g, setG] = useAsyncState<number>(0);
    const [b, setB] = useAsyncState<number>(0);

    const [select, setSelect] = useAsyncState("0");
    const [multi, setMulti] = useAsyncState("");
    const multiParsed = new Set(multi.split(";"));
    const createAddMulti = (value: string) => useCallback((selected: boolean) => {
        return setMulti((multi) => {
            let set = new Set(multi.split(";").filter(s => !!s));
            if (selected)
                set.add(value);
            else
                set.delete(value);
            return Array.from(set).join(";")
        })
    }, []);

    //const multiSelectStates = SelectArray.map(i => useState(false));


    //const [color, setColorB] = useAsyncState<`#${string}`>(`#000000`)
    const setColor = useCallback(async (value: `#${string}`, r: number, g: number, b: number) => {
        return Promise.all([
            setR(r),
            setG(g),
            setB(b),
        ]) as Promise<any>;
        //setColorB(value)
    }, [setR, setG, setB])
    return <div>
        <SetPendingMode mode="disabled">
            <div><Button onClick={async () => new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))}>Test button</Button></div>
            <div>{checked.toString()}<InputCheckbox checked={checked} onInput={(setChecked)} /></div>
            <div>{value}<InputNumber value={value} onInput={(setValue)} /></div>
            <div>{value}<InputRange value={value} onInput={(setValue)} min={0} max={20} /></div>
            <div>{date?.toString()}<InputDate value={date} onInput={(setDate)} /></div>
            <div>{datetime?.toString()}<InputDateTime value={datetime} onInput={(setDatetime)} /></div>
            <div>{email?.toString()}<InputEmail value={email} onInput={(setEmail)} multiple={true} /></div>
            <div>{`#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`}<InputColor valueR={r} valueG={g} valueB={b} onInput={setColor} /></div>
            <div>
                {radio}
                <InputRadioGroup name={"radio-test"} value={radio} onInput={(setRadio)} >
                    <ProvideId>{h(() => <InputRadio value="A" childrenPre={h(() => <label htmlFor={useProvidedId(null, "no-backup")}>A</label>, {})} />, {})}</ProvideId>
                    <ProvideId>{h(() => <InputRadio value="B" childrenPre={h(() => <label htmlFor={useProvidedId(null, "no-backup")}>B</label>, {})} />, {})}</ProvideId>
                    <ProvideId>{h(() => <InputRadio value="C" childrenPre={h(() => <label htmlFor={useProvidedId(null, "no-backup")}>C</label>, {})} />, {})}</ProvideId>
                </InputRadioGroup>
            </div>
            <div>
                {select}
                <SelectSingle value={select} onInput={(setSelect)} size={3}>
                    <OptionSingle value="0">Item 0</OptionSingle>
                    <OptionSingle value="1">Item 1</OptionSingle>
                    <OptionSingle value="2">Item 2</OptionSingle>
                </SelectSingle>
            </div>
            <div>
                {select}
                <SelectSingle value={select} onInput={(setSelect)}>
                    <OptionSingle value="0">Item 0</OptionSingle>
                    <OptionSingle value="1">Item 1</OptionSingle>
                    <OptionSingle value="2">Item 2</OptionSingle>
                </SelectSingle>
            </div>
            <div>
                {multi}
                <SelectMulti size={SelectArray.length} onChange={useCallback((selectedValues, e) => { return setMulti(Array.from(selectedValues).join(";")); }, [])} >
                    {SelectArray.map(i => <OptionMulti value={i.toString()} selected={multiParsed.has(i.toString())}>Item {i}</OptionMulti>)}
                </SelectMulti>
            </div>
            <div>
                <Input type="text" onInput={(setText)} value={text} />
            </div>
            <div>
                <TextArea onInput={(setText)} value={text} cols={60} rows={40} />
            </div>
        </SetPendingMode>

    </div>;
}

render(<App />, document.getElementById("main")!);
