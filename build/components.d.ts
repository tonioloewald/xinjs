import { ElementCreator } from './elements';
interface StyleRule {
    [key: string]: string | number;
}
interface StyleMap {
    [key: string]: StyleRule;
}
interface FunctionMap {
    [key: string]: Function;
}
declare type EventHandler = (event: Event) => void;
interface EventHandlerMap {
    [key: string]: EventHandler;
}
interface PropMap {
    [key: string]: any;
}
declare type ContentType = HTMLElement | Array<HTMLElement | string> | DocumentFragment | string;
interface WebComponentSpec {
    superClass?: typeof HTMLElement;
    style?: StyleMap;
    methods?: FunctionMap;
    render?: () => void;
    connectedCallback?: () => void;
    disconnectedCallback?: () => void;
    eventHandlers?: EventHandlerMap;
    props?: PropMap;
    attributes?: PropMap;
    content?: ContentType;
    role?: string;
}
export declare const makeWebComponent: (tagName: string, spec: WebComponentSpec) => ElementCreator;
export {};
//# sourceMappingURL=components.d.ts.map