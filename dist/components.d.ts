import { StyleSheet } from './css';
import { ContentType } from './dom';
import { ElementCreator, SwissArmyElement } from './xin-types';
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
interface WebComponentSpec {
    superClass?: typeof HTMLElement;
    style?: StyleSheet;
    methods?: FunctionMap;
    render?: VoidFunction;
    connectedCallback?: VoidFunction;
    disconnectedCallback?: VoidFunction;
    childListChange?: MutationCallback;
    eventHandlers?: EventHandlerMap;
    props?: PropMap;
    attributes?: PropMap;
    content?: ContentType | null;
    role?: string;
    value?: any;
}
export declare abstract class Component extends HTMLElement {
    static elements: {
        [key: string]: ElementCreator<any>;
        [key: symbol]: ElementCreator<any>;
    };
    private static _elementCreator?;
    styleNode?: HTMLStyleElement;
    content: ContentType | null;
    role?: string;
    onResize?: VoidFunction;
    [key: string]: any;
    value?: any;
    static StyleNode(styleSpec: StyleSheet): HTMLStyleElement;
    static elementCreator(options?: ElementDefinitionOptions): ElementCreator;
    initAttributes(...attributeNames: string[]): void;
    initValue(): void;
    private _refs?;
    get refs(): {
        [key: string]: SwissArmyElement;
    };
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    private _changeQueued;
    private _renderQueued;
    queueRender(triggerChangeEvent?: boolean): void;
    private _hydrated;
    hydrate(): void;
    render(): void;
}
export declare const makeWebComponent: (tagName: string, spec: WebComponentSpec) => ElementCreator;
export {};
//# sourceMappingURL=components.d.ts.map