import { XinObject } from './xin-types';
export declare type XinBinding = {
    toDOM: (element: HTMLElement, value: any, options?: XinObject) => void;
    fromDOM?: (element: HTMLElement) => any;
};
export declare const bindings: {
    [key: string | symbol]: XinBinding;
};
//# sourceMappingURL=bindings.d.ts.map