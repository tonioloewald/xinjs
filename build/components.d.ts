declare type StyleRule = {
    [key: string]: string | number;
};
declare type StyleMap = {
    [key: string]: StyleRule;
};
declare type FunctionMap = {
    [key: string]: Function;
};
declare type EventHandler = (event: Event) => void;
declare type EventHandlerMap = {
    [key: string]: EventHandler;
};
declare type PropMap = {
    [key: string]: any;
};
declare type ContentType = HTMLElement | HTMLElement[] | DocumentFragment | string;
declare type WebComponentSpec = {
    superClass: typeof HTMLElement;
    style: StyleMap;
    methods: FunctionMap;
    render?: () => void;
    connectedCallback?: () => void;
    disconnectedCallback?: () => void;
    eventHandlers: EventHandlerMap;
    props: PropMap;
    attributes: PropMap;
    content: ContentType;
    role?: string;
};
export declare const makeWebComponent: (tagName: string, spec: WebComponentSpec) => (...contents: (string | number | import("./xin-types").XinObject | HTMLElement)[]) => HTMLElement | DocumentFragment;
export {};
//# sourceMappingURL=components.d.ts.map