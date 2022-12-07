import { XinBinding, XinObject } from './xin-types';
export declare const BOUND_CLASS = "-xin-data";
export declare const BOUND_SELECTOR: string;
export declare const EVENT_CLASS = "-xin-event";
export declare const EVENT_SELECTOR: string;
export interface DataBinding {
    path: string;
    binding: XinBinding;
    options?: XinObject;
}
export declare type XinEventHandler = ((event: Event) => void) | string;
export declare type DataBindings = DataBinding[];
export interface XinEventBindings {
    [eventType: string]: XinEventHandler[];
}
export declare const elementToHandlers: WeakMap<Element, XinEventBindings>;
export declare const elementToBindings: WeakMap<Element, DataBindings>;
interface ElementMetadata {
    eventBindings?: XinEventBindings;
    dataBindings?: DataBindings;
}
export declare const getElementBindings: (element: Element) => ElementMetadata;
export declare const cloneWithBindings: (element: Node) => Node;
export declare const elementToItem: WeakMap<HTMLElement, XinObject>;
export declare const getListItem: (element: HTMLElement) => any;
export {};
//# sourceMappingURL=metadata.d.ts.map