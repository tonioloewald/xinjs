export type XinScalar = string | boolean | number | Function;
export type XinArray = XinObject[] | XinScalar[];
export interface XinObject {
    [key: string]: XinObject | XinArray | XinScalar;
}
export type XinProxyTarget = XinObject | XinArray;
export type XinValue = XinObject | XinArray | XinScalar | null | undefined;
export const xinPath: unique symbol;
export const xinValue: unique symbol;
export interface XinProps {
    [xinValue]: XinObject | XinObject | XinScalar;
    [xinPath]: string;
}
export type XinProxyObject = XinProps & {
    [key: string]: XinProxyObject | XinProxyArray | XinObject | XinArray | XinScalar;
};
export type XinProxyArray = XinProps & {
    [key: string]: XinProxyObject;
} & (XinProxyObject[] | XinScalar[]);
export type XinProxy = XinProps & (XinObject | XinArray);
export type XinProxyValue = XinProxy | XinScalar | null | undefined;
export type XinTouchableType = string | XinProps;
export type XinEventHandler<T = Event> = ((evt: T) => void) | string;
export type XinBindingShortcut = XinTouchableType | XinBindingSpec;
type _BooleanFunction = () => boolean;
type _PathTestFunction = (path: string) => boolean | Symbol;
export type PathTestFunction = _BooleanFunction | _PathTestFunction;
type OptionalSymbol = Symbol | undefined;
type _CallbackFunction = (() => void) | (() => OptionalSymbol);
type _PathCallbackFunction = ((path: string) => void) | ((path: string) => OptionalSymbol);
export type ObserverCallbackFunction = _PathCallbackFunction | _CallbackFunction;
export interface XinBindingSpec {
    value: XinTouchableType;
    [key: string]: any;
}
export interface XinBinding {
    toDOM?: (element: HTMLElement, value: any, options?: XinObject) => void;
    fromDOM?: (element: HTMLElement, options?: XinObject) => any;
}
export interface ElementProps {
    onClick?: XinEventHandler<MouseEvent>;
    onInput?: XinEventHandler;
    onChange?: XinEventHandler;
    onSubmit?: XinEventHandler;
    bindValue?: XinBindingShortcut;
    bindText?: XinBindingShortcut;
    bindList?: XinBindingShortcut;
    bindEnabled?: XinBindingShortcut;
    bindDisabled?: XinBindingShortcut;
    bindStyle?: XinBindingShortcut;
    [key: string]: any;
}
export type ValueElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export type SwissArmyElement = HTMLInputElement & HTMLCanvasElement;
export type ElementPart = SwissArmyElement | DocumentFragment | ElementProps | string | number;
export type HTMLElementCreator<T extends Node = SwissArmyElement> = (...contents: ElementPart[]) => T;
export type FragmentCreator = (...contents: ElementPart[]) => DocumentFragment;
export type ElementCreator<T extends Node = SwissArmyElement> = (...contents: ElementPart[]) => T;
export type ContentPart = HTMLElement | DocumentFragment | string;
export type ContentType = ContentPart | ContentPart[];
export const settings: {
    debug: boolean;
    perf: boolean;
};
export const observerShouldBeRemoved: unique symbol;
declare class Listener {
    description: string;
    test: PathTestFunction;
    callback: ObserverCallbackFunction;
    constructor(test: string | RegExp | PathTestFunction, callback: string | ObserverCallbackFunction);
}
export const touch: (what: XinTouchableType) => void;
export const unobserve: (listener: Listener) => void;
export const observe: (test: string | RegExp | PathTestFunction, callback: string | ObserverCallbackFunction) => Listener;
export const xin: XinProxyObject;
type VoidFunc = (...args: any[]) => void;
export const debounce: (origFn: VoidFunc, minInterval?: number) => VoidFunc;
export const throttle: (origFn: VoidFunc, minInterval?: number) => VoidFunc;
export const hotReload: (test?: PathTestFunction) => void;
declare class HslColor {
    h: number;
    s: number;
    l: number;
    constructor(r: number, g: number, b: number);
}
export class Color {
    r: number;
    g: number;
    b: number;
    a: number;
    static fromCss(spec: string): Color;
    static fromHsl(h: number, s: number, l: number, a?: number): Color;
    constructor(r: number, g: number, b: number, a?: number);
    get inverse(): Color;
    get inverseLuminance(): Color;
    get rgb(): string;
    get rgba(): string;
    get RGBA(): number[];
    get ARGB(): number[];
    _hslCached?: HslColor;
    get _hsl(): HslColor;
    get hsl(): string;
    get hsla(): string;
    get mono(): Color;
    get brightness(): number;
    get html(): string;
    brighten(amount: number): Color;
    darken(amount: number): Color;
    saturate(amount: number): Color;
    desaturate(amount: number): Color;
    rotate(amount: number): Color;
    opacity(alpha: number): Color;
    swatch(): void;
    blend(otherColor: Color, t: number): Color;
}
type _XinEventHandler1 = ((event: Event) => void) | string;
export const getListItem: (element: HTMLElement) => any;
export const bind: (element: HTMLElement | DocumentFragment, what: XinTouchableType | XinBindingSpec, binding: XinBinding, options?: XinObject) => HTMLElement;
export const on: (element: HTMLElement, eventType: string, eventHandler: _XinEventHandler1) => void;
declare global {
    interface HTMLElement {
        [listBindingRef]?: ListBinding;
    }
}
export const bindings: {
    [key: string | symbol]: XinBinding;
};
export const makeComponent: (...componentParts: ElementPart[]) => (...args: ElementPart[]) => HTMLDivElement;
interface ElementsProxy {
    a: ElementCreator<HTMLAnchorElement>;
    abbr: ElementCreator;
    acronym: ElementCreator;
    address: ElementCreator;
    area: ElementCreator<HTMLAreaElement>;
    article: ElementCreator;
    aside: ElementCreator;
    audio: ElementCreator<HTMLAudioElement>;
    b: ElementCreator;
    base: ElementCreator<HTMLBaseElement>;
    basefont: ElementCreator;
    bdi: ElementCreator;
    bdo: ElementCreator;
    big: ElementCreator;
    blockquote: ElementCreator<HTMLQuoteElement>;
    body: ElementCreator<HTMLBodyElement>;
    br: ElementCreator<HTMLBRElement>;
    button: ElementCreator<HTMLButtonElement>;
    canvas: ElementCreator<HTMLCanvasElement>;
    caption: ElementCreator;
    center: ElementCreator;
    cite: ElementCreator;
    code: ElementCreator;
    col: ElementCreator<HTMLTableColElement>;
    colgroup: ElementCreator<HTMLTableColElement>;
    data: ElementCreator<HTMLDataElement>;
    datalist: ElementCreator<HTMLDataListElement>;
    dd: ElementCreator;
    del: ElementCreator;
    details: ElementCreator<HTMLDetailsElement>;
    dfn: ElementCreator;
    dialog: ElementCreator<HTMLDialogElement>;
    div: ElementCreator<HTMLDivElement>;
    dl: ElementCreator;
    dt: ElementCreator;
    em: ElementCreator;
    embed: ElementCreator<HTMLEmbedElement>;
    fieldset: ElementCreator<HTMLFieldSetElement>;
    figcaption: ElementCreator;
    figure: ElementCreator;
    font: ElementCreator;
    footer: ElementCreator;
    form: ElementCreator<HTMLFormElement>;
    frame: ElementCreator;
    frameset: ElementCreator;
    head: ElementCreator<HTMLHeadElement>;
    header: ElementCreator;
    hgroup: ElementCreator;
    h1: ElementCreator<HTMLHeadingElement>;
    h2: ElementCreator<HTMLHeadingElement>;
    h3: ElementCreator<HTMLHeadingElement>;
    h4: ElementCreator<HTMLHeadingElement>;
    h5: ElementCreator<HTMLHeadingElement>;
    h6: ElementCreator<HTMLHeadingElement>;
    hr: ElementCreator<HTMLHRElement>;
    html: ElementCreator<HTMLHtmlElement>;
    i: ElementCreator;
    iframe: ElementCreator<HTMLIFrameElement>;
    img: ElementCreator<HTMLImageElement>;
    input: ElementCreator<HTMLInputElement>;
    ins: ElementCreator<HTMLModElement>;
    kbd: ElementCreator;
    keygen: ElementCreator<HTMLUnknownElement>;
    label: ElementCreator<HTMLLabelElement>;
    legend: ElementCreator<HTMLLegendElement>;
    li: ElementCreator<HTMLLIElement>;
    link: ElementCreator<HTMLLinkElement>;
    main: ElementCreator;
    map: ElementCreator<HTMLMapElement>;
    mark: ElementCreator;
    menu: ElementCreator<HTMLMenuElement>;
    menuitem: ElementCreator<HTMLUnknownElement>;
    meta: ElementCreator<HTMLMetaElement>;
    meter: ElementCreator<HTMLMeterElement>;
    nav: ElementCreator;
    noframes: ElementCreator;
    noscript: ElementCreator;
    object: ElementCreator<HTMLObjectElement>;
    ol: ElementCreator<HTMLOListElement>;
    optgroup: ElementCreator<HTMLOptGroupElement>;
    option: ElementCreator<HTMLOptionElement>;
    output: ElementCreator<HTMLOutputElement>;
    p: ElementCreator<HTMLParagraphElement>;
    param: ElementCreator;
    picture: ElementCreator<HTMLPictureElement>;
    pre: ElementCreator<HTMLPreElement>;
    progress: ElementCreator<HTMLProgressElement>;
    q: ElementCreator<HTMLQuoteElement>;
    rp: ElementCreator;
    rt: ElementCreator;
    ruby: ElementCreator;
    s: ElementCreator;
    samp: ElementCreator;
    script: ElementCreator<HTMLScriptElement>;
    section: ElementCreator;
    select: ElementCreator<HTMLSelectElement>;
    slot: ElementCreator<HTMLSlotElement>;
    small: ElementCreator;
    source: ElementCreator<HTMLSourceElement>;
    span: ElementCreator<HTMLSpanElement>;
    strike: ElementCreator;
    strong: ElementCreator;
    style: ElementCreator<HTMLStyleElement>;
    sub: ElementCreator;
    summary: ElementCreator;
    svg: ElementCreator<SVGElement>;
    table: ElementCreator<HTMLTableElement>;
    tbody: ElementCreator<HTMLTableSectionElement>;
    td: ElementCreator<HTMLTableCellElement>;
    template: ElementCreator<HTMLTemplateElement>;
    textarea: ElementCreator<HTMLTextAreaElement>;
    tfoot: ElementCreator<HTMLTableSectionElement>;
    th: ElementCreator<HTMLTableCellElement>;
    thead: ElementCreator<HTMLTableSectionElement>;
    time: ElementCreator<HTMLTimeElement>;
    title: ElementCreator<HTMLTitleElement>;
    tr: ElementCreator<HTMLTableRowElement>;
    track: ElementCreator<HTMLTrackElement>;
    tt: ElementCreator;
    u: ElementCreator;
    ul: ElementCreator<HTMLUListElement>;
    var: ElementCreator;
    video: ElementCreator<HTMLVideoElement>;
    wbr: ElementCreator;
    [key: string | symbol]: ElementCreator<any>;
}
export const elements: ElementsProxy;
interface StyleRule {
    [key: string]: string | number;
}
interface StyleMap {
    [key: string]: StyleRule;
}
interface StyleSheet {
    [key: string]: StyleRule | StyleMap | string;
}
export const css: (obj: StyleSheet | StyleMap, indentation?: string) => string;
export const initVars: (obj: StyleRule) => StyleRule;
export const darkMode: (obj: StyleRule) => StyleRule;
export const vars: {
    [key: string]: string;
};
export abstract class Component extends HTMLElement {
    static elements: ElementsProxy;
    instanceId: string;
    styleNode?: HTMLStyleElement;
    content: ContentType | (() => ContentType) | null;
    value?: any;
    [key: string]: any;
    static StyleNode(styleSpec: StyleSheet): HTMLStyleElement;
    static elementCreator(options?: ElementDefinitionOptions & {
        tag?: string;
    }): ElementCreator;
    initAttributes(...attributeNames: string[]): void;
    get refs(): {
        [key: string]: SwissArmyElement;
    };
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    queueRender(triggerChangeEvent?: boolean): void;
    render(): void;
}
export const MoreMath: typeof _MoreMath;

//# sourceMappingURL=types.d.ts.map
