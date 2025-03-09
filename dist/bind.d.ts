import { XinObject, XinEventHandler, XinTouchableType, XinBinding, XinBindingSpec } from './xin-types';
export declare const touchElement: (element: Element, changedPath?: string) => void;
export declare function bind<T extends Element>(element: T, what: XinTouchableType | XinBindingSpec, binding: XinBinding<T>, options?: XinObject): T;
export declare const on: (element: HTMLElement, eventType: string, eventHandler: XinEventHandler) => void;
