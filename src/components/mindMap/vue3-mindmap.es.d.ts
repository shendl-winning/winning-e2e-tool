declare function tf(A: any): void;
declare function rf(A: any): void;
declare function ef(A: any): void;
declare function Zl(A: any): void;
declare function Af(A: any): void;
declare function $l(A: any): void;
declare const Oh: import("vue").DefineComponent<Readonly<import("vue").ComponentPropsOptions<{
    [x: string]: unknown;
}>>, {
    wrapperEle: import("vue").Ref<any>;
    svgEle: import("vue").Ref<any>;
    gEle: import("vue").Ref<any>;
    style: {
        container: string;
        "svg-wrapper": string;
        "asst-svg": string;
        svg: string;
        trigger: string;
        dragging: string;
        "add-btn": string;
        hidden: string;
        "expand-btn": string;
        text: string;
        selected: string;
        content: string;
        animation: string;
        dashdraw: string;
        root: string;
        edited: string;
        outline: string;
        collapse: string;
        "button-list": string;
        "right-bottom": string;
        "right-top": string;
        disabled: string;
        gps: string;
        fit: string;
        download: string;
        prev: string;
        next: string;
        close: string;
    };
    asstSvgEle: import("vue").Ref<any>;
    foreignEle: import("vue").Ref<any>;
    foreignDivEle: import("vue").Ref<any>;
    centerView: () => void;
    fitView: () => void;
    download: () => void;
    menu: import("vue").ComputedRef<{
        title: string;
        name: string;
        disabled: boolean;
    }[][]>;
    contextmenuPos: import("vue").Ref<{
        left: number;
        top: number;
    }>;
    onClickMenu: (A: any) => void;
    next: () => void;
    prev: () => void;
    hasPrev: import("vue").Ref<boolean>;
    hasNext: import("vue").Ref<boolean>;
    mindMapSave: () => void;
}, any, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<({
    [x: number]: string;
} & {
    toString?: string;
    toLocaleString?: string;
    concat?: string[];
    indexOf?: (searchElement: string, fromIndex?: number) => number;
    lastIndexOf?: (searchElement: string, fromIndex?: number) => number;
    slice?: string[];
    length?: number;
    includes?: (searchElement: string, fromIndex?: number) => boolean;
    map?: <U>(callbackfn: (value: string, index: number, array: readonly string[]) => U, thisArg?: any) => U[];
    filter?: {
        <S extends string>(predicate: (value: string, index: number, array: readonly string[]) => value is S, thisArg?: any): S[];
        (predicate: (value: string, index: number, array: readonly string[]) => unknown, thisArg?: any): string[];
    };
    join?: string;
    every?: {
        <S_1 extends string>(predicate: (value: string, index: number, array: readonly string[]) => value is S_1, thisArg?: any): this is readonly S_1[];
        (predicate: (value: string, index: number, array: readonly string[]) => unknown, thisArg?: any): boolean;
    };
    some?: (predicate: (value: string, index: number, array: readonly string[]) => unknown, thisArg?: any) => boolean;
    forEach?: (callbackfn: (value: string, index: number, array: readonly string[]) => void, thisArg?: any) => void;
    reduce?: {
        (callbackfn: (previousValue: string, currentValue: string, currentIndex: number, array: readonly string[]) => string): string;
        (callbackfn: (previousValue: string, currentValue: string, currentIndex: number, array: readonly string[]) => string, initialValue: string): string;
        <U_1>(callbackfn: (previousValue: U_1, currentValue: string, currentIndex: number, array: readonly string[]) => U_1, initialValue: U_1): U_1;
    };
    reduceRight?: {
        (callbackfn: (previousValue: string, currentValue: string, currentIndex: number, array: readonly string[]) => string): string;
        (callbackfn: (previousValue: string, currentValue: string, currentIndex: number, array: readonly string[]) => string, initialValue: string): string;
        <U_2>(callbackfn: (previousValue: U_2, currentValue: string, currentIndex: number, array: readonly string[]) => U_2, initialValue: U_2): U_2;
    };
    find?: {
        <S_2 extends string>(predicate: (this: void, value: string, index: number, obj: readonly string[]) => value is S_2, thisArg?: any): S_2;
        (predicate: (value: string, index: number, obj: readonly string[]) => unknown, thisArg?: any): string;
    };
    findIndex?: (predicate: (value: string, index: number, obj: readonly string[]) => unknown, thisArg?: any) => number;
    entries?: IterableIterator<[number, string]>;
    keys?: IterableIterator<number>;
    values?: IterableIterator<string>;
    flatMap?: <U_3, This = undefined>(callback: (this: This, value: string, index: number, array: string[]) => U_3 | readonly U_3[], thisArg?: This) => U_3[];
    flat?: unknown[];
}) | ({} & {
    [x: string]: unknown;
})>, {
    [x: number]: string;
} | {}>;
export { tf as getStepList, rf as rushData, ef as setMindMapSave, Zl as setStepDetailsAppend, Af as setStepDetailsDelete, $l as setStepDetailsEdit, Oh as winMap };
