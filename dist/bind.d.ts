import { XinObject, XinEventHandler, XinTouchableType, XinBinding, XinBindingSpec } from './xin-types';
export declare const touchElement: (element: Element, changedPath?: string) => void;
export declare function bind<T extends Element = Element>(element: T, what: XinTouchableType | XinBindingSpec, binding: XinBinding<T>, options?: XinObject): T;
type RemoveListener = VoidFunction;
export declare function on<E extends HTMLElement, K extends keyof HTMLElementEventMap>(element: E, eventType: K, eventHandler: XinEventHandler<HTMLElementEventMap[K], E>): RemoveListener;
export {};
