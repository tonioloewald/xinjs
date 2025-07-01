import { XinEventHandler, XinTouchableType, XinBinding, XinBindingSpec, EventType } from './xin-types';
export declare const touchElement: (element: Element, changedPath?: string) => void;
interface BindingOptions {
    [key: string]: any;
}
export declare function bind<T extends Element = Element>(element: T, what: XinTouchableType | XinBindingSpec, binding: XinBinding<T>, options?: BindingOptions): T;
type RemoveListener = VoidFunction;
export declare function on<E extends HTMLElement, K extends EventType>(element: E, eventType: K, eventHandler: XinEventHandler<HTMLElementEventMap[K], E>): RemoveListener;
export {};
