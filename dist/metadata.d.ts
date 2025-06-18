import { XinObject, XinBinding, XinEventHandler, Unboxed } from './xin-types';
export declare const BOUND_CLASS = "-xin-data";
export declare const BOUND_SELECTOR = ".-xin-data";
export declare const EVENT_CLASS = "-xin-event";
export declare const EVENT_SELECTOR = ".-xin-event";
export declare const XIN_PATH = "xinPath";
export declare const XIN_VALUE = "xinValue";
export declare const XIN_OBSERVE = "xinObserve";
export declare const XIN_BIND = "xinBind";
export declare const XIN_ON = "xinOn";
export declare const xinPath: (x: any) => string | undefined;
export declare function xinValue<T>(x: T): Unboxed<T>;
export interface DataBinding<T extends Element = Element> {
    path: string;
    binding: XinBinding<T>;
    options?: XinObject;
}
export type DataBindings = DataBinding[];
export interface XinEventBindings {
    [eventType: string]: Set<XinEventHandler>;
}
export declare const elementToHandlers: WeakMap<Element, XinEventBindings>;
export declare const elementToBindings: WeakMap<Element, DataBindings>;
interface ElementMetadata {
    eventBindings?: XinEventBindings;
    dataBindings?: DataBindings;
}
export declare const getElementBindings: (element: Element) => ElementMetadata;
export declare const cloneWithBindings: (element: Node) => Node;
export declare const elementToItem: WeakMap<Element, XinObject>;
export declare const getListItem: (element: Element) => any;
export {};
