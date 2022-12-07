import { XinEventHandler } from './metadata';
import { XinObject, XinTouchableType, XinBinding, XinBindingSpec } from './xin-types';
export declare const bind: (element: HTMLElement | DocumentFragment, what: XinTouchableType | XinBindingSpec, binding: XinBinding, options?: XinObject) => HTMLElement;
export declare const on: (element: HTMLElement, eventType: string, eventHandler: XinEventHandler) => void;
//# sourceMappingURL=bind.d.ts.map