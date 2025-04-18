import { ElementCreator } from './xin-types';
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
export declare const elements: ElementsProxy;
interface SVGElementsProxy {
    [key: string]: ElementCreator<SVGElement>;
}
export declare const svgElements: SVGElementsProxy;
interface MathMLElementsProxy {
    [key: string]: ElementCreator<MathMLElement>;
}
export declare const mathML: MathMLElementsProxy;
export {};
