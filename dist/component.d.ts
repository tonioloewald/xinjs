import { XinStyleSheet } from './css-types';
import { ElementsProxy } from './elements';
import { ElementCreator, ContentType, PartsMap } from './xin-types';
interface ElementCreatorOptions extends ElementDefinitionOptions {
    tag?: string;
    styleSpec?: XinStyleSheet;
}
export declare abstract class Component<T = PartsMap> extends HTMLElement {
    static elements: ElementsProxy;
    private static _elementCreator?;
    instanceId: string;
    styleNode?: HTMLStyleElement;
    static styleSpec?: XinStyleSheet;
    static styleNode?: HTMLStyleElement;
    content: ContentType | (() => ContentType) | null;
    isSlotted?: boolean;
    private static _tagName;
    static get tagName(): null | string;
    [key: string]: any;
    static StyleNode(styleSpec: XinStyleSheet): HTMLStyleElement;
    static elementCreator(options?: ElementCreatorOptions): ElementCreator<Component>;
    initAttributes(...attributeNames: string[]): void;
    private initValue;
    private _parts?;
    get parts(): T;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    private _changeQueued;
    private _renderQueued;
    queueRender(triggerChangeEvent?: boolean): void;
    private _hydrated;
    private hydrate;
    render(): void;
}
export declare const xinSlot: ElementCreator<Component<PartsMap<Element>>>;
export {};
