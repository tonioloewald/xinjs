import { XinObject, XinTouchableType } from './xin-types';
export declare type XinBinding = {
    toDOM: (element: HTMLElement, value: any, options?: XinObject) => void;
    fromDOM?: (element: HTMLElement) => any;
};
export declare const bindings: {
    [key: string | symbol]: XinBinding;
};
export declare const bind: (element: HTMLElement, what: XinTouchableType, binding: XinBinding, options?: XinObject) => void;
//# sourceMappingURL=bind.d.ts.map