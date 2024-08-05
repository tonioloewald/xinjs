declare const XIN_PATH: unique symbol;
declare const XIN_VALUE: unique symbol;
export const xinPath: (x: any) => string | undefined;
export function xinValue<T>(x: T): T;
export const getListItem: (element: Element) => any;
declare function clamp(min: number, v: number, max: number): number;
declare function lerp(a: number, b: number, t: number): number;
export const MoreMath: {
    clamp: typeof clamp;
    lerp: typeof lerp;
};
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
    get _hsl(): HslColor;
    get hsl(): string;
    get hsla(): string;
    get mono(): Color;
    get brightness(): number;
    get html(): string;
    toString(): string;
    brighten(amount: number): Color;
    darken(amount: number): Color;
    saturate(amount: number): Color;
    desaturate(amount: number): Color;
    rotate(amount: number): Color;
    opacity(alpha: number): Color;
    swatch(): Color;
    blend(otherColor: Color, t: number): Color;
    mix(otherColor: Color, t: number): Color;
}
type CSSBasicAlign = 'nomal' | 'stretch';
type CSSPositionalAlign = 'center' | 'start' | 'end' | 'flex-start' | 'flex-end';
type CSSDistributedAlign = 'space-between' | 'space-around' | 'space-evenly' | 'stretch';
type CSSSelfAlign = 'self-start' | 'self-end';
type CSSBaselineAlign = 'baseline' | 'first baseline' | 'last baseline';
type CSSOverflowAlign = 'safe center' | 'unsafe center';
type CSSGlobalValues = 'inherit' | 'initial' | 'revert' | 'unset' | 'revert-layer';
type CSSAnimationDirection = 'normal' | 'reverse' | 'alternate' | 'aternate-reverse';
type CSSAnimationFillMode = 'node' | 'forwards' | 'backwards' | 'both';
type CSSAnimationPlayState = 'paused' | 'running';
type CSSAnimationTimingFunction = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | 'step-start' | 'step-end';
type CSSAppearance = 'none' | 'auto';
type CSSCursor = 'auto' | 'default' | 'none';
type CSSCursorLink = 'context-menu' | 'help' | 'pointer' | 'progress' | 'wait';
type CSSCursorSelection = 'cell' | 'crosshair' | 'text' | 'vertical-text';
type CSSCursorDrag = 'alias' | 'copy' | 'move' | 'no-drop' | 'not-allowed' | 'grap' | 'grabbing';
type CSSCursorCompass = 'n-resize' | 'e-resize' | 's-resize' | 'w-resize' | 'ne-resize' | 'se-resize' | 'sw-resize' | 'nw-resize' | 'nesw-resize' | 'nwse-resize';
type CSSCursorResize = 'col-resize' | 'row-resize';
type CSSCursorScroll = 'all-scroll';
type CSSCursorZoom = 'zoom-in' | 'zoom-out';
type CSSDisplay = 'block' | 'inline-block' | 'none' | 'flex' | 'inline-flex' | 'grid' | 'inline-grid' | 'flow-root' | 'contents';
type CSSDisplayOther = 'table' | 'table-row' | 'list-item';
type CSSDisplayMulti = 'block flow' | 'inline flow' | 'inline flow-root' | 'block-flex' | 'block-grid' | 'inline grid' | 'block flow-root';
type CSSFloat = 'left' | 'right' | 'none' | 'inline-start' | 'inline-end';
type CSSFlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
type CSSFlexFlow = CSSFlexDirection | CSSFlexWrap | 'row nowrap' | 'column wrap' | 'column-reverse wrap-reverse';
type CSSFlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
type CSSPointerEvents = 'auto' | 'none';
type CSSSVGPointerEvents = 'stroke' | 'fill' | 'visibleFill' | 'visibleStroke' | 'visible' | 'painted' | 'fill' | 'stroke' | 'all';
type CSSOverflow = 'visible' | 'hidden' | 'clip' | 'scroll' | 'auto' | 'hidden visible';
type CSSPosition = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
type CSSTouchAction = 'auto' | 'none' | 'pan-x' | 'pan-left' | 'pan-right' | 'pan-y' | 'pan-up' | 'pan-down' | 'pinch-zoom' | 'manipulation';
type CSSVisibility = 'visible' | 'hidden';
type CSSWhiteSpace = 'normal' | 'nowrap' | 'pre' | 'pre-wrap' | 'pre-line' | 'break-spaces';
type CSSWordBreak = 'normal' | 'break-all' | 'keep-all';
export interface XinStyleRule {
    accentColor?: Color | string;
    alignContent?: CSSBasicAlign | CSSBaselineAlign | CSSDistributedAlign | CSSPositionalAlign | CSSGlobalValues | string;
    alignItems?: CSSBasicAlign | CSSPositionalAlign | CSSBaselineAlign | CSSOverflowAlign | CSSGlobalValues | CSSSelfAlign | string;
    alignSelf?: 'auto' | CSSBasicAlign | CSSPositionalAlign | CSSBaselineAlign | CSSOverflowAlign | CSSGlobalValues | string;
    all?: CSSGlobalValues | string;
    animation?: string;
    animationDelay?: string;
    animationDirection?: CSSAnimationDirection | string;
    animationDuration?: string;
    animationFillMode?: CSSAnimationFillMode | string;
    animationIterationCount?: string | number;
    animationName?: string;
    animationPlayState?: CSSAnimationPlayState | CSSGlobalValues | string;
    animationTimingFunction?: CSSAnimationTimingFunction | CSSGlobalValues | string;
    appearance?: CSSAppearance | CSSGlobalValues | string;
    aspectRatio?: 'auto' | CSSGlobalValues | string;
    backdropFilter?: 'none' | string | CSSGlobalValues | string;
    backfaceVisibility?: CSSVisibility | CSSGlobalValues | string;
    background?: Color | string;
    backgroundAttachment?: string | number;
    backgroundBlendMode?: string;
    backgroundClip?: string | number;
    backgroundColor?: Color | string;
    backgroundImage?: string;
    backgroundOrigin?: string | number;
    backgroundPosition?: string | number;
    backgroundRepeat?: string | number;
    backgroundSize?: string | number;
    border?: string | number;
    borderBottom?: string | number;
    borderBottomColor?: Color | string;
    borderBottomLeftRadius?: string | number;
    borderBottomRightRadius?: string | number;
    borderBottomStyle?: string | number;
    borderBottomWidth?: string | number;
    borderCollapse?: string | number;
    borderColor?: Color | string;
    borderImage?: string;
    borderImageOutset?: string | number;
    borderImageRepeat?: string | number;
    borderImageSlice?: string | number;
    borderImageSource?: string | number;
    borderImageWidth?: string | number;
    borderLeft?: string | number;
    borderLeftColor?: Color | string;
    borderLeftStyle?: string | number;
    borderLeftWidth?: string | number;
    borderRadius?: string | number;
    borderRight?: string | number;
    borderRightColor?: Color | string;
    borderRightStyle?: string | number;
    borderRightWidth?: string | number;
    borderSpacing?: string | number;
    borderStyle?: string | number;
    borderTop?: string | number;
    borderTopColor?: Color | string;
    borderTopLeftRadius?: string | number;
    borderTopRightRadius?: string | number;
    borderTopStyle?: string | number;
    borderTopWidth?: string | number;
    borderWidth?: string | number;
    bottom?: string | number;
    boxShadow?: string | number;
    boxSizing?: string | number;
    captionSide?: string | number;
    caretColor?: Color | string;
    clear?: string | number;
    clip?: string | number;
    clipPath?: string | number;
    color?: Color | string;
    columnCount?: string | number;
    columnFill?: string | number;
    columnGap?: string | number;
    columnRule?: string | number;
    columnRuleColor?: Color | string;
    columnRuleStyle?: string | number;
    columnRuleWidth?: string | number;
    columnSpan?: string | number;
    columnWidth?: string | number;
    columns?: string | number;
    content?: string | number;
    counterIncrement?: string | number;
    counterReset?: string | number;
    cursor?: CSSCursor | CSSCursorDrag | CSSCursorLink | CSSCursorResize | CSSCursorCompass | CSSCursorSelection | CSSCursorScroll | CSSCursorZoom | CSSGlobalValues | string;
    direction?: string | number;
    display?: CSSDisplay | CSSDisplayOther | CSSDisplayMulti | CSSGlobalValues | string;
    emptyCells?: 'show' | 'hide' | CSSGlobalValues | string;
    filter?: string | CSSGlobalValues | string;
    flex?: string | number;
    flexBasis?: string | number;
    flexDirection?: CSSFlexDirection | CSSGlobalValues | string;
    flexFlow?: CSSFlexFlow | CSSGlobalValues;
    flexGrow?: string | number;
    flexShrink?: string | number;
    flexWrap?: CSSFlexWrap | CSSGlobalValues;
    float?: CSSFloat | CSSGlobalValues;
    font?: string | number;
    fontFamily?: string | number;
    fontKerning?: string | number;
    fontSize?: string | number;
    fontSizeAdjust?: string | number;
    fontStretch?: string | number;
    fontStyle?: string | number;
    fontVariant?: string | number;
    fontWeight?: string | number;
    grid?: string | number;
    gridArea?: string | number;
    gridAutoColumns?: string | number;
    gridAutoFlow?: string | number;
    gridAutoRows?: string | number;
    gridColumn?: string | number;
    gridColumnEnd?: string | number;
    gridColumnGap?: string | number;
    gridColumnStart?: string | number;
    gridGap?: string | number;
    gridRow?: string | number;
    gridRowEnd?: string | number;
    gridRowGap?: string | number;
    gridRowStart?: string | number;
    gridTemplate?: string | number;
    gridTemplateAreas?: string | number;
    gridTemplateColumns?: string | number;
    gridTemplateRows?: string | number;
    height?: string | number;
    hyphens?: string | number;
    justifyContent?: string | number;
    left?: string | number;
    letterSpacing?: string | number;
    lineHeight?: string | number;
    listStyle?: string | number;
    listStyleImage?: string;
    listStylePosition?: string | number;
    listStyleType?: string | number;
    margin?: string | number;
    marginBottom?: string | number;
    marginLeft?: string | number;
    marginRight?: string | number;
    marginTop?: string | number;
    maxHeight?: string | number;
    maxWidth?: string | number;
    minHeight?: string | number;
    minWidth?: string | number;
    objectFit?: string | number;
    objectPosition?: string | number;
    opacity?: string | number;
    order?: string | number;
    outline?: string | number;
    outlineColor?: Color | string;
    outlineOffset?: string | number;
    outlineStyle?: string | number;
    outlineWidth?: string | number;
    overflow?: CSSOverflow | CSSGlobalValues | string;
    overflowX?: CSSOverflow | CSSGlobalValues | string;
    overflowY?: CSSOverflow | CSSGlobalValues | string;
    padding?: string | number;
    paddingBottom?: string | number;
    paddingLeft?: string | number;
    paddingRight?: string | number;
    paddingTop?: string | number;
    pageBreakAfter?: string | number;
    pageBreakBefore?: string | number;
    pageBreakInside?: string | number;
    perspective?: string | number;
    perspectiveOrigin?: string | number;
    pointerEvents?: CSSPointerEvents | CSSSVGPointerEvents | CSSGlobalValues | string;
    position?: CSSPosition | CSSGlobalValues | string;
    quotes?: string;
    right?: string | number;
    scrollBehavior?: string | number;
    tableLayout?: string | number;
    textAlign?: string | number;
    textAlignLast?: string | number;
    textDecoration?: string | number;
    textDecorationColor?: Color | string;
    textDecorationLine?: string | number;
    textDecorationStyle?: string | number;
    textIndent?: string | number;
    textJustify?: string | number;
    textOverflow?: string | number;
    textShadow?: string | number;
    textTransform?: string | number;
    top?: string | number;
    touchAction?: CSSTouchAction | CSSGlobalValues | string;
    transform?: string;
    transformOrigin?: string;
    transformStyle?: string;
    transition?: string;
    transitionDelay?: string;
    transitionDuration?: string;
    transitionProperty?: string;
    transitionTimingFunction?: string;
    userSelect?: string | number;
    verticalAlign?: string;
    visibility?: CSSVisibility | 'collapse' | CSSGlobalValues | string;
    whiteSpace?: CSSWhiteSpace | CSSGlobalValues | string;
    width?: string | number;
    widows?: string | number;
    wordBreak?: CSSWordBreak | CSSGlobalValues | string;
    wordSpacing?: string | number;
    wordWrap?: string | number;
    writingMode?: string;
    zIndex?: string | number;
    [key: string]: Color | string | number | undefined;
}
export interface XinStyleMap {
    [key: string]: XinStyleRule;
}
export interface XinStyleSheet {
    [key: string]: XinStyleRule | XinStyleMap | string;
}
export type AnyFunction = (...args: any[]) => any | Promise<any>;
export type AnyObject = {
    [key: string | symbol | number]: any;
};
export type XinScalar = string | boolean | number | symbol | AnyFunction;
export type XinArray = any[];
export interface XinObject {
    [key: string | number | symbol]: any;
}
export type XinProxyTarget = XinObject | XinArray;
export type XinValue = XinObject | XinArray | XinScalar | null | undefined;
export interface XinProps {
    [XIN_VALUE]: XinObject | XinObject | XinScalar;
    [XIN_PATH]: string;
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
export type XinEventHandler<T = Event> = ((evt: T) => void) | ((evt: T) => Promise<void>) | string;
export type XinBindingShortcut = XinTouchableType | XinBindingSpec;
type _BooleanFunction = () => boolean;
type _PathTestFunction = (path: string) => boolean | symbol;
export type PathTestFunction = _BooleanFunction | _PathTestFunction;
type OptionalSymbol = symbol | undefined;
type _CallbackFunction = (() => void) | (() => OptionalSymbol);
type _PathCallbackFunction = ((path: string) => void) | ((path: string) => OptionalSymbol);
export type ObserverCallbackFunction = _PathCallbackFunction | _CallbackFunction;
export interface XinBindingSpec {
    value: XinTouchableType | any;
    [key: string]: any;
}
export type XinBindingSetter<T = HTMLElement> = (element: T, value: any, options?: XinObject) => void;
export type XinBindingGetter<T = HTMLElement> = (element: T, options?: XinObject) => any;
export interface XinBinding<T = HTMLElement> {
    toDOM?: XinBindingSetter<T>;
    fromDOM?: XinBindingGetter<T>;
}
export interface XinInlineBinding {
    value: XinTouchableType;
    binding: XinBinding | XinBindingSetter | string;
}
export interface ElementProps {
    onClick?: XinEventHandler<MouseEvent>;
    onInput?: XinEventHandler;
    onChange?: XinEventHandler;
    onSubmit?: XinEventHandler;
    bind?: XinInlineBinding;
    bindValue?: XinBindingShortcut;
    bindText?: XinBindingShortcut;
    bindList?: XinBindingShortcut;
    bindEnabled?: XinBindingShortcut;
    bindDisabled?: XinBindingShortcut;
    bindStyle?: XinBindingShortcut;
    style?: XinStyleRule;
    class?: string;
    apply?: (element: HTMLElement) => void | Promise<void>;
    [key: string]: any;
}
export interface StringMap {
    [key: string]: any;
}
export interface PartsMap {
    [key: string]: HTMLElement;
}
export type ValueElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export type ElementPart = Element | DocumentFragment | ElementProps | string | number;
export type HTMLElementCreator<T extends Node = HTMLElement> = (...contents: ElementPart[]) => T;
export type FragmentCreator = (...contents: ElementPart[]) => DocumentFragment;
export type ElementCreator<T extends Node = HTMLElement> = (...contents: ElementPart[]) => T;
export type ContentPart = Element | DocumentFragment | string;
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
export const updates: () => Promise<void>;
export const touch: (touchable: any) => void;
export const unobserve: (listener: Listener) => void;
export const observe: (test: string | RegExp | PathTestFunction, callback: string | ObserverCallbackFunction) => Listener;
export const xin: XinProxyObject;
export function bind<T extends HTMLElement>(element: T, what: XinTouchableType | XinBindingSpec, binding: XinBinding<T>, options?: XinObject): T;
export const on: (element: HTMLElement, eventType: string, eventHandler: XinEventHandler) => void;
type VoidFunc = (...args: any[]) => void;
export const debounce: (origFn: VoidFunc, minInterval?: number) => VoidFunc;
export const throttle: (origFn: VoidFunc, minInterval?: number) => VoidFunc;
export const bindings: {
    [key: string | symbol]: XinBinding;
};
export interface ElementsProxy {
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
/**
 * elements is a proxy that produces ElementCreators, e.g.
 * elements.div() creates <div> elements and
 * elements.myElement() creates <my-element> elements.
 */
export const elements: ElementsProxy;
interface SVGElementsProxy {
    [key: string]: ElementCreator<SVGElement>;
}
export const svgElements: SVGElementsProxy;
interface MathMLElementsProxy {
    [key: string]: ElementCreator<MathMLElement>;
}
export const mathML: MathMLElementsProxy;
export function StyleSheet(id: string, styleSpec: XinStyleSheet): void;
export const css: (obj: XinStyleSheet, indentation?: string) => string;
export const initVars: (obj: {
    [key: string]: string | number;
}) => XinStyleRule;
export const darkMode: (obj: XinStyleRule) => XinStyleRule;
export const invertLuminance: (map: XinStyleRule) => XinStyleRule;
export const vars: {
    [key: string]: string;
};
type CssVarBuilder = (val: string | number) => string;
export const varDefault: {
    [key: string]: CssVarBuilder;
};
interface ElementCreatorOptions extends ElementDefinitionOptions {
    tag?: string;
    styleSpec?: XinStyleSheet;
}
export abstract class Component extends HTMLElement {
    static elements: ElementsProxy;
    instanceId: string;
    styleNode?: HTMLStyleElement;
    static styleSpec?: XinStyleSheet;
    static styleNode?: HTMLStyleElement;
    content: ContentType | (() => ContentType) | null;
    isSlotted?: boolean;
    static get tagName(): null | string;
    [key: string]: any;
    static StyleNode(styleSpec: XinStyleSheet): HTMLStyleElement;
    static elementCreator(options?: ElementCreatorOptions): ElementCreator;
    initAttributes(...attributeNames: string[]): void;
    get parts(): PartsMap;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    queueRender(triggerChangeEvent?: boolean): void;
    render(): void;
}
export const hotReload: (test?: PathTestFunction) => void;
export interface XinFactory {
    Component: typeof Component;
    elements: typeof elements;
    vars: typeof vars;
    varDefault: typeof varDefault;
    Color: typeof Color;
}
interface XinComponentSpec {
    type: typeof Component;
    styleSpec?: XinStyleSheet;
}
export interface XinPackagedComponent {
    type: typeof Component;
    creator: ElementCreator;
}
export type XinBlueprint = (tag: string, module: XinFactory) => XinComponentSpec;
export function makeComponent(tag: string, blueprint: XinBlueprint): XinPackagedComponent;
export function importComponent(tag: string, url: string): Promise<XinPackagedComponent>;
type TestExpression = () => Promise<boolean> | boolean;
export class XinTest extends Component {
    test: TestExpression;
    delay: number;
    statis: string;
    expect: boolean;
    static delay(ms: number): Promise<void>;
    static styleSpec: {
        ':host': {
            display: string;
            gap: string;
            alignItems: string;
        };
        ':host [part="outcome"]': {
            display: string;
            borderRadius: string;
            padding: string;
            fontSize: string;
        };
        ':host .waiting': {
            background: string;
        };
        ':host .running': {
            background: string;
        };
        ':host .success': {
            background: string;
        };
        ':host .failed': {
            background: string;
        };
        ':host .exception': {
            color: string;
            background: string;
        };
    };
    content: HTMLSpanElement[];
    constructor();
    run: () => void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    render(): void;
}
export const xinTest: import("xin-types").ElementCreator;
export function xinProxy<T extends AnyObject>(obj: T, boxScalars?: boolean): T & XinProxyObject;

//# sourceMappingURL=types.d.ts.map
